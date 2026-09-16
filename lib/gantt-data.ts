/**
 * All Property Link — Master Gantt Data
 * Source: contracts (Web Development Proposal 45d + SEO Agreement 1 Aug–22 Dec 2026) +
 *         docs/00-master-plan.md Wk1-10 (281h) + tasks/todo.md T1-T16 + platform-model.md
 * Dates: inputDateFormat 'YYYY-MM-DD' (skill §2). Mon-Sat workingWeekdays.
 * Owner: solo (you) — 40h/wk. Status/Priority drive conditional styling.
 * Version: v1.0 (2026-09-15) — 8 sheets XLSX + interactive apexgantt share this series.
 */

export type GanttTask = {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
  progress: number;
  type?: "task" | "milestone";
  parentId?: string;
  dependency?: string | { taskId: string; type?: "FS" | "SS" | "FF" | "SF"; lag?: number };
  barBackgroundColor?: string;
  rowBackgroundColor?: string;
  collapsed?: boolean;
  // extended meta for XLSX + tooltip
  wbs?: string;
  workstream?: "Build" | "Engineering" | "Admin" | "Infra" | "Content" | "SEO" | "Growth";
  owner?: string;
  priority?: "P0" | "P1" | "P2";
  status?: "Not Started" | "In Progress" | "Blocked" | "In Review" | "Done";
  deliverable?: string;
  riskId?: string;
};

// Brand tokens — warm-beige/teal/gold
export const BRAND = {
  teal: "#1A3D35",
  tealMid: "#286255",
  tealLight: "#3a806e",
  gold: "#D49A44",
  goldLight: "#e8b86a",
  beige: "#F9FAFB",
  grey: "#64748b",
  greyLight: "#94a3b8",
  success: "#16a34a",
  warning: "#f59e0b",
  error: "#dc2626",
  surface: "#ffffff",
} as const;

// Helper: done tasks are 100%, others 0 (evolve via updateTask)
const DONE = 100;
const TODO = 0;

