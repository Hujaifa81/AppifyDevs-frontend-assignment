import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getStats } from '@/services/dashboard/getStats';
import { getRevenue } from '@/services/dashboard/getRevenue';
import { getOrders } from '@/services/dashboard/getOrders';
import { getUsers } from '@/services/dashboard/getUsers';
import { getTraffic } from '@/services/dashboard/getTraffic';
import type {
  Stats,
  Revenue,
  Orders,
  UserDistribution,
  Traffic,
} from '@/types/dashboard.type';
import type { Period, UserType } from '@/types/filters.type';
import type { AppDispatch } from '@/redux/store';


interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const initialAsyncState = <T>(): AsyncState<T> => ({
  data: null,
  loading: false,
  error: null,
});


export interface DashboardState {
  stats: AsyncState<Stats>;
  revenue: AsyncState<Revenue>;
  orders: AsyncState<Orders>;
  users: AsyncState<UserDistribution>;
  traffic: AsyncState<Traffic>;
}

const initialState: DashboardState = {
  stats: initialAsyncState<Stats>(),
  revenue: initialAsyncState<Revenue>(),
  orders: initialAsyncState<Orders>(),
  users: initialAsyncState<UserDistribution>(),
  traffic: initialAsyncState<Traffic>(),
};


const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Stats
    setStatsLoading: (state) => {
      state.stats.loading = true;
      state.stats.error = null;
    },
    setStatsData: (state, action: PayloadAction<Stats | null>) => {
      state.stats.loading = false;
      state.stats.data = action.payload;
    },
    setStatsError: (state, action: PayloadAction<string>) => {
      state.stats.loading = false;
      state.stats.error = action.payload;
    },

    // Revenue
    setRevenueLoading: (state) => {
      state.revenue.loading = true;
      state.revenue.error = null;
    },
    setRevenueData: (state, action: PayloadAction<Revenue | null>) => {
      state.revenue.loading = false;
      state.revenue.data = action.payload;
    },
    setRevenueError: (state, action: PayloadAction<string>) => {
      state.revenue.loading = false;
      state.revenue.error = action.payload;
    },

    // Orders
    setOrdersLoading: (state) => {
      state.orders.loading = true;
      state.orders.error = null;
    },
    setOrdersData: (state, action: PayloadAction<Orders | null>) => {
      state.orders.loading = false;
      state.orders.data = action.payload;
    },
    setOrdersError: (state, action: PayloadAction<string>) => {
      state.orders.loading = false;
      state.orders.error = action.payload;
    },

    // Users
    setUsersLoading: (state) => {
      state.users.loading = true;
      state.users.error = null;
    },
    setUsersData: (state, action: PayloadAction<UserDistribution | null>) => {
      state.users.loading = false;
      state.users.data = action.payload;
    },
    setUsersError: (state, action: PayloadAction<string>) => {
      state.users.loading = false;
      state.users.error = action.payload;
    },

    // Traffic
    setTrafficLoading: (state) => {
      state.traffic.loading = true;
      state.traffic.error = null;
    },
    setTrafficData: (state, action: PayloadAction<Traffic | null>) => {
      state.traffic.loading = false;
      state.traffic.data = action.payload;
    },
    setTrafficError: (state, action: PayloadAction<string>) => {
      state.traffic.loading = false;
      state.traffic.error = action.payload;
    },
  },
});

export const {
  setStatsLoading, setStatsData, setStatsError,
  setRevenueLoading, setRevenueData, setRevenueError,
  setOrdersLoading, setOrdersData, setOrdersError,
  setUsersLoading, setUsersData, setUsersError,
  setTrafficLoading, setTrafficData, setTrafficError,
} = dashboardSlice.actions;


export const fetchStats = (period: Period, userType: any = 'all') => async (dispatch: AppDispatch) => {
  dispatch(setStatsLoading());
  try {
    const data = await getStats(period, userType);
    dispatch(setStatsData(data));
  } catch (error) {
    dispatch(setStatsError(error instanceof Error ? error.message : 'Failed to fetch stats'));
  }
};

export const fetchRevenue = (period: Period, userType: UserType) => async (dispatch: AppDispatch) => {
  dispatch(setRevenueLoading());
  try {
    const data = await getRevenue(period, userType);
    dispatch(setRevenueData(data));
  } catch (error) {
    dispatch(setRevenueError(error instanceof Error ? error.message : 'Failed to fetch revenue'));
  }
};

export const fetchOrders = (period: Period, userType: UserType) => async (dispatch: AppDispatch) => {
  dispatch(setOrdersLoading());
  try {
    const data = await getOrders(period, userType);
    dispatch(setOrdersData(data));
  } catch (error) {
    dispatch(setOrdersError(error instanceof Error ? error.message : 'Failed to fetch orders'));
  }
};

export const fetchUsers = (period: Period) => async (dispatch: AppDispatch) => {
  dispatch(setUsersLoading());
  try {
    const data = await getUsers(period);
    dispatch(setUsersData(data));
  } catch (error) {
    dispatch(setUsersError(error instanceof Error ? error.message : 'Failed to fetch users'));
  }
};

export const fetchTraffic = (period: Period) => async (dispatch: AppDispatch) => {
  dispatch(setTrafficLoading());
  try {
    const data = await getTraffic(period);
    dispatch(setTrafficData(data));
  } catch (error) {
    dispatch(setTrafficError(error instanceof Error ? error.message : 'Failed to fetch traffic'));
  }
};

export default dashboardSlice.reducer;
