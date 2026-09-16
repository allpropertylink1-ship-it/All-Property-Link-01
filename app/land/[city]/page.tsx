import type { Metadata } from "next";
import LandCityPageClient from "@/components/property/LandCityPageClient";
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
  const label = count === 1 ? "plot" : "plots";
  const title = `Land & Plots for Sale in ${match.city}`;
  const description = `${count} ${label} of land for sale in ${match.city}, Kenya — browse verified listings from agents and owners on All Property Link.`;

  return {
    title,
    description,
    alternates: { canonical: `/land/${slugifyCity(match.city)}` },
  };
}

export default function LandCityPage({ params, searchParams }: Props) {
  return <LandCityPageClient city={params.city} searchParams={searchParams} />;
}
