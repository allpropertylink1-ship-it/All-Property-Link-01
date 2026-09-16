import { NextRequest, NextResponse } from "next/server";

// Must run on NODEJS serverless (NOT edge): edge -> cPanel origin fetches
// time out due to host-level IP filtering (Session 22), while
// serverless -> origin succeeds. Direct backend fetch is safe here.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BACKEND =
  process.env.API_BACKEND_URL || "https://api.allpropertylink.co.ke";

// --color-bg from app/globals.css (inline so the 503 shell never flashes white)
const BEIGE_BG = "#FAFAFA";
const FALLBACK_TITLE = "We'll be back shortly";
const FALLBACK_MESSAGE =
  "Our site is currently undergoing scheduled maintenance. Thank you for your patience and understanding.";
const THANKS_LINE = "Thank you for your patience and understanding.";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface SiteStatusResponse {
  maintenanceMode?: boolean;
  maintenanceTitle?: string;
  maintenanceMessage?: string;
  preview?: boolean;
}

export async function GET(req: NextRequest) {
  let status: SiteStatusResponse | null = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    // Forward cookies so the backend can validate apl_bypass server-side.
    // Contract: value validation lives here/backend-side, NOT in middleware.
    const cookie = req.headers.get("cookie");
    const upstream = await fetch(`${API_BACKEND}/api/site-status`, {
      cache: "no-store",
      signal: controller.signal,
      ...(cookie ? { headers: { cookie } } : {}),
    });
    clearTimeout(timeout);
    if (upstream.ok) {
      status = (await upstream.json()) as SiteStatusResponse;
    }
  } catch {
    status = null; // Backend unreachable: render generic fallback copy below.
  }

  // Valid bypass holders (backend confirms via preview === true) landing on
  // /maintenance are sent to the real site instead of being served the 503.
  if (status?.preview === true) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const rawTitle = status?.maintenanceTitle;
  const rawMessage = status?.maintenanceMessage;
  // Mirror MaintenanceNotice fallbacks + always-thank-you logic (kept in sync
  // by hand: route handlers cannot import react-dom/server in Next 14 builds).
  const heading =
    rawTitle && rawTitle.trim() ? rawTitle.trim() : FALLBACK_TITLE;
  const body =
    rawMessage && rawMessage.trim()
      ? rawMessage.trim()
      : FALLBACK_MESSAGE;
  const showThanks = !body.toLowerCase().includes("thank you");
  const docTitle = escapeHtml(`${heading} | All Property Link`);

  // Self-contained shell (no Tailwind stylesheet applies to route output):
  // design tokens inlined from app/globals.css + components/ui/icons.tsx.
  const html = `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="robots" content="noindex" /><title>${docTitle}</title><style>body{margin:0;background:${BEIGE_BG};color:#111827;font-family:"Plus Jakarta Sans",system-ui,sans-serif}.mwrap{max-width:32rem;margin:0 auto;min-height:50vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1rem;text-align:center}.brand{font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:1.125rem;font-weight:700;color:#1E3A40;margin:0}.brand span{color:#E27A23}.badge{width:3.5rem;height:3.5rem;border-radius:9999px;background:#E8F0F1;color:#1E3A40;display:flex;align-items:center;justify-content:center;margin-top:1.5rem}.mwrap h1{font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:1.875rem;font-weight:700;margin:1.5rem 0 .5rem}.msg{color:#64748B;margin:0 0 .5rem;line-height:1.5}.thanks{color:#64748B;font-size:.875rem;margin:0 0 2rem}.foot{font-size:.875rem;font-weight:500;color:#64748B;margin:0}</style></head><body style="background:${BEIGE_BG}"><main class="mwrap"><p class="brand">All Property <span>Link</span></p><div class="badge"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /><rect x="14" y="14" width="3" height="2" fill="#E27A23" stroke="none" rx="0.5" /></svg></div><h1>${escapeHtml(heading)}</h1><p class="msg">${escapeHtml(body)}</p>${showThanks ? `<p class="thanks">${escapeHtml(THANKS_LINE)}</p>` : ""}<p class="foot">All Property Link</p></main></body></html>`;

  return new Response(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "3600",
      "Cache-Control": "no-store",
    },
  });
}
