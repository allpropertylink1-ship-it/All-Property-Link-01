"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteSearchButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this saved search?")) return;

    const res = await fetch(`/api/saved-searches?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="touch-target flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-error-500/10 hover:text-error-500"
      aria-label="Delete saved search"
    >
      <Trash2 size={18} />
    </button>
  );
}
