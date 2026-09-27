"use client";

import { useMemo, useState } from "react";
import { Check } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface ShelfCategory {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

interface Props {
  categories: ShelfCategory[];
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
}

/**
 * Multi-shelf picker: choose a sector, tick one or more shelves inside it,
 * repeat across sectors. Selected shelves appear as chips (one advert can
 * span several sectors, or the provider posts separate adverts per sector).
 */
export default function ServiceShelfPicker({ categories, value, onChange, label = "Sectors & Categories" }: Props) {
  const [sectorId, setSectorId] = useState("");

  const sector = useMemo(() => categories.find((c) => c.id === sectorId), [categories, sectorId]);
  const shelves = useMemo(() => {
    if (!sector) return [];
    return sector.children.length > 0 ? sector.children : [{ id: sector.id, name: sector.name, slug: sector.slug }];
  }, [sector]);

  // Auto-select the sector holding the first tick (edit forms).
  const [primed, setPrimed] = useState(false);
  if (!primed && !sectorId && value.length > 0 && categories.length > 0) {
    const holder = categories.find(
      (c) => c.id === value[0] || c.children.some((ch) => ch.id === value[0])
    );
    if (holder) {
      setSectorId(holder.id);
      setPrimed(true);
    }
  }

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  function shelfName(id: string): string {
    for (const c of categories) {
      if (c.id === id) return `${c.name}`;
      const hit = c.children.find((ch) => ch.id === id);
      if (hit) return `${c.name} — ${hit.name}`;
    }
    return id;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="shelf-sector" className="text-sm font-medium text-text-primary">
          {label} <span className="text-text-secondary">(tick one or more)</span>
        </label>
        <select
          id="shelf-sector"
          value={sectorId}
          onChange={(e) => setSectorId(e.target.value)}
          className="flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">Select a sector to tick shelves…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.children.filter((ch) => value.includes(ch.id)).length > 0
                ? ` (${c.children.filter((ch) => value.includes(ch.id)).length} ticked)`
                : ""}
            </option>
          ))}
        </select>
        <p className="text-xs text-text-secondary">Only sectors matching your profile specialties are shown</p>
      </div>

      {sector && (
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2" role="group" aria-label={`${sector.name} shelves`}>
          {shelves.map((shelf) => {
            const isSelected = value.includes(shelf.id);
            return (
              <button
                key={shelf.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggle(shelf.id)}
                className={cn(
                  "touch-target relative flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                  isSelected
                    ? "border-accent-500 bg-accent-50 text-accent-700 shadow-sm"
                    : "border-border bg-surface text-text-secondary hover:border-accent-500 hover:bg-accent-50/50"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    isSelected ? "border-accent-500 bg-accent-500 text-white" : "border-border bg-surface"
                  )}
                  aria-hidden="true"
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className="text-left leading-tight">{shelf.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {value.length > 0 && (
        <div className="space-y-2">
          <span className="block text-xs font-medium uppercase tracking-wide text-text-secondary">
            Shelves on this advert ({value.length})
          </span>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Selected shelves">
            {value.map((id) => (
              <span
                key={id}
                role="listitem"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-accent-500 bg-accent-50 py-2 pl-4 pr-2 text-sm font-medium text-accent-700"
              >
                {shelfName(id)}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  aria-label={`Remove ${shelfName(id)}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-accent-700 transition-colors hover:bg-accent-500 hover:text-white"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
