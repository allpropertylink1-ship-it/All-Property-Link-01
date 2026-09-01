export default function AplRepsLoading() {
  return (
    <div className="min-h-[100dvh] bg-surface" aria-busy="true" aria-label="Loading representatives">
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
                {/* Mobile skeleton */}
                <div className="lg:hidden">
                  <div className="mx-auto h-[130px] w-[130px] rounded-full border-2 border-accent-300/70 p-[3px]">
                    <div className="h-full w-full rounded-full bg-surface-secondary animate-pulse" />
                  </div>
                  <div className="mt-4 h-6 w-56 rounded bg-surface-secondary animate-pulse" />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="h-5 w-40 rounded bg-surface-secondary animate-pulse" />
                    <div className="h-8 w-28 rounded-full bg-surface-secondary animate-pulse" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="h-8 w-20 rounded-full bg-surface-secondary animate-pulse" />
                    <div className="h-8 w-28 rounded-full bg-surface-secondary animate-pulse" />
                    <div className="h-8 w-24 rounded-full bg-surface-secondary animate-pulse" />
                  </div>
                  <div className="mt-4 border-t border-accent-300/60" />
                  <div className="mt-4 flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 rounded bg-surface-secondary animate-pulse" />
                    <div className="grid flex-1 grid-cols-1 gap-x-3 gap-y-2.5 min-[360px]:grid-cols-2">
                      <div className="h-8 rounded-full bg-surface-secondary animate-pulse" />
                      <div className="h-8 rounded-full bg-surface-secondary animate-pulse" />
                      <div className="h-8 rounded-full bg-surface-secondary animate-pulse" />
                      <div className="h-8 rounded-full bg-surface-secondary animate-pulse" />
                    </div>
                  </div>
                </div>
                {/* Desktop skeleton */}
                <div className="hidden lg:flex gap-7">
                  <div className="h-[150px] w-[150px] shrink-0 self-center rounded-full border-2 border-accent-300/70 p-[3px]">
                    <div className="h-full w-full rounded-full bg-surface-secondary animate-pulse" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="h-7 w-56 rounded bg-surface-secondary animate-pulse" />
                    <div className="mt-2 h-5 w-44 rounded bg-surface-secondary animate-pulse" />
                    <div className="mt-4 grid max-w-full grid-cols-1 gap-x-4 gap-y-3 min-[360px]:grid-cols-2 sm:max-w-[320px]">
                      <div className="h-9 rounded-full bg-surface-secondary animate-pulse" />
                      <div className="h-9 rounded-full bg-surface-secondary animate-pulse" />
                      <div className="h-9 rounded-full bg-surface-secondary animate-pulse" />
                      <div className="h-9 rounded-full bg-surface-secondary animate-pulse" />
                    </div>
                    <div className="mt-auto pt-5"><div className="border-t border-accent-300/60" /></div>
                  </div>
                </div>
                <div className="mt-5 hidden lg:flex items-center gap-6">
                  <div className="h-14 w-32 shrink-0 rounded bg-surface-secondary animate-pulse" />
                  <div className="flex flex-1 flex-wrap gap-x-10 gap-y-3">
                    <div className="h-8 w-24 rounded-full bg-surface-secondary animate-pulse" />
                    <div className="h-8 w-20 rounded-full bg-surface-secondary animate-pulse" />
                    <div className="h-8 w-20 rounded-full bg-surface-secondary animate-pulse" />
                    <div className="h-8 w-24 rounded-full bg-surface-secondary animate-pulse" />
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