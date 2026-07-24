import { FormSkeleton } from "@/components/shared/LoadingSkeleton"

export default function AgentActivateLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto h-6 w-56 animate-pulse rounded bg-surface-secondary" />
        </div>
        <div className="rounded-xl border border-border bg-surface p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-2 h-8 w-64 animate-pulse rounded bg-surface-secondary" />
            <div className="mx-auto h-4 w-56 animate-pulse rounded bg-surface-secondary" />
          </div>
          <FormSkeleton fields={2} />
        </div>
      </div>
    </div>
  )
}
