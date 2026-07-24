import { FormSkeleton } from "@/components/shared/LoadingSkeleton"

export default function BusinessProfileLoading() {
  return (
    <div>
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-surface-secondary" />
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6">
        <FormSkeleton fields={6} />
      </div>
    </div>
  )
}
