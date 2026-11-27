// Google Analytics 4 設定。
// 衡量 ID(G-XXXXXXXXXX)不是機密,本來就會出現在網頁原始碼裡,放在 wrangler.jsonc 的 vars 即可。
// 留空或格式不符 → 完全不載入任何分析程式碼。

const GA4_ID = /^G-[A-Z0-9]{6,12}$/;

/** 回傳合法的 GA4 衡量 ID;不合法(含空字串)回傳 null */
export function normalizeGaId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim().toUpperCase();
  return GA4_ID.test(id) ? id : null;
}

/** 這個網址要不要追蹤:後台與 API 一律不追蹤 */
export function shouldTrackPath(pathname: string): boolean {
  return !/^\/(admin|api)(\/|$)/.test(pathname);
}

/**
 * 產生要放進網頁的 GA4 指令碼(純字串)。
 * 事件:view_item、add_to_cart、begin_checkout、generate_lead(預訂/聯絡)、
 *       newsletter_subscribe、quiz_complete;頁面瀏覽由 GA4 自動記錄。
 * 參數都會用 JSON.stringify 轉成字面值;gaId 已通過格式驗證,lang/prefixes 來自固定清單。
 */
export function buildGaSnippet(
  gaId: string,
  lang: string,
  prefixes: readonly string[],
): string {
  return SNIPPET.replace(/__GA_ID__/g, JSON.stringify(gaId))
    .replace(/__LANG__/g, JSON.stringify(lang))
    .replace(/__PREFIXES__/g, JSON.stringify(prefixes));
}

const SNIPPET = `(function () {
  // 尊重瀏覽器的「不要追蹤」(DNT)與 Global Privacy Control
  if (
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1" ||
    navigator.globalPrivacyControl === true
  )
    return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  // 本站不投放廣告:廣告相關儲存一律拒絕,只允許分析用途
  gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  gtag("js", new Date());
  gtag("set", "user_properties", { site_language: __LANG__ });
  gtag("config", __GA_ID__);

  // gtag.js 等頁面載入完、瀏覽器閒置後才下載,不與首屏搶頻寬
window.addEventListener("load", function () {
  var load = function () {
    var s = document.createElement("script");
    s.async = true;
    s.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(__GA_ID__);
    document.head.appendChild(s);
  };
  if ("requestIdleCallback" in window)
    requestIdleCallback(load, { timeout: 3000 });
  else setTimeout(load, 1500);
});

// 同一個工作階段內,重新整理成功頁不重複計算轉換
  function once(key, fn) {
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch (e) {}
    fn();
  }

  var path =
    location.pathname.replace(
      new RegExp("^/(" + __PREFIXES__.join("|") + ")(?=/|$)"),
      "",
    ) || "/";
  var q = new URLSearchParams(location.search);

  document.addEventListener("DOMContentLoaded", function () {
    // 商品頁:view_item、add_to_cart(商品資料由伺服器放在 data-ga-item)
    var form = document.querySelector("[data-ga-item]");
    var item = null;
    try {
      item = form && JSON.parse(form.getAttribute("data-ga-item"));
    } catch (e) {}
    if (item) {
      gtag("event", "view_item", {
        currency: item.currency,
        value: item.price,
        items: [item],
      });
      form.addEventListener("submit", function () {
        gtag("event", "add_to_cart", {
          currency: item.currency,
          value: item.price,
          items: [item],
        });
      });
    }

    if (path === "/checkout") {
      gtag("event", "begin_checkout", { currency: "TWD" });
    }
    // 預訂制:送出訂單算「潛在客戶」轉換(尚未付款,不當成 purchase 以免灌水營收)
    if (path === "/checkout/success") {
      once("ga_lead_preorder", function () {
        gtag("event", "generate_lead", { lead_source: "preorder" });
      });
    }
    if (path === "/contact" && q.get("ok") === "1") {
      once("ga_lead_contact", function () {
        gtag("event", "generate_lead", { lead_source: "contact" });
      });
    }
    if (q.get("subscribed") === "1") {
      once("ga_newsletter", function () {
        gtag("event", "newsletter_subscribe");
      });
    }
    if (path === "/quiz/result") {
      gtag("event", "quiz_complete", {
        quiz_type: q.get("type") || "beans",
      });
    }
  });
})();`;
