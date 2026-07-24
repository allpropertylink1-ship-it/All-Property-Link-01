import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"

export default function BrowseLoading() {
  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-2 h-9 w-64 animate-pulse rounded bg-surface-secondary" />
        <div className="mx-auto h-5 w-80 animate-pulse rounded bg-surface-secondary" />
      </div>
      <div className="space-y-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <section key={i}>
            <div className="mb-5 flex items-end justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-surface-secondary" />
                <div className="h-6 w-48 animate-pulse rounded bg-surface-secondary" />
              </div>
              <div className="h-5 w-32 animate-pulse rounded bg-surface-secondary" />
            </div>
            <LoadingSkeleton count={6} />
          </section>
        ))}
      </div>
    </div>
  )
}
