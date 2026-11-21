# cnamber-store

> 森林系手作品牌電商——琥珀飾品與香品,大東南亞+中東市場,四語在地化。

## 品牌定位

- **品牌名**:「牛馬得飾」(placeholder,實作前 1 週定案)
- **視覺關鍵詞**:森林 / 綠樹 / 清新 / 自然 / 愜意 / 手作 / 通透 / 留白 / 東方禪意 / 歐美靜物電影感
- **目標市場**:大東南亞(馬/星/泰/印/菲)+ 中東 GCC(阿聯酋/沙烏地/科威特/卡達)
- **i18n**:簡體(預設)/ 英文 / 馬來西亞馬來語 / 印尼馬來語

## 技術棧

- **前台**:Astro 4.x SSR + React 18 islands + TypeScript strict + Tailwind v3
- **後端**:Cloudflare Workers + Hono(Astro API routes 形式)
- **資料庫**:Cloudflare D1(SQLite,13 個表)
- **儲存**:Cloudflare R2(產品圖)+ KV(i18n 快取)
- **認證**:Cloudflare Access(JWT-based,role whitelist)
- **Email**:Resend(Phase 5 接入)
- **部署**:Cloudflare Pages + GitHub App(PR preview + main deploy)

## 開發

```bash
pnpm install   # 安裝依賴
pnpm dev                    # 開發伺服器 (http://localhost:4321)
pnpm build                  # 建構 SSR
pnpm preview                # 預覽
pnpm deploy                 # 部署到 Cloudflare Pages
pnpm check                  # TypeScript / Astro check
pnpm test                       # Vitest
```

## 路由結構

### 前台

- `/` — 首頁(4 語)
- `/[lang]/` — 4 語首頁(en, ms-MY, id-ID)
- `/products` — 商品列表(SSR,category filter)
- `/products/[slug]` — 商品詳情
- `/quiz` — 推薦路徑入口
- `/quiz/jewelry` — 飾品問答
- `/quiz/incense` — 香品問答
- `/quiz/result` — 推薦結果
- `/cart` — 購物車
- `/checkout` — 預訂制結帳
- `/checkout/success` — 訂單確認
- `/story` `/amber` `/incense` `/materials` `/craft` `/vision` — 品牌頁
- `/contact` — 聯絡表單

### 後台(Cloudflare Access 保護)

- `/admin` — 儀表板
- `/admin/products` — 商品管理
- `/admin/products/new` — 新增商品
- `/admin/products/[id]` — 編輯商品
- `/admin/orders` — 訂單管理
- `/admin/reviews` — 評價審核

## 開發階段

- [x] Phase 0:基礎建設(已完成,commit `34086a2`+`f644cd5`+`11c84eb`+`658ee40`)
- [x] Phase 1:SSR + 4 語 i18n + D1 + Hono + CI/CD(commit `1cd6f05`)
- [x] Phase 2:後台骨架 + 商品 CRUD + 設計系統 + 前台商品頁(commit `c65c018`)
- [x] Phase 3:問答路徑 + i18n(commit `c65c018` 後續)
- [x] Phase 4:預訂制訂單 + Email + 內容頁(commit `c65c018` 後續)
- [ ] Phase 5:QA + 上線(審計完成,等用戶 DNS + Access 設定)

## 上線手動步驟

詳見 [`docs/PHASE1-ACCESS-SETUP.md`](./docs/PHASE1-ACCESS-SETUP.md)

### DNS CNAME

```
cnamber.ccwu.cc → cnamber-store.pages.dev (Proxied)
```

### Cloudflare Access Application

```
Application domain: cnamber.ccwu.cc
Path: /admin*
Policy: shineday999@gmail.com (Email OTP)
```

## 計劃書 / 文件

- 完整 PRD: [`docs/spec.md`](./docs/spec.md)
- **設計系統**: [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) — 配色 / 字體 / 排版 / 動效完整規範
- Phase 0 任務:`docs/PHASE0-HANDOFF.md`(已收結)
- Phase 1-5 任務:`docs/PHASE[1-5]-TASKS.md`
- 安全審計:`docs/SECURITY.md`

## License

Copyright (c) 2026 牛馬得飾. All Rights Reserved.

未經著作權人明確書面許可，嚴禁任何人以任何形式複製、修改、散布、公開傳輸或將本專案之程式碼用於任何商業或非商業用途。

## 協作進度

進度表:[docs/MOBILE-APP-PLAN.md](docs/MOBILE-APP-PLAN.md)(目前進行階段 7)。開工前先認領 ⬜ 步驟,已 ✅ 的不要重做。
