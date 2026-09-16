import { cache } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.allpropertylink.co.ke";

export interface SiteStatus {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
}

export const getSiteStatus = cache(async (): Promise<SiteStatus | null> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${API_BASE}/api/site-status`, {
      next: { revalidate: 30 },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return (await res.json()) as SiteStatus;
  } catch {
    return null;
  }
});
