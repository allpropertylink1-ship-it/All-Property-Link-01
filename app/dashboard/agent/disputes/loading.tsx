import { TableSkeleton } from "@/components/shared/LoadingSkeleton"

export default function AgentDisputesLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-surface-secondary" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-surface-secondary" />
      </div>
      <TableSkeleton rows={4} cols={5} />
    </div>
  )
}
