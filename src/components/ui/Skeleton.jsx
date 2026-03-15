/**
 * Skeleton — Minimal Fintech design system
 */

export default function Skeleton({
  variant = 'text',
  width = 'full',
  height,
  className = '',
  count = 1,
}) {
  const variants = {
    text:    'h-4',
    heading: 'h-7',
    button:  'h-9',
    input:   'h-9',
    card:    'h-28',
    avatar:  'h-10 w-10 rounded-full',
  };

  const widths = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4',
  };

  const heightClass = height ? `h-[${height}]` : (variants[variant] ?? variants.text);
  const widthClass  = widths[width] ?? width;

  const el = (
    <div
      className={`skeleton-shimmer rounded ${heightClass} ${widthClass} ${className}`}
    />
  );

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>{el}</div>
        ))}
      </div>
    );
  }

  return el;
}

export const SkeletonStyles = '';
