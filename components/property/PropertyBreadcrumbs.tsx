import Link from "next/link";
import { slugifyCity } from "@/lib/seo";

export default function PropertyBreadcrumbs({ city, title }: { city: string; title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-4 sm:pt-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
        <li>
          <Link href="/" className="transition-colors hover:text-primary-600">Home</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/properties" className="transition-colors hover:text-primary-600">Properties</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href={`/properties/${slugifyCity(city)}`} className="capitalize transition-colors hover:text-primary-600">
            {city}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="max-w-[220px] truncate text-text-primary sm:max-w-xs" title={title}>
          {title}
        </li>
      </ol>
    </nav>
  );
}