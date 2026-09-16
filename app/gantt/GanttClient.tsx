"use client";

import { useEffect, useRef, useState } from "react";
import { ganttSeries, BRAND } from "@/lib/gantt-data";

// react-apexgantt is client-only — dynamic import prevents SSR mismatch
export default function GanttClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let gantt: { destroy: () => void } | null = null;
    let cancelled = false;

    async function mount() {
      if (!containerRef.current) return;
      try {
        const { ApexGantt } = await import("apexgantt");
        if (cancelled || !containerRef.current) return;

        // Strip extended meta before passing to apexgantt (it only needs core TaskInput)
        const series = ganttSeries.map(({ wbs, workstream, owner, priority, status, deliverable, riskId, ...core }) => core);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gantt = new (ApexGantt as any)(containerRef.current, {
          series,
          inputDateFormat: "YYYY-MM-DD",
          theme: "light",
          pixelsPerDay: 4.9, // Month density — zoomIn() → Week 25.7 → Day 80
          rowHeight: 40,
          tasksContainerWidth: 460,
          calendar: {
            workingWeekdays: [1, 2, 3, 4, 5, 6], // Mon-Sat per client
            showNonWorkingStripes: true,
          },
          history: { enabled: true, maxSize: 100 },
          enableCriticalPath: true,
          enableRollups: true,
          enableProjectBoundary: true,
          projectBoundaryColor: "#7C3AED",
          enableSelection: true,
          enableTaskDrag: true,
          enableTaskResize: true,
          enableProgressDrag: true,
          enableCrosshair: true,
          baseline: { enabled: true, color: "#b0b8c1" },
          columnConfig: [
            { key: "name", label: "Task", flexGrow: 2 },
            { key: "progress", label: "%" },
            { key: "startTime", label: "Start" },
            { key: "endTime", label: "End" },
            { key: "dependency", label: "Dep" },
          ],
          // Per-skill: always call render() after construction
          tooltipTemplate: (task: { name: string; startTime: string; endTime?: string; progress?: number }) => {
            const meta = ganttSeries.find((t) => t.name === task.name);
            return `
              <div style="padding:8px 10px;min-width:260px">
                <div style="font-weight:700;margin-bottom:4px">${task.name}</div>
                <div style="font-size:12px;color:#475569">${task.startTime}${task.endTime ? ` → ${task.endTime}` : ""} · ${task.progress ?? 0}%</div>
                ${meta?.deliverable ? `<div style="font-size:12px;margin-top:6px;color:#334155">${meta.deliverable}</div>` : ""}
                ${meta?.wbs ? `<div style="font-size:11px;color:#64748b;margin-top:4px">WBS ${meta.wbs} · ${meta.workstream ?? ""} · ${meta.priority ?? ""} · ${meta.status ?? ""}</div>` : ""}
              </div>`;
          },
        } as unknown as ConstructorParameters<typeof ApexGantt>[1]);
        (gantt as unknown as { render: () => void }).render();
        ganttRef.current = gantt;
        setReady(true);

        // Wire history/progress events on container (skill §6)
        const el = containerRef.current;
        const onHistory = () => {
          // could sync to state or persist
        };
        el.addEventListener("historyChange", onHistory);
      } catch (e) {
        setError((e as Error).message ?? String(e));
      }
    }
    mount();
    return () => {
      cancelled = true;
      try {
        gantt?.destroy(); // REQUIRED per skill §1 — frees ResizeObserver
      } catch {}
    };
  }, []);

  return (
    <div className="w-full">
      {/* Brand tokens for apex family */}
      <style>{`:root{--apx-accent:${BRAND.gold};--apx-fore:#101828;--apx-grid:#e4e7ec;--apx-surface:#ffffff;--apx-series-1:${BRAND.teal};--apx-series-2:${BRAND.tealMid};--apx-series-3:${BRAND.gold};--apx-series-4:${BRAND.grey};--apx-series-5:${BRAND.tealLight};}`}</style>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (ganttRef.current as { zoomIn?: () => void })?.zoomIn?.()}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-secondary"
          >
            Zoom in
          </button>
          <button
            type="button"
            onClick={() => (ganttRef.current as { zoomOut?: () => void })?.zoomOut?.()}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-secondary"
          >
            Zoom out
          </button>
          <button
            type="button"
            onClick={() => (ganttRef.current as { exportChart?: (f?: string) => Promise<void> })?.exportChart?.("png")}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            Export PNG
          </button>
          <a href="/api/gantt/xlsx" className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-ink hover:bg-accent-600">
            Download XLSX
          </a>
        </div>
        <span className="ml-auto text-xs text-text-secondary">
          {ready ? `${ganttSeries.length} tasks · Mon–Sat · drag to reschedule · progress handle` : error ? `Error: ${error}` : "Loading…"}
        </span>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: BRAND.teal }} /> Build/Engineering</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: BRAND.gold }} /> SEO Retainer</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: BRAND.grey }} /> History / OOS</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-dashed border-amber-500" /> Critical path</span>
        <span className="inline-flex items-center gap-1.5">◆ Milestone</span>
      </div>

      <div
        ref={containerRef}
        className="min-h-[560px] overflow-hidden rounded-xl border border-border bg-surface"
        style={{ width: "100%", height: "72vh" }}
      />

      {!ready && !error && <p className="mt-3 text-sm text-text-secondary">Initializing Gantt…</p>}
      {error && <p className="mt-3 text-sm text-error-600">Failed to load Gantt: {error}</p>}
    </div>
  );
}
