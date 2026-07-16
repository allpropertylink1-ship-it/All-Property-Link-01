import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function ServicesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 h-9 w-72 rounded bg-surface-secondary" />
      <div className="mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 w-28 shrink-0 rounded-xl bg-surface-secondary" />
          ))}
        </div>
      </div>
      <div className="mb-6 h-5 w-40 rounded bg-surface-secondary" />
      <LoadingSkeleton count={6} />
    </div>
  );
}
