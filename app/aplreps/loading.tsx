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
          <div className="mb-8 h-11 w-full max-w-md rounded-xl bg-surface-secondary animate-pulse" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-3xl border-2 border-accent-300/60 bg-surface p-5 sm:p-6">
                <div className="flex gap-5 sm:gap-6">
                  <div className="h-28 w-28 shrink-0 self-center rounded-full bg-surface-secondary animate-pulse sm:h-[150px] sm:w-[150px]" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                      <div className="h-6 w-44 rounded bg-surface-secondary animate-pulse" />
                      <div className="h-4 w-28 rounded bg-surface-secondary animate-pulse" />
                    </div>
                    <div className="mt-2 h-4 w-40 rounded bg-surface-secondary animate-pulse" />
                    <div className="mt-4 grid w-fit grid-cols-1 gap-2.5 sm:grid-cols-[auto_auto] sm:gap-x-5 sm:gap-y-3">
                      <div className="h-9 w-32 rounded-full bg-surface-secondary animate-pulse" />
                      <div className="h-9 w-32 rounded-full bg-surface-secondary animate-pulse" />
                      <div className="h-9 w-24 rounded-full bg-surface-secondary animate-pulse" />
                      <div className="h-9 w-28 rounded-full bg-surface-secondary animate-pulse" />
                    </div>
                    <div className="mt-5 border-t border-accent-300/50" />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="h-10 w-44 shrink-0 rounded bg-surface-secondary animate-pulse" />
                  <div className="flex flex-wrap gap-3">
                    <div className="h-9 w-24 rounded-full bg-surface-secondary animate-pulse" />
                    <div className="h-9 w-20 rounded-full bg-surface-secondary animate-pulse" />
                    <div className="h-9 w-20 rounded-full bg-surface-secondary animate-pulse" />
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