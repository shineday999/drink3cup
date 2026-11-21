import { beforeEach, describe, expect, it } from "vitest";
import { ProductCreateSchema, VariantInputSchema } from "../../schemas/product";
import {
  RepoError,
  createProduct,
  deleteProduct,
  deleteVariant,
  derivePriceBase,
  getProduct,
  isSlugTaken,
  listProducts,
  setProductStatus,
  setVariantPrices,
  updateProduct,
  upsertVariant,
} from "../products";
import { createTestDb } from "./_d1";

const db = (await createTestDb()) as unknown as D1Database | null;

function sample(over: Record<string, unknown> = {}) {
  return ProductCreateSchema.parse({
    category: "jewelry",
    subcategory: "pendant",
    slug: "test-pendant",
    tags: ["calm", "gift"],
    translations: [
      { locale: "zh-Hans", name: "测试吊坠", description: "描述" },
      { locale: "en", name: "Test Pendant", description: "Desc" },
    ],
    variants: [
      {
        sku: "T-S",
        stock: 5,
        image_urls: ["/a.jpg"],
        prices: { USD: 12800, CNY: 92000 },
      },
      { sku: "T-M", stock: 3, prices: { USD: 18800 } },
    ],
    ...over,
  });
}

const mkVariant = (o: Record<string, unknown>) => VariantInputSchema.parse(o);

async function count(table: string): Promise<number> {
  const r = await db!
    .prepare(`SELECT COUNT(*) AS n FROM ${table}`)
    .first<{ n: number }>();
  return r?.n ?? 0;
}

async function resetAll() {
  for (const t of [
    "reviews",
    "product_prices",
    "product_variants",
    "product_translations",
    "products",
  ]) {
    await db!.prepare(`DELETE FROM ${t}`).run();
  }
}

describe("derivePriceBase", () => {
  it("優先用 CNY，換成元", () => {
    expect(derivePriceBase({ CNY: 92000, USD: 12800 })).toBe("920.00");
  });
  it("沒有 CNY 就用第一個幣別", () => {
    expect(derivePriceBase({ MYR: 59000 })).toBe("590.00");
  });
  it("沒有價格回 0.00", () => {
    expect(derivePriceBase({})).toBe("0.00");
  });
});

