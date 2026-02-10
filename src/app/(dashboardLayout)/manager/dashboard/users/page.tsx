"use client";

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchUsers } from '@/redux/slices/dashboard-slice';
import { getProfiles } from '@/services/users/getProfiles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardStatus from "@/components/modules/Dashboard/DashboardStatus";
import { Badge } from "@/components/ui/badge";
import { exportToCSV } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const UserDistributionChart = dynamic(() => import('@/components/modules/Dashboard/UserDistributionChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 rounded-3xl border border-border/50 shadow-sm" />
});

const ManagerUsers = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector((s) => s.dashboard.users.data);
  const loading = useAppSelector((s) => s.dashboard.users.loading);
  const error = useAppSelector((s) => s.dashboard.users.error);

  const [profiles, setProfiles] = useState<any[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const searchParams = useSearchParams();
  const router = useRouter();

  const period = useMemo(() => searchParams.get('period') || '30d', [searchParams]);

  const refreshAnalytics = useCallback(() => dispatch(fetchUsers(period as any)), [dispatch, period]);

  const loadProfiles = useCallback(async () => {
    setProfilesLoading(true);
    setProfilesError(false);
    try {
      const list = await getProfiles();
      setProfiles(list);
    } catch (e) {
      console.error(e);
      setProfilesError(true);
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('ts', String(Date.now()));
    router.push(`${window.location.pathname}?${params.toString()}`);
  }, [searchParams, router]);

  const handleExport = useCallback(() => {
    const exportData = users?.distribution?.map(d => ({
      Segment: d.segment,
      Count: d.count,
      DateRange: period
    })) || [];
    exportToCSV(exportData, 'manager_users_report');
  }, [users, period]);

  const filteredProfiles = useMemo(() => profiles.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.email.toLowerCase().includes(query.toLowerCase())
  ), [profiles, query]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
              <Users size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">Users</h1>
          </div>
          <p className="text-lg text-muted-foreground font-medium italic">Manage user segments and profiles.</p>
        </div>

        {/* Filters */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribution Chart */}
        <div className="lg:col-span-1">
          {loading ? (
            <Skeleton className="h-[400px] rounded-3xl border border-border/50" />
          ) : error ? (
            <DashboardStatus type="error" onRetry={refreshAnalytics} />
          ) : !users?.distribution?.length ? (
            <DashboardStatus type="empty" title="No Distribution Data" />
          ) : (
            <UserDistributionChart data={users.distribution} />
          )}
        </div>

        {/* Profiles Table */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden h-full flex flex-col">
            <CardHeader className="px-6 py-6 border-b border-border/50 bg-muted/20 sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="text-xl font-bold">User Profiles</CardTitle>
                <CardDescription className="text-sm font-medium">Directory of active platform users.</CardDescription>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Search name or email..."
                  className="pl-9 pr-4 py-2 bg-background/50 border border-border/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full sm:w-64"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {profilesLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={`profile-skeleton-${i}`} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : profilesError ? (
                <DashboardStatus type="error" title="Profiles Load Failed" onRetry={loadProfiles} />
              ) : filteredProfiles.length === 0 ? (
                <DashboardStatus type="empty" message="No users match your current search." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/30 text-left">
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground/70">User</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground/70">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredProfiles
                        .slice((page - 1) * pageSize, page * pageSize)
                        .map((p) => (
                          <tr key={`mgr-prof-${p.id}`} className="group hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">{p.name}</span>
                                <span className="text-xs text-muted-foreground font-medium">{p.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="secondary" className="font-black uppercase tracking-widest py-1">
                                {p.role}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            {/* Pagination */}
            {!profilesLoading && !profilesError && filteredProfiles.length > 0 && (
              <div className="px-6 py-4 border-t border-border/50 bg-muted/10 flex items-center justify-between mt-auto">
                <span className="text-xs font-black text-muted-foreground tracking-widest uppercase">
                  Page {page} of {Math.ceil(filteredProfiles.length / pageSize)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-lg border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page * pageSize >= filteredProfiles.length}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 rounded-lg border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerUsers;
