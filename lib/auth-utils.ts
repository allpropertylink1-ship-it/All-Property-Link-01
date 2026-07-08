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
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://delightful-encouragement-production-878d.up.railway.app"

export async function getSession() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Cookie: `access_token=${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.user) return null;
    const u = data.user as SessionUser
    return { user: { ...u, name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email } as SessionUser }
  } catch {
    return null;
  }
}

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
