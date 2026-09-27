"use client";

import { useMemo, useState } from "react";
import { Check } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import {
  OTHER_SECTOR_ID,
  SECTORS,
  isOtherSpecialty,
  labelForSpecialty,
  sanitizeSpecialtyCode,
  validateSpecialties,
  type Sector,
} from "@/lib/service-taxonomy";

interface Props {
  persona: string;
  value: string[];
  onChange: (next: string[]) => void;
  onError: (msg: string) => void;
}

/** Sectors visible to a persona. Other sector always last. */
export function visibleSectors(persona: string): Sector[] {
  const vis = SECTORS.filter(
    (s) => s.id === OTHER_SECTOR_ID || s.persona === "BOTH" || s.persona === persona
  );
  return [...vis.filter((s) => s.id !== OTHER_SECTOR_ID), ...vis.filter((s) => s.id === OTHER_SECTOR_ID)];
}

export default function SectorSpecialtyPicker({ persona, value, onChange, onError }: Props) {
  const sectors = useMemo(() => visibleSectors(persona), [persona]);
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of sectors) {
      if (value.some((c) => s.specialties.some((sp) => sp.code === c))) init[s.id] = true;
    }
    const first = sectors[0];
    if (Object.keys(init).length === 0 && first) init[first.id] = true;
    return init;
  });
  const [otherInput, setOtherInput] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");

  function toggle(code: string) {
    const next = value.includes(code) ? value.filter((s) => s !== code) : [...value, code];
    const { valid, errors } = validateSpecialties(next);
    if (errors.length > 0 && valid.length < next.length) {
      onError(errors[0]);
      // Still apply the valid subset so caps are visibly enforced.
      onChange(valid);
      return;
    }
    onError("");
    onChange(valid);
  }

  function addCustom(sectorId: string) {
    const raw = (otherInput[sectorId] || "").trim();
    const code = sanitizeSpecialtyCode(raw);
    if (!code || code.length < 2) {
      onError("Type a custom service with at least 2 characters, then tap Add.");
      return;
    }
    if (value.includes(code)) {
      onError(`"${labelForSpecialty(code)}" is already added.`);
      return;
    }
    // Customs are always saved alongside their sector's Other bucket so the
    // listing-category join keeps working (see service-taxonomy docs).
    const bucket = sectorId === OTHER_SECTOR_ID ? "OTHER_CUSTOM" : `${sectorId}_OTHER`;
    const next = value.includes(bucket) ? [...value, code] : [...value, bucket, code];
    const { valid, errors } = validateSpecialties(next);
    if (errors.length > 0) {
      onError(errors[0]);
      return;
    }
    onError("");
    onChange(valid);
    setOtherInput((p) => ({ ...p, [sectorId]: "" }));
  }

  function remove(code: string) {
    onChange(value.filter((s) => s !== code));
  }

  const q = query.trim().toLowerCase();
  const customs = value.filter(
    (c) => !SECTORS.some((s) => s.specialties.some((sp) => sp.code === c))
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary" htmlFor="sector-search">
          Find a service
        </label>
        <input
          id="sector-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to filter, e.g. plumbing, DJ, solar…"
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {sectors.map((sector) => {
        const selected = sector.specialties.filter((sp) => value.includes(sp.code));
        const shown = q
          ? sector.specialties.filter((sp) => sp.label.toLowerCase().includes(q))
          : sector.specialties;
        if (q && shown.length === 0) return null;
        const isOpen = open[sector.id] ?? false;
        return (
          <div key={sector.id} className="rounded-xl border border-border bg-surface">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`sector-${sector.id}`}
              onClick={() => setOpen((p) => ({ ...p, [sector.id]: !p[sector.id] }))}
              className="touch-target flex min-h-[44px] w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="text-sm font-semibold text-text-primary">
                {sector.name}
                <span className="ml-2 text-xs font-normal text-text-secondary">
                  {selected.length > 0 ? `${selected.length} selected` : `${sector.specialties.length - 1} services`}
                </span>
              </span>
              <span aria-hidden="true" className="text-text-secondary">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div id={`sector-${sector.id}`} className="border-t border-border p-4">
                <div
                  className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3"
                  role="group"
                  aria-label={`${sector.name} specialties`}
                >
                  {shown.map((spec) => {
                    const isSelected = value.includes(spec.code);
                    return (
                      <button
                        key={spec.code}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggle(spec.code)}
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
                        <span className="text-left leading-tight">{spec.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Per-sector Other input (Other sector uses the same box as free entry). */}
                <div className="mt-4 space-y-2 rounded-xl border border-dashed border-border bg-surface-secondary/50 p-4">
                  <label
                    className="block text-sm font-medium text-text-primary"
                    htmlFor={`other-${sector.id}`}
                  >
                    {sector.id === OTHER_SECTOR_ID
                      ? "Don't see your service anywhere? Describe it here"
                      : `Can't find it in ${sector.name}? Type it here`}
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id={`other-${sector.id}`}
                      type="text"
                      value={otherInput[sector.id] || ""}
                      onChange={(e) => setOtherInput((p) => ({ ...p, [sector.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustom(sector.id);
                        }
                      }}
                      placeholder="e.g. Solar water heating, Borehole drilling"
                      maxLength={60}
                      className="w-full flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => addCustom(sector.id)}
                      disabled={!(otherInput[sector.id] || "").trim()}
                      className="touch-target min-h-[44px] shrink-0 rounded-lg border border-primary-500 px-5 py-3 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add service
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {customs.length > 0 && (
        <div className="space-y-2">
          <span className="block text-xs font-medium uppercase tracking-wide text-text-secondary">
            Your custom services ({customs.length})
          </span>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Custom services added">
            {customs.map((code) => (
              <span
                key={code}
                role="listitem"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-accent-500 bg-accent-50 py-2 pl-4 pr-2 text-sm font-medium text-accent-700"
              >
                {labelForSpecialty(code)}
                {!isOtherSpecialty(code) && (
                  <button
                    type="button"
                    onClick={() => remove(code)}
                    aria-label={`Remove ${labelForSpecialty(code)}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-accent-700 transition-colors hover:bg-accent-500 hover:text-white"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
