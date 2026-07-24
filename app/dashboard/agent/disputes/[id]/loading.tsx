export default function AgentDisputeDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 h-6 w-32 animate-pulse rounded bg-surface-secondary" />
      <div className="mb-8 h-10 w-64 animate-pulse rounded bg-surface-secondary" />
      <div className="space-y-6">
        <div className="h-64 w-full animate-pulse rounded-xl bg-surface-secondary" />
        <div className="space-y-3">
          <div className="h-5 w-3/4 animate-pulse rounded bg-surface-secondary" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-surface-secondary" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-secondary" />
        </div>
      </div>
    </div>
  )
}
