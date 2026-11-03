import Link from "next/link";
import { siteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Property Link MCP Server",
  description: "All Property Link Model Context Protocol (MCP) server — connect AI agents to property listings, search, and agent data.",
  alternates: { canonical: "/mcp" },
  openGraph: {
    title: "All Property Link MCP Server",
    type: "website",
  },
};

export default function McpPage() {
  const apiBaseUrl = `${siteUrl()}/api`;
  return (
    <section className="min-h-[calc(100dvh-80px)] bg-surface">
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 px-4 py-20 text-center text-text-on-primary">
        <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold leading-tight tracking-h1 sm:text-5xl">
          All Property Link MCP Server
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
          Connect AI agents and assistants to All Property Link property data using the Model Context Protocol (MCP).
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12">
          <h2 className="font-display text-3xl font-bold tracking-h2 text-text-primary mb-4">
            What is MCP?
          </h2>
          <p className="text-text-secondary leading-relaxed text-lg mb-6">
            The Model Context Protocol (MCP) is an open standard that lets AI assistants connect to data sources and tools.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="font-display text-3xl font-bold tracking-h2 text-text-primary mb-4">
            Capabilities
          </h2>
          <ul className="list-disc list-inside text-text-secondary space-y-4 text-lg leading-relaxed">
            <li><strong>Search properties</strong> — Query listings by city, price, type, bedrooms, purpose.</li>
            <li><strong>Get property details</strong> — Full listing details with price, images, agent contact.</li>
            <li><strong>Find agents and fundis</strong> — Discover verified agents and service providers.</li>
          </ul>
        </div>

        <div className="mb-12">
          <h2 className="font-display text-3xl font-bold tracking-h2 text-text-primary mb-4">
            Connect your agent
          </h2>
<p className="text-text-secondary mb-4">
  Configure your MCP client to connect to All Property Link property data via
  the REST API at {apiBaseUrl}. The API exposes property listings, search,
  service providers, and agent profiles as JSON endpoints.
</p>
<div className="bg-surface-secondary rounded-lg p-6 mb-6">
  <pre className="text-sm text-text-secondary overflow-x-auto font-mono">{"{\n  \"mcpServers\": {\n    \"allpropertylink\": {\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@allpropertylink/mcp-server\"],\n      \"env\": {\n        \"API_BASE_URL\": \"" + apiBaseUrl + "\"\n      }\n    }\n  }\n}"}</pre>
  <p className="mt-4 text-sm text-text-secondary">
    The <code>@allpropertylink/mcp-server</code> package is forthcoming. Until
    then, connect your MCP client directly to the REST API endpoints listed in{" "}
    <a href="/docs" className="text-primary hover:underline">API Documentation</a>.
  </p>
</div>
        </div>

        <div className="rounded-lg bg-surface-secondary p-8 text-center md:p-12">
          <h2 className="mb-4 font-heading text-2xl font-bold text-text-primary sm:text-3xl">
            Ready to build?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-text-secondary">
            Start integrating All Property Link data into your AI agent today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/docs"
              className="touch-target inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary-600"
            >
              API Documentation
            </Link>
            <Link
              href="/"
              className="touch-target inline-flex items-center justify-center rounded-lg border border-border bg-surface px-8 py-3 font-medium text-text-primary transition-colors hover:border-accent-500"
            >
              Go to homepage
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}
