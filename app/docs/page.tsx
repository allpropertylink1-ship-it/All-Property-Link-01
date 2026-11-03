import Link from "next/link";
import { siteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Property Link API Documentation",
  description: "All Property Link API reference for developers — properties, agents, services, favorites, saved searches, and authentication endpoints.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "All Property Link API Documentation",
    type: "website",
  },
};

export default function DocsPage() {
  const apiBaseUrl = `${siteUrl()}/api`;
  return (
    <section className="min-h-[calc(100dvh-80px)] bg-surface">
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 px-4 py-20 text-center text-text-on-primary">
        <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold leading-tight tracking-h1 sm:text-5xl">
          All Property Link API
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
          Developer documentation for the All Property Link platform. Integrate property listings,
          agent profiles, service provider data, and more into your application.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12">
          <h2 className="font-display text-3xl font-bold tracking-h2 text-text-primary mb-4">
            Base URL
          </h2>
          <p className="text-text-secondary mb-4">
            <code className="text-primary-600 bg-surface-secondary px-2 py-1 rounded">{apiBaseUrl}</code>
          </p>
          <p className="text-text-secondary text-sm">
            All API requests are proxied through {siteUrl()} and forwarded to the backend at https://api.allpropertylink.co.ke.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="font-display text-3xl font-bold tracking-h2 text-text-primary mb-4">
            Authentication
          </h2>
          <p className="text-text-secondary mb-4">
            Public endpoints require no authentication. Protected endpoints use JWT access tokens stored in httpOnly cookies.
          </p>
        </div>

        <div className="mb-12 space-y-4">
          <h3 className="font-display text-2xl font-bold tracking-h2 text-text-primary mb-2">
            Endpoints
          </h3>
          <ul className="list-disc list-inside text-text-secondary space-y-2 text-sm">
            <li><code>GET /api/properties</code> — List properties</li>
            <li><code>GET /api/properties/:slug</code> — Get a single property</li>
            <li><code>GET /api/services</code> — List services and fundis</li>
            <li><code>GET /api/favorites</code> — List saved favorites (auth)</li>
          </ul>
        </div>

        <div className="rounded-lg bg-surface-secondary p-8 text-center md:p-12">
          <h2 className="mb-4 font-heading text-2xl font-bold text-text-primary sm:text-3xl">
            Need help?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-text-secondary">
            Questions about the API? Contact us at info@allpropertylink.com or +254 743 634 581.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="touch-target inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary-600"
            >
              Go to homepage
            </Link>
            <Link
              href="/mcp"
              className="touch-target inline-flex items-center justify-center rounded-lg border border-border bg-surface px-8 py-3 font-medium text-text-primary transition-colors hover:border-accent-500"
            >
              MCP Server
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}
