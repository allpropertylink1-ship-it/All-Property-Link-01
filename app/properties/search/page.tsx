import SearchPageClient from "@/components/property/SearchPageClient";

interface Props {
  searchParams: { q?: string; page?: string };
}

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || "";
  const page = searchParams.page ? Number(searchParams.page) : 1;
  return <SearchPageClient q={query} currentPage={page} />;
}