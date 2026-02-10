import React from 'react';
import { ArrowUp, ArrowDown, DollarSign, Users, ShoppingBag, Percent, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down';
}

const iconMap: Record<string, { icon: LucideIcon, color: string, bg: string }> = {
  'total revenue': { icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-100' },
  'total users': { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  'orders': { icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-100' },
  'conversion rate': { icon: Percent, color: 'text-green-600', bg: 'bg-green-100' },
};

const currency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const KpiCard = React.memo(({ title, value, change, trend }: Props) => {
  const lowerTitle = title.toLowerCase();
  const config = iconMap[lowerTitle] || { icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' };
  const Icon = config.icon;

  const display = typeof value === 'number' ? (lowerTitle.includes('revenue') ? currency(value) : value.toLocaleString()) : value;
  const isPositive = typeof change === 'number' ? (change >= 0) : true;

  return (
    <Card className="group overflow-hidden border-none shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/50 backdrop-blur-sm border border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight group-hover:scale-105 transition-transform origin-left">{display}</h3>
          </div>
          <div className={`p-4 rounded-2xl ${config.bg} ${config.color} shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
        </div>

        {typeof change === 'number' && (
          <div className="mt-4 flex items-center gap-2">
            <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {Math.abs(change)}%
            </div>
            <span className="text-xs text-muted-foreground font-medium">vs previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default KpiCard;
