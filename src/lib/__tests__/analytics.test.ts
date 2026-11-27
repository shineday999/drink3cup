import { describe, it, expect } from "vitest";
import {
  buildTrackingSnippet,
  normalizeGaId,
  normalizeGtmId,
  pickTracking,
  shouldTrackPath,
} from "../analytics";

describe("normalizeGaId", () => {
  it("接受合法的 GA4 衡量 ID(自動去空白、轉大寫)", () => {
    expect(normalizeGaId("G-ABCD123456")).toBe("G-ABCD123456");
    expect(normalizeGaId("  g-abcd123456 ")).toBe("G-ABCD123456");
  });
  it("空值、未設定、格式錯誤都回傳 null", () => {
    for (const bad of ["", undefined, null, "UA-12345-1", "G-", "GTM-ABCDEF1"])
      expect(normalizeGaId(bad)).toBeNull();
  });
  it("拒絕可能破壞網頁的字元(防注入)", () => {
    expect(normalizeGaId('G-ABCD123456"></script><script>x')).toBeNull();
  });
});

describe("normalizeGtmId", () => {
  it("接受合法的 GTM 容器 ID", () => {
    expect(normalizeGtmId("GTM-WMBGGQ8J")).toBe("GTM-WMBGGQ8J");
    expect(normalizeGtmId(" gtm-wmbggq8j ")).toBe("GTM-WMBGGQ8J");
  });
  it("拒絕 GA4 ID、空值與注入字元", () => {
    for (const bad of [
      "",
      undefined,
      "G-ABCD123456",
      "GTM-",
      'GTM-ABCDEF1"><x',
    ])
      expect(normalizeGtmId(bad)).toBeNull();
  });
});

