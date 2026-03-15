import { EmptyState } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <EmptyState
        icon={
          <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        primaryAction={{
          label: "Go to RebalanceKit",
          onClick: () => window.location.href = '/'
        }}
      />
    </div>
  );
}
