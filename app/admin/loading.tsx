import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8" />
        <LoadingSkeleton count={6} />
      </div>
    </div>
  );
}
