export default function AgentsLoading() {
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
              <div key={i} className="rounded-xl border border-border bg-surface p-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-full bg-surface-secondary" />
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="h-4 w-3/4 rounded bg-surface-secondary" />
                    <div className="h-3 w-1/2 rounded bg-surface-secondary" />
                    <div className="h-3 w-2/5 rounded bg-surface-secondary" />
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="h-3 w-full rounded bg-surface-secondary" />
                  <div className="h-3 w-5/6 rounded bg-surface-secondary" />
                </div>
                <div className="mt-5 flex gap-2">
                  <div className="h-8 flex-1 rounded-lg bg-surface-secondary" />
                  <div className="h-8 flex-1 rounded-lg bg-surface-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
