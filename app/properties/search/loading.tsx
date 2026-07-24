import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex gap-3">
        <div className="flex-1 h-12 animate-pulse rounded-lg bg-surface-secondary" />
        <div className="h-12 w-24 animate-pulse rounded-lg bg-surface-secondary" />
      </div>
      <div className="mb-6 h-5 w-48 animate-pulse rounded bg-surface-secondary" />
      <LoadingSkeleton count={6} />
    </div>
  )
}
