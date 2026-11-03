import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { PropertiesPageClient } from "@/components/property/PropertiesPageClient";
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
  const title = `Airbnbs & Short-Term Stays in ${match.city}`;
  const description = `${count} verified short-term stays and vacation rentals in ${match.city}, Kenya — book by the night.`;

  return {
    title,
    description,
    alternates: { canonical: `/airbnbs/${slugifyCity(match.city)}` },
  };
}

export default async function AirbnbsCityPage({ params, searchParams }: Props) {
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
        <section aria-labelledby="airbnbs-about-heading" className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:py-12 lg:px-8">
          <h2 id="airbnbs-about-heading" className="font-display text-3xl font-bold tracking-h2 text-text-primary mb-4">
            Airbnbs & Short-Term Stays in {match.city}
          </h2>
          <p className="text-text-secondary leading-relaxed text-lg max-w-2xl">
            Browse {match._count.city} verified short-term stays and vacation rentals in {match.city}, Kenya. Book
            by the night — from city apartments to holiday homes and getaways. Contact hosts directly by phone, SMS,
            or WhatsApp.
          </p>
        </section>
      )}
      <PropertiesPageClient
        searchParams={{ ...searchParams, city: params.city, purpose: "FOR_RENT_SHORT_TERM" }}
        basePath="/airbnbs"
      />
    </>
  );
}
