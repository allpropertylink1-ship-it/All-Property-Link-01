# SEO Measurement Checklist — allpropertylink.co.ke

Verify after each main-site deploy (and ~weekly afterward). Anything unchecked → investigate.

## After deploy (once)

| Check | How | Expected | Status |
|---|---|---|---|
| robots.txt serves | `curl https://allpropertylink.co.ke/robots.txt` | sitemap URL = `https://allpropertylink.co.ke/sitemap.xml` (no `*-vercel.preview` / VERCEL_URL hosts) | ☐ |
| sitemap serves | `curl https://allpropertylink.co.ke/sitemap.xml` | 200; >230 URLs; all `https://allpropertylink.co.ke/...`; cities slugified & deduped; no "test" titles | ☐ |
| No `www` duplication | `curl -I https://www.allpropertylink.co.ke` | 3xx → apex (Vercel redirect) | ☐ |
| Homepage JSON-LD | view-source `https://allpropertylink.co.ke` | `WebSite` + `SearchAction` blocks present | ☐ |
| Listing canonical + JSON-LD | view-source one live listing (e.g. a property from sitemap) | `<link rel="canonical">` = current URL; `RealEstateListing` + `BreadcrumbList` JSON-LD; title not overflowing | ☐ |
| City page | `/properties/nairobi` | 200; `<title>` has "Nairobi"; canonical correct; WebPage JSON-LD | ☐ |
| Service detail | `/services/<id>` from sitemap | `<title>` from service; `Service` JSON-LD | ☐ |
| Old-style URL redirect | hit `/properties/Nairobi/old-style-slug` (unslugified city, non-canonical slug) | 308 → `/properties/nairobi/canonical-slug` | ☐ |

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