import Image from "next/image";
import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/services/property";

interface Props {
  params: { slug: string };
}

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();

  const imageUrls = Array.isArray(property.images) ? property.images : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {imageUrls.slice(0, 4).map((url, i) => (
          <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl bg-surface-secondary">
            <Image
              src={url}
              alt={property.title}
              width={400}
              height={300}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            {property.title}
          </h1>
          <p className="mt-2 text-lg text-text-secondary">
            {property.region}, {property.city}, {property.country}
          </p>
          <p className="mt-4 font-heading text-2xl font-bold text-primary-600">
            {property.currency} {Number(property.price).toLocaleString()}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 border-y border-border py-4">
            {property.bedrooms && (
              <div className="text-center">
                <p className="text-xl font-bold text-text-primary">{property.bedrooms}</p>
                <p className="text-xs text-text-secondary">Beds</p>
              </div>
            )}
            {property.bathrooms && (
              <div className="text-center">
                <p className="text-xl font-bold text-text-primary">{property.bathrooms}</p>
                <p className="text-xs text-text-secondary">Baths</p>
              </div>
            )}
            {property.area && (
              <div className="text-center">
                <p className="text-xl font-bold text-text-primary">{property.area}</p>
                <p className="text-xs text-text-secondary">Sqft</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="mb-3 font-heading text-lg font-semibold text-text-primary">
              Description
            </h2>
            <p className="whitespace-pre-line text-text-secondary leading-relaxed">
              {property.description}
            </p>
          </div>

          {property.features.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 font-heading text-lg font-semibold text-text-primary">
                Features
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-full bg-surface-secondary px-3 py-1 text-sm text-text-secondary"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="font-heading text-lg font-semibold text-text-primary">
              Contact agent
            </h3>
            {property.agent && (
              <p className="mt-2 text-sm text-text-secondary">
                {property.agent.firstName} {property.agent.lastName}
              </p>
            )}
            <a
              href={`/contact?property=${encodeURIComponent(property.title)}`}
              className="touch-target mt-4 flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-text-on-primary hover:bg-primary-700"
            >
              Send inquiry
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}