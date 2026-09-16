import type { Metadata } from "next";
import SearchPageClient from "@/components/property/SearchPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Properties in Kenya",
  description:
    "Search houses, apartments, land and commercial properties for sale or rent across Kenya on All Property Link.",
  alternates: { canonical: "/properties/search" },
};

interface Props {
  searchParams: { q?: string; city?: string; propertyType?: string; sort?: string; page?: string };
}

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || "";
  const page = searchParams.page ? Number(searchParams.page) : 1;
  return (
    <SearchPageClient
      q={query}
      city={searchParams.city}
      propertyType={searchParams.propertyType}
      sortParam={searchParams.sort}
      currentPage={page}
    />
  );
}
