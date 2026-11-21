#!/usr/bin/env bash
# Mobile-First RWD installer for mycafe (Astro + Tailwind)
# 用法: 放到專案根目錄後執行  bash apply-mobile-first.sh
set -euo pipefail

cd "$(dirname "$0")"
[ -f astro.config.mjs ] || { echo "❌ 請在專案根目錄執行 (找不到 astro.config.mjs)"; exit 1; }

git checkout -b feat/mobile-first 2>/dev/null || git checkout feat/mobile-first
mkdir -p src/components src/styles

###############################################################################
# 1) MobileNav.astro：固定頂部 Header + 底部 Tab Bar
###############################################################################
cat > src/components/MobileNav.astro <<'EOF'
---
// 手機版專用導覽 (<768px 才顯示，桌面版 CSS 會隱藏)
const path = Astro.url.pathname;
const m = path.match(/^\/(en|ms-MY|id-ID)(?=\/|$)/);
const lang = (m ? m[1] : 'zh') as 'zh' | 'en' | 'ms-MY' | 'id-ID';
const prefix = m ? `/${m[1]}` : '';
const rest = m ? path.slice(m[0].length) || '/' : path;

const labels = {
  zh:      { home: '首页', products: '产品', quiz: '选一件', cart: '购物车', story: '故事' },
  en:      { home: 'Home', products: 'Shop', quiz: 'Quiz', cart: 'Cart', story: 'Story' },
  'ms-MY': { home: 'Utama', products: 'Produk', quiz: 'Kuiz', cart: 'Troli', story: 'Kisah' },
  'id-ID': { home: 'Beranda', products: 'Produk', quiz: 'Kuis', cart: 'Keranjang', story: 'Kisah' },
}[lang];

const tabs = [
  { key: 'home',     href: prefix || '/', active: rest === '/' },
  { key: 'products', href: '/products',   active: rest.startsWith('/products') },
  { key: 'quiz',     href: '/quiz',       active: rest.startsWith('/quiz') },
  { key: 'cart',     href: '/cart',       active: rest.startsWith('/cart') || rest.startsWith('/checkout') },
  { key: 'story',    href: '/story',      active: ['/story','/vision','/craft','/materials','/about','/blog'].some(p => rest.startsWith(p)) },
] as const;

const icons: Record<string, string> = {
  home:     '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  products: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  quiz:     '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17l.7 1.8L21.5 19.5l-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z"/>',
  cart:     '<path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  story:    '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>',
};

const langs = [
  { code: 'zh', label: '简体中文', href: '/' },
  { code: 'en', label: 'English', href: '/en/' },
  { code: 'ms-MY', label: 'Bahasa Melayu', href: '/ms-MY/' },
  { code: 'id-ID', label: 'Bahasa Indonesia', href: '/id-ID/' },
];
---

<header class="m-header" role="banner">
  <a class="m-brand" href={prefix || '/'} aria-label="喝三杯咖啡">
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" set:html={icons.story} />
    <span class="m-brand-text">喝三杯咖啡</span>
  </a>
  <details class="m-lang">
    <summary aria-label="Language">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>
    </summary>
    <ul>
      {langs.map(l => <li><a href={l.href} aria-current={l.code === lang ? 'true' : undefined}>{l.label}</a></li>)}
    </ul>
  </details>
</header>

<nav class="m-tabbar" aria-label="Primary">
  {tabs.map(t => (
    <a href={t.href} class:list={['m-tab', { 'is-active': t.active }]} aria-current={t.active ? 'page' : undefined}>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" set:html={icons[t.key]} />
      <span>{labels[t.key]}</span>
    </a>
  ))}
</nav>
EOF

###############################################################################
# 2) mobile.css：全部限定在 <768px
###############################################################################
cat > src/styles/mobile.css <<'EOF'
/* ===== Mobile-First App-like layer (<768px) ===== */
:root {
  --m-bg: #f3f1ea;
  --m-card: #ffffff;
  --m-ink: #1f2a24;
  --m-muted: #6b7a70;
  --m-accent: #3f6b4f;
  --m-header-h: 56px;
  --m-tab-h: 64px;
}

