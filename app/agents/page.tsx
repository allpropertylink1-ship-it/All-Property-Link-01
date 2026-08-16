import type { Metadata } from "next"
import { AgentsDirectory } from "./AgentsDirectory"

export const metadata: Metadata = {
  title: "APL Representatives",
  description: "Browse our verified APL Representatives across Kenya.",
  alternates: { canonical: "/agents" },
}

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-surface">
      <section className="bg-primary-600 py-16 text-center text-text-on-primary sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">Our APL Representatives</h1>
          <p className="mx-auto max-w-2xl text-balance text-lg text-primary-100 sm:text-xl">
            Verified representatives ready to help you find the perfect property
          </p>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <AgentsDirectory />
        </div>
      </section>
    </main>
  )
}
