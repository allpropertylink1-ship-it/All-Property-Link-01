export default function AplRepsLoading() {
  return (
    <div className="min-h-screen bg-surface" aria-busy="true" aria-label="Loading representatives">
      {/* Page header */}
      <section className="bg-primary-600 py-14 text-center sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-4 h-4 w-40 rounded-full bg-white/20" />
          <div className="mx-auto h-9 w-72 rounded-lg bg-white/25" />
          <div className="mx-auto mt-3 h-4 w-96 max-w-full rounded bg-white/15" />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-2xl border-2 border-accent-200/60 bg-surface p-5">
                <div className="flex gap-5">
                  <div className="h-[100px] w-[100px] shrink-0 rounded-full bg-surface-secondary animate-pulse" />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="h-5 w-3/4 rounded bg-surface-secondary animate-pulse" />
                      <div className="h-4 w-24 rounded bg-surface-secondary animate-pulse shrink-0" />
                    </div>
                    <div className="mt-1 h-3 w-1/2 rounded bg-surface-secondary animate-pulse" />
                    <div className="mt-2 self-end h-4 w-32 rounded bg-surface-secondary animate-pulse" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <div className="h-8 w-20 rounded-full bg-surface-secondary animate-pulse" />
                      <div className="h-8 w-28 rounded-full bg-surface-secondary animate-pulse" />
                      <div className="h-8 w-24 rounded-full bg-surface-secondary animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3 animate-pulse">
                  <div className="h-5 w-28 rounded bg-surface-secondary shrink-0" />
                  <div className="flex-1 flex flex-wrap gap-2">
                    <div className="h-6 w-24 rounded-full bg-surface-secondary" />
                    <div className="h-6 w-20 rounded-full bg-surface-secondary" />
                    <div className="h-6 w-28 rounded-full bg-surface-secondary" />
                    <div className="h-6 w-22 rounded-full bg-surface-secondary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}