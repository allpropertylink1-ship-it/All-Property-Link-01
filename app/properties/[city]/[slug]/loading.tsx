export default function PropertyDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8" aria-busy="true" aria-label="Loading property">
      {/* Breadcrumbs */}
      <div className="mb-5 flex items-center gap-2">
        {[64, 80, 72, 180].map((w, i) => (
          <span key={i} className="flex items-center gap-2">
            <div className="h-3 animate-pulse rounded bg-surface-secondary" style={{ width: w }} />
            {i < 3 && <div className="h-3 w-2 rounded bg-surface-secondary/60" />}
          </span>
        ))}
      </div>

      {/* Title bar */}
      <div className="space-y-3 py-4">
        <div className="h-8 w-full rounded bg-surface-secondary" />
        <div className="h-8 w-2/3 rounded bg-surface-secondary" />
        <div className="h-4 w-1/2 rounded bg-surface-secondary" />
      </div>

      {/* Gallery */}
      <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-surface-secondary sm:aspect-video lg:aspect-[21/9]" />

      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* ─── MAIN (8 cols) ─── */}
        <div className="min-w-0 space-y-6 lg:col-span-8">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-surface-secondary" />
            ))}
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 h-5 w-48 rounded bg-surface-secondary" />
            <div className="space-y-2">
              {[100, 96, 92, 98, 60].map((w, i) => (
                <div key={i} className="h-3.5 animate-pulse rounded bg-surface-secondary" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 h-5 w-40 rounded bg-surface-secondary" />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-secondary" />
              ))}
            </div>
          </div>
          <div className="h-56 animate-pulse rounded-xl bg-surface-secondary" />
        </div>

        {/* ─── STICKY SIDEBAR (4 cols) ─── */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 rounded-xl bg-surface-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-surface-secondary" />
                <div className="h-3 w-1/2 rounded bg-surface-secondary" />
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="h-12 w-full rounded-lg bg-surface-secondary" />
              <div className="h-12 w-full rounded-lg bg-surface-secondary" />
              <div className="h-12 w-full rounded-lg bg-surface-secondary" />
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile agent card skeleton */}
      <div className="mt-6 rounded-xl border border-border bg-surface p-4 lg:hidden">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-surface-secondary" />
          <div className="h-4 w-40 rounded bg-surface-secondary" />
        </div>
        <div className="flex gap-2">
          <div className="h-11 flex-1 rounded-lg bg-surface-secondary" />
          <div className="h-11 flex-1 rounded-lg bg-surface-secondary" />
        </div>
      </div>
    </div>
  )
}
