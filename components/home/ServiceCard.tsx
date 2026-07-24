import Image from "next/image"
import Link from "next/link"
import { Wrench, MapPin } from "@/components/ui/icons"

export interface ServiceRow {
  id: string; title: string; price: unknown; currency: string;
  city: string | null; region: string | null; images: unknown; userId: string; categoryId: string;
  category: { id: string; name: string } | null;
  user: { id: string; firstName: string; lastName: string; avatar: string | null; city: string | null };
}

export function ServiceCard({ item, icon }: { item: ServiceRow; icon: typeof Wrench }) {
  const images = Array.isArray(item.images) ? item.images : [];
  const imageUrl = images.length > 0 ? String(images[0]) : null;
  const Icon = icon;
  return (
    <Link href={`/services/${item.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
        {imageUrl ? (
          <Image src={imageUrl} alt={item.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon className="h-12 w-12 text-text-secondary" />
          </div>
        )}
        {item.category && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-primary-500 px-2.5 py-1 text-xs font-semibold text-white">{item.category.name}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-1 font-heading text-sm font-semibold text-text-primary">{item.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary-600 uppercase">
            {item.user.firstName[0]}{item.user.lastName[0]}
          </div>
          <span className="text-text-secondary">{item.user.firstName} {item.user.lastName}</span>
        </div>
        {(item.city || item.user.city) && (
          <div className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
            <MapPin size={12} className="shrink-0" />
            {[item.city, item.user.city].filter(Boolean).join(", ")}
          </div>
        )}
        {item.price ? (
          <p className="mt-1.5 font-heading text-sm font-bold text-primary-500">From KES {Number(item.price).toLocaleString()}</p>
        ) : null}
      </div>
    </Link>
  )
}
