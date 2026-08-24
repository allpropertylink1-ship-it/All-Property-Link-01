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

      <div className="grid gap-6 sm:p-0 lg:grid-cols-[240px_1fr_280px] lg:gap-8 xl:grid-cols-[260px_1fr_300px]">
        {/* ─── LEFT SIDEBAR ─── */}
        <aside className="hidden space-y-5 lg:block">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-3.5">
              <div className="h-12 w-12 shrink-0 rounded-full bg-surface-secondary" />
              <div className="h-10 w-24 rounded bg-surface-secondary" />
            </div>
            <div className="mb-3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-surface-secondary" />
              <div className="h-3 w-1/2 rounded bg-surface-secondary" />
            </div>
            <div className="mb-3 h-6 w-24 rounded-full bg-primary-50" />
            <div className="flex flex-wrap gap-1.5">
              {[52, 64, 44].map((w, i) => (
                <div key={i} className="h-5 rounded-md bg-surface-secondary" style={{ width: w }} />
              ))}
            </div>
          </div>
          <div className="h-48 animate-pulse rounded-xl bg-surface-secondary" />
        </aside>

        {/* ─── CENTER ─── */}
        <div className="min-w-0 space-y-5">
          <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-surface-secondary sm:aspect-video lg:aspect-[4/3]" />

          <div className="space-y-3">
            <div className="h-8 w-full rounded bg-surface-secondary" />
            <div className="h-8 w-2/3 rounded bg-surface-secondary" />
            <div className="h-4 w-1/2 rounded bg-surface-secondary" />
            <div className="h-9 w-56 rounded bg-surface-secondary" />
            <div className="flex gap-2">
              <div className="h-6 w-28 rounded-full bg-surface-secondary" />
              <div className="h-6 w-24 rounded-full bg-surface-secondary" />
            </div>
          </div>

          <div className="flex gap-5 border-y border-border py-3 sm:gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-surface-secondary" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-8 rounded bg-surface-secondary" />
                  <div className="h-2.5 w-10 rounded bg-surface-secondary" />
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-surface-secondary" />
            {[100, 96, 92, 98, 88, 60].map((w, i) => (
              <div key={i} className="h-3.5 animate-pulse rounded bg-surface-secondary" style={{ width: `${w}%` }} />
            ))}
          </div>

          {/* Reviews preview card */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-4 w-32 rounded bg-surface-secondary" />
              <div className="h-3 w-16 rounded bg-surface-secondary" />
            </div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-surface-secondary" />
              <div className="h-6 w-12 rounded bg-surface-secondary" />
              <div className="h-3 w-20 rounded bg-surface-secondary" />
            </div>
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="border-l-2 border-border/60 pl-4">
                  <div className="h-3 w-32 rounded bg-surface-secondary" />
                  <div className="mt-2 h-3 w-full rounded bg-surface-secondary" />
                  <div className="mt-1.5 h-3 w-3/4 rounded bg-surface-secondary" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <aside className="hidden space-y-5 lg:block">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="space-y-2.5">
              <div className="h-11 w-full rounded-lg bg-surface-secondary" />
              <div className="h-11 w-full rounded-lg bg-surface-secondary" />
              <div className="h-10 w-full rounded-lg bg-surface-secondary" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 h-3 w-20 rounded bg-surface-secondary" />
            <div className="flex gap-2">
              {[36, 36, 36, 36].map((s, i) => (
                <div key={i} className="h-9 w-9 shrink-0 rounded-lg bg-surface-secondary" style={{ width: s }} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3.5 h-4 w-28 rounded bg-surface-secondary" />
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-16 w-20 shrink-0 rounded-md bg-surface-secondary" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 w-full rounded bg-surface-secondary" />
                    <div className="h-3 w-2/3 rounded bg-surface-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile contact card (matches lg:hidden block on real page) */}
      <div className="mt-6 rounded-xl border border-border bg-surface p-4 lg:hidden">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-surface-secondary" />
          <div className="h-4 w-40 rounded bg-surface-secondary" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 flex-1 rounded-lg bg-surface-secondary" />
          <div className="h-9 flex-1 rounded-lg bg-surface-secondary" />
        </div>
      </div>
    </div>
  )
}
