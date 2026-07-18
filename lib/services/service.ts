const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://delightful-encouragement-production-878d.up.railway.app";

export interface ServiceFilters {
  category?: string;
  city?: string;
  search?: string;
  page?: string;
  limit?: string;
  type?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  parentId: string | null;
  children: ServiceCategory[];
  _count?: { serviceListings: number };
}

export interface ServiceListingUser {
  firstName: string;
  lastName: string;
  companyName: string | null;
  businessLogo: string | null;
  phone: string | null;
  email: string | null;
  specialties: string[];
  website: string | null;
}

export interface ServiceListingCard {
  id: string;
  title: string;
  description: string;
  price: string | null;
  currency: string;
  pricePeriod: string;
  location: string | null;
  city: string | null;
  region: string | null;
  images: unknown;
  viewCount: number;
  createdAt: string;
  user: ServiceListingUser | null;
  category: { id: string; name: string; slug: string; icon: string | null } | null;
}

export interface ServiceListingsResponse {
  services: ServiceListingCard[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ServiceDetailUser extends ServiceListingUser {
  phone: string | null;
  email: string | null;
  specialties: string[];
  website: string | null;
}

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  price: string | null;
  currency: string;
  pricePeriod: string;
  location: string | null;
  city: string | null;
  region: string | null;
  images: unknown;
  viewCount: number;
  createdAt: string;
  user: ServiceDetailUser | null;
  category: { id: string; name: string; slug: string; icon: string | null; description: string | null } | null;
  avgRating: number | null;
  reviewCount: number;
}

export interface ServiceReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string } | null;
}

export interface ServiceReviewsResponse {
  reviews: ServiceReview[];
  total: number;
}

export async function getServiceListings(filters: ServiceFilters = {}): Promise<ServiceListingsResponse> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.city) params.set("city", filters.city);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", filters.page);
  if (filters.limit) params.set("limit", filters.limit);
  if (filters.type) params.set("type", filters.type);

  const res = await fetch(`${API_BASE}/api/services?${params}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return { services: [], total: 0, page: 1, totalPages: 0 };
  return res.json();
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const res = await fetch(`${API_BASE}/api/services/categories`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.categories || []) as ServiceCategory[];
}

export async function getServiceById(id: string): Promise<ServiceDetail | null> {
  const res = await fetch(
    `${API_BASE}/api/services/${encodeURIComponent(id)}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return (data.service || null) as ServiceDetail | null;
}

export async function getServiceReviews(targetId: string): Promise<ServiceReviewsResponse> {
  const res = await fetch(
    `${API_BASE}/api/reviews/SERVICE_LISTING/${encodeURIComponent(targetId)}`,
    { next: { revalidate: 30 } },
  );
  if (!res.ok) return { reviews: [], total: 0 };
  return res.json();
}
