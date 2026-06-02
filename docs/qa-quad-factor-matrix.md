# QA Quad-Factor Matrix (Prioritized Runtime Paths)

This matrix captures high-risk runtime paths and evaluates each across four
quality factors:

- Happy path behavior
- Edge and boundary handling
- Destructive misuse resilience
- Operational observability

It is scoped to the initial target areas in `apps/web/src/pages`,
`apps/web/src/lib`, `apps/web/src/components`, `apps/web/src/middleware.ts`,
and `packages/infra`.

## Priority Legend

- **P0**: Core flow breakage or silent data loss
- **P1**: Major UX regression or stale/incorrect content risk
- **P2**: Lower blast radius but worth baseline coverage

## QA Matrix

### 1) Dynamic location route (`/locations/[slug]`) - **P0**

- **Runtime surface**
  - `apps/web/src/pages/locations/[slug].astro`
  - `apps/web/src/lib/sanity-location-repository.ts`
  - `apps/web/src/lib/sanity/map-location.ts`
- **Happy path**
  - Valid `slug` resolves location, renders detail, and honors `photo` and
    valid `collection` query params.
  - Page metadata and JSON-LD are generated from resolved location data.
- **Edge and boundary**
  - Missing/unknown slug returns 404 and `LocationNotFound` UI with noindex.
  - Invalid `collection` query value is ignored without throwing.
  - Empty filtered photo set still renders route without crashing.
- **Destructive misuse**
  - Tampered `photo` query ID does not crash gallery launcher or page render.
  - Oversized query values do not bypass collection validation.
- **Operational observability**
  - Mapping skips and invalid rows log warnings in repository mapping.
  - Gap: no structured event payloads for 404 and mapping-skip rates.
- **Automation target**
  - **Playwright**: valid slug render, invalid slug 404, invalid query params.
  - **Vitest**: collection param validation and filter behavior.

### 2) Theme collection route (`/themes/[collection]`) - **P0**

- **Runtime surface**
  - `apps/web/src/pages/themes/[collection].astro`
  - `apps/web/src/lib/selected-photo-collections.ts`
  - `apps/web/src/lib/sanity-location-repository.ts`
- **Happy path**
  - Static path collection pages render with photo list and count.
  - `photo` query highlights initial photo when present.
- **Edge and boundary**
  - Invalid collection param returns 404 and fallback content.
  - Valid collection with zero tagged photos shows empty-state card.
  - First preview image metadata remains safe when `photos[0]` is missing.
- **Destructive misuse**
  - Direct deep links with malformed/tampered collection values stay 404.
  - Rapid toggling between collections does not leave stale state in URL.
- **Operational observability**
  - Invalid dataset rows default to safe values or are skipped in mappers.
  - Gap: no route-level telemetry for collection misses vs true empty themes.
- **Automation target**
  - **Playwright**: theme navigation, deep-link with photo query, invalid theme.
  - **Vitest**: collection validator and collection-link generation.

### 3) Selected-photo collection control and URL transitions - **P1**

- **Runtime surface**
  - `apps/web/src/components/selected-photos/collection-dropdown.astro`
  - `apps/web/src/lib/selected-photo-collections.ts`
- **Happy path**
  - Selecting a collection pushes user to `/themes/<collection>`.
  - Default option keeps user on current context when empty.
- **Edge and boundary**
  - No-op for empty selection value avoids accidental redirects.
  - Non-select event target is ignored safely.
- **Destructive misuse**
  - Synthetic or repeated change events should not trigger invalid routes.
  - Invalid option injection should be blocked by server-side route validation.
- **Operational observability**
  - Currently no interaction logging for drop-down change or failed nav.
  - Gap: no client-side breadcrumb for repeated redirect loops.
- **Automation target**
  - **Vitest + Testing Library**: change handler behavior (empty vs valid value).
  - **Playwright**: user flow from selector to resolved theme page.

### 4) Sanity repository mapping/validation layer - **P0**

