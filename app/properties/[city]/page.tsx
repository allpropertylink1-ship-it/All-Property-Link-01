import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import CityPageClient from "@/components/property/CityPageClient";
import { getCities } from "@/lib/services/property";
import { slugifyCity } from "@/lib/seo";

interface Props {
  params: { city: string };
  searchParams: { [key: string]: string | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cities = await getCities();
  const match = (cities || []).find(
    (c) => slugifyCity(c.city) === slugifyCity(params.city)
  );
  if (!match) return {};

  const count = match._count.city;
  const label = count === 1 ? "property" : "properties";
  const title = `Properties in ${match.city}`;
  const description = `${count} ${label} for sale, rent and short stays in ${match.city}, Kenya — browse verified listings from agents and owners on All Property Link.`;

  return {
    title,
    description,
    alternates: { canonical: `/properties/${slugifyCity(match.city)}` },
  };
}

export default function CityPage({ params, searchParams }: Props) {
  if (searchParams.type === "LAND" || searchParams.propertyType === "LAND") {
    permanentRedirect(`/land/${params.city}`);
  }
  return <CityPageClient city={params.city} searchParams={searchParams} />;
}