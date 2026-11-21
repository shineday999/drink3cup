// 後台產品資料契約（zod）
// 後台 API、repository、表單共用。修改請開 PR 並在 docs/ADMIN-PRODUCTS-PLAN.md 更新紀錄註明。
import { z } from "zod";

export const LOCALES = ["zh-Hans", "en", "ms-MY", "id-ID"] as const;
export const CURRENCIES = [
  "USD",
  "CNY",
  "MYR",
  "IDR",
  "AED",
  "SAR",
  "TWD",
] as const;
export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;

export const LocaleSchema = z.enum(LOCALES);
export const ProductStatusSchema = z.enum(PRODUCT_STATUSES);

export const SlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能用小寫英數與連字號");

export const TranslationSchema = z.object({
  locale: LocaleSchema,
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1),
  short_description: z.string().trim().max(500).nullable().default(null),
  story: z.string().nullable().default(null),
  meta_title: z.string().trim().max(120).nullable().default(null),
  meta_description: z.string().trim().max(300).nullable().default(null),
});

// 幣別 → 金額（最小單位，整數）
export const PricesSchema = z
  .record(z.string(), z.number().int().nonnegative())
  .refine(
    (o) =>
      Object.keys(o).every((k) =>
        (CURRENCIES as readonly string[]).includes(k),
      ),
    "不支援的幣別",
  );

export const VariantInputSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1).max(64),
  attributes: z.record(z.string(), z.string()).default({}),
  stock: z.number().int().min(0).default(0),
  weight_grams: z.number().int().min(0).nullable().default(null),
  image_urls: z.array(z.string()).default([]),
  prices: PricesSchema.default({}),
});

// faq 格式與 api/admin/faqs.ts 一致：{ locale: [{ q, a }] }
export const FaqSchema = z.record(
  z.string(),
  z.array(z.object({ q: z.string(), a: z.string() })),
);

export const TranslationsSchema = z
  .array(TranslationSchema)
  .min(1)
  .refine(
    (ts) => ts.some((t) => t.locale === "zh-Hans"),
    "必須包含 zh-Hans 翻譯",
  )
  .refine(
    (ts) => new Set(ts.map((t) => t.locale)).size === ts.length,
    "同一語言不可重複",
  );

// 各欄位（不含 default），建立與更新共用
const fields = {
  category: z.string().trim().min(1).max(50),
  subcategory: z.string().trim().max(50).nullable(),
  slug: SlugSchema,
  status: ProductStatusSchema,
  tags: z.array(z.string().trim().min(1)),
  image_url: z.string().nullable(),
  faq: FaqSchema,
  translations: TranslationsSchema,
  variants: z.array(VariantInputSchema).min(1),
};

export const ProductCreateSchema = z.object({
  ...fields,
  subcategory: fields.subcategory.default(null),
  status: fields.status.default("draft"),
  tags: fields.tags.default([]),
  image_url: fields.image_url.default(null),
  faq: fields.faq.default({}),
});

// 更新：所有欄位皆選填，且不套用 default（沒帶的欄位維持原值）
export const ProductUpdateSchema = z.object(fields).partial();

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type VariantInput = z.infer<typeof VariantInputSchema>;
export type TranslationInput = z.infer<typeof TranslationSchema>;

// tags 與 quiz.ts 的 scoreProducts 使用相同的分隔規則
export const tagsToDb = (tags: string[]): string => tags.join(",");
export const tagsFromDb = (s: string | null | undefined): string[] =>
  (s ?? "").split(/[,;\s]+/).filter(Boolean);
