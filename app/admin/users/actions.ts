"use server";

import { serverFetch, requireRole } from "@/lib/auth-utils";

interface ApiUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string;
  accountStatus: string;
  kycStatus: string;
  createdAt: string;
  avatar: string | null;
}

export async function getUsers(search: string, page: number) {
  await requireRole(["ADMIN"]);

  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (search) params.set("search", search);

  const res = await serverFetch(`/api/admin/users?${params}`);
  const data = await res.json().catch(() => null);

  const active = (u: ApiUser) => u.accountStatus === "ACTIVE";

  return {
    count: data?.total ?? 0,
    users: (data?.users || []).map((u: ApiUser) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      emailVerified: active(u) ? new Date() : null,
      phoneVerified: active(u),
      createdAt: new Date(u.createdAt),
      avatar: u.avatar,
      kycStatus: u.kycStatus,
    })),
  };
}

export async function updateUserRole(userId: string, role: string) {
  await requireRole(["ADMIN"]);

  try {
    const res = await serverFetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) return { success: false, error: "Failed to update user role" };
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update user role" };
  }
}

export async function toggleUserStatus(userId: string, suspend: boolean) {
  await requireRole(["ADMIN"]);

  try {
    const res = await serverFetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountStatus: suspend ? "SUSPENDED" : "ACTIVE" }),
    });
    if (!res.ok) return { success: false, error: "Failed to update user status" };
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update user status" };
  }
}

export async function deleteUser(userId: string) {
  await requireRole(["ADMIN"]);

  try {
    const res = await serverFetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) return { success: false, error: "Failed to delete user" };
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete user" };
  }
}
