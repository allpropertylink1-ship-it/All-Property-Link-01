"use server";

import { serverFetch } from "@/lib/auth-utils";

export async function getProperties(page: number) {
  await requireAdmin();
  const res = await serverFetch(`/api/admin/properties?page=${page}&limit=20`);
  const data = await res.json().catch(() => null);

  return {
    total: data?.pagination?.total ?? 0,
    properties: (data?.properties || []).map((p: {
      id: string; slug: string; title: string; price: number | null; currency: string;
      propertyType: string; city: string; moderationStatus: string; isPublished: boolean;
      createdAt: string; agent: { firstName: string; lastName: string; avatar: string | null } | null;
    }) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: p.price == null ? null : Number(p.price),
      currency: p.currency,
      propertyType: p.propertyType,
      city: p.city,
      moderationStatus: p.moderationStatus,
      isPublished: p.isPublished,
      createdAt: p.createdAt,
      agent: p.agent,
    })),
  };
}

async function requireAdmin() {
  const { requireRole } = await import("@/lib/auth-utils");
  await requireRole(["ADMIN"]);
}
