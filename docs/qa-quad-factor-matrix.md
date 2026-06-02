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
