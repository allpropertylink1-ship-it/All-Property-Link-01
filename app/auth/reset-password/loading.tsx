import { FormSkeleton } from "@/components/shared/LoadingSkeleton"

export default function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-56 animate-pulse rounded bg-surface-secondary" />
          <div className="mx-auto h-4 w-48 animate-pulse rounded bg-surface-secondary" />
        </div>
        <FormSkeleton fields={2} />
      </div>
    </div>
  )
}
