"use client";

export function BrowseSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4" role="status" aria-label="Loading listings">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface animate-pulse">
          <div className="aspect-[4/3] bg-surface-secondary" />
          <div className="flex flex-1 flex-col p-3.5 space-y-3">
            <div className="h-4 w-3/4 bg-surface-secondary rounded" />
            <div className="h-3 w-1/2 bg-surface-secondary rounded" />
            <div className="h-3 w-1/3 bg-surface-secondary rounded" />
            <div className="mt-auto h-6 w-1/4 bg-surface-secondary rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}