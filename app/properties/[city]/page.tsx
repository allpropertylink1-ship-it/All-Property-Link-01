import { notFound } from "next/navigation";
import { getProperties, getCities } from "@/lib/services/property";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { PropertyFilters } from "@/components/property/PropertyFilters";

interface Props {
  params: { city: string };
  searchParams: { [key: string]: string | undefined };
}

export default async function CityPage({ params, searchParams }: Props) {
  const cities = await getCities();
  const cityExists = cities.find((c) => c.city.toLowerCase() === params.city.toLowerCase());
  if (!cityExists) notFound();

  const cityName = cityExists.city;
  const { propertyType, minPrice, maxPrice, bedrooms, page } = searchParams;
  const data = await getProperties({
    city: cityName,
    propertyType,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    page: page ? Number(page) : 1,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 font-heading text-3xl font-bold text-text-primary">
        Properties in {cityName}
      </h1>
      <p className="mb-8 text-text-secondary">{data.total} properties found</p>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <PropertyFilters
            cities={cities}
            selectedCity={cityName}
            selectedType={propertyType}
            minPrice={minPrice}
            maxPrice={maxPrice}
            bedrooms={bedrooms}
          />
        </aside>
        <div>
          <PropertyGrid properties={data.properties} />
        </div>
      </div>
    </div>
  );
}
