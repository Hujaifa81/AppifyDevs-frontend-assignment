"use client";

import React, { useEffect, useMemo, useCallback } from "react";
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useSearchParams, useRouter } from "next/navigation";
import {
    fetchStats,
    fetchRevenue,
    fetchOrders,
    fetchUsers,
    fetchTraffic,
} from "@/redux/slices/dashboard-slice";
import KpiCard from "@/components/modules/Dashboard/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardStatus from "@/components/modules/Dashboard/DashboardStatus";
import { exportToCSV } from "@/lib/utils";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamic imports for charts to reduce initial bundle size and avoid hydration issues with Recharts
const RevenueChart = dynamic(() => import('@/components/modules/Dashboard/RevenueChart'), {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] rounded-3xl border border-border/50" />
});
const OrdersChart = dynamic(() => import('@/components/modules/Dashboard/OrdersChart'), {
    ssr: false,
    loading: () => <Skeleton className="h-64 rounded-3xl border border-border/50" />
});
const UserDistributionChart = dynamic(() => import('@/components/modules/Dashboard/UserDistributionChart'), {
    ssr: false,
    loading: () => <Skeleton className="h-64 rounded-3xl border border-border/50" />
});
const TrafficSourceChart = dynamic(() => import('@/components/modules/Dashboard/TrafficSourceChart'), {
    ssr: false,
    loading: () => <Skeleton className="h-64 rounded-3xl border border-border/50" />
});

