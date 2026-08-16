import type { Metadata } from "next"
import { AgentsDirectory } from "./AgentsDirectory"

export const metadata: Metadata = {
  title: "APL Representatives — All Property Link",
  description: "Browse our verified APL Representatives across Kenya.",
  alternates: { canonical: "/agents" },
}

export default function AgentsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">Our APL Representatives</h1>
        <p className="mt-3 text-base text-text-secondary">Verified representatives ready to help you find the perfect property</p>
      </div>
      <AgentsDirectory />
    </main>
  )
}
