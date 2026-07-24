import { cache } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.allpropertylink.co.ke";

export interface PropertyFilters {
  city?: string;
  propertyType?: string;
  purpose?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  query?: string;
  page?: number;
  pageSize?: number;
}

 const slugify = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

export interface PropertyCard {
  id: string; slug: string; title: string; price: number; currency: string;
  propertyType: string; listingPurpose: string | null;
  city: string; region: string; bedrooms: number | null; bathrooms: number | null;
  area: number | null; images: unknown; isFeatured: boolean; createdAt: Date;
}

interface PropertyDetailAgent {
  id: string; firstName: string; lastName: string; phone: string | null; email: string | null;
  avatar: string | null; businessLogo: string | null; companyName: string | null;
  category: string | null; specialties: string[]; website: string | null;
}

export interface PropertyDetail {
  id: string; slug: string; title: string; description: string; price: number; currency: string;
  propertyType: string; listingPurpose: string | null; status: string;
  city: string; region: string; country: string;
  bedrooms: number | null; bathrooms: number | null; area: number | null;
  latitude: unknown; longitude: unknown; images: unknown; features: string[];
  isFeatured: boolean; createdAt: Date;
  agent: PropertyDetailAgent | null;
}

interface OtherProperty {
  id: string; title: string; slug: string; price: number; city: string;
  currency: string; images: unknown; listingPurpose: string | null;
}

const fetchApi = cache(async <T>(path: string): Promise<T | null> => {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null }
});

export const getProperties = cache(async (filters: PropertyFilters = {}): Promise<{
  properties: PropertyCard[];
  total: number; page: number; pageSize: number; totalPages: number;
}> => {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.propertyType) params.set("type", filters.propertyType);
  if (filters.purpose) params.set("purpose", filters.purpose);
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters.bedrooms) params.set("bedrooms", String(filters.bedrooms));
  if (filters.query) params.set("search", filters.query);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("limit", String(filters.pageSize));
  params.set("limit", String(filters.pageSize || 20));

  const data = await fetchApi<{ properties: PropertyCard[]; total: number; page: number; pageSize: number; totalPages: number }>(`/api/properties?${params}`);
  return data || { properties: [], total: 0, page: 1, pageSize: filters.pageSize || 20, totalPages: 0 };
});

export const getPropertyBySlug = cache(async (slug: string): Promise<PropertyDetail | null> => {
  const data = await fetchApi<PropertyDetail>(`/api/properties/${encodeURIComponent(slug)}`);
  return data;
});

export const getOtherPropertiesByAgent = cache(async (agentId: string, currentPropertyId: string): Promise<OtherProperty[]> => {
  const data = await fetchApi<{ properties: OtherProperty[] }>(`/api/properties?agentId=${encodeURIComponent(agentId)}&limit=6`);
  return (data?.properties || []).filter(p => p.id !== currentPropertyId);
});

export const getCities = cache(async (): Promise<{ city: string; _count: { city: number } }[]> => {
  const data = await fetchApi<{ cities: { city: string; count: number }[] }>("/api/properties?limit=1");
  return (data?.cities || []).map(c => ({ city: c.city, _count: { city: c.count } }));
});

type MutateResult<T = undefined> = { success: boolean; error?: string; data?: T };

export const createProperty = cache(async (data: Record<string, unknown>, userId: string): Promise<MutateResult<{ id: string }>> => {
  try {
    const res = await fetch(`${API_BASE}/api/properties`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, userId }),
    });
    if (!res.ok) return { success: false, error: `API returned ${res.status}` };
    return { success: true, data: await res.json() };
  } catch (e) { return { success: false, error: String(e) }; }
});

export const updateProperty = cache(async (id: string, data: Record<string, unknown>, userId: string, userRole: string): Promise<MutateResult> => {
  try {
    const res = await fetch(`${API_BASE}/api/properties/${encodeURIComponent(id)}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, userId, userRole }),
    });
    if (!res.ok) return { success: false, error: `API returned ${res.status}` };
    return { success: true };
  } catch (e) { return { success: false, error: String(e) }; }
});

export const deleteProperty = cache(async (id: string, userId: string, userRole: string): Promise<MutateResult> => {
  try {
    const res = await fetch(`${API_BASE}/api/properties/${encodeURIComponent(id)}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userRole }),
    });
    if (!res.ok) return { success: false, error: `API returned ${res.status}` };
    return { success: true };
  } catch (e) { return { success: false, error: String(e) }; }
});

export const approveProperty = cache(async (id: string, reviewerId: string): Promise<MutateResult> => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/properties/${encodeURIComponent(id)}/approve`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerId }),
    });
    if (!res.ok) return { success: false, error: `API returned ${res.status}` };
    return { success: true };
  } catch (e) { return { success: false, error: String(e) }; }
});

export const rejectProperty = cache(async (id: string, reason: string, reviewerId: string): Promise<MutateResult> => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/properties/${encodeURIComponent(id)}/reject`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, reviewerId }),
    });
    if (!res.ok) return { success: false, error: `API returned ${res.status}` };
    return { success: true };
  } catch (e) { return { success: false, error: String(e) }; }
});

export const publishProperty = cache(async (id: string): Promise<MutateResult> => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/properties/${encodeURIComponent(id)}/publish`, {
      method: "POST", headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return { success: false, error: `API returned ${res.status}` };
    return { success: true };
  } catch (e) { return { success: false, error: String(e) }; }
});
