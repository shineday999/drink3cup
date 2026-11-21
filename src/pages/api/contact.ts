import type { APIRoute } from "astro";
import { getDB, genId } from "../../lib/db";
import {
  sendEmail,
  emailEnvFromContext,
  contactNotificationEmail,
} from "../../lib/email";

export const POST: APIRoute = async (ctx) => {
  const form = await ctx.request.formData();
  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "");
  const phone = String(form.get("phone") ?? "") || null;
  const subject = String(form.get("subject") ?? "") || null;
  const message = String(form.get("message") ?? "");

  if (!name || !email || !message) {
    return new Response("Missing required fields", { status: 400 });
  }

  if (message.length > 5000) {
    return new Response("Message too long", { status: 400 });
  }
  if (!email.includes("@") || email.length > 254) {
    return new Response("Invalid email", { status: 400 });
  }

  const db = getDB();
  const id = genId("inq");
  await db
    .prepare(
      "INSERT INTO inquiries (id, name, email, phone, subject, message, locale, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      id,
      name,
      email,
      phone,
      subject,
      message,
      ctx.locals.locale,
      Math.floor(Date.now() / 1000),
    )
    .run();

  // 寄通知給管理員(若有 RESEND_API_KEY)
  const template = contactNotificationEmail(name, email, message);
  void sendEmail(emailEnvFromContext(), {
    to: "weider@0061qwen.cc.cd",
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo: email,
  }).catch((e) => console.error("[contact] admin notification failed", e));

  return ctx.redirect("/contact?ok=1", 303);
};
