# QA Improvements Report

Brief summary of changes implemented following the Site QA Review (June 2026). These updates target performance, reliability, security, maintainability, and test stability.

---

## 1. Performance — deferred hydration and code splitting

**Goal:** Reduce main-thread work and initial JavaScript payload on the homepage and detail pages.

| Change | Location |
|--------|----------|
| Coverflow island hydrates when scrolled into view (`client:visible`) | `apps/web/src/components/home/home-selected-photos-section.astro` |
| Gallery launcher hydrates on visibility | `apps/web/src/components/location/location-detail.astro`, `apps/web/src/pages/themes/[collection].astro` |
| Map island lazy-loads `TredyffrinMap` via `React.lazy()` + `Suspense` | `apps/web/src/components/home/home-map-island.tsx` |

The map still uses `client:idle` at the Astro layer; the React lazy import defers the MapLibre bundle until the island mounts.

**Not yet addressed:** homepage prerendering, `srcset`/`sizes`, carousel library consolidation, font subsetting. See Lighthouse artifacts in `apps/web/lighthouse-*.json` for baseline metrics.

---

## 2. Reliability — error handling parity

**Goal:** Graceful degradation when Sanity is unavailable; a branded fallback for unhandled errors.

| Change | Location |
|--------|----------|
| Theme route wraps `fetchThemePhotos` in try/catch and returns **503** with a user-facing message | `apps/web/src/pages/themes/[collection].astro` |
| Global **500** page with `noindex` and link back to home | `apps/web/src/pages/500.astro` |

Theme pages now behave consistently with location pages, which already distinguished 404 (unknown slug) from 503 (upstream failure).

---

## 3. Security — HTTP response headers

**Goal:** Defense-in-depth beyond framework escaping for a read-only public archive.

Middleware now applies on every response:

- `Content-Security-Policy` (self, Sanity CDN, Carto basemaps, blob workers)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (geolocation, microphone, camera disabled)
- `Strict-Transport-Security` on HTTPS requests

Implementation: `apps/web/src/middleware.ts` (`applySecurityHeaders`). Unit tests in `apps/web/src/middleware.test.ts`.

**Not yet addressed:** dependency audit in CI (`bun audit`, Dependabot).

---

## 4. Maintainability — lint and CI build gate

**Goal:** Catch style and bundle issues before merge.

| Change | Location |
|--------|----------|
| **Biome** linter added (lint-only; formatter disabled to avoid mass reformat) | `biome.json`, root and `apps/web` `lint` scripts |
| CI runs **lint** and **production build** in addition to typecheck and tests | `.github/workflows/ci.yml` |

Biome is configured with relaxed rules for pre-existing patterns (a11y and hook warnings, not errors). Astro files are excluded from lint until a dedicated plugin is adopted.

---

## 5. E2E test hardening — fixture data

**Goal:** Deterministic Playwright runs without depending on live Sanity content.

| Change | Location |
|--------|----------|
| Fixture dataset for map, themes, locations, sitemap slugs | `apps/web/src/lib/e2e-fixtures.ts` |
| Repository short-circuits to fixtures when `SANITY_E2E_FIXTURES=1` | `apps/web/src/lib/sanity-location-repository.ts` |
| Astro env schema field for the flag | `apps/web/astro.config.mjs` |
| Playwright starts a dedicated dev server with fixtures enabled | `playwright.config.ts` |
| New smoke test: valid location page (`/locations/e2e-test-location`) | `apps/web/e2e/site-smoke.spec.ts` |
| Shared slug constant (no Astro imports in Playwright) | `apps/web/src/lib/e2e-constants.ts` |

E2E suite: **7 tests** (homepage coverflow filter, robots/sitemap, theme happy/404 paths, location happy/404 paths).

To run locally:

```bash
bun run test:e2e
```

The Playwright web server sets `SANITY_E2E_FIXTURES=1` automatically; do not enable this flag in production `.env`.

---

## Verification snapshot

At implementation time:

| Check | Result |
|-------|--------|
| `bun run check-types` | Pass |
| `bun run lint` | Pass (warnings only) |
| `bun run build` | Pass |
| `bun run test:unit` | 44/44 pass |
| `CI=1 bun run test:e2e` | 7/7 pass |

---

## Remaining gaps (from QA review)

These were identified in the review but are **out of scope** for this pass:

- Doc drift: QA matrix §3 still describes collection dropdown navigation to `/themes/*`; implementation filters coverflow in-place
- Structured logging/telemetry (production observability)
- `srcset`/`sizes` for Sanity images; LCP `fetchpriority`
- Dead code cleanup (`carousel-02.tsx`, unused `@fontsource-variable/geist`)
- E2E coverage for 503 paths and gallery deep-links
- `bun audit` / Dependabot in CI

See [`qa-quad-factor-matrix.md`](qa-quad-factor-matrix.md) for the full prioritized runtime path matrix.
