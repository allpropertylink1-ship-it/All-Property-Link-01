import { ListSkeleton } from "@/components/shared/LoadingSkeleton"

export default function NotificationsLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-surface-secondary" />
      <ListSkeleton />
    </div>
  )
}
