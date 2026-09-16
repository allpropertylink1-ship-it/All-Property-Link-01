"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { LandFilters } from "@/components/property/LandFilters";
import { FilterPanel } from "@/components/property/FilterPanel";
import { Pagination } from "@/components/shared/Pagination";
import { Loader2 } from "@/components/ui/icons";
import { slugifyCity } from "@/lib/seo";
import { fetchCityCounts } from "@/lib/cities-client";

interface CityInfo {
  city: string;
  _count: { city: number };
}

interface LandItem {
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

interface LandData {
  properties: LandItem[];
  total: number;
  page: number;
  totalPages: number;
  cities?: { city: string; count: number }[];
}

export default function LandCityPageClient({
  city,
  searchParams,
}: {
  city: string;
  searchParams: Record<string, string | undefined>;
}) {
  const [data, setData] = useState<LandData | null>(null);
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [resolvedCity, setResolvedCity] = useState(city);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { minPrice, maxPrice, page } = searchParams;

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    const params = new URLSearchParams();
    params.set("type", "LAND");
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (page) params.set("page", page);
    params.set("limit", "20");

    fetchCityCounts("LAND")
      .then(async (cityCounts) => {
        const match = (cityCounts || []).find(
          (c) => slugifyCity(c.city) === slugifyCity(city)
        );
        if (!match) {
          setNotFound(true);
          return;
        }
        setResolvedCity(match.city);
        params.set("city", match.city);
        const landData: LandData = await fetch(`/api/properties?${params.toString()}`).then((r) => r.json());
        setData(landData);
        setCities(
          (cityCounts || []).map((c) => ({
            city: c.city,
            _count: { city: c.count },
          }))
        );
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [city, minPrice, maxPrice, page]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-text-secondary">City not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 font-heading text-3xl font-bold text-text-primary">
        Land & plots for sale in {resolvedCity}
      </h1>
      <p className="mb-8 text-text-secondary">
        {data.total} {data.total === 1 ? "plot" : "plots"} found. Looking for houses?{" "}
        <Link href={`/properties/${slugifyCity(resolvedCity)}`} className="font-medium text-primary-600 hover:underline">
          Browse properties in {resolvedCity}
        </Link>
      </p>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <FilterPanel>
          <LandFilters
            cities={cities}
            selectedCity={resolvedCity}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </FilterPanel>
        <div>
          <PropertyGrid properties={data.properties} />
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            basePath={`/land/${slugifyCity(city)}`}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}
