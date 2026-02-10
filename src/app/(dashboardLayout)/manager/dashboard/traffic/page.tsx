"use client";

import React, { useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchTraffic } from '@/redux/slices/dashboard-slice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardStatus from "@/components/modules/Dashboard/DashboardStatus";
import { exportToCSV } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const TrafficSourceChart = dynamic(() => import('@/components/modules/Dashboard/TrafficSourceChart'), {
    ssr: false,
    loading: () => <Skeleton className="h-40 rounded-3xl border border-border/50 shadow-sm" />
});

const ManagerTraffic = () => {
    const dispatch = useAppDispatch();
    const traffic = useAppSelector((s) => s.dashboard.traffic.data);
    const loading = useAppSelector((s) => s.dashboard.traffic.loading);
    const error = useAppSelector((s) => s.dashboard.traffic.error);

    const searchParams = useSearchParams();
    const router = useRouter();

    const period = useMemo(() => searchParams.get('period') || '30d', [searchParams]);

    const refresh = useCallback(() => dispatch(fetchTraffic(period as any)), [dispatch, period]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const setParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        params.set('ts', String(Date.now()));
        router.push(`${window.location.pathname}?${params.toString()}`);
    }, [searchParams, router]);

    const handleExport = useCallback(() => {
        const exportData = traffic?.sources?.map(s => ({
            Source: s.source,
            Sessions: s.visitors,
            DateRange: period
        })) || [];
        exportToCSV(exportData, 'manager_traffic_report');
    }, [traffic, period]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                            <Globe size={24} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">Traffic</h1>
                    </div>
                    <p className="text-lg text-muted-foreground font-medium italic">Analyze user acquisition and traffic sources.</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 p-1.5 bg-muted/30 backdrop-blur-sm rounded-2xl border border-border/50 transition-all hover:bg-muted/40">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Period</span>
                        <select
                            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer outline-none"
                            value={period}
                            onChange={(e) => setParam('period', e.target.value)}
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="12m">Last 12 Months</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end px-2 sm:px-0">
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleExport}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-black hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all cursor-pointer gap-2 border-none px-6"
                >
                    <Download className="h-4 w-4" />
                    <span className="font-bold">Export Traffic CSV</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {loading ? (
                    <Skeleton className="h-[400px] rounded-3xl border border-border/50 shadow-sm" />
                ) : error ? (
                    <DashboardStatus type="error" title="Traffic Load Failed" onRetry={refresh} />
                ) : !traffic?.sources?.length ? (
                    <DashboardStatus type="empty" message="No traffic data recorded for this period." />
                ) : (
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="lg:col-span-1">
                            <TrafficSourceChart data={traffic.sources} />
                        </div>

                        <div className="lg:col-span-1">
                            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden h-full">
                                <CardHeader className="px-6 py-6 border-b border-border/50 bg-muted/20">
                                    <CardTitle className="text-xl font-bold">Source Breakdown</CardTitle>
                                    <CardDescription className="text-sm font-medium">Distribution of incoming traffic by source channel.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-muted/30 text-left">
                                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground/70">Source</th>
                                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground/70 text-right">Sessions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {traffic.sources.map((s) => (
                                                    <tr key={`mgr-traffic-${s.source}`} className="group hover:bg-muted/20 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-bold text-foreground capitalize">{s.source}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="text-sm font-black text-primary transition-all group-hover:scale-110 inline-block origin-right">
                                                                {s.visitors.toLocaleString()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerTraffic;
