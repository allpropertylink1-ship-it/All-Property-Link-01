import type { Metadata } from "next";
import CityPageClient from "@/components/property/CityPageClient";
import { getProperties } from "@/lib/services/property";
import { slugifyCity } from "@/lib/seo";

interface Props {
  params: { city: string };
  searchParams: { [key: string]: string | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getProperties({ pageSize: 1 });
  const match = (data.cities || []).find(
    (c) => slugifyCity(c.city) === slugifyCity(params.city)
  );
  if (!match) return {};

  const count = match.count;
  const label = count === 1 ? "property" : "properties";
  const title = `Properties in ${match.city} — All Property Link`;
  const description = `${count} ${label} for sale, rent and short stays in ${match.city}, Kenya — browse verified listings from agents and owners on All Property Link.`;

  return {
    title,
    description,
    alternates: { canonical: `/properties/${slugifyCity(match.city)}` },
  };
}

export default function CityPage({ params, searchParams }: Props) {
  return <CityPageClient city={params.city} searchParams={searchParams} />;
}