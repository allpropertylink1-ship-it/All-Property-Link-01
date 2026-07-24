export default function PropertyDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 h-10 w-64 animate-pulse rounded bg-surface-secondary" />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-surface-secondary" />
          <div className="space-y-3">
            <div className="h-6 w-3/4 animate-pulse rounded bg-surface-secondary" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-secondary" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-secondary" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface-secondary" />
          </div>
        </div>
        <aside className="space-y-6">
          <div className="h-48 w-full animate-pulse rounded-xl bg-surface-secondary" />
          <div className="h-32 w-full animate-pulse rounded-xl bg-surface-secondary" />
        </aside>
      </div>
    </div>
  )
}
