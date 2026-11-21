import type { APIRoute } from "astro";
import { getDB } from "../../../../../lib/db";

const ALLOWED = ["approved", "rejected"] as const;

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) {
    return new Response("Unauthorized", { status: 401 });
  }
  const id = ctx.params.id;
  if (!id) return new Response("Missing id", { status: 400 });

  const form = await ctx.request.formData();
  const action = String(form.get("action") ?? "");
  if (!ALLOWED.includes(action as never)) {
    return new Response("Invalid action", { status: 400 });
  }

  const db = getDB();
  await db
    .prepare("UPDATE reviews SET status = ? WHERE id = ?")
    .bind(action, id)
    .run();

  return ctx.redirect(`/admin/reviews`, 303);
};
