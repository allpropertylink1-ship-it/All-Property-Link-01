"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteSearchButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/saved-searches?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setConfirming(false);
      router.refresh();
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">Are you sure?</span>
        <button
          type="button"
          onClick={handleDelete}
          className="touch-target rounded bg-error-500 px-2 py-1 text-xs font-medium text-white hover:bg-error-600"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="touch-target rounded bg-surface-secondary px-2 py-1 text-xs font-medium text-text-secondary hover:bg-border"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="touch-target flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-error-500/10 hover:text-error-500"
      aria-label="Delete saved search"
    >
      <Trash2 size={18} />
    </button>
  );
}
