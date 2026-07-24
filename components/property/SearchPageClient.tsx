"use client";

import { useState, useEffect } from "react";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { Loader2 } from "@/components/ui/icons";

interface CityInfo {
  city: string;
  _count: { city: number };
}

interface PropertyItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  propertyType: string;
  listingPurpose?: string | null;
  city: string;
  region: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: unknown;
  isFeatured: boolean;
  createdAt: Date;
}

interface PropertiesData {
  properties: PropertyItem[];
  total: number;
  page: number;
  totalPages: number;
  cities: { city: string; count: number }[];
}

export default function SearchPageClient({
  q,
  currentPage,
}: {
  q: string;
  currentPage: number;
}) {
  const [data, setData] = useState<PropertiesData | null>(null);
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetches: Promise<unknown>[] = [];

    if (q) {
      const params = new URLSearchParams();
      params.set("q", q);
      params.set("page", String(currentPage));
      fetches.push(
        fetch(`/api/properties?${params.toString()}`)
          .then((r) => r.json())
          .then((d: PropertiesData) => setData(d))
      );
    } else {
      setData({
        properties: [],
        total: 0,
        page: 1,
        totalPages: 0,
        cities: [],
      });
    }

    fetches.push(
      fetch(`/api/properties?limit=1`)
        .then((r) => r.json())
        .then((d: PropertiesData) => {
          setCities(
            (d.cities || []).map((c) => ({
              city: c.city,
              _count: { city: c.count },
            }))
          );
        })
    );

    Promise.all(fetches).finally(() => setLoading(false));
  }, [q, currentPage]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <form method="GET" action="/properties/search" className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search properties, cities, areas..."
            className="flex-1 rounded-lg border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <button
            type="submit"
            className="touch-target rounded-lg bg-primary-600 px-6 py-3 font-medium text-text-on-primary hover:bg-primary-700"
          >
            Search
          </button>
        </div>
      </form>

      {q && (
        <p className="mb-6 text-sm text-text-secondary">
          {data?.total || 0} results for &ldquo;{q}&rdquo;
        </p>
      )}

      {q ? (
        <PropertyGrid properties={data?.properties || []} />
      ) : (
        <div>
          <h2 className="mb-4 font-heading text-xl font-semibold text-text-primary">
            Browse by city
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c) => (
              <a
                key={c.city}
                href={`/properties/${c.city.toLowerCase()}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md"
              >
                <span className="font-medium text-text-primary">{c.city}</span>
                <span className="text-sm text-text-secondary">{c._count.city} properties</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}