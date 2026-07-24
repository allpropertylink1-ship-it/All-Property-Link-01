import PropertyDetailClient from "@/components/property/PropertyDetailClient";

interface Props {
  params: { slug: string };
}

export default function PropertyDetailPage({ params }: Props) {
  return <PropertyDetailClient slug={params.slug} />;
}