import type { APIRoute } from "astro";
import { getDB } from "../../../../../lib/db";

const ALLOWED_STATUS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
const ALLOWED_PAYMENT = ["unpaid", "paid", "refunded"] as const;

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) {
    return new Response("Unauthorized", { status: 401 });
  }
  // F-14: id 必須 alphanumeric + _ -,避免 path injection / SQL injection 攻擊
  const id = ctx.params.id;
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return new Response("Invalid id", { status: 400 });
  }

  const form = await ctx.request.formData();
  const status = String(form.get("status") ?? "");
  const submittedPay = String(form.get("payment_status") ?? "");
  const trackingNumber = String(form.get("tracking_number") ?? "") || null;
  const notes = String(form.get("notes") ?? "") || null;

  if (!ALLOWED_STATUS.includes(status as never)) {
    return new Response("Invalid status", { status: 400 });
  }

  // Status→payment cascade:admin 沒明確選 payment_status 時,從 status 推預設。
  // admin 明確選的 payment_status 永遠贏過 cascade (per user 確認可手動覆蓋)。
  const PAYMENT_CASCADE = {
    pending: "unpaid",
    confirmed: "paid",
    shipped: "paid",
    delivered: "paid",
    cancelled: "refunded",
  } as const;
  const paymentStatus = ALLOWED_PAYMENT.includes(submittedPay as never)
    ? submittedPay
    : (PAYMENT_CASCADE[status as keyof typeof PAYMENT_CASCADE] ?? "unpaid");

  const db = getDB();
  await db
    .prepare(
      "UPDATE orders SET status = ?, payment_status = ?, tracking_number = ?, notes = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      status,
      paymentStatus,
      trackingNumber,
      notes,
      Math.floor(Date.now() / 1000),
      id,
    )
    .run();

  return ctx.redirect(`/admin/orders/${id}`, 303);
};
