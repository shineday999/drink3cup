/* cnamber-store service worker (6.6)
 * 原則：只快取「不含個人資料」的靜態資源；HTML 一律走網路，斷線時才顯示離線頁。
 *  - 導覽（HTML）：network-first，網路失敗才回 /offline.html（不快取任何頁面，購物車／登入狀態不會過期）
 *  - /_astro/*、/api/images/*（內容固定或檔名含時間戳）：cache-first
 *  - /images/*、圖示：stale-while-revalidate（檔名固定，可能被替換）
 *  - 其他一律不處理：非 GET、跨網域、/admin、/api/*（圖片除外）、Range 請求
 * 改動快取行為時請遞增 VERSION，舊快取會在 activate 時清掉。
 */
const VERSION = "v1";
const CACHE = "cnamber-static-" + VERSION;
const OFFLINE_URL = "/offline.html";
const MAX_ENTRIES = 120;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const res = await fetch(OFFLINE_URL, {
        cache: "reload",
        redirect: "follow",
      });
      if (!res.ok) throw new Error("offline page unavailable");
      // 重新包成乾淨的 Response：Pages 可能把 .html 轉址，被轉址的回應不能直接拿來回應導覽
      const body = await res.blob();
      const cache = await caches.open(CACHE);
      await cache.put(
        OFFLINE_URL,
        new Response(body, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("cnamber-static-") && k !== CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isImmutable(p) {
  return p.startsWith("/_astro/") || p.startsWith("/api/images/");
}
function isRevalidated(p) {
  return (
    p.startsWith("/images/") ||
    p === "/icon-192.png" ||
    p === "/icon-512.png" ||
    p === "/apple-touch-icon.png" ||
    p === "/favicon.svg" ||
    p === "/favicon.ico"
  );
}

async function trim(cache) {
  const keys = await cache.keys();
  const extra = keys.length - MAX_ENTRIES;
  for (let i = 0, d = 0; i < keys.length && d < extra; i++) {
    if (new URL(keys[i].url).pathname === OFFLINE_URL) continue;
    await cache.delete(keys[i]);
    d++;
  }
}

async function store(cache, req, res) {
  if (res && res.status === 200 && res.type === "basic") {
    await cache.put(req, res.clone());
    await trim(cache);
  }
  return res;
}

async function navigate(req) {
  try {
    return await fetch(req);
  } catch (err) {
    const cache = await caches.open(CACHE);
    const offline = await cache.match(OFFLINE_URL);
    return (
      offline ||
      new Response("Offline", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  return store(cache, req, await fetch(req));
}

function staleWhileRevalidate(event, req) {
  return (async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    const refresh = fetch(req).then((res) => store(cache, req, res));
    if (hit) {
      event.waitUntil(refresh.catch(() => {}));
      return hit;
    }
    return refresh;
  })();
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const p = url.pathname;
  if (p.startsWith("/admin")) return;

  if (req.mode === "navigate") {
    event.respondWith(navigate(req));
    return;
  }
  if (p.startsWith("/api/") && !p.startsWith("/api/images/")) return;

  if (isImmutable(p)) event.respondWith(cacheFirst(req));
  else if (isRevalidated(p))
    event.respondWith(staleWhileRevalidate(event, req));
});