- **Runtime surface**
  - `apps/web/src/lib/sanity-location-repository.ts`
  - `apps/web/src/lib/sanity/map-location.ts`
  - `apps/web/src/lib/about-feature-photos.ts`
- **Happy path**
  - Array responses map to typed records and produce deterministic links.
  - Required fields produce complete location/map/gallery payloads.
- **Edge and boundary**
  - Non-array responses fail open to empty arrays in list fetchers.
  - Partially invalid rows are skipped without failing full page render.
  - Missing numeric counters fall back to zero.
- **Destructive misuse**
  - Schema/query drift and malformed rows should not break route generation.
  - Tampered string fields are trimmed and validation-gated before use.
- **Operational observability**
  - `console.warn` captures skip reasons and unexpected shapes.
  - Gap: warn-only logging can be lost in production and is not queryable.
- **Automation target**
  - **Vitest**: table-driven tests for malformed rows, empty arrays, and drift.
  - **Vitest**: assert skip behavior and output shape for each repository API.

### 5) Cache-control middleware behavior - **P0**

- **Runtime surface**
  - `apps/web/src/middleware.ts`
- **Happy path**
  - Cache headers are set only for cacheable HTML GET responses with status 200.
  - Existing `Cache-Control` headers are preserved.
- **Edge and boundary**
  - Non-GET methods bypass cache mutation.
  - Non-200 responses bypass cache mutation.
  - Unknown routes and non-whitelisted paths do not get HTML cache policy.
- **Destructive misuse**
  - Query-string spam and unusual path variants should not broaden cache scope.
  - Header injection attempts should not override explicit upstream headers.
- **Operational observability**
  - Current behavior is deterministic but lacks explicit request-level tracing.
  - Gap: no metric for cache hit intent vs bypass reasons.
- **Automation target**
  - **Vitest**: path/method/status/header matrix for `onRequest`.
  - **Playwright**: smoke assertion for expected cache headers on route samples.

### 6) Deployment preflight and prerender safety checks - **P1**

- **Runtime surface**
  - `packages/infra/scripts/preflight-cloudflare.ts`
  - `packages/infra/scripts/prerender-safety-check.ts`
  - root scripts: `deploy:safe`, `deploy:preflight`
- **Happy path**
  - Preflight and prerender checks pass before deploy path is allowed.
  - `deploy:safe` enforces predeploy check before `deploy`.
- **Edge and boundary**
  - Missing or malformed env configuration fails fast.
  - Unexpected production response shape fails safety check.
- **Destructive misuse**
  - Operator bypass of safety scripts is possible via direct deploy command.
  - Risk: branch/developer variation in command choice can skip guardrail.
- **Operational observability**
  - Script failures block process at CLI level.
  - Gap: no centralized alerting/audit trail for skipped safety checks.
- **Automation target**
  - **Vitest**: unit tests for env validation and non-zero exit paths.
  - **CI step**: enforce `bun run deploy:safe` usage for protected branches.

## Risk-First Backlog (Derived from Matrix)

1. Add route-level E2E for invalid `slug`/`collection` and query-param tampering.
2. Add unit tests for repository fail-open logic and schema-drift conditions.
3. Add middleware tests covering method/status/path/header permutations.
4. Add observability hooks beyond `console.warn` for high-risk skip/error paths.
5. Add CI rule to prevent deploy commands that bypass preflight/safety checks.

## P0 Refactor Notes (Implemented)

This section documents the rationale, structural changes, and runtime behavior
changes introduced by the P0 refactor pass.

### Why These Changes Were Made

- **Reduce edge cache drift risk:** previous cache eligibility logic used broad
  prefix matching and only covered a subset of stable HTML routes.
- **Lower homepage TTFB:** independent Sanity reads on `/` were performed
  serially despite having no data dependency between them.
- **Separate repository concerns:** data fetch orchestration, row guards, and
  telemetry behaviors lived in one large module.
- **Harden dynamic route behavior:** detail/theme pages accepted `?photo=`
  values without checking that the photo exists in the resolved payload.
- **Improve failure UX for upstream outages:** location detail route treated all
  missing data as not-found rather than distinguishing fetch failures.
