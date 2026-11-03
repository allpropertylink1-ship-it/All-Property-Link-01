import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/seo";

const MARKDOWN_404 = `# Page Not Found

The page you requested does not exist on All Property Link.

[Go to homepage](${siteUrl()}) | [View sitemap](${siteUrl()}/sitemap.xml) | [View all properties](${siteUrl()}/properties)

---

All Property Link — Kenya's marketplace for properties, land, short stays, fundis, and service providers.`;

const MARKDOWN_HOMEPAGE = `# All Property Link

## What you can do here

- **Buy or sell property** — houses, apartments, land plots, and commercial real estate listed by owners and verified agents.
- **Rent long-term or short-term** — homes and Airbnb-style stays across Kenyan towns.
- **Hire fundis and service providers** — plumbers, electricians, cleaners, security, and more.
- **List your property** — create an account and list your property for sale or rent.

## Browse listings

- [All properties](${siteUrl()}/properties)
- [Land & plots](${siteUrl()}/land)
- [Short stays / Airbnbs](${siteUrl()}/airbnbs)
- [Services & fundis](${siteUrl()}/services)

## Developer resources

- [API documentation](${siteUrl()}/docs)
- [MCP server](${siteUrl()}/mcp)
- [Sitemap](${siteUrl()}/sitemap.xml)

---

All Property Link — Embassy House, 4th Floor, Harambee Avenue, Nairobi, Kenya. info@allpropertylink.com | +254 743 634 581`;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "404";

  const isMarkdown =
    request.headers.get("accept")?.includes("text/markdown") ?? true;

  if (!isMarkdown) {
    return NextResponse.next();
  }

  const body = type === "homepage" ? MARKDOWN_HOMEPAGE : MARKDOWN_404;
  const status = type === "homepage" ? 200 : 404;

  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Vary": "Accept",
      "Cache-Control": "public, max-age=300",
    },
  });
}
