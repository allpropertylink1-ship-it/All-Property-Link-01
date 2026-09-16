import type { Metadata } from "next";
import GanttClient from "./GanttClient";
import { ganttSeries, GANTT_META, DELIVERABLES_CHECKLIST, WBS_PHASES } from "@/lib/gantt-data";

export const metadata: Metadata = {
  title: "Gantt — All Property Link Master Plan",
  description: "Interactive Gantt covering Web Proposal 45d + SEO Agreement 1 Aug–22 Dec 2026 + 22-model platform. Mon–Sat, 115 tasks, v1.0.",
};

export default function GanttPage() {
  const total = ganttSeries.length;
  const done = ganttSeries.filter((t) => t.progress === 100).length;
  const milestones = ganttSeries.filter((t) => t.type === "milestone").length;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">All Property Link — Master Gantt</h1>
            <p className="mt-1 text-sm text-text-secondary">
              v{GANTT_META.version} · {GANTT_META.date} · {GANTT_META.start} → {GANTT_META.end} · Weekly · Mon–Sat · {total} tasks ({done} Done, {milestones} milestones) · {GANTT_META.owner} · {GANTT_META.capacity}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface px-4 py-3 text-xs">
            <div className="font-semibold">Deliverable</div>
            <div className="text-text-secondary">Interactive + XLSX share same series. XLSX = contracted file.</div>
            <div className="mt-2 flex gap-2">
              <a href="/api/gantt/xlsx" className="rounded-md bg-primary px-3 py-1.5 font-medium text-white hover:bg-primary-700">Download XLSX v1.0</a>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="text-xs text-text-secondary">Progress</div>
            <div className="text-xl font-bold">{Math.round((done / total) * 100)}%</div>
            <div className="text-xs text-text-secondary">{done}/{total} tasks</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="text-xs text-text-secondary">Contract Value</div>
            <div className="text-xl font-bold">KES 155,000</div>
            <div className="text-xs text-text-secondary">6 payments + 36k dev + 1.5k PM hosting</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="text-xs text-text-secondary">SEO Committed</div>
            <div className="text-xl font-bold">75 posts · 10 blogs</div>
            <div className="text-xs text-text-secondary">30+ citations · 10–25 backlinks</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="text-xs text-text-secondary">Data</div>
            <div className="text-xl font-bold">303 users · 237 props</div>
            <div className="text-xs text-text-secondary">22 models · 2,131 images</div>
          </div>
        </div>
      </div>

      <GanttClient />

      {/* WBS summary */}
      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold">WBS — Baseline vs Actual (hours)</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary text-left text-xs text-text-secondary">
              <tr>
                <th className="px-3 py-2">Phase</th>
                <th className="px-3 py-2">Baseline</th>
                <th className="px-3 py-2">Actual</th>
                <th className="px-3 py-2">Variance</th>
              </tr>
            </thead>
            <tbody>
              {WBS_PHASES.map((r) => (
                <tr key={r.phase} className="border-t border-border">
                  <td className="px-3 py-2">{r.phase}</td>
                  <td className="px-3 py-2">{r.baseline}h</td>
                  <td className="px-3 py-2">{r.actual}h</td>
                  <td className={`px-3 py-2 ${r.actual > r.baseline ? "text-error-600" : r.actual > 0 ? "text-success-600" : "text-text-secondary"}`}>{r.actual - r.baseline >= 0 ? `+${r.actual - r.baseline}` : r.actual - r.baseline}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Deliverables checklist */}
      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Deliverables Checklist (tick per contracted deliverable → Gantt row)</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary text-left text-xs text-text-secondary">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Deliverable</th>
                <th className="px-3 py-2">Phase</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Gantt</th>
                <th className="px-3 py-2">Contract</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERABLES_CHECKLIST.map((d) => (
                <tr key={d.id} className={`border-t border-border ${d.status === "Out of Scope" ? "bg-amber-50/50" : ""}`}>
                  <td className="px-3 py-2 font-mono text-xs">{d.id}</td>
                  <td className="px-3 py-2">{d.deliverable}</td>
                  <td className="px-3 py-2 text-xs">{d.phase}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${d.status === "Done" ? "bg-success-50 text-success-700" : d.status === "Out of Scope" ? "bg-amber-100 text-amber-800" : "bg-surface-secondary text-text-secondary"}`}>{d.status}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{d.ganttId}</td>
                  <td className="px-3 py-2 text-xs text-text-secondary">{d.contract}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-text-secondary">Out-of-scope = paid ads (FB/IG 3–10k, TikTok 2–5k, Google 5–20k + 5k mgmt), direct sales closing, logo rebrand — Agreement p.4 — requires addendum + fee.</p>
      </section>

      <p className="mt-8 text-center text-xs text-text-secondary">Evolving: edit bars/progress inline → undo/redo · zoom in/out · export PNG · XLSX mirrors same series at <code>/api/gantt/xlsx</code></p>
    </div>
  );
}
