import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireAuth();
  const userRole = (session.user as { role: string }).role;
  if (!roles.includes(userRole)) redirect("/");
  return session;
}
