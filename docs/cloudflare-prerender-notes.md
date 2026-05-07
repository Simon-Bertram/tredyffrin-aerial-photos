# Cloudflare prerender notes

## Symptom

- Deploy completed, but `/` returned Cloudflare `404: Not Found`.
- Build logs intermittently showed `MiniflareCoreError [ERR_DISPOSED]: Cannot use disposed instance` during static prerender.

## Validated working setup

- `astro`: `6.3.0`
- `@astrojs/cloudflare`: `13.5.0`
- Resolved transitive `@cloudflare/vite-plugin`: `1.32.3` (from `bun.lock`)
- Cloudflare adapter fallback enabled in `apps/web/astro.config.mjs`:
  - `prerenderEnvironment: "node"`

## Resolution used

1. Keep homepage in worker-rendered mode (no `export const prerender = true` in `index.astro`).
2. Configure Astro Cloudflare adapter with `prerenderEnvironment: "node"` to avoid the workerd/miniflare prerender runtime path.
3. Rebuild and deploy.
4. Verify `workers.dev` root returns HTTP `200`.

## Required pre-deploy check

- Run `bun run predeploy:prerender-check` before live deploy whenever prerender behavior or routing changes.
- The command verifies:
  - build success with no known prerender crash signatures,
  - expected `dist` worker/client artifacts,
  - local wrangler preview route health for `/`, `/about`, and a discovered `/locations/*` page.
- Use `bun run deploy:safe` to run checks and deploy in one command.

## Notes

- A temporary override attempt for `@cloudflare/vite-plugin` was not kept.
- If a future adapter/plugin release removes the need for this fallback, test by removing `prerenderEnvironment: "node"` and re-running `bun run build` + `bun run deploy`.
