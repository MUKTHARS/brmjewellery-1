import { cn } from '@/lib/cn';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{title}</p>
          <p className="font-cormorant text-3xl font-light text-ink tracking-wide">{value}</p>
          {subtitle && <p className="text-xs text-ink-muted mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs mt-2 font-medium', trend.positive ? 'text-success' : 'text-danger')}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className="w-10 h-10 bg-gold/10 flex items-center justify-center ml-4">
          <Icon size={18} className="text-gold" />
        </div>
      </div>
    </div>
  );
}
