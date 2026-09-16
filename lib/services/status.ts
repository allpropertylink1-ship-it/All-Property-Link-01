import { cache } from "react";
import { headers } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.allpropertylink.co.ke";

export interface SiteStatus {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  // Present (true) when the caller forwarded a VALID apl_bypass cookie and
  // the backend granted preview access. Optional: public callers without the
  // cookie never receive it. Existence-checked in middleware, validated here.
  preview?: boolean;
}

export const getSiteStatus = cache(async (): Promise<SiteStatus | null> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE}/api/site-status`, {
      next: { revalidate: 30 },
      signal: controller.signal,
      headers: { cookie: headers().get("cookie") ?? "" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return (await res.json()) as SiteStatus;
  } catch {
    return null;
  }
});
