import CityPageClient from "@/components/property/CityPageClient";

interface Props {
  params: { city: string };
  searchParams: { [key: string]: string | undefined };
}

export default function CityPage({ params, searchParams }: Props) {
  return <CityPageClient city={params.city} searchParams={searchParams} />;
}