import type { APIRoute } from "astro";

// POST /api/cart/clear — 清空整個 mycafe_cart cookie
// 使用者可以從 /cart 頁面按「清空購物車」按鈕重置累積的項目
export const POST: APIRoute = async (ctx) => {
  ctx.cookies.set("mycafe_cart", "", {
    path: "/",
    maxAge: 0,
  });
  return ctx.redirect("/cart", 303);
};