- **Fix map control edge case:** locate button could enter waiting state in
  unsupported geolocation environments.

### New Structure

The repository layer was split into focused support modules:

- `apps/web/src/lib/sanity/repository-context.ts`
  - Provides shared repository context (`client`, `imageBuilder`) and central
    image builder memoization.
- `apps/web/src/lib/sanity/repository-row-guards.ts`
  - Encapsulates common row-shape checks and parsers:
    - `requireSanityRows()`
    - `getRowSlug()`
    - `parsePlaceLinkRow()`
- `apps/web/src/lib/sanity/repository-telemetry.ts`
  - Centralizes telemetry types and emitters:
    - `SanityRepositoryTelemetryEvent`
    - `setSanityRepositoryTelemetryEmitter()`
    - `resetSanityRepositoryTelemetryEmitter()`
    - `emitSanityRepositorySkip()`
    - `emitSanityRepositoryUnexpectedShape()`
- `apps/web/src/lib/sanity-location-repository.ts`
  - Retains public API surface but now delegates shared concerns to the modules
    above to reduce duplication and improve maintainability.

### Functionality Changes

- **Middleware cache policy (`apps/web/src/middleware.ts`)**
  - Cacheable HTML routes are now matched with explicit allowlist patterns:
    `/`, `/about`, `/locations/[slug]`, `/themes/[collection]`.
  - Header application now checks `Content-Type` and avoids adding HTML cache
    policy to non-HTML responses.
  - Decision logic is isolated in `shouldSetHtmlCacheHeader()` and covered in
    unit tests.

- **Homepage server data (`apps/web/src/pages/index.astro`)**
  - `fetchLocationsForMap()`, `fetchOtherLocationPlaces()`, and
    `fetchThemeCollectionPhotoCounts()` now run in `Promise.all(...)`.
  - Expected impact: lower SSR latency for `/` under equivalent backend
    conditions.

- **Location detail route (`apps/web/src/pages/locations/[slug].astro`)**
  - Adds explicit `try/catch` around Sanity fetch.
  - Uses `503` + temporary unavailable UI for upstream failure path.
  - Keeps `404` semantics for genuine not-found records.
  - Validates `?photo=` against current `displayPhotos` before passing to the
    gallery launcher.

- **Theme route (`apps/web/src/pages/themes/[collection].astro`)**
  - Validates `?photo=` against fetched photo IDs before passing initial photo
    selection to the gallery launcher.

- **Map controls (`apps/web/src/components/ui/map.tsx`)**
  - Locate action now exits early when geolocation is unavailable and does not
    leave control state in a waiting/spinner lock.

### Expected Operational Impact

- Reduced accidental cache broadening and better cache correctness for HTML
  routes.
- Lower server response time for homepage SSR due to parallel fetch fan-out.
- Better resilience semantics (distinguishing unavailable vs missing content) on
  location detail route.
- Lower invalid deep-link surface for `?photo=` query parameters on location and
  theme pages.
- Cleaner repository internals for future Sanity query evolution and telemetry
  extension.

## Follow-up Refactors (Completed)

These items complete the remaining code-level refactors from the review pass.

- **Collection taxonomy hardening**
  - `apps/web/src/lib/selected-photo-collections.ts` now defines
    `SELECTED_PHOTO_COLLECTIONS` as an immutable `as const` source and validates
    with a precomputed `Set` for tighter runtime checks.

- **Client-side collection navigation guardrail**
  - `apps/web/src/components/selected-photos/collection-dropdown.astro` now
    checks selected values against an allowlist before navigating to
    `/themes/<collection>`.

- **Map tooltip carousel edge-case safety**
  - `apps/web/src/components/map/location-marker-tooltip-card.tsx` now guards
    prev/next handlers against zero-length photo arrays before modulo math.

- **Route-level query-param observability**
  - `apps/web/src/pages/locations/[slug].astro` and
    `apps/web/src/pages/themes/[collection].astro` now emit structured warnings
    when invalid `?photo=` params are ignored.
