"use client";

import { FilterCard } from "./FilterCard";

interface FilterCardGroupProps {
  activeTab: "properties" | "services";
  propertyFilter: string;
  serviceFilter: string;
  onPropertyFilterChange: (key: string) => void;
  onServiceFilterChange: (key: string) => void;
}

const PROPERTY_CARDS = [
  {
    key: "FOR_SALE",
    title: "For Sale",
    subtitle: "Houses & apartments",
    imageSrc: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
    imageAlt: "Coastal Kenyan house surrounded by palm trees and lush greenery",
  },
  {
    key: "FOR_RENT_LONG_TERM",
    title: "For Rent",
    subtitle: "Long-term rentals",
    imageSrc: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    imageAlt: "Kenyan coastal town buildings along a lush waterfront",
  },
  {
    key: "FOR_RENT_SHORT_TERM",
    title: "Short-Term",
    subtitle: "Airbnbs & vacation",
    imageSrc: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    imageAlt: "Tropical palm-fringed beach in Mombasa, Kenya",
  },
  {
    key: "LAND",
    title: "Land & Plots",
    subtitle: "Development land",
    imageSrc: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    imageAlt: "Aerial view of coastal land with ocean and trees in Kilifi, Kenya",
  },
] as const;

const SERVICE_CARDS = [
  {
    key: "FUNDI",
    title: "Fundis",
    subtitle: "Skilled trades",
    imageSrc: "https://images.unsplash.com/photo-1581147036324-c1c88e8c0c3e?w=800&q=80",
    imageAlt: "Carpenter working with wooden planks in a workshop",
  },
  {
    key: "SERVICE_PROVIDER",
    title: "Services",
    subtitle: "Delivery & more",
    imageSrc: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80",
    imageAlt: "Motorcycle delivery service on a Nairobi street with vibrant street art",
  },
] as const;

export function FilterCardGroup({
  activeTab,
  propertyFilter,
  serviceFilter,
  onPropertyFilterChange,
  onServiceFilterChange,
}: FilterCardGroupProps) {
  if (activeTab === "properties") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PROPERTY_CARDS.map((card) => {
          const { key, ...cardProps } = card;
          return (
            <FilterCard
              key={key}
              {...cardProps}
              filterKey={key}
              isActive={propertyFilter === key}
              onClick={onPropertyFilterChange}
              tab="properties"
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {SERVICE_CARDS.map((card) => {
        const { key, ...cardProps } = card;
        return (
          <FilterCard
            key={key}
            {...cardProps}
            filterKey={key}
            isActive={serviceFilter === key}
            onClick={onServiceFilterChange}
            tab="services"
          />
        );
      })}
    </div>
  );
}