import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import dashboardReducer from './slices/dashboard-slice';
import profileReducer from './slices/profile-slice';


export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    profile: profileReducer,
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
