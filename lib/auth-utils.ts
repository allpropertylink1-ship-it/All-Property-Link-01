interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  role: string
  avatar?: string | null
  phone?: string
  kycStatus?: string
  accountStatus?: string
  isAgent?: boolean
  companyName?: string
  userTypes?: string[]
  primaryUserType?: string | null
  onboardingComplete?: boolean
  authMethod?: "user" | "agent" | "admin"
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.allpropertylink.co.ke"

import { cache } from "react";

/**
 * Server-side fetch that forwards the user's cookies (access_token, refresh_token,
 * csrf-token) to the backend API. Mutations also forward the CSRF cookie/header pair.
 */
export const serverFetch = cache(async (path: string, init?: RequestInit) => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookie = cookieStore.toString();
  const method = (init?.method || "GET").toUpperCase();
  const headers: Record<string, string> = {
    ...(init?.body ? { "Content-Type": "application/json" } : {}),
    ...(cookie ? { Cookie: cookie } : {}),
  };
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const csrf = cookieStore.get("csrf-token")?.value;
    if (csrf) headers["x-csrf-token"] = csrf;
  }
  // Retry idempotent reads through transient origin 502/503/504s.
  const maxAttempts = method === "GET" || method === "HEAD" ? 3 : 1;
  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
      });
      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 300 * attempt));
        continue;
      }
      return res;
    } catch {
      if (attempt >= maxAttempts) throw new Error(`fetch failed: ${API_URL}${path}`);
      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
});

export const getSession = cache(async () => {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    // The shared-hosting origin drops requests intermittently (502/503/504);
    // retry session reads so a single blip doesn't bounce users to login.
    let res: Response | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Cookie: `access_token=${token}` },
        });
        if (res.status !== 502 && res.status !== 503 && res.status !== 504) break;
        res = null;
      } catch {
        res = null;
      }
      if (attempt < 3) await new Promise((r) => setTimeout(r, 300 * attempt));
    }
    if (!res || !res.ok) return null;
    const data = await res.json();
    if (!data.user) return null;
    const u = data.user as SessionUser
    return { user: { ...u, name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email } as SessionUser }
  } catch {
    return null;
  }
});

export async function requireAuth(): Promise<{ user: SessionUser }> {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/auth/login");
    throw new Error("unreachable")
  }
  return session
}

export async function requireRole(roles: string[]): Promise<{ user: SessionUser }> {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    const { redirect } = await import("next/navigation");
    redirect("/");
  }
  return session
}