describe("pickTracking", () => {
  it("GTM 優先:兩個都設時只用 GTM(避免重複計算)", () => {
    expect(
      pickTracking({
        GTM_CONTAINER_ID: "GTM-WMBGGQ8J",
        GA_MEASUREMENT_ID: "G-ABCD123456",
      }),
    ).toEqual({ kind: "gtm", id: "GTM-WMBGGQ8J" });
  });
  it("只設 GA4 就用 GA4", () => {
    expect(
      pickTracking({ GTM_CONTAINER_ID: "", GA_MEASUREMENT_ID: "G-ABCD123456" }),
    ).toEqual({
      kind: "ga4",
      id: "G-ABCD123456",
    });
  });
  it("都沒設或都不合法 → null(完全不載入)", () => {
    expect(pickTracking({})).toBeNull();
    expect(
      pickTracking({ GTM_CONTAINER_ID: "x", GA_MEASUREMENT_ID: "y" }),
    ).toBeNull();
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

const PREFIXES = ["en", "ms-MY", "id-ID"];
const gtmCode = buildTrackingSnippet(
  { kind: "gtm", id: "GTM-WMBGGQ8J" },
  "zh-Hant",
  PREFIXES,
);
const gaCode = buildTrackingSnippet(
  { kind: "ga4", id: "G-ABCD123456" },
  "zh-Hant",
  PREFIXES,
);

describe("buildTrackingSnippet", () => {
  it("兩種模式產生的指令碼語法都正確", () => {
    expect(() => new Function(gtmCode)).not.toThrow();
    expect(() => new Function(gaCode)).not.toThrow();
  });
  it("帶入 ID、語言與前綴,沒有殘留佔位字串", () => {
    for (const c of [gtmCode, gaCode]) {
      expect(c).toContain('"zh-Hant"');
      expect(c).toContain('["en","ms-MY","id-ID"]');
      expect(c).not.toMatch(/__(ID|LANG|PREFIXES)__/);
    }
    expect(gtmCode).toContain("gtm.js?id=");
    expect(gtmCode).not.toContain("gtag/js");
    expect(gaCode).toContain("gtag/js?id=");
    expect(gaCode).not.toContain("gtm.js");
  });
  it("包含所有轉換事件,尊重 DNT / GPC,廣告儲存一律拒絕", () => {
    for (const ev of [
      "view_item",
      "add_to_cart",
      "begin_checkout",
      "generate_lead",
      "newsletter_subscribe",
      "quiz_complete",
    ])
      expect(gtmCode).toContain(ev);
    expect(gtmCode).toContain("doNotTrack");
    expect(gtmCode).toContain("globalPrivacyControl");
    expect(gtmCode).toContain('ad_storage: "denied"');
  });
});

// 以假的瀏覽器環境實際執行指令碼,檢查 GTM 模式推進 dataLayer 的內容
function run(
  code: string,
  url: string,
  opts: { dnt?: boolean; item?: object } = {},
) {
  const dl: unknown[] = [];
  const listeners: Record<string, Array<() => void>> = {};
  const formListeners: Array<() => void> = [];
  const appended: Array<{ src: string }> = [];
  const store: Record<string, string> = {};
  const u = new URL(url);
  const win: Record<string, unknown> = {
    dataLayer: dl,
    addEventListener: (e: string, f: () => void) =>
      (listeners[e] ||= []).push(f),
    doNotTrack: opts.dnt ? "1" : undefined,
  };
  const doc = {
    addEventListener: (e: string, f: () => void) =>
      (listeners["doc:" + e] ||= []).push(f),
    createElement: () => ({}) as { src: string },
    head: { appendChild: (el: { src: string }) => appended.push(el) },
    querySelector: () =>
      opts.item
        ? {
            getAttribute: () => JSON.stringify(opts.item),
            addEventListener: (_e: string, f: () => void) =>
              formListeners.push(f),
          }
        : null,
  };
  const fn = new Function(
    "window",
    "document",
    "navigator",
    "location",
    "sessionStorage",
    "URLSearchParams",
    "requestIdleCallback",
    "setTimeout",
    code,
  );
  fn(
    win,
    doc,
    { doNotTrack: undefined },
    { pathname: u.pathname, search: u.search },
    {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => (store[k] = v),
    },
    URLSearchParams,
    (f: () => void) => f(),
    (f: () => void) => f(),
  );
  (listeners["doc:DOMContentLoaded"] ?? []).forEach((f) => f());
  (listeners["load"] ?? []).forEach((f) => f());
  return { dl, appended, submit: () => formListeners.forEach((f) => f()) };
}
const events = (dl: unknown[]) =>
  (dl as Array<Record<string, unknown>>)
    .filter(
      (x) =>
        x && typeof x.event === "string" && !String(x.event).startsWith("gtm."),
    )
    .map((x) => x.event);

describe("GTM 模式實際執行", () => {
  const item = {
    item_id: "ethiopia",
    item_name: "耶加雪菲",
    item_category: "beans",
    price: 520,
    currency: "TWD",
    quantity: 1,
  };
  it("商品頁:推 view_item(電商格式),送出表單推 add_to_cart", () => {
    const r = run(gtmCode, "https://x.tw/products/ethiopia", { item });
    const view = (r.dl as Array<Record<string, unknown>>).find(
      (x) => x.event === "view_item",
    )!;
    expect(view.ecommerce).toEqual({
      currency: "TWD",
      value: 520,
      items: [item],
    });
    r.submit();
    expect(events(r.dl)).toEqual(["view_item", "add_to_cart"]);
  });
  it("載入 GTM 容器指令碼,並先推入 site_language", () => {
    const r = run(gtmCode, "https://x.tw/");
    expect(r.appended[0]?.src).toBe(
      "https://www.googletagmanager.com/gtm.js?id=GTM-WMBGGQ8J",
    );
    expect(
      (r.dl as Array<Record<string, unknown>>).some(
        (x) => x.site_language === "zh-Hant",
      ),
    ).toBe(true);
  });
  it("轉換頁面推對應事件;英文版網址前綴會被忽略", () => {
    expect(events(run(gtmCode, "https://x.tw/checkout").dl)).toEqual([
      "begin_checkout",
    ]);
    expect(
      events(run(gtmCode, "https://x.tw/checkout/success?id=1").dl),
    ).toEqual(["generate_lead"]);
    expect(
      events(run(gtmCode, "https://x.tw/en/checkout/success?id=1").dl),
    ).toEqual(["generate_lead"]);
    expect(events(run(gtmCode, "https://x.tw/contact?ok=1").dl)).toEqual([
      "generate_lead",
    ]);
    expect(events(run(gtmCode, "https://x.tw/?subscribed=1").dl)).toEqual([
      "newsletter_subscribe",
    ]);
    expect(
      events(run(gtmCode, "https://x.tw/quiz/result?type=brewing").dl),
    ).toEqual(["quiz_complete"]);
    expect(events(run(gtmCode, "https://x.tw/faq").dl)).toEqual([]);
  });
  it("開啟 DNT 時完全不推任何資料、不載入任何東西", () => {
    const r = run(gtmCode, "https://x.tw/checkout/success?id=1", { dnt: true });
    expect(r.dl).toEqual([]);
    expect(r.appended).toEqual([]);
  });
});
