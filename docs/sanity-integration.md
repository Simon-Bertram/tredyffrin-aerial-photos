# Sanity integration (concise reference)

Use this to replicate the same pattern in another project. This repo uses **Astro** (server output) + **`@sanity/client`** + **`@sanity/image-url`** + **Zod** + **Astro env schema**.

---

## Concepts to learn

| Topic | Why it matters |
|--------|----------------|
| **Content Lake** | Sanity stores JSON documents in a hosted API; your app reads them over HTTP (not from your DB). |
| **Project ID & dataset** | Every query is scoped to `projectId` + `dataset` (e.g. `production`). Same schema can have multiple datasets. |
| **Studio vs frontend** | **Sanity Studio** is the editor UI (often deployed separately). The **frontend** only needs the API + read access. |
| **GROQ** | Query language for JSON documents. You define **projections** `{ field, "alias": expr }` to shape each document. |
| **Drafts** | Unpublished edits may live as draft documents (`_id` often prefixed with `drafts.`). Public frontends usually query **published** docs only (see `coalesce` / `!(_id in path("drafts.**"))` patterns in [Sanity docs](https://www.sanity.io/docs/groq) if you need to exclude drafts explicitly). |
| **CDN vs API** | `useCdn: true` uses the **read CDN** (fast, eventually consistent). **Authenticated** reads (`token`) typically use `useCdn: false` for fresher data. |
| **API version** | `apiVersion` is a dated string (e.g. `2024-01-01`); pin it so behavior does not drift. |
| **Image pipeline** | Image fields store an **asset reference** (`asset._ref`). Public URLs are built with **`@sanity/image-url`** (width, format, crop/hotspot), not by hand. |
| **Geopoints** | `geopoint` fields expose **`lat`** and **`lng`** in API JSON. |

---

## Dependencies

- `@sanity/client` — `createClient`, `fetch` with GROQ strings.
- `@sanity/image-url` — `createImageUrlBuilder({ projectId, dataset })`, then `.image(source).width(n).auto('format').url()`.
- `zod` (optional but recommended) — parse API payloads before mapping to UI types.

---

## Environment variables

| Variable | Role |
|----------|------|
| `PUBLIC_SANITY_PROJECT_ID` | Project identifier (from [sanity.io/manage](https://www.sanity.io/manage)). |
| `PUBLIC_SANITY_DATASET` | Dataset name (often `production`). |
| `SANITY_API_READ_TOKEN` | **Optional.** Server-only token with **Viewer** (read) access if the dataset is **private**. Never expose to the browser. |

In **Astro 4+**, declare these in `astro.config` `env.schema` and import from `astro:env/server` in server-only code so values are validated and secrets stay server-scoped. Other frameworks: use their env rules (e.g. Next `server-only` + `process.env`).

---

## Client pattern

```ts
createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: !hasReadToken,
  ...(hasReadToken ? { token: readToken } : {}),
})
```

- **Public dataset:** no token, `useCdn: true` is typical.
- **Private dataset:** token required, `useCdn: false` is typical.

Run all Sanity calls **on the server** (SSR, route loaders, server actions) unless you intentionally expose public data from the browser (still avoid tokens client-side).

---

## GROQ

1. **Filter** documents: `*[_type == "post" && defined(slug.current)]`.
2. **Project** fields: `{ title, "slug": slug.current, ... }`.
3. **Parameters:** `slug.current == $slug` with `client.fetch(query, { slug })`.
4. **Single doc:** `[0]` after filter, e.g. `*[...][0]{ ... }`.
5. **Order:** `| order(name asc)`.

Reuse **one projection** for “list” and “detail” queries so the app shape never diverges.

Nested **image** fields: query `photo` as stored (object with `asset`), not only `url`, so `@sanity/image-url` can apply transforms and hotspot.

---

## Images

- Validate minimally that `photo.asset._ref` exists before calling the builder.
- Use different **widths** for thumbnails vs hero (this repo: ~1200 map, ~1600 detail).
- `auto('format')` serves modern formats when supported.

Docs: [Image URL](https://www.sanity.io/docs/image-url).

---

## Validation (Zod)

1. Define schemas for **raw GROQ rows** (geopoint, image stub, nested objects), not for final UI types first.
2. Use **`safeParse`** per document and per nested item (e.g. skip bad photos, keep the location).
3. Log **`flatten()`** or a short message **server-side** for content QA; do not crash the page on one bad block.

---

## Mapping layer

1. **Fetch** → `unknown` / `unknown[]`.
2. **Parse** with Zod → typed raw shape.
3. **Map** → your UI model (slugs, `longitude`/`latitude`, display strings for years, image `src` URLs).

Keeps React/Astro components free of Sanity field names (`slug.current`, `lng`, etc.).

---

## Data flow (this repo)

```text
Page (SSR) → repository → getSanityClient().fetch(GROQ)
 → mapSanityLocationToRecord (Zod + image URLs)
         → LocationRecord[] / single record → components
```

Files: `apps/web/src/lib/sanity/*`, `sanity-location-repository.ts`, `locations.ts` (types only).

---

## Porting checklist

1. Create Sanity project + dataset; note **project ID** and **dataset** name.
2. Decide **public vs private** dataset → token + `useCdn` strategy.
3. Add env vars to host (and `.env.example`); never commit secrets.
4. Install `@sanity/client` + `@sanity/image-url` (+ Zod if used).
5. Write **one GROQ projection** matching your schema; list + by-slug queries.
6. Implement **client singleton** (or per-request in serverless if you prefer no global cache).
7. **Validate** → **map** → render.
8. After changing Astro env schema, run **`astro sync`** so `astro:env` types regenerate.
9. In CI/production, fail deploy if required env vars are missing.

---

## Further reading

- [Sanity: GROQ](https://www.sanity.io/docs/groq)
- [Sanity: JS client](https://www.sanity.io/docs/js-client)
- [Sanity: Image URLs](https://www.sanity.io/docs/image-url)
- [Astro: Environment variables](https://docs.astro.build/en/guides/environment-variables/)
