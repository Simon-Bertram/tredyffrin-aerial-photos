# SEO and semantic HTML (web app)

This document describes how the **`apps/web`** Astro app handles **search and sharing metadata**, **structured data**, **crawler discovery**, and **semantic markup**. Use it when changing layouts, adding routes, or tuning previews in Slack, Messages, or search results.

---

## Environment: canonical URLs

| Variable | Role |
|----------|------|
| **`PUBLIC_SERVER_URL`** | **Canonical site origin** (no trailing slash required; code normalizes it). Used for `<link rel="canonical">`, Open Graph / Twitter absolute URLs, JSON-LD `url` fields, **`/sitemap.xml`** entries, and **`/robots.txt`** `Sitemap:` line. |

Declared in `apps/web/astro.config.mjs` and imported in layout/endpoints via **`astro:env/client`**.

**Production:** set this to the real HTTPS origin (for example `https://www.example.com`). If it stays on `http://localhost:3000`, shared links and sitemap locations will point at localhost.

Implementation: `apps/web/src/lib/site-url.ts` (`getSiteOrigin()`, `toAbsoluteUrl()`).

---

## Global layout: `Layout.astro`

All pages should use the shared layout so metadata stays consistent.

### Props

| Prop | Type | Purpose |
|------|------|---------|
| `title` | `string` (optional) | `<title>` and social titles. |
| `description` | `string` (optional) | Meta description and social descriptions. |
| `image` | `string` (optional) | Preview image: absolute URL or site-relative path; passed through `toAbsoluteUrl()`. |
| `imageAlt` | `string` (optional) | `og:image:alt` and `twitter:image:alt` when `image` is set. |
| `ogType` | `'website' \| 'article'` | `og:type` (default `website`). |
| `robots` | `string` (optional) | `meta name="robots"` (e.g. `noindex, nofollow` for error pages). |
| `jsonLd` | object or array of objects | Injected as one or more `<script type="application/ld+json">` blocks (with safe escaping). |

### Head output (summary)

- **Canonical:** `canonicalUrl` = origin + `Astro.url.pathname` (query string omitted).
- **Open Graph:** `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `og:locale`, and when `image` is set: `og:image` (+ `og:image:alt` if `imageAlt` is set).
- **Twitter:** `twitter:card` is `summary_large_image` when an image exists, otherwise `summary`; plus title, description, and image fields when applicable.

Defaults for missing `title` / `description` match the original site tagline (see `Layout.astro`).

---

## Per-route behavior

### Home (`apps/web/src/pages/index.astro`)

- **Semantics:** Single `<main id="main-content">`; map section has a visible **`<h2>`** (“The atlas.”); site colophon is a **`<footer>`** sibling **after** `</main>` (not nested inside `<main>`).
- **SEO:** Page-specific `title` / `description` aligned with the hero; Open Graph image from the **first photo of the first location** when data exists.
- **JSON-LD:** `WebSite` (name, url, description) and `Organization` (Tredyffrin Easttown Historical Society).

### About (`apps/web/src/pages/about.astro`)

- **Semantics:** Long-form **`article`**; microdata (`itemscope` / `itemtype`) was removed in favor of JSON-LD only. External links with `target="_blank"` use **`rel="noopener noreferrer"`**. Link text fixes include **Pennsylvania** (spelling) and **Google Maps.**
- **SEO:** Dedicated meta `description`; `og:type` is **`article`**; OG image from the hero feature photo when present.
- **JSON-LD:** `Article` (headline, description, url, author/publisher organization).

### Location detail (`apps/web/src/pages/locations/[slug].astro`)

- **Semantics:** `<main id="main-content">`; one `<h1>` for the location; each photo card uses **`<h2>`** for `photo.title` when present; images include **`width` / `height`** and **`decoding="async"`** to reduce layout shift.
- **SEO:** Title pattern **`{location.name} — Tredyffrin Aerial Photos`** (replaces older `tehs-aerial-images` branding). Meta description is a **truncated** `shortDescription` or `fullDescription`. OG image from the first photo when present.
- **JSON-LD:** `Place` (name, description, `geo` coordinates, url, optional `image` array with absolute URLs).
- **404:** HTTP404, title **Page not found — Tredyffrin Aerial Photos**, `robots: noindex, nofollow`, no Place JSON-LD.

---

## Crawler discovery

| URL | Implementation | Notes |
|-----|----------------|--------|
| **`/sitemap.xml`** | `apps/web/src/pages/sitemap.xml.ts` | Lists `/`, `/about`, and `/locations/{slug}` for every published Sanity location (`fetchPublishedLocationSlugs()`). |
| **`/robots.txt`** | `apps/web/src/pages/robots.txt.ts` | `Allow: /` and `Sitemap:` pointing at `{origin}/sitemap.xml`. |

GROQ for slugs only: `locationSlugsQuery` in `apps/web/src/lib/sanity/queries.ts`. Server helper: `fetchPublishedLocationSlugs()` in `apps/web/src/lib/sanity-location-repository.ts`.

---

## Component-level semantics and a11y

| Area | File | Change |
|------|------|--------|
| Map tooltip card | `apps/web/src/components/map-marker.tsx` | Location name is an **`<h3>`** inside the tooltip `article`. |
| Selected photographs strip | `apps/web/src/components/selected-photos.tsx` | Horizontal list has **`role="list"`** and **`aria-label="Selected photographs"`** (items remain `role="listitem"` on links). |

---

## Adding a new page

1. Use **`Layout`** with an explicit **`title`** and **`description`**.
2. Set **`ogType`** to **`article`** for editorial or long-form pages if previews should use article semantics.
3. Pass **`image` / `imageAlt`** when there is a natural hero or primary visual (improves share cards).
4. Append the path to **`sitemap.xml`** generation if the page should be indexed (static routes only need a new entry in the `paths` array in `sitemap.xml.ts`; dynamic routes need a data source like the locations query).

---

## Related files (quick index)

- `apps/web/src/layouts/Layout.astro` — head tags and JSON-LD injection.
- `apps/web/src/lib/site-url.ts` — origin and absolute URLs.
- `apps/web/src/lib/sanity/queries.ts` — `locationSlugsQuery`.
- `apps/web/src/lib/sanity-location-repository.ts` — `fetchPublishedLocationSlugs()`.
- `apps/web/src/pages/sitemap.xml.ts` — sitemap endpoint.
- `apps/web/src/pages/robots.txt.ts` — robots endpoint.
