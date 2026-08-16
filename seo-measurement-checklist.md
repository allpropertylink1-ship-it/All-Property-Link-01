# SEO Measurement Checklist — www.allpropertylink.co.ke

Verify after each main-site deploy (and ~weekly afterward). Anything unchecked → investigate.

**Canonical host is `www.allpropertylink.co.ke`** — the apex (`allpropertylink.co.ke`) 308-redirects to www (Vercel domain config). All robots/sitemap/canonicals/JSON-LD emit `https://www.allpropertylink.co.ke` via `siteUrl()` (`lib/seo.ts`); override with `SITE_URL` env if the redirect is ever flipped.

## After deploy (once)

| Check | How | Expected | Status |
|---|---|---|---|
| robots.txt serves | `curl https://www.allpropertylink.co.ke/robots.txt` | sitemap URL = `https://www.allpropertylink.co.ke/sitemap.xml` (no `*-vercel.preview` / VERCEL_URL hosts) | ☐ |
| sitemap serves | `curl https://www.allpropertylink.co.ke/sitemap.xml` | 200; ~440 URLs; all `https://www.allpropertylink.co.ke/...`; cities slugified & deduped; no "test" titles | ☐ |
| Apex redirects | `curl -I https://allpropertylink.co.ke` | 308 → www | ☐ |
| Homepage JSON-LD | view-source `https://www.allpropertylink.co.ke` | `Organization` + `WebSite` + `SearchAction` blocks with www URLs | ☐ |
| Listing canonical + JSON-LD | view-source one live listing (from sitemap) | `<link rel="canonical">` = current URL; `RealEstateListing` + `BreadcrumbList` JSON-LD; title = `<title> | All Property Link` exactly once | ☐ |
| City page | `/properties/kisumu` | 200; `<title>` = `Properties in Kisumu | All Property Link`; canonical correct | ☐ |
| Service detail | `/services/<id>` from sitemap | title = `service title | All Property Link` (no doubled brand); `Service` JSON-LD with www URL | ☐ |
| Legacy URL handling | hit `/properties/Kisumu/<slug>` (wrong case) or `/properties/nairobi/<slug>` (wrong city) | 200 + `<meta id="__next-page-redirect" http-equiv="refresh" content="1;url=/properties/kisumu/...">` + canonical to the canonical URL (soft redirect — Google consolidates via canonical+refresh) | ☐ |

## Weekly (Google Search Console)

| Metric | Target | Trend |
|---|---|---|
| Indexed pages | grows week-over-week | |
| Sitemap errors | 0 | |
| Core Web Vitals (LCP) | < 2.5s on listing pages | |
| 404s on indexed URLs | 0 (check "Page indexing" report) | |

## Monthly

- Search for `site:allpropertylink.co.ke` — count indexed pages; should rise as crawl budget allows.
- Check GSC "Page indexing" for "Crawled – currently not indexed" clusters (thin city/service pages — add content if so).
- Query performance (sitemap/listering page TTBFB) — server-rendered initial data must stay fast; if prisma call drifts, cache the city+property gets.