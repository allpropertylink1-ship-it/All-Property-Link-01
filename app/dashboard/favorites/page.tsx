"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import Image from "next/image";

interface FavoriteItem {
  id: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    city: string;
    propertyType: string;
    bedrooms: number | null;
    bathrooms: number | null;
    images: string[];
    isPublished: boolean;
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  async function handleRemoveFavorite(favoriteId: string) {
    try {
      const res = await fetch("/api/user/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoriteId }),
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
      }
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
          Favorites
        </h1>
        <LoadingSkeleton />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div>
        <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
          Favorites
        </h1>
        <EmptyState
          title="No favorites yet"
          description="Save properties you like by clicking the heart icon on any listing."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
        Favorites
      </h1>
      <p className="mb-6 text-sm text-text-secondary">
        {favorites.length} saved {favorites.length === 1 ? "property" : "properties"}
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((fav) => {
          const images: string[] =
            typeof fav.property.images === "string"
              ? JSON.parse(fav.property.images)
              : Array.isArray(fav.property.images)
                ? fav.property.images
                : [];
          const image = images[0] || null;

          return (
            <div
              key={fav.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => handleRemoveFavorite(fav.id)}
                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-error-500 shadow transition-colors hover:bg-error-500 hover:text-white"
                aria-label="Remove from favorites"
              >
                <Heart size={16} fill="currentColor" />
              </button>

              <div
                className="relative h-48 w-full cursor-pointer bg-surface-secondary"
                onClick={() => router.push(`/properties/${fav.property.slug}`)}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={fav.property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-secondary">
                    No image
                  </div>
                )}
                {!fav.property.isPublished && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-warning-500 px-2 py-0.5 text-xs font-medium text-white">
                    Unpublished
                  </span>
                )}
              </div>

              <div className="p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-text-secondary">
                  {fav.property.propertyType} &middot; {fav.property.city}
                </p>
                <h3
                  className="mb-1 cursor-pointer font-medium text-text-primary hover:text-primary-600"
                  onClick={() => router.push(`/properties/${fav.property.slug}`)}
                >
                  {fav.property.title}
                </h3>
                <p className="mb-2 font-heading text-lg font-bold text-primary-600">
                  {fav.property.currency} {Number(fav.property.price).toLocaleString()}
                </p>
                <div className="flex gap-4 text-sm text-text-secondary">
                  {fav.property.bedrooms && (
                    <span>{fav.property.bedrooms} bed</span>
                  )}
                  {fav.property.bathrooms && (
                    <span>{fav.property.bathrooms} bath</span>
                  )}
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  Saved {new Date(fav.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
