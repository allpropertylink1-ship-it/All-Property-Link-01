import type { Metadata } from "next"
import { FavoritesClient } from "./FavoritesClient"

// Personal page — must never be indexed.
export const metadata: Metadata = {
  title: "Saved Listings",
  robots: { index: false, follow: false },
}

export default function FavoritesPage() {
  return <FavoritesClient />
}