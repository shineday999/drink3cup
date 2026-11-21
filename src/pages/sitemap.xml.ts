// src/pages/sitemap.xml.ts
// Wave 32 SEO: dynamic sitemap for SEO + AEO + GEO
//   - Phase 1: static pages × 4 locales (48 URLs)
//   - Wave 37: append D1 products (active) × 4 locales + blog posts (published) × 4 locales
import type { APIRoute } from "astro";
import { locales, localizedPath } from "../i18n/config";
import { getDB } from "../lib/db";

const SITE_URL = "https://mycafe.de5.net";

// Static pages included in sitemap (no /admin/*, /api/*, /checkout/*, /cart — session-gated or low-value)
const STATIC_PATHS = [
  "/",
  "/products",
  "/story",
  "/vision",
  "/craft",
  "/materials",
  "/amber",
  "/incense",
  "/blog",
  "/quiz",
  "/contact",
  "/about",
];

function tsToDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET: APIRoute = async (ctx) => {
  const today = new Date().toISOString().slice(0, 10);

  const urls: {
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
  }[] = [];

  // (A) Static pages × 4 locales
  for (const path of STATIC_PATHS) {
    for (const locale of locales) {
      const localized = localizedPath(locale, path);
      const isHome = path === "/";
      const isProductList = path === "/products";
      const isBlog = path === "/blog";
      const isAbout = path === "/about";
      // Wave 38: amber/incense 是主要 category landing,跟 /products 同 priority
      const isAmberOrIncense = path === "/amber" || path === "/incense";
      urls.push({
        loc: `${SITE_URL}${localized}`,
        lastmod: today,
        changefreq: isHome ? "weekly" : isBlog ? "weekly" : "monthly",
        priority: isHome
          ? "1.0"
          : isProductList
            ? "0.9"
            : isAbout || isAmberOrIncense
              ? "0.8"
              : "0.7",
      });
    }
  }

  // (B) Wave 37: D1 products (active) × 4 locales
  try {
    const db = getDB();
    const productsRes = await db
      .prepare(
        "SELECT slug, updated_at FROM products WHERE status = 'active' ORDER BY updated_at DESC",
      )
      .all<{ slug: string; updated_at: number }>();
    for (const p of productsRes.results) {
      const lastmod = tsToDate(p.updated_at);
      for (const locale of locales) {
        const localized = localizedPath(locale, `/products/${p.slug}`);
        urls.push({
          loc: `${SITE_URL}${localized}`,
          lastmod,
          changefreq: "monthly",
          priority: "0.8",
        });
      }
    }

    // (C) Wave 37: D1 blog posts (published) × 4 locales
    const postsRes = await db
      .prepare(
        "SELECT slug, published_at FROM posts WHERE status = 'published' AND published_at IS NOT NULL ORDER BY published_at DESC",
      )
      .all<{ slug: string; published_at: number }>();
    for (const post of postsRes.results) {
      const lastmod = tsToDate(post.published_at);
      for (const locale of locales) {
        const localized = localizedPath(locale, `/blog/${post.slug}`);
        urls.push({
          loc: `${SITE_URL}${localized}`,
          lastmod,
          changefreq: "yearly",
          priority: "0.6",
        });
      }
    }
  } catch (err) {
    // D1 unavailable: fall back to static-only (e.g., dev mode without remote binding)
    console.error("sitemap: D1 query failed, falling back to static-only", err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
