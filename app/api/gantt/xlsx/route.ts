import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { ganttSeries, DELIVERABLES_CHECKLIST, GANTT_META } from "@/lib/gantt-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Client-friendly XLSX: 3 sheets, plain English, color = status ──
// Green = Done, Yellow = In Progress/In Review, Grey = Not Started, Red = Blocked
export async function GET() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "All Property Link";
  wb.created = new Date();
  wb.calcProperties.fullCalcOnLoad = true;

  const TEAL = "FF1A3D35";
  const GOLD = "FFD49A44";
  const WHITE = "FFFFFFFF";
  const GREY_TXT = "FF64748B";

  const GREEN_BG = "FFDCFCE7"; // Done
  const GREEN_TXT = "FF166534";
  const YELLOW_BG = "FFFEF9C3"; // In Progress
  const YELLOW_TXT = "FF854D0E";
  const GREY_BG = "FFF1F5F9"; // Not Started
  const MID_GREY_BG = "FFE2E8F0";
  const RED_BG = "FFFEE2E2"; // Blocked

  const thin: ExcelJS.Borders = {
    top: { style: "thin", color: { argb: MID_GREY_BG } },
    left: { style: "thin", color: { argb: MID_GREY_BG } },
    bottom: { style: "thin", color: { argb: MID_GREY_BG } },
    right: { style: "thin", color: { argb: MID_GREY_BG } },
    diagonal: { style: "thin", color: { argb: MID_GREY_BG } },
  };

  const doneCount = ganttSeries.filter((t) => t.status === "Done").length;
  const inProgCount = ganttSeries.filter((t) => t.status === "In Progress" || t.status === "In Review").length;
  const notStarted = ganttSeries.filter((t) => t.status === "Not Started").length;
  const total = ganttSeries.length;
  const pct = Math.round((doneCount / total) * 100);

  // ── Sheet 1: SUMMARY (the client cover) ──
  const s = wb.addWorksheet("Summary", { properties: { tabColor: { argb: TEAL } } });

  s.getCell("A1").value = "All Property Link — Project Status";
  s.getCell("A1").font = { size: 18, bold: true, color: { argb: TEAL } };
  s.getCell("A2").value = `${GANTT_META.version}  ·  ${GANTT_META.date}  ·  ${total} tasks total  ·  Weekly · Mon–Sat`;
  s.getCell("A2").font = { size: 10, color: { argb: GREY_TXT }, italic: true };
  s.getCell("A3").value = "Share this with the client — green = finished, grey = still to do. Details are on the next sheets.";
  s.getCell("A3").font = { size: 10, color: { argb: GREY_TXT } };

  // Big KPIs — 3 boxes
  const kpiRow = 5;
  const boxW = 4;
  // Helper to draw a KPI box occupying 3 cols
  function kpiBox(colStart: number, label: string, value: string, sub: string, bg: string, fg: string) {
    s.mergeCells(kpiRow, colStart, kpiRow, colStart + boxW - 1);
    s.mergeCells(kpiRow + 1, colStart, kpiRow + 1, colStart + boxW - 1);
    s.mergeCells(kpiRow + 2, colStart, kpiRow + 2, colStart + boxW - 1);
    const l = s.getCell(kpiRow, colStart); l.value = label; l.font = { size: 9, color: { argb: fg }, bold: true }; l.alignment = { horizontal: "center", vertical: "middle" };
    const v = s.getCell(kpiRow + 1, colStart); v.value = value; v.font = { size: 18, bold: true, color: { argb: fg } }; v.alignment = { horizontal: "center", vertical: "middle" };
    const su = s.getCell(kpiRow + 2, colStart); su.value = sub; su.font = { size: 8, color: { argb: fg } }; su.alignment = { horizontal: "center", vertical: "middle" };
    for (let r = kpiRow; r <= kpiRow + 2; r++) for (let cc = colStart; cc < colStart + boxW; cc++) {
      const cell = s.getCell(r, cc);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.border = thin;
    }
    s.getRow(kpiRow).height = 16; s.getRow(kpiRow + 1).height = 28; s.getRow(kpiRow + 2).height = 14;
  }
  kpiBox(1, "✅ DONE", `${doneCount}`, `${pct}% done`, GREEN_BG, GREEN_TXT);
  kpiBox(6, "⬜ NOT STARTED", `${notStarted}`, `to begin`, GREY_BG, GREY_TXT);
  kpiBox(11, "🟡 IN PROGRESS", `${inProgCount}`, `active now`, YELLOW_BG, YELLOW_TXT);

  // Progress bar (10 segments)
  const barRow = 9;
  s.getCell(`A${barRow}`).value = "Overall progress";
  s.getCell(`A${barRow}`).font = { size: 9, bold: true, color: { argb: TEAL } };
  const filled = Math.round((pct / 100) * 10);
  for (let i = 0; i < 10; i++) {
    const cell = s.getCell(barRow, 2 + i);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: i < filled ? TEAL : MID_GREY_BG } };
    cell.border = thin;
  }
  s.getCell(barRow, 13).value = `${pct}%`;
  s.getCell(barRow, 13).font = { size: 9, bold: true, color: { argb: TEAL } };
  s.getRow(barRow).height = 14;

  // Legend
  s.getCell("A11").value = "How to read";
  s.getCell("A11").font = { size: 10, bold: true, color: { argb: TEAL } };
  const legend: Array<[string, string, string]> = [
    ["🟩  Green row", "Done — finished and live", GREEN_BG],
    ["🟨  Yellow row", "In progress / in review", YELLOW_BG],
    ["⬜  Grey row", "Not started (planned)", GREY_BG],
    ["🟥  Red row", "Blocked — needs input", RED_BG],
    ["◆", "Milestone (one-day checkpoint/payment)", GOLD],
  ];
  legend.forEach(([a, b, bg], i) => {
    const r = 12 + i;
    const ca = s.getCell(`A${r}`); ca.value = a; ca.font = { size: 9, bold: true }; ca.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg === GOLD ? "FFFFF7ED" : bg } }; ca.border = thin; ca.alignment = { horizontal: "center" };
    const cb = s.getCell(`B${r}`); cb.value = b; cb.font = { size: 9, color: { argb: GREY_TXT } }; cb.border = thin;
    s.mergeCells(`B${r}:G${r}`);
  });

  // Phase summary (simple)
  s.getCell("A18").value = "Progress by phase";
  s.getCell("A18").font = { size: 10, bold: true, color: { argb: TEAL } };
  // Aggregate by parent phase (top-level tasks without parentId)
  const phases = ganttSeries.filter((t) => !t.parentId && t.id.startsWith("ph"));
  s.getCell("A19").value = "Phase"; s.getCell("B19").value = "Done / Total"; s.getCell("C19").value = "Status";
  ["A19", "B19", "C19"].forEach((a) => { const c = s.getCell(a); c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } }; c.font = { color: { argb: WHITE }, bold: true, size: 9 }; c.alignment = { horizontal: "center" }; c.border = thin; });
  phases.forEach((ph, i) => {
    const r = 20 + i;
    const children = ganttSeries.filter((t) => t.parentId === ph.id || t.id === ph.id);
    // better: count all descendants of phase
    const allDesc = ganttSeries.filter((t) => t.id === ph.id || t.parentId === ph.id || ganttSeries.some((p) => p.id === t.parentId && p.parentId === ph.id));
    const d = allDesc.filter((t) => t.status === "Done").length;
    const tot = allDesc.length;
    const label = ph.name.replace("Phase ", "");
    s.getCell(`A${r}`).value = label; s.getCell(`A${r}`).font = { size: 9 }; s.getCell(`A${r}`).border = thin;
    s.getCell(`B${r}`).value = `${d} / ${tot}`; s.getCell(`B${r}`).font = { size: 9 }; s.getCell(`B${r}`).alignment = { horizontal: "center" }; s.getCell(`B${r}`).border = thin;
    const pctPh = tot ? Math.round((d / tot) * 100) : 0;
    const status = pctPh === 100 ? "✅ Done" : pctPh === 0 ? "⬜ Not started" : `🟡 ${pctPh}%`;
    const sc = s.getCell(`C${r}`); sc.value = status; sc.font = { size: 9, bold: true, color: { argb: pctPh === 100 ? GREEN_TXT : pctPh === 0 ? GREY_TXT : YELLOW_TXT } }; sc.alignment = { horizontal: "center" }; sc.border = thin;
    sc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: pctPh === 100 ? GREEN_BG : pctPh === 0 ? GREY_BG : YELLOW_BG } };
    s.getCell(`A${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: pctPh === 100 ? GREEN_BG : pctPh === 0 ? GREY_BG : YELLOW_BG } };
    s.getCell(`B${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: pctPh === 100 ? GREEN_BG : pctPh === 0 ? GREY_BG : YELLOW_BG } };
  });
  s.getCell(`A${20 + phases.length + 1}`).value = "Tip: Change any Status to “Done” on the Work Tracker sheet — this summary updates itself.";
  s.getCell(`A${20 + phases.length + 1}`).font = { size: 8, italic: true, color: { argb: GREY_TXT } };

  s.getColumn(1).width = 42;
  s.getColumn(2).width = 16;
  s.getColumn(3).width = 16;
  for (let c = 4; c <= 28; c++) s.getColumn(c).width = 4;
  s.pageSetup.paperSize = 9 as unknown as ExcelJS.PageSetup["paperSize"];
  s.pageSetup.orientation = "landscape"; s.pageSetup.fitToPage = true; s.pageSetup.fitToWidth = 1; s.pageSetup.fitToHeight = 1;

  // ── Sheet 2: WORK TRACKER (one row per task, status = color) ──
  const w = wb.addWorksheet("Work Tracker", { properties: { tabColor: { argb: GREEN_TXT } } });
  // Title row
  w.getCell("A1").value = "Work Tracker — ✅ green = done, ⬜ grey = to do · Filter by Status · Edit Status to update";
  w.getCell("A1").font = { size: 10, bold: true, color: { argb: TEAL } };
  w.mergeCells("A1:E1");

  const headers = ["Phase", "Task", "Status", "When", "Notes (what this delivers)"];
  w.addRow(headers);
  const hr = w.getRow(2);
  hr.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } }; c.font = { color: { argb: WHITE }, bold: true, size: 10 }; c.alignment = { horizontal: "center", vertical: "middle" }; c.border = thin; });
  hr.height = 20;
  w.views = [{ state: "frozen", xSplit: 0, ySplit: 2 }];
  w.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: headers.length } };

  function statusStyle(sv: string) {
    if (sv === "Done") return { bg: GREEN_BG, fg: GREEN_TXT, label: "✅ Done" };
    if (sv === "In Progress" || sv === "In Review") return { bg: YELLOW_BG, fg: YELLOW_TXT, label: `🟡 ${sv}` };
    if (sv === "Blocked") return { bg: RED_BG, fg: "FF991B1B", label: "🟥 Blocked" };
    return { bg: GREY_BG, fg: GREY_TXT, label: "⬜ Not started" };
  }

  // Emit phase header + tasks grouped
  for (const ph of phases) {
    const descendants = ganttSeries.filter((t) => t.id === ph.id || t.parentId === ph.id || ganttSeries.some((p) => p.id === t.parentId && p.parentId === ph.id));
    const d = descendants.filter((t) => t.status === "Done").length;
    const tot = descendants.length;
    const isDone = d === tot && tot > 0;
    const isNotStarted = d === 0;
    const phBg = isDone ? GREEN_BG : isNotStarted ? MID_GREY_BG : YELLOW_BG;
    const phFg = isDone ? GREEN_TXT : isNotStarted ? GREY_TXT : YELLOW_TXT;

    const phRow = w.addRow([ph.name.replace("Phase ", ""), `${d}/${tot} done`, isDone ? "✅ Done" : isNotStarted ? "⬜ Not started" : `🟡 ${Math.round((d / tot) * 100)}%`, "", ph.deliverable ?? ""]);
    phRow.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: phBg } }; c.font = { size: 10, bold: true, color: { argb: phFg } }; c.border = thin; c.alignment = { vertical: "middle" }; });
    phRow.height = 18;

    for (const t of descendants) {
      if (t.id === ph.id) continue; // phase already as header
      const isMilestone = t.type === "milestone";
      const when = isMilestone ? (t.startTime ?? "") : t.startTime && t.endTime ? `${t.startTime} → ${t.endTime}` : t.startTime ?? "";
      const sv = t.status ?? "Not Started";
      const st = statusStyle(sv);
      const row = w.addRow([
        "", // phase col blank for child (grouping via header)
        isMilestone ? `◆ ${t.name.replace(/^◆\s*/, "")}` : `  ${t.name}`,
        st.label,
        when,
        t.deliverable ?? "",
      ]);
      row.eachCell((c, col) => {
        c.border = thin; c.font = { size: 9, color: { argb: col === 3 ? st.fg : "FF1F2937" }, bold: col === 3 }; c.alignment = { vertical: "middle", wrapText: col === 5 };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: st.bg } };
        if (isMilestone) { c.font = { size: 9, bold: true, color: { argb: TEAL } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF7ED" } }; }
      });
      row.height = 16;
      // Status dropdown per task row
      // ref by row number
      const rIdx = row.number;
      w.getCell(`C${rIdx}`).dataValidation = { type: "list", formulae: ['"✅ Done,🟡 In Progress,🟡 In Review,⬜ Not started,🟥 Blocked"'], showErrorMessage: false } as unknown as ExcelJS.DataValidation;
    }
  }

  w.getColumn(1).width = 30;
  w.getColumn(2).width = 58;
  w.getColumn(3).width = 16;
  w.getColumn(4).width = 24;
  w.getColumn(5).width = 52;

  // ── Sheet 3: DELIVERABLES (client checklist — Done vs To Do) ──
  const chk = wb.addWorksheet("Deliverables", { properties: { tabColor: { argb: GOLD } } });
  chk.getCell("A1").value = "Deliverables — what the contract promised (tick when live)";
  chk.getCell("A1").font = { size: 11, bold: true, color: { argb: TEAL } };
  chk.getCell("A2").value = "Green = done · Grey = to do · Yellow = in progress — change Status and the Summary updates";
  chk.getCell("A2").font = { size: 9, color: { argb: GREY_TXT }, italic: true };
  chk.mergeCells("A1:C1"); chk.mergeCells("A2:C2");

  chk.addRow(["Deliverable", "Status", "Reference"]);
  const ch = chk.getRow(3);
  ch.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } }; c.font = { color: { argb: WHITE }, bold: true, size: 10 }; c.alignment = { horizontal: "center", vertical: "middle" }; c.border = thin; });
  ch.height = 18;
  chk.views = [{ state: "frozen", xSplit: 0, ySplit: 3 }];
  chk.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: 3 } };

  for (const d of DELIVERABLES_CHECKLIST) {
    const isDone = d.status === "Done";
    const isOOS = d.status === "Out of Scope";
    const label = isDone ? "✅ Done" : isOOS ? "— Out of scope" : "⬜ To do";
    const bg = isDone ? GREEN_BG : isOOS ? MID_GREY_BG : GREY_BG;
    const fg = isDone ? GREEN_TXT : isOOS ? GREY_TXT : GREY_TXT;
    const r = chk.addRow([d.deliverable, label, d.contract]);
    r.eachCell((c, col) => {
      c.border = thin; c.font = { size: 9, color: { argb: col === 2 ? fg : "FF1F2937" }, bold: col === 2 }; c.alignment = { vertical: "middle", wrapText: col === 1 };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      if (isOOS) c.font = { size: 9, color: { argb: GREY_TXT }, italic: true };
    });
    r.getCell(2).dataValidation = { type: "list", formulae: ['"✅ Done,⬜ To do,🟡 In progress,— Out of scope"'], showErrorMessage: false } as unknown as ExcelJS.DataValidation;
    r.height = 18;
  }
  chk.getColumn(1).width = 68;
  chk.getColumn(2).width = 16;
  chk.getColumn(3).width = 26;

  wb.eachSheet((ws) => {
    ws.pageSetup.paperSize = 9 as unknown as ExcelJS.PageSetup["paperSize"];
    ws.pageSetup.orientation = "landscape";
    ws.pageSetup.fitToPage = true;
    ws.pageSetup.fitToWidth = 1;
    ws.pageSetup.fitToHeight = 0;
    ws.properties.defaultRowHeight = 15;
  });

  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(buf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="All-Property-Link-Gantt-${GANTT_META.version}-${GANTT_META.date}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
