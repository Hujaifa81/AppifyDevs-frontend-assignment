import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@/redux/store';
import { updateProfile as updateProfileService } from '@/services/auth/updateProfile';
import { UserInfo } from '@/types';

interface ProfileState {
  user: UserInfo | null;
  updating: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  user: null,
  updating: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserInfo | null>) => {
      state.user = action.payload;
    },
    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.updating = action.payload;
      if (action.payload) state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setUser, setUpdating, setError } = profileSlice.actions;

export const updateProfileOptimistic = (
  optimisticPayload: { name?: string; avatar?: string },
  body: FormData | { name?: string; contactNumber?: string; avatar?: string }
) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const prev = getState().profile.user;
  const optimistic = prev ? { ...prev, ...optimisticPayload } : null;
  dispatch(setUser(optimistic));
  dispatch(setUpdating(true));

  try {
    const res = await updateProfileService(body as FormData | { name?: string; contactNumber?: string; avatar?: string });
    if (res?.success) {
      dispatch(setUser(res.data || optimistic));
      dispatch(setUpdating(false));
    } else {
      dispatch(setUser(prev));
      dispatch(setError(res?.message || 'Update failed'));
      dispatch(setUpdating(false));
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    dispatch(setUser(prev));
    dispatch(setError(message));
    dispatch(setUpdating(false));
  }
};

export default profileSlice.reducer;
