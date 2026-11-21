import type { APIRoute } from "astro";
import { clearSessionCookie } from "../../../lib/auth";

export const POST: APIRoute = async (ctx) => {
  clearSessionCookie(ctx);
  return ctx.redirect("/admin/login", 303);
};
