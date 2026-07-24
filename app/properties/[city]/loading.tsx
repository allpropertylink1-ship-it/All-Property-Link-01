import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"

export default function CityLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-2 h-9 w-64 animate-pulse rounded bg-surface-secondary" />
      <div className="mb-8 h-5 w-40 animate-pulse rounded bg-surface-secondary" />
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-surface-secondary" />
            ))}
          </div>
        </aside>
        <div>
          <LoadingSkeleton count={6} />
        </div>
      </div>
    </div>
  )
}
