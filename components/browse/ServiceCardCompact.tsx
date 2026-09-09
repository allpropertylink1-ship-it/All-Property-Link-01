"use client";

import Link from "next/link";
import { optimizeImageUrl } from "@/lib/images";
import { PLACEHOLDER_SERVICE } from "@/lib/placeholders";
import { formatPrice } from "@/lib/utils";

interface ServiceCardCompactProps {
  id: string;
  title: string;
  description?: string;
  price: number | null;
  currency: string;
  pricePeriod: string;
  city: string | null;
  region: string | null;
  images: unknown;
  category: { name: string; slug: string } | null;
  user: { firstName: string; lastName: string; companyName: string | null; businessLogo: string | null } | null;
}

export function ServiceCardCompact({
  id,
  title,
  price,
  pricePeriod,
  city,
  region,
  images,
  category,
  user,
}: ServiceCardCompactProps) {
  const imageUrls = Array.isArray(images) ? images : [];
  const imageUrl = imageUrls.length > 0 ? optimizeImageUrl(String(imageUrls[0]), 400) : PLACEHOLDER_SERVICE;

  return (
    <Link href={`/services/${id}`} className="group flex gap-4 p-3 rounded-xl border border-border bg-surface hover:bg-surface-secondary hover:border-primary-200 hover:shadow-md transition-all duration-200">
      <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-secondary">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_SERVICE }}
        />
        {category && (
          <span className="absolute bottom-1 left-1 text-[10px] font-medium bg-primary-600 text-white px-1.5 py-0.5 rounded">
            {category.name}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-text-primary line-clamp-1">{title}</h4>
        <p className="text-xs text-text-secondary mt-0.5">{city || region || "Kenya"}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
          {price != null && (
            <span className="font-semibold text-primary-600">{formatPrice(Number(price), pricePeriod)}</span>
          )}
          {user && (
            <span className="text-text-secondary">{user.firstName} {user.lastName}</span>
          )}
        </div>
      </div>
    </Link>
  );
}