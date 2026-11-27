// 網站分析設定(S36)。
// 支援兩種方式,**只會啟用一種**(避免同一次瀏覽被重複計算):
//   1. Google Tag Manager(GTM):wrangler.jsonc 的 GTM_CONTAINER_ID(GTM-XXXXXXX),優先。
//      事件以 dataLayer.push 送出,GA4 設定放在 GTM 後台(見 docs/PLAN.md「S36 擁有者設定」)。
//   2. 直接使用 GA4:GA_MEASUREMENT_ID(G-XXXXXXXXXX)。
// 這些 ID 都不是機密(本來就會出現在網頁原始碼)。兩者皆留空或格式不符 = 完全不載入。

const GA4_ID = /^G-[A-Z0-9]{6,12}$/;
const GTM_ID = /^GTM-[A-Z0-9]{6,10}$/;

/** 回傳合法的 GA4 衡量 ID;不合法(含空字串)回傳 null */
export function normalizeGaId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim().toUpperCase();
  return GA4_ID.test(id) ? id : null;
}

/** 回傳合法的 GTM 容器 ID;不合法(含空字串)回傳 null */
export function normalizeGtmId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim().toUpperCase();
  return GTM_ID.test(id) ? id : null;
}

export type Tracking = { kind: "gtm" | "ga4"; id: string };

/** 依設定決定用哪一種(GTM 優先);都沒設定回傳 null */
export function pickTracking(cfg: {
  GTM_CONTAINER_ID?: unknown;
  GA_MEASUREMENT_ID?: unknown;
}): Tracking | null {
  const gtm = normalizeGtmId(cfg.GTM_CONTAINER_ID);
  if (gtm) return { kind: "gtm", id: gtm };
  const ga = normalizeGaId(cfg.GA_MEASUREMENT_ID);
  if (ga) return { kind: "ga4", id: ga };
  return null;
}

/** 這個網址要不要追蹤:後台與 API 一律不追蹤 */
export function shouldTrackPath(pathname: string): boolean {
  return !/^\/(admin|api)(\/|$)/.test(pathname);
}

/**
 * 產生要放進網頁的追蹤指令碼(純字串)。
 * 事件:view_item、add_to_cart、begin_checkout、generate_lead(預訂/聯絡)、
 *       newsletter_subscribe、quiz_complete;頁面瀏覽由 GA4 / GTM 自動記錄。
 * 參數都用 JSON.stringify 轉成字面值;id 已通過格式驗證,lang/prefixes 來自固定清單。
 */
export function buildTrackingSnippet(
  tracking: Tracking,
  lang: string,
  prefixes: readonly string[],
): string {
  const prelude = tracking.kind === "gtm" ? PRELUDE_GTM : PRELUDE_GA4;
  return (HEAD + prelude + EVENTS)
    .replace(/__ID__/g, JSON.stringify(tracking.id))
    .replace(/__LANG__/g, JSON.stringify(lang))
    .replace(/__PREFIXES__/g, JSON.stringify(prefixes));
}

const HEAD = `(function () {
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

  // 頁面載入完、瀏覽器閒置後才下載外部指令碼,不與首屏搶頻寬
  function loadLater(src) {
    window.addEventListener("load", function () {
      var load = function () {
        var s = document.createElement("script");
        s.async = true;
        s.src = src;
        document.head.appendChild(s);
      };
      if ("requestIdleCallback" in window)
        requestIdleCallback(load, { timeout: 3000 });
      else setTimeout(load, 1500);
    });
  }

  var track;
`;

const PRELUDE_GA4 = `
  // 模式:直接使用 GA4
  gtag("js", new Date());
  gtag("set", "user_properties", { site_language: __LANG__ });
  gtag("config", __ID__);
  track = function (name, params) {
    gtag("event", name, params || {});
  };
  loadLater(
    "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(__ID__),
  );
`;

const PRELUDE_GTM = `
  // 模式:Google Tag Manager。事件以 dataLayer.push 送出,由 GTM 內的標記轉給 GA4
  window.dataLayer.push({ site_language: __LANG__ });
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  track = function (name, params) {
    params = params || {};
    var o = { event: name };
    if (params.items) {
      // 電商事件:先清掉上一個 ecommerce 物件,再放新的(GA4 建議做法)
      window.dataLayer.push({ ecommerce: null });
      o.ecommerce = {
        currency: params.currency,
        value: params.value,
        items: params.items,
      };
    } else {
      for (var k in params) o[k] = params[k];
    }
    window.dataLayer.push(o);
  };
  loadLater(
    "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(__ID__),
  );
`;

const EVENTS = `
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
      track("view_item", {
        currency: item.currency,
        value: item.price,
        items: [item],
      });
      form.addEventListener("submit", function () {
        track("add_to_cart", {
          currency: item.currency,
          value: item.price,
          items: [item],
        });
      });
    }

    if (path === "/checkout") {
      track("begin_checkout", { currency: "TWD" });
    }
    // 預訂制:送出訂單算「潛在客戶」轉換(尚未付款,不當成 purchase 以免灌水營收)
    if (path === "/checkout/success") {
      once("ga_lead_preorder", function () {
        track("generate_lead", { lead_source: "preorder" });
      });
    }
    if (path === "/contact" && q.get("ok") === "1") {
      once("ga_lead_contact", function () {
        track("generate_lead", { lead_source: "contact" });
      });
    }
    if (q.get("subscribed") === "1") {
      once("ga_newsletter", function () {
        track("newsletter_subscribe");
      });
    }
    if (path === "/quiz/result") {
      track("quiz_complete", { quiz_type: q.get("type") || "beans" });
    }
  });
})();`;
