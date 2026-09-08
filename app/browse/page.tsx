import type { Metadata } from "next";
import BrowsePageClient from "@/components/browse/BrowsePageClient";

export const metadata: Metadata = {
  title: "Browse All Listings",
  description: "Browse properties for sale, rent, Airbnbs, land, and services in Kenya. Filter by category to find exactly what you're looking for.",
  alternates: { canonical: "/browse" },
};

export default function BrowsePage() {
  return <BrowsePageClient />;
}