import { cache } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.allpropertylink.co.ke";

export interface AgentSummary {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  agentCode: string;
  avatar: string | null;
  regions: string[];
  specificArea: string | null;
  status: string;
  createdAt: Date;
  _count: { users: number };
}

export interface AgentListing {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currency: string;
  propertyType: string;
  listingPurpose: string | null;
  status: string;
  city: string;
  region: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: unknown;
  isFeatured: boolean;
  createdAt: Date;
}

const fetchApi = cache(async <T>(path: string): Promise<T | null> => {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null }
});

export const getAgents = cache(async (): Promise<AgentSummary[]> => {
  const data = await fetchApi<{ agents: AgentSummary[] }>("/api/apl-agents");
  return data?.agents || [];
});

export const getAgentById = cache(async (id: string): Promise<AgentSummary | null> => {
  const agents = await getAgents();
  return agents.find((a) => a.id === id) || null;
});

export const getAgentListings = cache(async (id: string): Promise<AgentListing[]> => {
  const data = await fetchApi<{ properties: AgentListing[] }>(`/api/apl-agents/${encodeURIComponent(id)}`);
  return data?.properties || [];
});