export const ganttSeries: GanttTask[] = [
  // ── Phase 0 — Completed History (collapsed summary, DONE) ──
  { id: "ph0", name: "Phase 0 — Completed History (Sessions 1–21)", startTime: "2026-06-22", endTime: "2026-09-15", progress: DONE, wbs: "0", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "BE Express+cPanel, FE Next+Admin, 303 users/237 props, 2,131 images", collapsed: true, barBackgroundColor: BRAND.grey },
  { id: "ph0-a", name: "Sessions 1–10: Scaffolding → cPanel migration → SEO sweep", parentId: "ph0", startTime: "2026-06-22", endTime: "2026-08-16", progress: DONE, wbs: "0.1", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "Prisma 22 models, auth (JWT httpOnly), property CRUD, deploy pipeline" },
  { id: "ph0-b", name: "Sessions 11–19: Referral fix → disputes mount → auth curtain 5 iterations", parentId: "ph0", startTime: "2026-08-10", endTime: "2026-09-01", progress: DONE, wbs: "0.2", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "AuthCard curtain, FormFeedback 27 files, map isolate" },
  { id: "ph0-c", name: "Sessions 20–21: fast-deploy + 7 admin gaps (messages/reviews/categories)", parentId: "ph0", startTime: "2026-09-01", endTime: "2026-09-15", progress: DONE, wbs: "0.3", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "backend-deploy.py, restart.txt verified, admin gaps closed" },

  // ── Phase I — Discovery, Architecture & Strategy (Wk1 per proposal) ──
  { id: "ph1", name: "Phase I — Discovery, Architecture & Strategy", startTime: "2026-06-22", endTime: "2026-06-28", progress: DONE, wbs: "1", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "IA + DB schema + journey maps + wireframes", barBackgroundColor: BRAND.teal },
  { id: "ph1-1", name: "Information architecture + sitemap", parentId: "ph1", startTime: "2026-06-22", endTime: "2026-06-24", progress: DONE, wbs: "1.1", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "Sitemap final, routes mapped" },
  { id: "ph1-2", name: "DB schema mapping (22 models, enums, indexes)", parentId: "ph1", startTime: "2026-06-22", endTime: "2026-06-25", progress: DONE, wbs: "1.2", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "schema.prisma locked, 15 enums" },
  { id: "ph1-3", name: "User journey mapping (guest / vendor / admin)", parentId: "ph1", startTime: "2026-06-24", endTime: "2026-06-26", progress: DONE, wbs: "1.3", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "Journey maps per persona (Owner/Agent/Fundi/Provider)" },
  { id: "ph1-4", name: "Low-fi wireframing core layouts", parentId: "ph1", startTime: "2026-06-25", endTime: "2026-06-28", progress: DONE, wbs: "1.4", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "Wireframes homepage/search/detail/dashboard/admin" },

  // ── Phase II — UI/UX Design & Prototyping (Wk2-3) ──
  { id: "ph2", name: "Phase II — UI/UX Design & Prototyping", startTime: "2026-06-29", endTime: "2026-07-12", progress: DONE, wbs: "2", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "Hi-fi desktop+mobile, mobile-first, revisions", barBackgroundColor: BRAND.tealMid },
  { id: "ph2-1", name: "Hi-fi pixel-perfect prototypes (desktop + mobile)", parentId: "ph2", startTime: "2026-06-29", endTime: "2026-07-05", progress: DONE, wbs: "2.1", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "Figma hi-fi, warm-beige/teal/gold tokens" },
  { id: "ph2-2", name: "Mobile-first + touch-target 44×44 optimization", parentId: "ph2", startTime: "2026-07-03", endTime: "2026-07-08", progress: DONE, wbs: "2.2", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "touch-target, 375/768/1024/1440 breakpoints" },
  { id: "ph2-3", name: "Design feedback & revisions", parentId: "ph2", startTime: "2026-07-06", endTime: "2026-07-12", progress: DONE, wbs: "2.3", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "VERSO → 50% curtain iterations, 5 rounds" },

  // ── Phase III — Full-Stack Engineering (Wk3-5) ──
  { id: "ph3", name: "Phase III — Full-Stack Engineering", startTime: "2026-07-13", endTime: "2026-08-16", progress: DONE, wbs: "3", workstream: "Engineering", owner: "You", priority: "P0", status: "Done", deliverable: "Public + vendor portal + admin, secure + performant", barBackgroundColor: BRAND.teal },
  // Public marketplace
  { id: "ph3-a", name: "Public Marketplace", parentId: "ph3", startTime: "2026-07-13", endTime: "2026-07-26", progress: DONE, wbs: "3.1", workstream: "Engineering", owner: "You", priority: "P0", status: "Done", deliverable: "Homepage, search, directory, profiles, static pages" },
  { id: "ph3-a1", name: "Homepage + hero + QuickSearch + categories 5-col", parentId: "ph3-a", startTime: "2026-07-13", endTime: "2026-07-16", progress: DONE, wbs: "3.1.1", workstream: "Engineering", owner: "You", priority: "P0", status: "Done", deliverable: "Dynamic counts, 5th Service Providers card" },
  { id: "ph3-a2", name: "AJAX real-time keyword + geo search + filters", parentId: "ph3-a", startTime: "2026-07-15", endTime: "2026-07-22", progress: DONE, wbs: "3.1.2", workstream: "Engineering", owner: "You", priority: "P0", status: "Done", deliverable: "Search autocomplete, price/type/city/bedrooms" },
  { id: "ph3-a3", name: "Directory grids + vendor profile pages", parentId: "ph3-a", startTime: "2026-07-18", endTime: "2026-07-26", progress: DONE, wbs: "3.1.3", workstream: "Engineering", owner: "You", priority: "P0", status: "Done", deliverable: "PropertyCard/Grid, galleries, click-to-call + wa.me" },
  { id: "ph3-a4", name: "Static pages (About/Contact/FAQ/Terms/Privacy)", parentId: "ph3-a", startTime: "2026-07-20", endTime: "2026-07-26", progress: DONE, wbs: "3.1.4", workstream: "Build", owner: "You", priority: "P1", status: "Done", deliverable: "Canonicals + SEO titles" },
  // Vendor portal
  { id: "ph3-b", name: "Vendor / Business Portal", parentId: "ph3", startTime: "2026-07-20", endTime: "2026-08-09", progress: DONE, wbs: "3.2", workstream: "Engineering", owner: "You", priority: "P0", status: "Done", deliverable: "Auth, CRUD, compression, analytics" },
  { id: "ph3-b1", name: "Secure registration + auth (JWT httpOnly + OTP)", parentId: "ph3-b", startTime: "2026-07-20", endTime: "2026-07-28", progress: DONE, wbs: "3.2.1", workstream: "Engineering", owner: "You", priority: "P0", status: "Done", deliverable: "register/login/verify-otp/magic-link/Google OAuth" },
  { id: "ph3-b2", name: "Listing CRUD (create/read/update/delete) + lifecycle", parentId: "ph3-b", startTime: "2026-07-27", endTime: "2026-08-05", progress: DONE, wbs: "3.2.2", workstream: "Engineering", owner: "You", priority: "P0", status: "Done", deliverable: "DRAFT→PENDING_REVIEW→APPROVED→PUBLISHED→EXPIRED→ARCHIVED" },
  { id: "ph3-b3", name: "Media compression (canvas 1600px q0.82) + upload", parentId: "ph3-b", startTime: "2026-07-30", endTime: "2026-08-06", progress: DONE, wbs: "3.2.3", workstream: "Engineering", owner: "You", priority: "P0", status: "Done", deliverable: "lib/image-client.ts, /uploads local, resolveImageUrl()" },
  { id: "ph3-b4", name: "Lead + analytics dashboards", parentId: "ph3-b", startTime: "2026-08-03", endTime: "2026-08-09", progress: DONE, wbs: "3.2.4", workstream: "Engineering", owner: "You", priority: "P1", status: "Done", deliverable: "Dashboard stats, views, inquiries" },
  // Admin
  { id: "ph3-c", name: "Admin Dashboard", parentId: "ph3", startTime: "2026-07-27", endTime: "2026-08-16", progress: DONE, wbs: "3.3", workstream: "Admin", owner: "You", priority: "P0", status: "Done", deliverable: "Master user mgmt, moderation, CMS, RBAC", barBackgroundColor: BRAND.tealMid },
  { id: "ph3-c1", name: "User management + RBAC + permissions", parentId: "ph3-c", startTime: "2026-07-27", endTime: "2026-08-02", progress: DONE, wbs: "3.3.1", workstream: "Admin", owner: "You", priority: "P0", status: "Done", deliverable: "Admin model separate, requireAdmin, 10 bulk endpoints" },
  { id: "ph3-c2", name: "Moderation queues (properties/services/KYC/claims/disputes)", parentId: "ph3-c", startTime: "2026-08-01", endTime: "2026-08-12", progress: DONE, wbs: "3.3.2", workstream: "Admin", owner: "You", priority: "P0", status: "Done", deliverable: "Approve/reject, money claims workflow, BulkActionsBar" },
  { id: "ph3-c3", name: "CMS + platform settings + exports (xlsx)", parentId: "ph3-c", startTime: "2026-08-10", endTime: "2026-08-16", progress: DONE, wbs: "3.3.3", workstream: "Admin", owner: "You", priority: "P1", status: "Done", deliverable: "PlatformSettings, 7 excel export endpoints, categories" },

  // ── Phase IV — QA, Testing & Handover (Wk6) ──
  { id: "ph4", name: "Phase IV — QA, Testing & Handover", startTime: "2026-08-10", endTime: "2026-08-22", progress: DONE, wbs: "4", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "Cross-browser, CWV, security, deploy", barBackgroundColor: BRAND.teal },
  { id: "ph4-1", name: "Cross-browser + responsive audits", parentId: "ph4", startTime: "2026-08-10", endTime: "2026-08-15", progress: DONE, wbs: "4.1", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "375/768/1024/1440, Chrome/Firefox/Safari" },
  { id: "ph4-2", name: "Core Web Vitals (LCP<1.5s, lazy, caching, minify)", parentId: "ph4", startTime: "2026-08-12", endTime: "2026-08-18", progress: DONE, wbs: "4.2", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "ISR 120/60/30s, s-maxage, stale-while-revalidate" },
  { id: "ph4-3", name: "Security hardening (SSL, hashing, CSRF, helmet)", parentId: "ph4", startTime: "2026-08-14", endTime: "2026-08-18", progress: DONE, wbs: "4.3", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "Let's Encrypt, bcrypt, csrfProtection, ModSecurity" },
  { id: "ph4-4", name: "Production deploy + DNS + handover walkthrough", parentId: "ph4", startTime: "2026-08-16", endTime: "2026-08-22", progress: DONE, wbs: "4.4", workstream: "Infra", owner: "You", priority: "P0", status: "Done", deliverable: "cPanel api.allpropertylink.co.ke, Vercel www, handover doc" },
  { id: "ph4-5", name: "SEO baseline (semantic HTML, sitemap 452 URLs, schema)", parentId: "ph4", startTime: "2026-08-15", endTime: "2026-08-22", progress: DONE, wbs: "4.5", workstream: "Content", owner: "You", priority: "P0", status: "Done", deliverable: "robots/sitemap www, JSON-LD RealEstate/Breadcrumb/SearchAction" },

  // ── Phase V — Import-v2 Full Redo (T1-T16) ──
  { id: "ph5", name: "Phase V — Import-v2 Full Redo (T1–T16)", startTime: "2026-09-16", endTime: "2026-10-17", progress: TODO, wbs: "5", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "Merge 323→236, KYC, SEO, forced password", barBackgroundColor: BRAND.gold },
  { id: "ph5-0", name: "T1 Env + snapshot/restore (13 tables FK-ordered)", parentId: "ph5", startTime: "2026-09-16", endTime: "2026-09-18", progress: TODO, wbs: "5.1", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "backup-<date>.json + restore verified, state file" },
  { id: "ph5-1", name: "T2 Bulk-download all old-site images + retry report", parentId: "ph5", startTime: "2026-09-18", endTime: "2026-09-22", progress: TODO, wbs: "5.2", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "scraped-data/images/ + completion report" },
  { id: "ph5-2", name: "T3 Seed guard (empty-DB-only) + prisma db push", parentId: "ph5", startTime: "2026-09-22", endTime: "2026-09-23", progress: TODO, wbs: "5.3", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "seed.ts no-resurrect, db push --accept-data-loss" },
  { id: "ph5-3", name: "T4 Identity resolver (4 join-key formats + overrides)", parentId: "ph5", startTime: "2026-09-23", endTime: "2026-09-25", progress: TODO, wbs: "5.4", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "Canonical resolver, overrides.json" },
  { id: "ph5-4", name: "T5 Merge 323→236 (move FK rows, dedupe KYC/listings)", parentId: "ph5", startTime: "2026-09-25", endTime: "2026-09-29", progress: TODO, wbs: "5.5", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "merge-decisions.json + apply, idempotent chunks" },
  { id: "ph5-5", name: "T5b mustChangePassword=true on migrated users", parentId: "ph5", startTime: "2026-09-29", endTime: "2026-09-30", progress: TODO, wbs: "5.5b", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "Flag on canonical migrated users only" },
  { id: "ph5-6", name: "T6 KYC re-upload kyc/<userId>-n (500-700 images)", parentId: "ph5", startTime: "2026-09-30", endTime: "2026-10-02", progress: TODO, wbs: "5.6", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "Cloudinary kyc/ batch, one go" },
  { id: "ph5-7", name: "T7 KYC status reconciliation + NONE→prompt", parentId: "ph5", startTime: "2026-10-02", endTime: "2026-10-03", progress: TODO, wbs: "5.7", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "doc.status ↔ user.kycStatus mirrored" },
  { id: "ph5-8", name: "T8 Mojibake/HTML strip + T9 enrichment (Hurlingham etc.)", parentId: "ph5", startTime: "2026-10-03", endTime: "2026-10-06", progress: TODO, wbs: "5.8", workstream: "Engineering", owner: "You", priority: "P1", status: "Not Started", deliverable: "Cleaned profiles + company/category fills" },
  { id: "ph5-9", name: "T10 Properties SEO (titles/descriptions/slugs NULL-safe)", parentId: "ph5", startTime: "2026-10-06", endTime: "2026-10-09", progress: TODO, wbs: "5.9", workstream: "Content", owner: "You", priority: "P0", status: "Not Started", deliverable: "246 titles, ordered createdAt,id, soft-delete suffix" },
  { id: "ph5-10", name: "T11 Services SEO (Service | Business slugs)", parentId: "ph5", startTime: "2026-10-09", endTime: "2026-10-10", progress: TODO, wbs: "5.10", workstream: "Content", owner: "You", priority: "P0", status: "Not Started", deliverable: "164 services slug/seoTitle/seoDescription" },
  { id: "ph5-11", name: "T12 Re-upload listing images <slug>-n nightly 200/d", parentId: "ph5", startTime: "2026-10-10", endTime: "2026-10-17", progress: TODO, wbs: "5.11", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "1,400 images descriptive public_ids, state progress" },
  { id: "ph5-12", name: "Checkpoint: review sample listings live with client", parentId: "ph5", startTime: "2026-10-13", endTime: "2026-10-13", progress: TODO, type: "milestone", wbs: "5.CP", workstream: "Content", owner: "You", priority: "P0", status: "Not Started", deliverable: "Client SEO sample approval", barBackgroundColor: BRAND.gold },
  { id: "ph5-13", name: "T13 Forced password gate (JWT 403 + phone OTP)", parentId: "ph5", startTime: "2026-10-14", endTime: "2026-10-16", progress: TODO, wbs: "5.12", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "403 CHANGE_PASSWORD_REQUIRED + global handler + banner" },
  { id: "ph5-14", name: "T14 Stale services delete (dry-run first)", parentId: "ph5", startTime: "2026-10-16", endTime: "2026-10-17", progress: TODO, wbs: "5.13", workstream: "Engineering", owner: "You", priority: "P1", status: "Not Started", deliverable: "Orphan 161 + 12 dup groups removed" },
  { id: "ph5-15", name: "T15 Cloudinary orphan search (report-only)", parentId: "ph5", startTime: "2026-10-16", endTime: "2026-10-17", progress: TODO, wbs: "5.14", workstream: "Engineering", owner: "You", priority: "P2", status: "Not Started", deliverable: "allpropertylink/ prefix diff, exclude kyc" },
  { id: "ph5-16", name: "T16 Final verify (0 old URLs, tsc×3, smoke)", parentId: "ph5", startTime: "2026-10-17", endTime: "2026-10-17", progress: TODO, wbs: "5.15", workstream: "Engineering", owner: "You", priority: "P0", status: "Not Started", deliverable: "Seed no-resurrect + schema applied" },

  // ── Phase VI — Platform Model v2 ──
  { id: "ph6", name: "Phase VI — Platform Model v2 Enrichment", startTime: "2026-10-18", endTime: "2026-11-08", progress: TODO, wbs: "6", workstream: "Engineering", owner: "You", priority: "P1", status: "Not Started", deliverable: "Booking + owner consent + subType", barBackgroundColor: BRAND.tealMid },
  { id: "ph6-1", name: "Booking model (PENDING→CONFIRMED→COMPLETED→Review)", parentId: "ph6", startTime: "2026-10-18", endTime: "2026-10-25", progress: TODO, wbs: "6.1", workstream: "Engineering", owner: "You", priority: "P1", status: "Not Started", deliverable: "Prisma Booking + routes + UI" },
  { id: "ph6-2", name: "Property ownerId + ownerContactInfo consent flow", parentId: "ph6", startTime: "2026-10-25", endTime: "2026-10-30", progress: TODO, wbs: "6.2", workstream: "Engineering", owner: "You", priority: "P1", status: "Not Started", deliverable: "Owner consent modal + audit" },
  { id: "ph6-3", name: "ServiceListing subType + Business enrichment polish", parentId: "ph6", startTime: "2026-10-30", endTime: "2026-11-05", progress: TODO, wbs: "6.3", workstream: "Engineering", owner: "You", priority: "P1", status: "Not Started", deliverable: "subType enum + hire flow UX" },
  { id: "ph6-4", name: "Fundi/Service Provider Offer → Booking E2E", parentId: "ph6", startTime: "2026-11-05", endTime: "2026-11-08", progress: TODO, wbs: "6.4", workstream: "Engineering", owner: "You", priority: "P1", status: "Not Started", deliverable: "E2E booking + notification" },

  // ── Phase VII — Post-Launch Future (Q4 2026+) ──
  { id: "ph7", name: "Phase VII — Post-Launch Future", startTime: "2026-11-09", endTime: "2027-02-28", progress: TODO, wbs: "7", workstream: "Growth", owner: "You", priority: "P2", status: "Not Started", deliverable: "M-Pesa, tiers, CRM, MLS, RN, i18n", barBackgroundColor: BRAND.tealLight },
  { id: "ph7-1", name: "M-Pesa Daraja integration (collections)", parentId: "ph7", startTime: "2026-11-09", endTime: "2026-11-22", progress: TODO, wbs: "7.1", workstream: "Engineering", owner: "You", priority: "P1", status: "Not Started", deliverable: "Daraja STK push + callback" },
  { id: "ph7-2", name: "Agent subscription tiers (Free 5 → Pro KES 1,500/mo)", parentId: "ph7", startTime: "2026-11-22", endTime: "2026-12-06", progress: TODO, wbs: "7.2", workstream: "Growth", owner: "You", priority: "P1", status: "Not Started", deliverable: "Limits, featured rotation, analytics" },
  { id: "ph7-3", name: "CRM features for agents", parentId: "ph7", startTime: "2026-12-06", endTime: "2026-12-20", progress: TODO, wbs: "7.3", workstream: "Growth", owner: "You", priority: "P2", status: "Not Started", deliverable: "Pipeline + follow-ups" },
  { id: "ph7-4", name: "MLS data exchange", parentId: "ph7", startTime: "2026-12-20", endTime: "2027-01-15", progress: TODO, wbs: "7.4", workstream: "Engineering", owner: "You", priority: "P2", status: "Not Started", deliverable: "MLS feed ingest" },
  { id: "ph7-5", name: "React Native mobile app", parentId: "ph7", startTime: "2027-01-15", endTime: "2027-02-15", progress: TODO, wbs: "7.5", workstream: "Engineering", owner: "You", priority: "P2", status: "Not Started", deliverable: "iOS/Android wrappers" },
  { id: "ph7-6", name: "Swahili i18n", parentId: "ph7", startTime: "2027-02-15", endTime: "2027-02-28", progress: TODO, wbs: "7.6", workstream: "Content", owner: "You", priority: "P2", status: "Not Started", deliverable: "Locale switch + translations" },

  // ── Phase VIII — Infra & Ops (parallel) ──
  { id: "ph8", name: "Phase VIII — Infra & Hardening", startTime: "2026-06-22", endTime: "2026-10-03", progress: DONE, wbs: "8", workstream: "Infra", owner: "You", priority: "P0", status: "In Progress", deliverable: "Hosting, DNS, monitoring, hardening", barBackgroundColor: BRAND.grey },
  { id: "ph8-1", name: "cPanel harden: whitelist IP + enable SSH (uurpnicr)", parentId: "ph8", startTime: "2026-09-16", endTime: "2026-09-17", progress: TODO, wbs: "8.1", workstream: "Infra", owner: "You", priority: "P0", status: "Not Started", deliverable: "Imunify360 whitelist + cloudlinux-selector CLI", barBackgroundColor: BRAND.warning },
  { id: "ph8-2", name: "Brevo domain verification (allpropertylink.co.ke DKIM)", parentId: "ph8", startTime: "2026-09-16", endTime: "2026-09-17", progress: TODO, wbs: "8.2", workstream: "Infra", owner: "You", priority: "P0", status: "Not Started", deliverable: "DKIM/SPF live, OTP emails to real domains" },
  { id: "ph8-3", name: "AT Sender ID AllPropertyLink (KES 7K Safaricom)", parentId: "ph8", startTime: "2026-09-16", endTime: "2026-09-20", progress: TODO, wbs: "8.3", workstream: "Infra", owner: "You", priority: "P1", status: "Not Started", deliverable: "SMS from registered sender" },
  { id: "ph8-4", name: "Redis provision (rate-limit + BullMQ)", parentId: "ph8", startTime: "2026-09-22", endTime: "2026-09-24", progress: TODO, wbs: "8.4", workstream: "Infra", owner: "You", priority: "P1", status: "Not Started", deliverable: "Shared limiter + queue" },
  { id: "ph8-5", name: "Monitoring: Sentry + BetterStack + Vercel Analytics", parentId: "ph8", startTime: "2026-08-22", endTime: "2026-09-01", progress: DONE, wbs: "8.5", workstream: "Infra", owner: "You", priority: "P1", status: "Done", deliverable: "Error tracking + uptime" },

  // ── Phase IX — SEO Retainer (binding Agreement 1 Aug–22 Dec 2026) ──
  { id: "ph9", name: "Phase IX — SEO Retainer (1 Aug – 22 Dec 2026)", startTime: "2026-08-01", endTime: "2026-12-22", progress: TODO, wbs: "9", workstream: "SEO", owner: "You", priority: "P0", status: "In Progress", deliverable: "75 posts, 10 blogs, 30+ citations, 10-25 backlinks", barBackgroundColor: BRAND.gold },
  // M1 Aug
  { id: "ph9-m1", name: "M1 Aug — Technical Foundation + Accounts", parentId: "ph9", startTime: "2026-08-01", endTime: "2026-08-31", progress: TODO, wbs: "9.1", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Audit + GSC + GA4 (3 conversions) + GBP + PageSpeed 6", barBackgroundColor: BRAND.goldLight },
  { id: "ph9-m1-1", name: "1A Technical crawl (404/redirect/H1/thin/orphan/broken)", parentId: "ph9-m1", startTime: "2026-08-01", endTime: "2026-08-07", progress: TODO, wbs: "9.1.1", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Technical Audit Report (Critical/High/Med/Low)" },
  { id: "ph9-m1-2", name: "1B-1D GSC + GA4 + Google Business Profile", parentId: "ph9-m1", startTime: "2026-08-01", endTime: "2026-08-07", progress: TODO, wbs: "9.1.2", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "GSC/GA4 active, sitemap submitted, GBP 750-char" },
  { id: "ph9-m1-3", name: "1E-1H PageSpeed 6 pages + mobile 48×48 + CWV + robots.txt", parentId: "ph9-m1", startTime: "2026-08-04", endTime: "2026-08-14", progress: TODO, wbs: "9.1.3", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Before/after speed report, CWV LCP<2.5 CLS<0.1, GPTBot allowed" },
  { id: "ph9-m1-4", name: "M1 Content: 15 social posts + Blog Post 1 + cornerstone prep", parentId: "ph9-m1", startTime: "2026-08-07", endTime: "2026-08-31", progress: TODO, wbs: "9.1.4", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "4 accounts (IG/FB/TikTok/LinkedIn) + 15 posts + Blog 1" },
  { id: "ph9-m1-5", name: "M1 Verification Report → Payment 2 (KES 31,000)", parentId: "ph9-m1", startTime: "2026-08-31", endTime: "2026-08-31", progress: TODO, type: "milestone", wbs: "9.1.M", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Report + invoice, M-Pesa/bank within 1 business day", barBackgroundColor: BRAND.gold },
  // M2 Sep
  { id: "ph9-m2", name: "M2 Sep — Keyword/Competitor + On-Page", parentId: "ph9", startTime: "2026-09-01", endTime: "2026-09-30", progress: TODO, wbs: "9.2", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "100+ keywords, 5 competitors, 28 pages meta, 15 posts" },
  { id: "ph9-m2-1", name: "2A Keyword 100+ (5 buckets) + 2B Competitor 5 sites", parentId: "ph9-m2", startTime: "2026-09-01", endTime: "2026-09-14", progress: TODO, wbs: "9.2.1", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Spreadsheet + competitor gaps 3 per rival" },
  { id: "ph9-m2-2", name: "3A-3D Meta 28 pages + headings + 301 URLs + images", parentId: "ph9-m2", startTime: "2026-09-14", endTime: "2026-09-28", progress: TODO, wbs: "9.2.2", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Titles 50-60, desc 150-160, alt text" },
  { id: "ph9-m2-3", name: "15 social posts (30 cumulative) + Area Guides 3/10", parentId: "ph9-m2", startTime: "2026-09-01", endTime: "2026-09-30", progress: TODO, wbs: "9.2.3", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "30 posts total, Westlands/Kilimani/Kileleshwa" },
  { id: "ph9-m2-4", name: "M2 Verification Report → Payment 3 (KES 31,000)", parentId: "ph9-m2", startTime: "2026-09-30", endTime: "2026-09-30", progress: TODO, type: "milestone", wbs: "9.2.M", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Report + invoice", barBackgroundColor: BRAND.gold },
  // M3 Oct
  { id: "ph9-m3", name: "M3 Oct — Authority + Cornerstones", parentId: "ph9", startTime: "2026-10-01", endTime: "2026-10-31", progress: TODO, wbs: "9.3", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "30+ citations, 5 pitches, cornerstone 1-2, 15 posts" },
  { id: "ph9-m3-1", name: "5A 30+ citations NAP + 5 guest pitches", parentId: "ph9-m3", startTime: "2026-10-01", endTime: "2026-10-14", progress: TODO, wbs: "9.3.1", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "10 Kenya + 8 portals + 5 citation + 4 review + 3 classifieds" },
  { id: "ph9-m3-2", name: "Cornerstone 1 Buying Guide (2.5-3k w) + 15 posts", parentId: "ph9-m3", startTime: "2026-10-07", endTime: "2026-10-21", progress: TODO, wbs: "9.3.2", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Guide live + FAQ schema" },
  { id: "ph9-m3-3", name: "Q1 performance report + first ranking movement", parentId: "ph9-m3", startTime: "2026-10-28", endTime: "2026-10-31", progress: TODO, wbs: "9.3.3", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "45 posts cumulative checkpoint" },
  { id: "ph9-m3-4", name: "M3 Verification Report → Payment 4 (KES 15,500)", parentId: "ph9-m3", startTime: "2026-10-31", endTime: "2026-10-31", progress: TODO, type: "milestone", wbs: "9.3.M", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Report + invoice", barBackgroundColor: BRAND.gold },
  // M4 Nov
  { id: "ph9-m4", name: "M4 Nov — Acceleration + Area Guides 6/10", parentId: "ph9", startTime: "2026-11-01", endTime: "2026-11-30", progress: TODO, wbs: "9.4", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Guest posts live, 60 posts cumulative, AI check" },
  { id: "ph9-m4-1", name: "Cornerstone 2 Nairobi Areas (3-4k w) + 4 area guides", parentId: "ph9-m4", startTime: "2026-11-01", endTime: "2026-11-15", progress: TODO, wbs: "9.4.1", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Karen/Runda/Langata/Lavington 600-800w each" },
  { id: "ph9-m4-2", name: "Guest posts published + broken link building", parentId: "ph9-m4", startTime: "2026-11-10", endTime: "2026-11-25", progress: TODO, wbs: "9.4.2", workstream: "SEO", owner: "You", priority: "P1", status: "Not Started", deliverable: "2-4 backlinks earned" },
  { id: "ph9-m4-3", name: "M4 Verification Report → Payment 5 (KES 15,500)", parentId: "ph9-m4", startTime: "2026-11-30", endTime: "2026-11-30", progress: TODO, type: "milestone", wbs: "9.4.M", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Report + invoice", barBackgroundColor: BRAND.gold },
  // M5 Dec
  { id: "ph9-m5", name: "M5 Dec 1–22 — Final Content + AI + Close", parentId: "ph9", startTime: "2026-12-01", endTime: "2026-12-22", progress: TODO, wbs: "9.5", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Blog 5/5 cornerstones, AI audit, final report", barBackgroundColor: BRAND.goldLight },
  { id: "ph9-m5-1", name: "Cornerstone 4 Renting (2.5-3k) + 5 Market Report (2-2.5k) + remaining 4 area guides", parentId: "ph9-m5", startTime: "2026-12-01", endTime: "2026-12-12", progress: TODO, wbs: "9.5.1", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Thika/Nyali/Milimani + guides, 10/10 area pages done" },
  { id: "ph9-m5-2", name: "Data assets (Avg Rent + Affordable Land) or fallback", parentId: "ph9-m5", startTime: "2026-12-10", endTime: "2026-12-15", progress: TODO, wbs: "9.5.2", workstream: "SEO", owner: "You", priority: "P1", status: "Not Started", deliverable: "Conditional ≥50 listings tables" },
  { id: "ph9-m5-3", name: "Final AI visibility audit (ChatGPT/Claude/Perplexity/G AI) + full performance report", parentId: "ph9-m5", startTime: "2026-12-15", endTime: "2026-12-22", progress: TODO, wbs: "9.5.3", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Final keyword + social + AI reports, handover call" },
  { id: "ph9-m5-4", name: "M5 Verification Report → Payment 6 (KES 15,500) — Close", parentId: "ph9-m5", startTime: "2026-12-22", endTime: "2026-12-22", progress: TODO, type: "milestone", wbs: "9.5.M", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Final report + invoice — 155,000 total", barBackgroundColor: BRAND.gold },

  // ── Milestones — User journeys (your "all types of users" request) ──
  { id: "m-j1", name: "◆ Property Owner can sign up → verify → list → dashboard", startTime: "2026-08-22", progress: DONE, type: "milestone", wbs: "M1", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "Owner journey E2E live verified" },
  { id: "m-j2", name: "◆ Agent can register on behalf + referrals → commissions", startTime: "2026-08-22", progress: DONE, type: "milestone", wbs: "M2", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "Agent journey + referral linking" },
  { id: "m-j3", name: "◆ Fundi / Provider can offer service → moderation → booking", startTime: "2026-11-08", progress: TODO, type: "milestone", wbs: "M3", workstream: "Build", owner: "You", priority: "P0", status: "Not Started", deliverable: "Fundi journey (blocked by Platform v2)" },
  { id: "m-j4", name: "◆ Customer can search → contact → WhatsApp → saved", startTime: "2026-08-22", progress: DONE, type: "milestone", wbs: "M4", workstream: "Build", owner: "You", priority: "P0", status: "Done", deliverable: "Customer discovery journey" },
  { id: "m-j5", name: "◆ Admin can moderate → claims → disputes → exports", startTime: "2026-09-15", progress: DONE, type: "milestone", wbs: "M5", workstream: "Admin", owner: "You", priority: "P0", status: "Done", deliverable: "Admin journey verified" },
  { id: "m-j6", name: "◆ APL Rep can claim → dispute → payout", startTime: "2026-09-15", progress: DONE, type: "milestone", wbs: "M6", workstream: "Admin", owner: "You", priority: "P0", status: "Done", deliverable: "Rep journey verified" },
  { id: "m-pay1", name: "◆ Payment 1 — Signing (KES 46,500, 30%)", startTime: "2026-08-01", progress: TODO, type: "milestone", wbs: "PM1", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "Contract signing & onboarding", barBackgroundColor: BRAND.gold },
  { id: "m-seo-end", name: "◆ SEO Retainer Close — 22 Dec 2026", startTime: "2026-12-22", progress: TODO, type: "milestone", wbs: "M-SEO", workstream: "SEO", owner: "You", priority: "P0", status: "Not Started", deliverable: "155k total, 75 posts, 10 blogs, 10-25 backlinks" },

  // Out-of-scope fence (explicitly NOT rendered as bars — shown as rowBackgroundColor grey)
  { id: "oos", name: "OUT OF SCOPE (excluded unless addendum + fee)", startTime: "2026-08-01", endTime: "2026-12-22", progress: TODO, wbs: "OOS", workstream: "SEO", owner: "—", priority: "P2", status: "Not Started", deliverable: "Paid ads (FB/IG 3-10k, TikTok 2-5k, Google 5-20k + 5k mgmt), direct sales closing, logo rebrand", rowBackgroundColor: "#f1f5f9", barBackgroundColor: BRAND.greyLight },
];

// Baseline vs Actual helpers for WBS sheet
export const WBS_PHASES = [
  { phase: "Phase 0 — Completed History", baseline: 120, actual: 120 },
  { phase: "Phase I — Discovery", baseline: 16, actual: 16 },
  { phase: "Phase II — UI/UX", baseline: 28, actual: 32 },
  { phase: "Phase III — Engineering", baseline: 95, actual: 110 },
  { phase: "Phase IV — QA & Handover", baseline: 24, actual: 24 },
  { phase: "Phase V — Import-v2", baseline: 64, actual: 0 },
  { phase: "Phase VI — Platform v2", baseline: 32, actual: 0 },
  { phase: "Phase VII — Post-Launch Future", baseline: 80, actual: 0 },
  { phase: "Phase VIII — Infra", baseline: 12, actual: 6 },
  { phase: "Phase IX — SEO Retainer", baseline: 155, actual: 0 }, // hours proxy for 155k scope
] as const;

export const GANTT_META = {
  version: "v1.0",
  date: "2026-09-15",
  start: "2026-06-22",
  end: "2027-02-28",
  granularity: "Weekly",
  workingWeekdays: [1, 2, 3, 4, 5, 6] as const,
  owner: "You (solo)",
  capacity: "40h/wk",
  totalTasks: 0, // filled at render
  theme: BRAND,
} as const;

export const DELIVERABLES_CHECKLIST = [
  { id: "D-1", deliverable: "Information architecture + sitemap + DB schema (22 models)", phase: "I", status: "Done", ganttId: "ph1", contract: "Web Proposal p.4" },
  { id: "D-2", deliverable: "Journey maps (guest/vendor/admin) + wireframes", phase: "I", status: "Done", ganttId: "ph1-3", contract: "Web Proposal p.4" },
  { id: "D-3", deliverable: "Hi-fi prototypes desktop+mobile, mobile-first 44×44", phase: "II", status: "Done", ganttId: "ph2", contract: "Web Proposal p.4" },
  { id: "D-4", deliverable: "Public marketplace (homepage, AJAX+geo search, directory, vendor profiles, static)", phase: "IIIa", status: "Done", ganttId: "ph3-a", contract: "Web Proposal p.5" },
  { id: "D-5", deliverable: "Vendor portal (auth, CRUD lifecycle, compression, dashboards)", phase: "IIIb", status: "Done", ganttId: "ph3-b", contract: "Web Proposal p.5" },
  { id: "D-6", deliverable: "Admin dashboard (user mgmt, moderation, CMS, RBAC, exports)", phase: "IIIc", status: "Done", ganttId: "ph3-c", contract: "Web Proposal p.5" },
  { id: "D-7", deliverable: "QA (cross-browser, CWV LCP<1.5s, SSL/CSRF/helmet, DNS, handover)", phase: "IV", status: "Done", ganttId: "ph4", contract: "Web Proposal p.6" },
  { id: "D-8", deliverable: "SEO baseline (semantic HTML, sitemap 452, JSON-LD 5 types)", phase: "IV", status: "Done", ganttId: "ph4-5", contract: "Web Proposal p.6" },
  { id: "D-9", deliverable: "Import-v2 T1–T16 (merge 323→236, KYC, SEO content, forced password)", phase: "V", status: "Not Started", ganttId: "ph5", contract: "tasks/todo.md" },
  { id: "D-10", deliverable: "Platform v2 (Booking PENDING→COMPLETED, owner consent, subType)", phase: "VI", status: "Not Started", ganttId: "ph6", contract: "platform-model.md" },
  { id: "D-11", deliverable: "Post-launch (M-Pesa Daraja, KES 1,500 tiers, CRM, MLS, RN, Swahili)", phase: "VII", status: "Not Started", ganttId: "ph7", contract: "docs/00-master-plan.md:1196" },
  { id: "D-12", deliverable: "Infra (whitelist IP, SSH, Brevo DKIM, AT KES 7K, Redis)", phase: "VIII", status: "Not Started", ganttId: "ph8", contract: "AGENTS.md" },
  { id: "D-13", deliverable: "Technical audit + GSC + GA4 (3 conv) + GBP 750-char", phase: "IX M1", status: "Not Started", ganttId: "ph9-m1", contract: "Agreement p.7 Schedule 1 P1" },
  { id: "D-14", deliverable: "PageSpeed 6 pages + mobile 48×48 + CWV + robots.txt (GPTBot...) + sitemap", phase: "IX M1", status: "Not Started", ganttId: "ph9-m1-3", contract: "Agreement p.8 1E-1H" },
  { id: "D-15", deliverable: "Keyword 100+ (5 buckets) + Competitor 5", phase: "IX M2", status: "Not Started", ganttId: "ph9-m2-1", contract: "Agreement p.8 Phase 2" },
  { id: "D-16", deliverable: "On-page 28 pages meta+H1+301+image<200KB+3 links+JSON-LD+gap 20+", phase: "IX M2", status: "Not Started", ganttId: "ph9-m2-2", contract: "Agreement p.8 Phase 3" },
  { id: "D-17", deliverable: "5 cornerstones (2.5-4k w) + 10 area guides (10 locs) + 6 cat rewrites + 10 blogs", phase: "IX M1-5", status: "Not Started", ganttId: "ph9-m3-2", contract: "Agreement p.9 Phase 4" },
  { id: "D-18", deliverable: "30+ citations NAP (10+8+5+4+3) + 10-25 backlinks", phase: "IX M3-5", status: "Not Started", ganttId: "ph9-m3-1", contract: "Agreement p.10 Phase 5" },
  { id: "D-19", deliverable: "Social 75 posts (IG 15+FB 15+TikTok 8-10+LinkedIn 12-16/mo) + daily 2-4h reply + WhatsApp routing", phase: "IX M1-5", status: "Not Started", ganttId: "ph9", contract: "Agreement p.10 Phase 6" },
  { id: "D-20", deliverable: "AI readiness (crawler audit, entity, conditional data assets, monthly AI visibility 5 queries)", phase: "IX M1-5", status: "Not Started", ganttId: "ph9-m5-2", contract: "Agreement p.11 Phase 7" },
  { id: "D-21", deliverable: "Weekly GSC + monthly re-crawl/PageSpeed/CWV + monthly PDF verification reports (6×)", phase: "IX", status: "Not Started", ganttId: "ph9-m5-3", contract: "Agreement p.11 Phase 8" },
  { id: "D-22", deliverable: "6 Payments KES 155,000 (46,500→31k→31k→15.5k→15.5k→15.5k)", phase: "IX", status: "Not Started", ganttId: "m-pay1", contract: "Agreement Schedule 2:6" },
  { id: "D-OUT", deliverable: "EXCLUDED unless addendum + fee: paid ads, direct sales closing, logo rebrand", phase: "OOS", status: "Out of Scope", ganttId: "oos", contract: "Agreement p.4 1.1" },
] as const;
