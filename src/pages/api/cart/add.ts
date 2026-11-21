import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { readCart, writeCart, addToCart } from "../../../lib/cart";

export const POST: APIRoute = async (ctx) => {
  const form = await ctx.request.formData();
  const slug = String(form.get("slug") ?? "");
  const sku = String(form.get("sku") ?? "");
  // qty 預設 1,parse int,min 1,拒絕 0 / 負數 / NaN
  const qtyRaw = String(form.get("qty") ?? "1");
  const qtyParsed = parseInt(qtyRaw, 10);
  const qty = Number.isFinite(qtyParsed) && qtyParsed >= 1 ? qtyParsed : 1;

  if (!slug) return new Response("Missing slug", { status: 400 });
  if (!sku)
    return new Response("Missing sku — please select an option", {
      status: 400,
    });
  // Stock validation:從 product_variants 查 sku 對應庫存,
  // 累加 cart 現有 qty 後不得超過 stock(超庫存 → 400)。
  if (env?.DB) {
    const variant = await env.DB.prepare(
      "SELECT stock FROM product_variants WHERE sku = ?",
    )
      .bind(sku)
      .first<{ stock: number }>();
    if (!variant) {
      return new Response("Invalid sku", { status: 400 });
    }
    const cookieHeader = ctx.request.headers.get("cookie");
    const items = readCart(cookieHeader);
    const existingQty =
      items.find((i) => i.slug === slug && i.sku === sku)?.qty ?? 0;
    if (existingQty + qty > variant.stock) {
      return new Response(
        `Only ${variant.stock} in stock (you already have ${existingQty} in cart).`,
        { status: 400 },
      );
    }
  }

  const cookieHeader = ctx.request.headers.get("cookie");
  const items = readCart(cookieHeader);
  const next = addToCart(items, { slug, sku, qty, addedAt: Date.now() });

  ctx.cookies.set("mycafe_cart", writeCart(next), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    httpOnly: true,
  });

  // next:只接受站內相對路徑,避免 open redirect;預設導向購物車
  const nextRaw = String(form.get("next") ?? "");
  const safeNext = /^\/(?!\/)[^\s\\]*$/.test(nextRaw) ? nextRaw : "/cart";
  return ctx.redirect(safeNext, 303);
};
