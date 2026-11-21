import { describe, it, expect } from "vitest";
import { createT } from "../../i18n/t";

describe("createT", () => {
  const messages = {
    common: { site_name: "喝三杯咖啡", loading: "載入中..." },
    home: {
      hero_title: "把森林穿戴在身上",
      welcome: "歡迎 {name}",
      count: "有 {count} 件商品",
    },
  };

  it("returns string for existing key", () => {
    const t = createT(messages);
    expect(t("common.site_name")).toBe("喝三杯咖啡");
  });

  it("returns nested key", () => {
    const t = createT(messages);
    expect(t("home.hero_title")).toBe("把森林穿戴在身上");
  });

  it("substitutes {name} placeholder", () => {
    const t = createT(messages);
    expect(t("home.welcome", { name: "小明" })).toBe("歡迎 小明");
  });

  it("substitutes {count} with number", () => {
    const t = createT(messages);
    expect(t("home.count", { count: 5 })).toBe("有 5 件商品");
  });

  it("returns raw key on missing path (loud fallback)", () => {
    const t = createT(messages);
    expect(t("home.nonexistent.key")).toBe("home.nonexistent.key");
    expect(t("totally.missing")).toBe("totally.missing");
  });

  it("leaves placeholder if param missing", () => {
    const t = createT(messages);
    expect(t("home.welcome")).toBe("歡迎 {name}");
  });
});
