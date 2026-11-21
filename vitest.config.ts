import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/__tests__/**/*.test.ts", "src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "@components": new URL("./src/components", import.meta.url).pathname,
      "@layouts": new URL("./src/layouts", import.meta.url).pathname,
      "@i18n": new URL("./src/i18n", import.meta.url).pathname,
      "@lib": new URL("./src/lib", import.meta.url).pathname,
    },
  },
});
