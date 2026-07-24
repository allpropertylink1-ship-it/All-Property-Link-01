import { FormSkeleton } from "@/components/shared/LoadingSkeleton"

export default function ForgotPasswordLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-48 animate-pulse rounded bg-surface-secondary" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded bg-surface-secondary" />
        </div>
        <FormSkeleton fields={1} />
      </div>
    </div>
  )
}
