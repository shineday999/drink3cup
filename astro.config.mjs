// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// Phase 1: SSR (output: 'server') + @astrojs/cloudflare adapter
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: "cloudflare",
  }),
  integrations: [react()],
  server: {
    port: 4321,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: { exclude: ["hono"] },
    ssr: { external: ["hono"] },
  },
});
