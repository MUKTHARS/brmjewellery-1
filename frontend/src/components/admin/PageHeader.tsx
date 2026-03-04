import { cn } from '@/lib/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div>
        <h1 className="font-cormorant text-3xl font-light text-ink tracking-wide">{title}</h1>
        {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
