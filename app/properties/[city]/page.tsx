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

export default async function CityPage({ params, searchParams }: Props) {
  if (searchParams.type === "LAND" || searchParams.propertyType === "LAND") {
    permanentRedirect(`/land/${params.city}`);
  }
  const cities = await getCities();
  const match = (cities || []).find(
    (c) => slugifyCity(c.city) === slugifyCity(params.city)
  );
  return (
    <>
      {match && (
        <section aria-labelledby="city-about-heading" className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:py-12 lg:px-8">
          <h2 id="city-about-heading" className="font-display text-3xl font-bold tracking-h2 text-text-primary mb-4">
            Properties in {match.city}
          </h2>
          <p className="text-text-secondary leading-relaxed text-lg max-w-2xl">
            Browse {match._count.city} verified property listings for sale, rent, and short stays in {match.city},
            Kenya. Find houses, apartments, land plots, and commercial properties listed by owners and verified agents.
            Contact sellers directly by phone, SMS, or WhatsApp.
          </p>
        </section>
      )}
      <CityPageClient city={params.city} searchParams={searchParams} />
    </>
  );
}