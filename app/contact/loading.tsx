import { FormSkeleton } from "@/components/shared/LoadingSkeleton"

export default function ContactLoading() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-2 h-9 w-48 animate-pulse rounded bg-surface-secondary" />
          <div className="mx-auto h-5 w-96 animate-pulse rounded bg-surface-secondary" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <FormSkeleton fields={4} />
          <div className="space-y-6">
            <div className="h-48 animate-pulse rounded-lg bg-surface-secondary" />
            <div className="h-32 animate-pulse rounded-lg bg-surface-secondary" />
          </div>
        </div>
      </section>
    </div>
  )
}
