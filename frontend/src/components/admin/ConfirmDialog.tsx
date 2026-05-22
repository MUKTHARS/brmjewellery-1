'use client';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm',
  variant = 'default', onConfirm, onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white border border-gray-100 shadow-card-hover w-full max-w-sm mx-4 p-6">
        <h3 className="font-cormorant text-xl font-light text-ink mb-2">{title}</h3>
        <p className="text-sm text-ink-muted mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-ghost">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={variant === 'danger'
              ? 'px-4 py-2 text-sm bg-danger text-white hover:bg-red-800 transition-colors disabled:opacity-50'
              : 'btn-gold disabled:opacity-50'
            }
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
