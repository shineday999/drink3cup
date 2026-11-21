// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// Phase 1: SSR (output: 'server') + @astrojs/cloudflare adapter
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: "cloudflare",
  }),
  integrations: [react(), tailwind({ applyBaseStyles: true })],
  server: {
    port: 4321,
    host: true,
  },
  vite: {
    optimizeDeps: { exclude: ["hono"] },
    ssr: { external: ["hono"] },
  },
});
