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

export default async function LandCityPage({ params, searchParams }: Props) {
  const cities = await getCities();
  const match = (cities || []).find(
    (c) => slugifyCity(c.city) === slugifyCity(params.city)
  );
  return (
    <>
      {match && (
        <section aria-labelledby="land-about-heading" className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:py-12 lg:px-8">
          <h2 id="land-about-heading" className="font-display text-3xl font-bold tracking-h2 text-text-primary mb-4">
            Land & Plots for Sale in {match.city}
          </h2>
          <p className="text-text-secondary leading-relaxed text-lg max-w-2xl">
            Browse {match._count.city} verified land and plot listings for sale in {match.city}, Kenya. Find titled
            plots ready to build, farm, or hold, listed by owners and verified agents. Contact sellers directly by
            phone, SMS, or WhatsApp.
          </p>
        </section>
      )}
      <LandCityPageClient city={params.city} searchParams={searchParams} />
    </>
  );
}
