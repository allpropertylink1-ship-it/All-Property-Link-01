export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-border bg-surface p-4"
        >
          <div className="mb-4 h-48 rounded-lg bg-surface-secondary" />
          <div className="mb-2 h-4 w-3/4 rounded bg-surface-secondary" />
          <div className="mb-4 h-4 w-1/2 rounded bg-surface-secondary" />
          <div className="h-8 w-full rounded-lg bg-surface-secondary" />
        </div>
      ))}
    </div>
  );
}
