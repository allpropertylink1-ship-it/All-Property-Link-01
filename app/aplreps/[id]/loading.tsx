export default function AgentDetailLoading() {
  return (
    <div className="min-h-screen bg-surface" aria-busy="true" aria-label="Loading representative profile">
      {/* Hero band */}
      <section className="bg-primary-600 py-14 text-center sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-white/15" />
          <div className="mx-auto h-9 w-72 rounded-lg bg-white/25" />
          <div className="mx-auto mt-3 h-6 w-56 rounded-full bg-white/15" />
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4">
          {/* Name + contact row */}
          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="space-y-2.5 text-center sm:text-left">
              <div className="h-6 w-48 animate-pulse rounded bg-surface-secondary" />
              <div className="h-4 w-64 animate-pulse rounded bg-surface-secondary" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 rounded-lg bg-surface-secondary" />
              <div className="h-10 w-32 rounded-lg bg-surface-secondary" />
            </div>
          </div>

          {/* Listings grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
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
      </section>
    </div>
  )
}
