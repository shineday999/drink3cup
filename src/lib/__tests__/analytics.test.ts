import { describe, it, expect } from "vitest";
import { buildGaSnippet, normalizeGaId, shouldTrackPath } from "../analytics";

describe("normalizeGaId", () => {
  it("接受合法的 GA4 衡量 ID(自動去空白、轉大寫)", () => {
    expect(normalizeGaId("G-ABCD123456")).toBe("G-ABCD123456");
    expect(normalizeGaId("  g-abcd123456 ")).toBe("G-ABCD123456");
  });
  it("空值、未設定、格式錯誤都回傳 null(不載入 GA)", () => {
    expect(normalizeGaId("")).toBeNull();
    expect(normalizeGaId(undefined)).toBeNull();
    expect(normalizeGaId(null)).toBeNull();
    expect(normalizeGaId("UA-12345-1")).toBeNull();
    expect(normalizeGaId("G-")).toBeNull();
  });
  it("拒絕可能破壞網頁的字元(防注入)", () => {
    expect(normalizeGaId('G-ABCD123456"></script><script>x')).toBeNull();
    expect(normalizeGaId("G-ABCD123456\n")).toBe("G-ABCD123456");
  });
});

describe("shouldTrackPath", () => {
  it("後台與 API 不追蹤,前台追蹤", () => {
    expect(shouldTrackPath("/admin")).toBe(false);
    expect(shouldTrackPath("/admin/orders/1")).toBe(false);
    expect(shouldTrackPath("/api/orders/create")).toBe(false);
    expect(shouldTrackPath("/")).toBe(true);
    expect(shouldTrackPath("/products/ethiopia")).toBe(true);
    expect(shouldTrackPath("/administrator-guide")).toBe(true);
  });
});

describe("buildGaSnippet", () => {
  const code = buildGaSnippet("G-ABCD123456", "zh-Hant", [
    "en",
    "ms-MY",
    "id-ID",
  ]);
  it("產生的指令碼語法正確(可被 JavaScript 編譯)", () => {
    expect(() => new Function(code)).not.toThrow();
  });
  it("帶入衡量 ID、語言與語言前綴,沒有殘留的佔位字串", () => {
    expect(code).toContain('"G-ABCD123456"');
    expect(code).toContain('"zh-Hant"');
    expect(code).toContain('["en","ms-MY","id-ID"]');
    expect(code).not.toMatch(/__(GA_ID|LANG|PREFIXES)__/);
  });
  it("包含所有轉換事件,且尊重 DNT / GPC", () => {
    for (const ev of [
      "view_item",
      "add_to_cart",
      "begin_checkout",
      "generate_lead",
      "newsletter_subscribe",
      "quiz_complete",
    ])
      expect(code).toContain(ev);
    expect(code).toContain("doNotTrack");
    expect(code).toContain("globalPrivacyControl");
  });
  it("廣告相關儲存一律拒絕", () => {
    expect(code).toContain('ad_storage: "denied"');
  });
});
