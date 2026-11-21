// ESLint v9 flat config — replaces legacy .eslintrc.* (which was never present).
// husky pre-commit runs `npx lint-staged`, which runs `eslint --fix` on staged files.
// Without this config, ESLint v9 aborts with "couldn't find an eslint.config.* file".
import astro from "eslint-plugin-astro";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  // Astro files (.astro) — uses eslint-plugin-astro's recommended ruleset
  ...astro.configs["flat/recommended"],

  // TypeScript files (.ts, .tsx) — uses @typescript-eslint recommended ruleset
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },

  // TypeScript declaration files (.d.ts) — triple-slash references are normal in .d.ts
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },

  // Global ignores — build artifacts, public assets, node_modules
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "public/**",
      "worker-configuration.d.ts",
    ],
  },
];
