import type { APIRoute } from "astro";
import { getDB } from "../../../../../lib/db";

const LOCALES = ["zh-Hans", "en", "ms-MY", "id-ID"] as const;

const LIMITS = {
  name: 200,
  short_description: 500,
  description: 10000,
  story: 20000,
} as const;

// 一次儲存四種語言：欄位命名為 <field>__<locale>，例如 name__en、description__ms-MY。
// 某語言四個欄位全空 → 略過（保留原資料）；有填但名稱或描述缺一 → 整批不儲存並回報該語言。
export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) return new Response("Unauthorized", { status: 401 });
  const id = ctx.params.id;
  if (!id) return new Response("Missing id", { status: 400 });

  const form = await ctx.request.formData();
  const back = (query: string) =>
    ctx.redirect(`/admin/products/${id}?tab=translations&${query}`, 303);

  const rows: {
    locale: string;
    name: string;
    description: string;
    shortDescription: string | null;
    story: string | null;
  }[] = [];

  for (const loc of LOCALES) {
    const get = (field: keyof typeof LIMITS) =>
      String(form.get(`${field}__${loc}`) ?? "").trim();
    const name = get("name");
    const description = get("description");
    const shortDescription = get("short_description");
    const story = get("story");

    if (!name && !description && !shortDescription && !story) continue;
    if (!name || !description) return back(`error=incomplete&loc=${loc}`);
    if (
      name.length > LIMITS.name ||
      shortDescription.length > LIMITS.short_description ||
      description.length > LIMITS.description ||
      story.length > LIMITS.story
    ) {
      return back(`error=too_long&loc=${loc}`);
    }

    rows.push({
      locale: loc,
      name,
      description,
      shortDescription: shortDescription || null,
      story: story || null,
    });
  }

  if (rows.length === 0) return back("error=empty");

  const db = getDB();
  await db.batch(
    rows.map((r) =>
      db
        .prepare(
          `INSERT INTO product_translations (product_id, locale, name, description, short_description, story)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT (product_id, locale) DO UPDATE SET
             name = excluded.name,
             description = excluded.description,
             short_description = excluded.short_description,
             story = excluded.story`,
        )
        .bind(id, r.locale, r.name, r.description, r.shortDescription, r.story),
    ),
  );

  return back("saved=1");
};
