export default function ServicesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8" role="status" aria-label="Loading services">
      <div aria-hidden="true">
        <div className="mb-2 h-4 w-40 animate-pulse rounded bg-surface-secondary" />
        <div className="mb-8 h-8 w-64 animate-pulse rounded bg-surface-secondary" />
        <div className="mb-8 h-[68px] animate-pulse rounded-xl bg-surface-secondary" />
        <div className="mb-8 flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-surface-secondary" />
          ))}
        </div>
        <div className="mb-8 flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-lg bg-surface-secondary" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-surface-secondary" />
          ))}
        </div>
      </div>
    </div>
  );
}
