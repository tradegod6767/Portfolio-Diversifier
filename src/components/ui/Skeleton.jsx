/**
 * Skeleton Loading Component
 * Professional loading state for RebalanceKit
 */

export default function Skeleton({
  variant = 'text',
  width = 'full',
  height,
  className = '',
  count = 1
}) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded';

  const variantClasses = {
    text: 'h-4',
    heading: 'h-8',
    button: 'h-11',
    input: 'h-12',
    card: 'h-32',
    avatar: 'h-12 w-12 rounded-full',
  };

  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4',
  };

  const heightClass = height ? `h-[${height}]` : variantClasses[variant];
  const widthClass = widthClasses[width] || width;

  const skeletonElement = (
    <div
      className={`${baseClasses} ${heightClass} ${widthClass} ${className}`}
      style={{ animation: 'shimmer 2s infinite linear' }}
    />
  );

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>{skeletonElement}</div>
        ))}
      </div>
    );
  }

  return skeletonElement;
}

// CSS animation for shimmer effect
export const SkeletonStyles = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;
