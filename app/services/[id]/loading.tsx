export default function ServiceDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8" aria-busy="true" aria-label="Loading service">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr_280px] lg:gap-8 xl:grid-cols-[260px_1fr_300px]">
        {/* ─── LEFT SIDEBAR: provider ─── */}
        <aside className="hidden space-y-5 lg:block">
          <div className="rounded-xl border border-border bg-surface p-5 text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-surface-secondary" />
            <div className="mx-auto mb-2 h-5 w-3/4 rounded bg-surface-secondary" />
            <div className="mx-auto h-6 w-24 rounded-full bg-primary-50" />
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 h-3 w-16 rounded bg-surface-secondary" />
            <div className="flex flex-wrap gap-1.5">
              {[56, 72, 48].map((w, i) => (
                <div key={i} className="h-5 rounded-md bg-surface-secondary" style={{ width: w }} />
              ))}
            </div>
          </div>
        </aside>

        {/* ─── CENTER ─── */}
        <div className="min-w-0 space-y-5">
          <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-surface-secondary" />

          <div className="space-y-3">
            <div className="h-8 w-full rounded bg-surface-secondary" />
            <div className="h-4 w-1/2 rounded bg-surface-secondary" />
            <div className="h-9 w-48 rounded bg-surface-secondary" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-28 rounded bg-surface-secondary" />
              <div className="h-4 w-16 rounded bg-surface-secondary" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-surface-secondary" />
            {[100, 94, 97, 85, 55].map((w, i) => (
              <div key={i} className="h-3.5 animate-pulse rounded bg-surface-secondary" style={{ width: `${w}%` }} />
            ))}
          </div>

          {/* Reviews */}
          <div>
            <div className="mb-4 h-4 w-32 rounded bg-surface-secondary" />
            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-10">
                <div className="h-14 w-20 rounded bg-surface-secondary" />
                <div className="space-y-2.5 sm:border-l sm:border-border sm:pl-10">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-2.5 flex-1 overflow-hidden rounded-full bg-primary-50">
                      <div
                        className="h-full rounded-full bg-surface-secondary"
                        style={{ width: `${92 - i * 17}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-surface-secondary" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-36 rounded bg-surface-secondary" />
                      <div className="h-3 w-24 rounded bg-surface-secondary" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3.5 w-full rounded bg-surface-secondary" />
                    <div className="h-3.5 w-4/5 rounded bg-surface-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <aside className="hidden space-y-5 lg:block">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 h-3.5 w-16 rounded bg-surface-secondary" />
            <div className="space-y-2.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-11 w-full rounded-lg bg-surface-secondary" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 h-3 w-24 rounded bg-surface-secondary" />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-9 shrink-0 rounded-lg bg-surface-secondary" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
