import type { Metadata } from "next";
import BrowsePageClient from "@/components/browse/BrowsePageClient";

export const metadata: Metadata = {
  title: "Browse Properties",
  description: "Browse properties for sale, long-term rentals, short stays, land and plots in Kenya. Connect directly with verified agents and property owners.",
  alternates: { canonical: "/browse" },
};

export default function BrowsePage() {
  return <BrowsePageClient />;
}