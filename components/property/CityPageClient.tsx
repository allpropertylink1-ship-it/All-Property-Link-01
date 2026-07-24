"use client";

import { useState, useEffect } from "react";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { FilterPanel } from "@/components/property/FilterPanel";
import { Pagination } from "@/components/shared/Pagination";
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

export default function CityPageClient({
  city,
  searchParams,
}: {
  city: string;
  searchParams: Record<string, string | undefined>;
}) {
  const [data, setData] = useState<PropertiesData | null>(null);
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { propertyType, minPrice, maxPrice, bedrooms, page } = searchParams;

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    const params = new URLSearchParams();
    params.set("city", city);
    if (propertyType) params.set("type", propertyType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (page) params.set("page", page);
    params.set("limit", "20");

    Promise.all([
      fetch(`/api/properties?${params.toString()}`).then((r) => r.json()),
      fetch(`/api/properties?limit=1`).then((r) => r.json()),
    ])
      .then(([propsData, citiesData]: [PropertiesData, PropertiesData]) => {
        const cityExists = citiesData.cities?.some(
          (c) => c.city.toLowerCase() === city.toLowerCase()
        );
        if (!cityExists) {
          setNotFound(true);
          return;
        }
        setData(propsData);
        setCities(
          (citiesData.cities || []).map((c) => ({
            city: c.city,
            _count: { city: c.count },
          }))
        );
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [city, propertyType, minPrice, maxPrice, bedrooms, page]);

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
        Properties in {city}
      </h1>
      <p className="mb-8 text-text-secondary">{data.total} properties found</p>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <FilterPanel>
          <PropertyFilters
            cities={cities}
            selectedCity={city}
            selectedType={propertyType}
            minPrice={minPrice}
            maxPrice={maxPrice}
            bedrooms={bedrooms}
          />
        </FilterPanel>
        <div>
          <PropertyGrid properties={data.properties} />
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            basePath={`/properties/${encodeURIComponent(city.toLowerCase())}`}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}