const ManagerDashboard = () => {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Filters
    const period = useMemo(() => searchParams.get("period") || "30d", [searchParams]);
    const userType = useMemo(() => searchParams.get("userType") || "all", [searchParams]);

    // Selectors
    const stats = useAppSelector((state) => state.dashboard.stats.data);
    const statsLoading = useAppSelector((state) => state.dashboard.stats.loading);
    const statsError = useAppSelector((state) => state.dashboard.stats.error);

    const revenue = useAppSelector((state) => state.dashboard.revenue.data);
    const revenueLoading = useAppSelector((state) => state.dashboard.revenue.loading);
    const revenueError = useAppSelector((state) => state.dashboard.revenue.error);

    const orders = useAppSelector((state) => state.dashboard.orders.data);
    const ordersLoading = useAppSelector((state) => state.dashboard.orders.loading);
    const ordersError = useAppSelector((state) => state.dashboard.orders.error);

    const users = useAppSelector((state) => state.dashboard.users.data);
    const usersLoading = useAppSelector((state) => state.dashboard.users.loading);
    const usersError = useAppSelector((state) => state.dashboard.users.error);

    const traffic = useAppSelector((state) => state.dashboard.traffic.data);
    const trafficLoading = useAppSelector((state) => state.dashboard.traffic.loading);
    const trafficError = useAppSelector((state) => state.dashboard.traffic.error);

    const refreshAll = useCallback(() => {
        dispatch(fetchStats(period as any, userType as any));
        dispatch(fetchRevenue(period as any, userType as any));
        dispatch(fetchOrders(period as any, userType as any));
        dispatch(fetchUsers(period as any));
        dispatch(fetchTraffic(period as any));
    }, [dispatch, period, userType]);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    const setParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        params.set("ts", String(Date.now()));
        router.push(`${window.location.pathname}?${params.toString()}`);
    }, [searchParams, router]);

    const handleExport = useCallback(() => {
        const exportData = revenue?.data?.map(d => ({
            Period: d.label,
            Revenue: d.revenue,
            Orders: orders?.data?.find(o => o.label === d.label)?.orders || 0,
            UserType: userType,
            DateRange: period
        })) || [];

        exportToCSV(exportData, 'manager_dashboard_report');
    }, [revenue, orders, userType, period]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                        Manager <span className="text-primary italic">Overview</span>
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground font-medium italic">
                        Monitor key performance indicators and operational metrics.
                    </p>
                </div>

                {/* Global Filters */}
                <div className="flex flex-wrap items-center gap-3 p-1.5 bg-muted/30 backdrop-blur-sm rounded-2xl border border-border/50 transition-all hover:bg-muted/40">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Period</span>
                        <select
                            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer outline-none"
                            value={period}
                            onChange={(e) => setParam("period", e.target.value)}
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="12m">Last 12 Months</option>
                        </select>
                    </div>
                    <div className="w-[1px] h-4 bg-border/50" />
                    <div className="flex items-center gap-2 px-3 py-1.5">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Segment</span>
                        <select
                            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer outline-none"
                            value={userType}
                            onChange={(e) => setParam("userType", e.target.value)}
                        >
                            <option value="all">All Users</option>
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end px-2 sm:px-0">
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleExport}
                    className="rounded-xl bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white font-black hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all cursor-pointer gap-2 border-none px-6"
                >
                    <Download className="h-4 w-4" />
                    <span className="font-bold">Export Report</span>
                </Button>
            </div>

            {/* KPI Section */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={`kpi-skeleton-${i}`} className="h-32 rounded-3xl border border-border/50" />
                    ))
                ) : statsError ? (
                    <div className="col-span-full">
                        <DashboardStatus type="error" title="KPI Load Failed" onRetry={refreshAll} />
                    </div>
                ) : stats?.kpis ? (
                    <>
                        <KpiCard title="Total Revenue" value={stats.kpis.totalRevenue.value} change={stats.kpis.totalRevenue.changePercent} trend={stats.kpis.totalRevenue.trend as any} />
                        <KpiCard title="Total Users" value={stats.kpis.totalUsers.value} change={stats.kpis.totalUsers.changePercent} trend={stats.kpis.totalUsers.trend as any} />
                        <KpiCard title="Orders" value={stats.kpis.orders.value} change={stats.kpis.orders.changePercent} trend={stats.kpis.orders.trend as any} />
                        <KpiCard title="Conversion Rate" value={`${stats.kpis.conversionRate.value}%`} change={stats.kpis.conversionRate.changePercent} trend={stats.kpis.conversionRate.trend as any} />
                    </>
                ) : (
                    <div className="col-span-full">
                        <DashboardStatus type="empty" title="No KPIs Available" />
                    </div>
                )}
            </div>

            {/* Main Charts Area */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Analytics Column (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">
                    {revenueLoading ? (
                        <Skeleton className="h-[400px] rounded-3xl border border-border/50" />
                    ) : revenueError ? (
                        <DashboardStatus type="error" onRetry={refreshAll} />
                    ) : !revenue?.data?.length ? (
                        <DashboardStatus type="empty" message="No revenue recorded for this period." />
                    ) : (
                        <RevenueChart data={revenue.data} />
                    )}

                    {ordersLoading ? (
                        <Skeleton className="h-64 rounded-3xl border border-border/50" />
                    ) : ordersError ? (
                        <DashboardStatus type="error" onRetry={refreshAll} />
                    ) : !orders?.data?.length ? (
                        <DashboardStatus type="empty" message="No orders found for the selection." />
                    ) : (
                        <OrdersChart data={orders.data} />
                    )}
                </div>

                {/* Side Distribution Column (1/3 width) */}
                <div className="lg:col-span-1 space-y-8">
                    {usersLoading ? (
                        <Skeleton className="h-64 rounded-3xl border border-border/50" />
                    ) : usersError ? (
                        <DashboardStatus type="error" onRetry={refreshAll} />
                    ) : !users?.distribution?.length ? (
                        <DashboardStatus type="empty" title="No Users" />
                    ) : (
                        <UserDistributionChart data={users.distribution} />
                    )}
                    {trafficLoading ? (
                        <Skeleton className="h-64 rounded-3xl border border-border/50" />
                    ) : trafficError ? (
                        <DashboardStatus type="error" onRetry={refreshAll} />
                    ) : !traffic?.sources?.length ? (
                        <DashboardStatus type="empty" title="No Traffic" />
                    ) : (
                        <TrafficSourceChart data={traffic.sources} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
