import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'gold' | 'success' | 'danger' | 'warning' | 'info';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-ink-muted',
  gold: 'bg-gold/10 text-gold border border-gold/30',
  success: 'bg-green-50 text-success',
  danger: 'bg-red-50 text-danger',
  warning: 'bg-amber-50 text-amber-700',
  info: 'bg-blue-50 text-blue-700',
};

const orderStatusMap: Record<string, BadgeVariant> = {
  PENDING: 'warning', CONFIRMED: 'gold', PROCESSING: 'info',
  SHIPPED: 'info', DELIVERED: 'success', CANCELLED: 'danger', REFUNDED: 'danger',
};

const paymentStatusMap: Record<string, BadgeVariant> = {
  UNPAID: 'warning', PAID: 'success', FAILED: 'danger', REFUNDED: 'default',
};

const bespokeStatusMap: Record<string, BadgeVariant> = {
  NEW: 'gold', IN_REVIEW: 'info', QUOTED: 'warning', CONFIRMED: 'success', COMPLETED: 'default',
};

const appointmentStatusMap: Record<string, BadgeVariant> = {
  PENDING: 'warning', CONFIRMED: 'success', CANCELLED: 'danger', COMPLETED: 'default',
};

export const getOrderStatusVariant = (s: string): BadgeVariant => orderStatusMap[s] ?? 'default';
export const getPaymentStatusVariant = (s: string): BadgeVariant => paymentStatusMap[s] ?? 'default';
export const getBespokeStatusVariant = (s: string): BadgeVariant => bespokeStatusMap[s] ?? 'default';
export const getAppointmentStatusVariant = (s: string): BadgeVariant => appointmentStatusMap[s] ?? 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ label, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('badge text-[11px]', variants[variant], className)}>
      {label.replace(/_/g, ' ')}
    </span>
  );
}
