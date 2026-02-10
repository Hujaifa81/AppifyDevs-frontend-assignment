"use client";
import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
} from 'recharts';
import { TrafficSource } from '@/types/dashboard.type';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

interface Props {
    data: TrafficSource[];
}

const TrafficSourceChart = React.memo(({ data }: Props) => {
    if (!data || data.length === 0) return <div className="p-4 bg-card rounded-md border border-dashed text-muted-foreground text-center">No traffic data</div>;

    const chartData = React.useMemo(() => data.map((d) => ({ name: d.source, visitors: d.visitors })), [data]);

    return (
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                                width={70}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                                formatter={(value: number) => [value.toLocaleString(), 'Visitors']}
                            />
                            <Bar
                                dataKey="visitors"
                                radius={[0, 4, 4, 0]}
                                barSize={12}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
});

export default TrafficSourceChart;
