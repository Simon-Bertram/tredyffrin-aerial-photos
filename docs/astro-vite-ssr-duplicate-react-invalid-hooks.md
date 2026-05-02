# Astro + Vite SSR: duplicate React and “Invalid hook call”

This note records a **production-style dev failure** seen with this stack: **Astro 6**, **React 19**, **`@astrojs/react`**, **Vite SSR prebundling** (`deps_ssr`), and the **Cloudflare** adapter (Alchemy). The same class of bug can appear in other SSR setups when **more than one physical copy of `react`** participates in a single server render.

## Symptoms

In the terminal running `astro dev` (often right after Vite logs **optimized dependencies changed. reloading**), you may see:

- **`Invalid hook call`** — React’s usual message about mismatching React/renderer versions, duplicate React, or broken Rules of Hooks.
- **`TypeError: Cannot read properties of null (reading 'useState')`** (or **`useContext`**) — the dispatcher React expects during `react-dom/server` rendering is wrong or unset because hooks are bound to a **different** React instance than the one `react-dom/server` is using.
- Stack frames that mix **`node_modules/.vite/deps_ssr/chunk-*.js`** (prebundled hooks) with **`react-dom_server.js`** — a strong hint that SSR dependency optimization split the graph incorrectly.

In this project, **`TredyffrinMap`** failed first on `useState`; **`framer-motion`** inside the selected-photos carousel could fail in the same pass with **`useContext`** errors. That does not mean Motion is the root cause—it often means SSR **never reached a stable single-React world** for the whole page.

## Root cause (short)

Vite’s **SSR dependency prebundling** can end up with **two resolutions of `react`** (and peers): one path for code pulled through `deps_ssr` chunks and another for `react-dom/server`. Hooks run against one copy while the server renderer expects the other → **invalid hook call** / **null dispatcher**.

Client-side **`resolve.dedupe: ["react", "react-dom"]`** helps the browser bundle but **does not** fully solve that SSR-specific split.

## Fix (this repo)

In **`apps/web/astro.config.mjs`**, under `vite`:

1. **`resolve.dedupe`** — `["react", "react-dom"]`.
2. **`resolve.alias`** — pin **`react`** to **`path.resolve(__dirname, "node_modules/react")`** (Bun symlink + `deps_ssr` can still split hooks without this). **Do not** alias **`react-dom`** to the package root on **Cloudflare SSR**: that resolves Node’s `server.js` (`util`, `crypto`, …) and breaks the worker build; let Vite keep prebundling the worker-safe server entry.
3. **`ssr.noExternal`** — include **`react`**, **`react-dom`**, **`react/jsx-runtime`**, **`react/jsx-dev-runtime`**, and **`framer-motion`** so JSX and Motion stay on the same React instance as the renderer.

Do **not** add **`scheduler`** to **`ssr.optimizeDeps.include`** unless it resolves from the app root: with **Bun**, dev may log **`Failed to resolve dependency: scheduler`** and the graph can stay broken.

After changing this, **restart dev**, optionally delete **`apps/web/node_modules/.vite`**, let Vite re-optimize, then load the homepage (map + carousel).

## How to confirm the fix

- **Dev:** Homepage loads with **no** invalid-hook errors in the terminal.
- **Optional:** A full **`bun run build`** (from `apps/web`) should complete; SSR paths exercise the same graph.

## Related reading

- [Astro: Adding dependencies to Astro in a monorepo](https://docs.astro.build/en/guides/troubleshooting/#adding-dependencies-to-astro-in-a-monorepo) — suggests `vite.ssr.noExternal` when packages resolve oddly in monorepos.
- [React: Invalid hook call](https://react.dev/link/invalid-hook-call) — official causes (duplicate React is one of them).
- [Vite: SSR options](https://vite.dev/config/ssr-options.html) — `ssr.noExternal` / `ssr.external` behavior.

## History

- **2026-05:** Observed during `bun run dev` with Turbo + Alchemy + Astro; fixed by expanding `ssr.noExternal` (incl. JSX runtimes), **`react`-only** `resolve.alias`, and avoiding broken `scheduler` / `optimizeDeps` entries. Importing **`react`** in **`index.astro`** frontmatter for debugging was removed—it can add another resolution path during SSR.
