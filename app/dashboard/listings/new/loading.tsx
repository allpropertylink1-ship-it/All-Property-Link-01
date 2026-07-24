import { FormSkeleton } from "@/components/shared/LoadingSkeleton"

export default function NewListingLoading() {
  return (
    <div>
      <div className="mb-8 h-8 w-40 animate-pulse rounded bg-surface-secondary" />
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6">
        <FormSkeleton fields={8} />
      </div>
    </div>
  )
}
