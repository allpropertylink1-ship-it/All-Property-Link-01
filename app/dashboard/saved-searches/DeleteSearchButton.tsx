"use client";

import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function DeleteSearchButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    const res = await fetch(`/api/saved-searches?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <button
          type="button"
          className="touch-target flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-error-500/10 hover:text-error-500"
          aria-label="Delete saved search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      }
      title="Delete Saved Search"
      description="Are you sure you want to delete this saved search? This action cannot be undone."
      confirmLabel="Delete"
      confirmVariant="destructive"
      onConfirm={handleDelete}
    />
  );
}
