import { createElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToStaticMarkup } from "react-dom/server";
import MaintenanceNotice from "@/components/shared/MaintenanceNotice";

// Must run on NODEJS serverless (NOT edge): edge -> cPanel origin fetches
// time out due to host-level IP filtering (Session 22), while
// serverless -> origin succeeds. Direct backend fetch is safe here.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BACKEND =
  process.env.API_BACKEND_URL || "https://api.allpropertylink.co.ke";

// --color-bg from app/globals.css (inline so the 503 shell never flashes white)
const BEIGE_BG = "#F6F4EF";
const FALLBACK_TITLE = "We'll be back shortly";

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
  const title = rawTitle && rawTitle.trim() ? rawTitle : null;
  const message = rawMessage && rawMessage.trim() ? rawMessage : null;

  // MaintenanceNotice is server-renderable (no "use client", no hooks; its
  // Wrench import from @/components/ui/icons is pure SVG). renderToStaticMarkup
  // auto-escapes title/message from the backend.
  const body = renderToStaticMarkup(
    createElement(MaintenanceNotice, { title, message })
  );
  const docTitle = escapeHtml(
    `${title ?? FALLBACK_TITLE} | All Property Link`
  );

  // Self-contained shell: Tailwind classes in the component markup have no
  // stylesheet here, so minimal element-scoped CSS + inline body background
  // (beige token) keep it readable with zero external requests.
  const html = `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="robots" content="noindex" /><title>${docTitle}</title><style>body{margin:0;background:${BEIGE_BG};color:#1A1A1A;font-family:"DM Sans",system-ui,sans-serif}.mwrap{max-width:32rem;margin:0 auto;min-height:50vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1rem;text-align:center}.mwrap>p:first-child{font-family:Sora,system-ui,sans-serif;font-size:1.125rem;font-weight:700;color:#286255;margin:0}.mwrap>div:first-of-type{width:3.5rem;height:3.5rem;border-radius:9999px;background:#E5F0ED;color:#286255;display:flex;align-items:center;justify-content:center;margin-top:1.5rem}.mwrap>div:first-of-type svg{width:28px;height:28px}.mwrap h1{font-family:Sora,system-ui,sans-serif;font-size:1.875rem;font-weight:700;margin:1.5rem 0 .5rem}.mwrap p{color:#75716B;margin:0 0 .5rem;line-height:1.5}.mwrap p:last-child{font-size:.875rem;font-weight:500;margin-bottom:0}</style></head><body style="background:${BEIGE_BG}"><main class="mwrap">${body}</main></body></html>`;

  return new Response(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "3600",
      "Cache-Control": "no-store",
    },
  });
}
