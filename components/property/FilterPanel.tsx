"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export function FilterPanel({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mb-4 flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filters
        </span>
        <span className="text-xs text-text-secondary">
          {open ? "Close" : "Open"}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`lg:block ${open ? "fixed inset-0 z-50 overflow-y-auto bg-surface p-4 lg:static lg:z-auto lg:overflow-visible lg:bg-transparent lg:p-0" : "hidden lg:block"}`}
      >
        <div className="flex items-center justify-between lg:hidden">
          <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-text-secondary hover:bg-surface-secondary"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}
