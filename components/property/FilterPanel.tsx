"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "@/components/ui/icons";

export function FilterPanel({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="catalog-filter-rail"
        className="mb-4 flex min-h-[44px] w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Refine Results
        </span>
        <span className="text-xs text-text-secondary">{open ? "Close" : "Open"}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="catalog-filter-rail"
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label="Refine results"
        className={`${
          open
            ? "fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto bg-surface p-4 lg:static lg:z-auto lg:overflow-visible lg:bg-transparent lg:p-0"
            : "hidden lg:block"
        } lg:sticky lg:top-24 lg:self-start`}
      >
        <div className="mb-2 flex items-center justify-between lg:hidden">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            <SlidersHorizontal size={18} />
            Refine Results
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-text-secondary hover:bg-surface-secondary"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-6 rounded-xl bg-surface p-6 shadow-sm">{children}</div>
      </aside>
    </>
  );
}
