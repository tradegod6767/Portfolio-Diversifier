/**
 * AppLoadingSkeleton - Shows app shell with skeleton placeholders during initial load
 *
 * Displays immediately while the app is initializing, auth is loading, etc.
 */

import { Skeleton } from './ui';

export default function AppLoadingSkeleton() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar Skeleton */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 p-4">
        {/* Logo area */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-md bg-slate-700 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-slate-700 rounded animate-pulse mb-2" />
            <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>

        {/* Nav items skeleton */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-md">
              <div className="w-9 h-9 rounded-full bg-slate-800 animate-pulse" />
              <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar Skeleton */}
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-4">
            <Skeleton variant="text" width="1/4" className="w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton variant="button" width="100px" />
          </div>
        </header>

        {/* Main content skeleton */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Hero skeleton */}
            <div className="text-center py-12 space-y-6">
              <Skeleton variant="heading" width="1/2" className="mx-auto h-12" />
              <Skeleton variant="text" width="3/4" className="mx-auto" />
              <Skeleton variant="text" width="1/2" className="mx-auto" />

              <div className="flex justify-center gap-4 pt-4">
                <Skeleton variant="button" className="w-40 h-12" />
                <Skeleton variant="button" className="w-40 h-12" />
              </div>
            </div>

            {/* Feature cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl p-6 animate-pulse-subtle"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    animationDelay: `${i * 0.1}s`
                  }}
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-200 mb-4" />
                  <Skeleton variant="text" width="3/4" className="mb-2" />
                  <Skeleton variant="text" width="full" />
                  <Skeleton variant="text" width="1/2" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * CalculatorSkeleton - Skeleton for the calculator view specifically
 */
export function CalculatorSkeleton() {
  return (
    <div className="space-y-6">
      {/* Form skeleton */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {/* Mode toggle skeleton */}
        <div className="flex gap-2 p-1.5 rounded-xl mb-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <Skeleton variant="button" className="flex-1 h-12" />
          <Skeleton variant="button" className="flex-1 h-12" />
        </div>

        {/* Header skeleton */}
        <Skeleton variant="heading" width="1/3" className="mb-4" />
        <Skeleton variant="text" width="1/2" className="mb-6" />

        {/* Action buttons skeleton */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="button" className="w-24 h-9" />
          ))}
        </div>

        {/* Position rows skeleton */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="grid grid-cols-4 gap-4 mb-4 p-5 rounded-lg animate-pulse-subtle"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              animationDelay: `${i * 0.1}s`
            }}
          >
            <div>
              <Skeleton variant="text" width="1/2" className="mb-2" />
              <Skeleton variant="input" />
            </div>
            <div>
              <Skeleton variant="text" width="1/2" className="mb-2" />
              <Skeleton variant="input" />
            </div>
            <div>
              <Skeleton variant="text" width="3/4" className="mb-2" />
              <Skeleton variant="input" />
            </div>
            <div className="flex items-end">
              <Skeleton variant="button" className="w-full" />
            </div>
          </div>
        ))}

        {/* Add position button skeleton */}
        <Skeleton variant="button" className="w-32 h-11 mt-4" />

        {/* Submit button skeleton */}
        <Skeleton variant="button" className="w-full h-14 mt-6" />
      </div>
    </div>
  );
}

/**
 * ResultsSkeleton - Skeleton for rebalancing results
 */
export function ResultsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton variant="heading" width="1/4" />
        <Skeleton variant="button" className="w-48 h-10" />
      </div>

      {/* Total value skeleton */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <Skeleton variant="text" width="1/3" className="h-6" />
      </div>

      {/* Impact summary skeleton */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <Skeleton variant="text" width="1/4" className="mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Skeleton variant="text" width="1/2" className="mb-2" />
              <Skeleton variant="heading" width="3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <Skeleton variant="text" width="1/3" className="mb-4" />
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {/* Table header */}
        <div className="grid grid-cols-6 gap-4 p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="text" width="3/4" />
          ))}
        </div>
        {/* Table rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 p-4 animate-pulse-subtle"
            style={{
              backgroundColor: i % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-card)',
              animationDelay: `${i * 0.1}s`
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <Skeleton key={j} variant="text" width={j === 5 ? '1/2' : '3/4'} />
            ))}
          </div>
        ))}
      </div>

      {/* AI Analysis skeleton */}
      <AIAnalysisSkeleton />
    </div>
  );
}

/**
 * AIAnalysisSkeleton - Skeleton with typing indicator for AI loading
 */
export function AIAnalysisSkeleton() {
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="text" width="1/4" className="h-6" />
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full bg-slate-400"
            style={{ animation: 'typing-bounce 1.4s ease-in-out infinite' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-slate-400"
            style={{ animation: 'typing-bounce 1.4s ease-in-out 0.2s infinite' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-slate-400"
            style={{ animation: 'typing-bounce 1.4s ease-in-out 0.4s infinite' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Analyzing your portfolio...</span>
      </div>

      <div className="space-y-3">
        <Skeleton variant="text" width="full" />
        <Skeleton variant="text" width="full" />
        <Skeleton variant="text" width="3/4" />
        <div className="pt-2" />
        <Skeleton variant="text" width="full" />
        <Skeleton variant="text" width="1/2" />
      </div>
    </div>
  );
}
