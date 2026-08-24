export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-surface" aria-busy="true" aria-label="Loading profile">
      {/* Identity band */}
      <section className="profile-hero py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
              <div className="h-24 w-24 shrink-0 rounded-full bg-white/10" />
              <div className="space-y-3 text-center sm:text-left">
                <div className="mx-auto h-3 w-28 rounded-full bg-white/15 sm:mx-0" />
                <div className="h-8 w-64 rounded-lg bg-white/20" />
                <div className="mx-auto h-4 w-48 rounded bg-white/10 sm:mx-0" />
              </div>
            </div>
            <dl className="flex gap-3.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="stat-glass rounded-xl px-5 py-4">
                  <div className="mx-auto h-2.5 w-14 rounded-full bg-white/15" />
                  <div className="mx-auto mt-2 h-6 w-10 rounded bg-white/25" />
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Reviews + listings */}
      <section className="bg-surface-secondary/50 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-16 px-4">
          <div>
            <div className="mb-1 h-3 w-32 animate-pulse rounded bg-surface-secondary" />
            <div className="mb-7 h-7 w-28 animate-pulse rounded bg-surface-secondary" />
            {/* Summary card */}
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-10">
                <div className="flex items-center gap-5 sm:block">
                  <div className="h-12 w-20 rounded bg-surface-secondary" />
                  <div className="mt-0 h-4 w-24 rounded bg-surface-secondary sm:mt-3" />
                </div>
                <div className="space-y-2.5 sm:border-l sm:border-border sm:pl-10">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="ml-auto h-2 w-3 rounded-sm bg-surface-secondary" />
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-primary-50">
                        <div
                          className="h-full rounded-full bg-surface-secondary"
                          style={{ width: `${90 - i * 18}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Review rows */}
            <div className="mt-6 space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-surface-secondary" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-36 rounded bg-surface-secondary" />
                      <div className="h-3 w-24 rounded bg-surface-secondary" />
                    </div>
                    <div className="hidden h-4 w-24 rounded bg-surface-secondary sm:block" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3.5 w-full rounded bg-surface-secondary" />
                    <div className="h-3.5 w-4/5 rounded bg-surface-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 h-3 w-36 animate-pulse rounded bg-surface-secondary" />
            <div className="mb-7 h-7 w-56 animate-pulse rounded bg-surface-secondary" />
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
                  <div className="aspect-[4/3] w-full animate-pulse bg-surface-secondary" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/4 rounded bg-surface-secondary" />
                    <div className="h-3 w-1/2 rounded bg-surface-secondary" />
                    <div className="h-5 w-2/3 rounded bg-surface-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
