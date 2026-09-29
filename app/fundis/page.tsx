import { permanentRedirect } from "next/navigation";

interface Props {
  searchParams: { [key: string]: string | undefined };
}

// Legacy route — permanently consolidated into /services (Option B).
// Kept as a safety net behind the edge-level 308 in next.config.mjs:
// preserves ?category=&city=&search=&page= and forces type=FUNDI.
export default function FundisRedirect({ searchParams }: Props) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.city) params.set("city", searchParams.city);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.page) params.set("page", searchParams.page);
  params.set("type", "FUNDI");
  permanentRedirect(`/services?${params.toString()}`);
}
