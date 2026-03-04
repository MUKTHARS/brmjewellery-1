'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-1.5 border border-gray-200 hover:border-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={14} />
      </button>

      <span className="text-sm text-ink-muted tabular-nums">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-1.5 border border-gray-200 hover:border-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