/* 桌面版隱藏手機專用元件 */
.m-header, .m-tabbar { display: none; }

@media (max-width: 767.98px) {
  /* ---- 1. 基礎：禁止水平捲軸 ---- */
  html { -webkit-text-size-adjust: 100%; scroll-padding-top: calc(var(--m-header-h) + 16px); }
  html, body { max-width: 100%; overflow-x: clip; }
  body {
    background: var(--m-bg);
    padding-top: calc(var(--m-header-h) + env(safe-area-inset-top, 0px));
    padding-bottom: calc(var(--m-tab-h) + env(safe-area-inset-bottom, 0px) + 16px);
    -webkit-tap-highlight-color: transparent;
  }
  img, video, svg, canvas, iframe { max-width: 100%; }
  main { overflow-x: clip; }
  main :where(pre, table) { max-width: 100%; overflow-x: auto; }

  /* ---- 2. 導覽列：隱藏桌面 header，改用 Fixed Header + Bottom Tab Bar ---- */
  header:not(.m-header):not(main header):not(article header):not(section header),
  #site-header, .site-header, [data-site-header],
  body > nav:not(.m-tabbar), #mobile-menu, [data-mobile-menu] {
    display: none !important;
  }

  .m-header {
    display: flex; align-items: center; justify-content: space-between;
    position: fixed; top: 0; left: 0; right: 0; z-index: 60;
    height: calc(var(--m-header-h) + env(safe-area-inset-top, 0px));
    padding: env(safe-area-inset-top, 0px) 16px 0;
    background: rgba(255,255,255,.92);
    -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(0,0,0,.06);
    color: var(--m-ink);
  }
  .m-brand { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; color: var(--m-accent); text-decoration: none; }
  .m-brand-text { font-size: 20px; font-weight: 700; color: var(--m-ink); letter-spacing: .02em; }

  .m-lang { position: relative; }
  .m-lang summary { list-style: none; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 999px; cursor: pointer; }
  .m-lang summary::-webkit-details-marker { display: none; }
  .m-lang ul {
    position: absolute; right: 0; top: 48px; min-width: 190px; margin: 0; padding: 6px; list-style: none;
    background: #fff; border-radius: 16px; box-shadow: 0 12px 32px rgba(0,0,0,.16);
  }
  .m-lang li a { display: flex; align-items: center; min-height: 44px; padding: 0 14px; border-radius: 12px; font-size: 16px; color: var(--m-ink); text-decoration: none; }
  .m-lang li a[aria-current="true"] { background: #eef3ee; font-weight: 600; color: var(--m-accent); }

  .m-tabbar {
    display: grid; grid-template-columns: repeat(5, 1fr);
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 60;
    height: calc(var(--m-tab-h) + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: rgba(255,255,255,.95);
    -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
    border-top: 1px solid rgba(0,0,0,.07);
    box-shadow: 0 -4px 20px rgba(0,0,0,.05);
  }
  .m-tab {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
    min-height: 48px; color: var(--m-muted); text-decoration: none; font-size: 12px; font-weight: 500;
    transition: color .15s;
  }
  .m-tab:active { transform: scale(.94); }
  .m-tab.is-active { color: var(--m-accent); font-weight: 700; }

  /* ---- 3. 卡片式區塊 & 網格重排 ---- */
  main > section:not(:first-child) { padding: 28px 16px; }

  /* 預設單欄；3 個以上子項 → 2x2 雙欄 */
  main .grid { grid-template-columns: 1fr !important; gap: 12px !important; }
  main .grid:has(> :nth-child(3)) { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  main .grid:has(> :nth-child(3)) > :last-child:nth-child(odd) { grid-column: 1 / -1; }

  /* 圓角卡片 */
  main .grid > * {
    border-radius: 16px; overflow: hidden; min-height: 44px;
    background: var(--m-card); box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 14px rgba(31,42,36,.05);
  }
  main .grid > a, main .grid > article { padding: 0; }
  main .grid img { width: 100%; object-fit: cover; }

  footer { margin: 16px 12px 0; border-radius: 16px; overflow: hidden; }
  footer .grid { grid-template-columns: 1fr !important; }
  footer .grid > * { box-shadow: none; background: transparent; border-radius: 0; }
  footer a { display: inline-flex; align-items: center; min-height: 44px; }

  /* ---- 4. 字體 & 按鈕 ---- */
  main h1 { font-size: 28px !important; line-height: 1.25 !important; font-weight: 700 !important; }
  main h2 { font-size: 24px !important; line-height: 1.3 !important; font-weight: 700 !important; }
  main h3 { font-size: 18px !important; line-height: 1.4 !important; font-weight: 600 !important; }
  main p, main li, main dd { font-size: 16px; line-height: 1.7; }
  .text-xs, .text-sm { font-size: 14px !important; }

  /* CTA：膠囊狀、加高 */
  main :is(button, [role="button"], input[type="submit"], a.btn, a[class*="btn"], a[class*="button"], a[class*="cta"]),
  main section:first-child a:not(p a):not(li a) {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    min-height: 48px; padding: 0 24px; border-radius: 999px;
    font-size: 16px; font-weight: 600; text-decoration: none;
  }
  main :is(.flex, [class*="flex-wrap"]):has(> :is(a, button)) { gap: 12px; }

  /* 表單：16px 避免 iOS 自動放大 */
  input, select, textarea { font-size: 16px !important; min-height: 48px; border-radius: 14px; max-width: 100%; }
  textarea { min-height: 120px; }
}

/* 平板以上完全不影響 */
@media (min-width: 768px) { .m-header, .m-tabbar { display: none !important; } }
EOF

###############################################################################
# 3) 自動 patch layout（冪等，可重複執行）
###############################################################################
python3 - <<'PY'
import glob, os, re, sys

def read(f): return open(f, encoding='utf-8').read()

cands = [f for f in glob.glob('src/layouts/**/*.astro', recursive=True)
         if '<slot' in read(f) and '<html' in read(f)]
if not cands:
    print("⚠️ 找不到含 <html> 與 <slot> 的 layout，請手動加入："
          "\n   frontmatter: import MobileNav from '<相對路徑>/components/MobileNav.astro'; import '<相對路徑>/styles/mobile.css';"
          "\n   <body> 後面: <MobileNav />")
    sys.exit(0)

for f in cands:
    s = read(f)
    if 'MobileNav' in s:
        print(f"↪ {f} 已套用，略過"); continue
    d = os.path.dirname(f)
    nav = os.path.relpath('src/components/MobileNav.astro', d)
    css = os.path.relpath('src/styles/mobile.css', d)
    imp = f"import MobileNav from '{nav}';\nimport '{css}';\n"

    if s.startswith('---'):
        s = s.replace('---\n', '---\n' + imp, 1)
    else:
        s = '---\n' + imp + '---\n' + s

    if 'name="viewport"' not in s:
        s = re.sub(r'<head[^>]*>', lambda m: m.group(0) + '\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />', s, 1)

    s = re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + '\n    <MobileNav />', s, 1)
    open(f, 'w', encoding='utf-8').write(s)
    print(f"✅ 已 patch {f}")
PY

echo
echo "── 偵測到可能的桌面版 header 檔案（供核對）──"
grep -rlE "<header|<nav" src --include=*.astro --include=*.tsx | grep -v MobileNav || true
echo
echo "完成。接著： npm run dev  → 瀏覽器 DevTools 切到 375px 檢查"
echo "確認 OK 後： git add -A && git commit -m 'feat(ui): mobile-first app-like layout' && git push -u origin feat/mobile-first"
