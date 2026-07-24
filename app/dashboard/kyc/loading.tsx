import { FormSkeleton } from "@/components/shared/LoadingSkeleton"

export default function KycLoading() {
  return (
    <div>
      <div className="mb-8 h-8 w-40 animate-pulse rounded bg-surface-secondary" />
      <FormSkeleton fields={3} />
    </div>
  )
}
