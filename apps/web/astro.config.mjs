// @ts-check
import tailwindcss from "@tailwindcss/vite";
import alchemy from "alchemy/cloudflare/astro";
import { defineConfig, envField } from "astro/config";
import { visualizer } from "rollup-plugin-visualizer";

import react from "@astrojs/react";

const wranglerConfigPath = "./wrangler.toml";

/** Pre-bundle SSR deps in one pass — avoids deps_ssr / react-dom/server split (Astro 6 + Cloudflare). */
const SERVER_OPTIMIZE_DEPS = [
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom",
  "react-dom/server",
  "framer-motion",
  // Discovered lazily on first homepage SSR after Sanity env imports; late reload breaks React hooks.
  "astro/env/runtime",
];

const SERVER_OPTIMIZE_ENTRIES = [
  "./src/pages/index.astro",
  "./src/lib/sanity-location-repository.ts",
];

function optimizeServerDeps() {
  return {
    name: "optimize-server-deps",
    configEnvironment(name) {
      if (name === "client") {
        return {
          optimizeDeps: {
            include: SERVER_OPTIMIZE_DEPS,
          },
        };
      }
      return {
        optimizeDeps: {
          include: SERVER_OPTIMIZE_DEPS,
          entries: SERVER_OPTIMIZE_ENTRIES,
          holdUntilCrawlEnd: true,
        },
      };
    },
  };
}

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: alchemy({
    configPath: wranglerConfigPath,
    prerenderEnvironment: "node",
  }),

  env: {
    schema: {
      PUBLIC_SERVER_URL: envField.string({
        access: "public",
        context: "client",
        default: "http://localhost:3000",
      }),
      PUBLIC_SANITY_PROJECT_ID: envField.string({
        access: "public",
        context: "server",
      }),
      PUBLIC_SANITY_DATASET: envField.string({
        access: "public",
        context: "server",
      }),
      SANITY_API_READ_TOKEN: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),
    },
  },

  vite: {
    plugins: [
      optimizeServerDeps(),
      tailwindcss(),
      visualizer({
        open: false,
        filename: "stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    optimizeDeps: {
      include: SERVER_OPTIMIZE_DEPS,
      entries: SERVER_OPTIMIZE_ENTRIES,
    },
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    // Avoid two React copies in SSR — invalid hook / null dispatcher (see docs/astro-vite-ssr-duplicate-react-invalid-hooks.md).
    ssr: {
      noExternal: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "framer-motion",
      ],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("maplibre-gl")) return "maplibre";
            if (id.includes("@sanity/")) return "sanity-vendor";
          },
        },
      },
    },
  },

  integrations: [react()],
});
