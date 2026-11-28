import type { APIRoute } from "astro";
import { getDB } from "../../../../lib/db";

const ALLOWED = ["new", "done"] as const;

// 後台:切換留言的處理狀態。登入驗證與同源檢查由 middleware 統一處理。
export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) {
    return new Response("Unauthorized", { status: 401 });
  }
  const id = ctx.params.id;
  if (!id) return new Response("Missing id", { status: 400 });

  const form = await ctx.request.formData();
  const status = String(form.get("status") ?? "");
  if (!ALLOWED.includes(status as never)) {
    return new Response("Invalid status", { status: 400 });
  }

  await getDB()
    .prepare("UPDATE inquiries SET status = ? WHERE id = ?")
    .bind(status, id)
    .run();

  return ctx.redirect("/admin/inquiries", 303);
};
