import { TableSkeleton } from "@/components/shared/LoadingSkeleton"

export default function AgentReferralsLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-surface-secondary" />
      <TableSkeleton rows={4} cols={5} />
    </div>
  )
}
