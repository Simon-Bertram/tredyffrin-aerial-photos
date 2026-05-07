// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import alchemy from "alchemy/cloudflare/astro";
import { defineConfig, envField } from "astro/config";
import { visualizer } from "rollup-plugin-visualizer";

import react from "@astrojs/react";

const wranglerConfigPath = "./wrangler.toml";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      tailwindcss(),
      visualizer({
        open: false,
        filename: "stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    resolve: {
      // Keep single React instance without forcing package-dir alias resolution.
      alias: {},
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
