/// <reference path="../.astro/types.d.ts" />

type RuntimeEnv = {
  DB: D1Database;
  PRODUCT_IMAGES: R2Bucket;
  I18N: KVNamespace;
  ASSETS: Fetcher;
};

declare namespace App {
  interface Locals {
    siteSettings?: {
      siteName: Partial<Record<string, string>>;
      theme: Partial<Record<string, string>>;
      subTheme: Partial<Record<string, string>>;
      heroSubtitle: Partial<Record<string, string>>;
    };
    locale: import("./i18n/config").Locale;
    messages: Record<string, unknown>;
    admin?: {
      email: string;
      role: "super_admin" | "editor" | "viewer";
      displayName?: string;
    };
    runtime?: {
      env: RuntimeEnv;
      ctx?: ExecutionContext;
    };
  }
}

// mycafe Cloudflare bindings — augment @cloudflare/workers-types 的 Cloudflare.Env
// (Astro v6+ env 從 "cloudflare:workers" 拿,type 推為 Cloudflare.Env,所以要 merge 到該 namespace)
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    PRODUCT_IMAGES: R2Bucket;
    I18N: KVNamespace;
    SESSION: KVNamespace;
    EMAIL_FROM: string;
    EMAIL_REPLY_TO: string;
    SESSION_SECRET?: string;
    /** Google Analytics 4 衡量 ID(G-XXXXXXXXXX);空字串 = 關閉 */
    GA_MEASUREMENT_ID?: string;
  }
}
