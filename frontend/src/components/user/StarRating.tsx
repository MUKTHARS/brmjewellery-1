import { Star } from 'lucide-react';

interface Props {
  rating: number;
  max?: number;
  size?: number;
  showValue?: boolean;
}

export default function StarRating({ rating, max = 5, size = 14, showValue = false }: Props) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={size}
          className={i < Math.round(rating) ? 'text-gold fill-gold' : 'text-gray-300'} />
      ))}
      {showValue && <span className="text-xs text-ink-muted ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
}
