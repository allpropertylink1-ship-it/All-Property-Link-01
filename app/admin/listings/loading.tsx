import { TableSkeleton } from "@/components/shared/LoadingSkeleton"

export default function AdminListingsLoading() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <TableSkeleton rows={5} cols={6} />
      </div>
    </div>
  )
}
