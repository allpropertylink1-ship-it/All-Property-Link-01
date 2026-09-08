"use client";

import Image from "next/image";
import { CheckCircle } from "@/components/ui/icons";

interface FilterCardProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  filterKey: string;
  isActive: boolean;
  onClick: (key: string) => void;
}

export function FilterCard({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  filterKey,
  isActive,
  onClick,
}: FilterCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(filterKey)}
      className={`
        relative group overflow-hidden rounded-2xl border transition-all duration-200
        active:scale-[0.98] active:shadow-none
        ${isActive
          ? "border-primary-500 ring-3 ring-primary-500 ring-offset-2 bg-primary-50 shadow-md"
          : "border-border bg-surface hover:border-primary-400 hover:shadow-xl hover:-translate-y-1"
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
      `}
      aria-pressed={isActive}
      aria-label={`${title}, ${subtitle}. ${isActive ? "Currently selected" : "Click to filter"}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {isActive && (
          <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-white drop-shadow-lg" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 right-2 flex justify-end">
          {isActive && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold shadow-lg">
              ✓
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      </div>
    </button>
  );
}