describe.skipIf(!db)("products repository", () => {
  beforeEach(async () => {
    await resetAll();
  });

  it("createProduct 一次寫入商品、翻譯、變體、價格", async () => {
    const id = await createProduct(db!, sample());
    expect(await count("products")).toBe(1);
    expect(await count("product_translations")).toBe(2);
    expect(await count("product_variants")).toBe(2);
    expect(await count("product_prices")).toBe(3);

    const p = await getProduct(db!, id);
    expect(p?.slug).toBe("test-pendant");
    expect(p?.status).toBe("draft");
    expect(p?.tags).toEqual(["calm", "gift"]);
    expect(p?.image_url).toBe("/a.jpg"); // 沒指定封面 → 取第一個變體第一張圖
    expect(p?.variants.map((v) => v.sku)).toEqual(["T-M", "T-S"]);
    const s = p?.variants.find((v) => v.sku === "T-S");
    expect(s?.prices).toEqual({ USD: 12800, CNY: 92000 });
    expect(s?.image_urls).toEqual(["/a.jpg"]);
  });

  it("price_base 依價格寫入（6.5 移除欄位前仍需要）", async () => {
    const id = await createProduct(db!, sample());
    const row = await db!
      .prepare(
        "SELECT price_base FROM product_variants WHERE sku = 'T-S' AND product_id = ?",
      )
      .bind(id)
      .first<{ price_base: string }>();
    expect(row?.price_base).toBe("920.00");
  });

  it("slug 重複 → slug_taken", async () => {
    await createProduct(db!, sample());
    await expect(
      createProduct(db!, sample({ variants: [{ sku: "OTHER" }] })),
    ).rejects.toMatchObject({
      code: "slug_taken",
    });
    expect(await isSlugTaken(db!, "test-pendant")).toBe(true);
    expect(await isSlugTaken(db!, "nope")).toBe(false);
  });

  it("SKU 重複 → sku_taken，且整筆 batch 回滾（不留下半套資料）", async () => {
    await createProduct(db!, sample());
    await expect(
      createProduct(
        db!,
        sample({ slug: "another", variants: [{ sku: "T-S" }] }),
      ),
    ).rejects.toMatchObject({ code: "sku_taken" });
    expect(await count("products")).toBe(1);
    expect(await count("product_translations")).toBe(2);
  });

  it("同一輸入內 SKU 重複也會回滾", async () => {
    await expect(
      createProduct(db!, sample({ variants: [{ sku: "X" }, { sku: "X" }] })),
    ).rejects.toMatchObject({ code: "sku_taken" });
    expect(await count("products")).toBe(0);
  });

  it("getProduct 找不到回 null", async () => {
    expect(await getProduct(db!, "nope")).toBeNull();
  });

  it("listProducts：分頁、狀態與分類篩選", async () => {
    for (let i = 1; i <= 5; i++) {
      await createProduct(
        db!,
        sample({
          slug: `item-${i}`,
          category: i <= 3 ? "jewelry" : "incense",
          status: i === 1 ? "active" : "draft",
          variants: [{ sku: `SKU-${i}` }],
          translations: [
            { locale: "zh-Hans", name: `商品${i}`, description: "d" },
          ],
        }),
      );
    }
    const all = await listProducts(db!, { pageSize: 2 });
    expect(all.total).toBe(5);
    expect(all.items.length).toBe(2);
    expect(
      (await listProducts(db!, { pageSize: 2, page: 3 })).items.length,
    ).toBe(1);
    expect((await listProducts(db!, { status: "active" })).total).toBe(1);
    expect((await listProducts(db!, { category: "incense" })).total).toBe(2);
    expect((await listProducts(db!, { pageSize: 999 })).pageSize).toBe(100);
    expect((await listProducts(db!, { page: -3 })).page).toBe(1);
    const first = (await listProducts(db!, { category: "incense" })).items[0];
    expect(first?.variant_count).toBe(1);
    expect(first?.name?.startsWith("商品")).toBe(true);
  });

  it("listProducts：搜尋比對 slug 與翻譯名稱，並正確處理 % 與 _", async () => {
    await createProduct(
      db!,
      sample({ slug: "amber-ring", variants: [{ sku: "A1" }] }),
    );
    await createProduct(
      db!,
      sample({
        slug: "plain-item",
        variants: [{ sku: "A2" }],
        translations: [
          { locale: "zh-Hans", name: "100% 纯银", description: "d" },
        ],
      }),
    );
    expect((await listProducts(db!, { q: "amber" })).total).toBe(1);
    expect((await listProducts(db!, { q: "纯银" })).total).toBe(1);
    expect((await listProducts(db!, { q: "%" })).total).toBe(1); // 只比對字面的 %
    expect((await listProducts(db!, { q: "_" })).total).toBe(0); // _ 不是萬用字元
    expect((await listProducts(db!, { q: "不存在" })).total).toBe(0);
  });

  it("updateProduct：只改有帶的欄位，translations 整組取代", async () => {
    const id = await createProduct(db!, sample());
    await updateProduct(db!, id, {
      status: "active",
      subcategory: null,
      translations: [
        {
          locale: "zh-Hans",
          name: "新名称",
          description: "新描述",
          short_description: null,
          story: null,
          meta_title: null,
          meta_description: null,
        },
      ],
    });
    const p = await getProduct(db!, id);
    expect(p?.status).toBe("active");
    expect(p?.subcategory).toBeNull();
    expect(p?.category).toBe("jewelry"); // 沒帶 → 不變
    expect(p?.tags).toEqual(["calm", "gift"]);
    expect(p?.translations.map((t) => t.locale)).toEqual(["zh-Hans"]);
    expect(p?.translations[0]?.name).toBe("新名称");
  });

  it("updateProduct：slug 可以維持自己的，不能撞別人的", async () => {
    const a = await createProduct(
      db!,
      sample({ slug: "aaa", variants: [{ sku: "SA" }] }),
    );
    await createProduct(
      db!,
      sample({ slug: "bbb", variants: [{ sku: "SB" }] }),
    );
    await updateProduct(db!, a, { slug: "aaa", tags: ["x"] });
    await expect(updateProduct(db!, a, { slug: "bbb" })).rejects.toMatchObject({
      code: "slug_taken",
    });
    await expect(
      updateProduct(db!, "nope", { status: "active" }),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("setProductStatus", async () => {
    const id = await createProduct(db!, sample());
    await setProductStatus(db!, id, "archived");
    expect((await getProduct(db!, id))?.status).toBe("archived");
  });

  it("deleteProduct 連帶刪除翻譯、變體、價格、評論", async () => {
    const id = await createProduct(db!, sample());
    await db!
      .prepare(
        "INSERT INTO reviews (id, product_id, customer_name, rating, content, created_at) VALUES ('r1', ?, 'n', 5, 'c', 1)",
      )
      .bind(id)
      .run();
    expect(await deleteProduct(db!, id)).toBe(true);
    for (const t of [
      "products",
      "product_translations",
      "product_variants",
      "product_prices",
      "reviews",
    ]) {
      expect(await count(t)).toBe(0);
    }
    expect(await deleteProduct(db!, id)).toBe(false);
  });

  it("upsertVariant：新增、更新（價格整組取代）、不能動別的商品的變體", async () => {
    const id = await createProduct(db!, sample());
    const other = await createProduct(
      db!,
      sample({ slug: "other", variants: [{ sku: "O1" }] }),
    );

    const newId = await upsertVariant(
      db!,
      id,
      mkVariant({
        sku: "T-L",
        stock: 1,
        attributes: { size: "L" },
        image_urls: [],
        prices: { USD: 25000 },
      }),
    );
    let p = await getProduct(db!, id);
    expect(p?.variants.length).toBe(3);

    await upsertVariant(
      db!,
      id,
      mkVariant({
        id: newId,
        sku: "T-L",
        stock: 9,
        attributes: { size: "L" },
        image_urls: [],
        prices: { CNY: 180000 },
        weight_grams: 20,
      }),
    );
    p = await getProduct(db!, id);
    const l = p?.variants.find((v) => v.id === newId);
    expect(l?.stock).toBe(9);
    expect(l?.weight_grams).toBe(20);
    expect(l?.prices).toEqual({ CNY: 180000 }); // USD 被取代掉

    await expect(
      upsertVariant(
        db!,
        other,
        mkVariant({
          id: newId,
          sku: "HACK",
          stock: 0,
          attributes: {},
          image_urls: [],
          prices: {},
        }),
      ),
    ).rejects.toMatchObject({ code: "not_found" });
    await expect(
      upsertVariant(
        db!,
        id,
        mkVariant({
          sku: "T-S",
          stock: 0,
          attributes: {},
          image_urls: [],
          prices: {},
        }),
      ),
    ).rejects.toMatchObject({ code: "sku_taken" });
  });

  it("setVariantPrices 整組取代並同步 price_base", async () => {
    const id = await createProduct(db!, sample());
    const v = (await getProduct(db!, id))!.variants[0]!;
    await setVariantPrices(db!, id, v.id, { MYR: 5000, CNY: 1000 });
    const after = (await getProduct(db!, id))!.variants.find(
      (x) => x.id === v.id,
    )!;
    expect(after.prices).toEqual({ MYR: 5000, CNY: 1000 });
    const row = await db!
      .prepare("SELECT price_base FROM product_variants WHERE id = ?")
      .bind(v.id)
      .first<{ price_base: string }>();
    expect(row?.price_base).toBe("10.00");
  });

  it("deleteVariant：可刪，但不能刪掉最後一個", async () => {
    const id = await createProduct(db!, sample());
    const vs = (await getProduct(db!, id))!.variants;
    await deleteVariant(db!, id, vs[0]!.id);
    expect(await count("product_prices")).toBe(2); // T-M 的 1 筆價格一併刪除，剩 T-S 的 2 筆
    await expect(deleteVariant(db!, id, vs[1]!.id)).rejects.toMatchObject({
      code: "last_variant",
    });
    await expect(deleteVariant(db!, id, "nope")).rejects.toMatchObject({
      code: "not_found",
    });
    expect(RepoError.name).toBe("RepoError");
  });
});
