"use client";
import React, { useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchUsers } from '@/redux/slices/dashboard-slice';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardStatus from '@/components/modules/Dashboard/DashboardStatus';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Download } from "lucide-react";
import { exportToCSV } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const UserDistributionChart = dynamic(() => import('@/components/modules/Dashboard/UserDistributionChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 rounded-3xl border border-border/50 shadow-sm" />
});

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector((s) => s.dashboard.users.data);
  const loading = useAppSelector((s) => s.dashboard.users.loading);
  const error = useAppSelector((s) => s.dashboard.users.error);

  const searchParams = useSearchParams();
  const router = useRouter();

  const period = useMemo(() => searchParams.get('period') || '30d', [searchParams]);

  const refresh = useCallback(() => dispatch(fetchUsers(period as any)), [dispatch, period]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('ts', String(Date.now()));
    const url = `${window.location.pathname}?${params.toString()}`;
    router.push(url);
  }, [searchParams, router]);

  const handleExport = useCallback(() => {
    const exportData = users?.distribution?.map(d => ({
      Segment: d.segment,
      Count: d.count,
      DateRange: period
    })) || [];
    exportToCSV(exportData, 'admin_users_report');
  }, [users, period]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
              <Users size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">Users</h1>
          </div>
          <p className="text-lg text-muted-foreground font-medium italic">User segments and distribution analysis.</p>
        </div>

        <div className="flex items-center gap-3 p-1.5 bg-muted/30 backdrop-blur-sm rounded-2xl border border-border/50">
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
          className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all cursor-pointer gap-2 border-none px-6"
        >
          <Download className="h-4 w-4" />
          <span className="font-bold">Export Users CSV</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          <Skeleton className="h-[400px] rounded-3xl border border-border/50 shadow-sm" />
        ) : error ? (
          <DashboardStatus type="error" title="User Data Load Failed" onRetry={refresh} />
        ) : !users?.distribution?.length ? (
          <DashboardStatus type="empty" message="No user data recorded for this period." />
        ) : (
          <div className="space-y-8">
            <UserDistributionChart data={users.distribution} />

            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
              <CardHeader className="px-6 py-6 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-xl font-bold">Segment Breakdown</CardTitle>
                <CardDescription className="text-sm font-medium">Distribution of users across different platform tiers.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/30 text-left">
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground/70">Segment</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground/70 text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {users.distribution.map((d) => (
                        <tr key={`user-segment-${d.segment}`} className="group hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-foreground capitalize">{d.segment}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black text-primary transition-all group-hover:scale-110 inline-block origin-right">
                              {d.count.toLocaleString()}
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
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
