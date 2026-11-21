# MyCafe — 專案計畫與進度看板

**網站:** https://mycafe.de5.net(DNS 由 Cloudflare 管理)
**主題:** 精品咖啡 — 知識(產地、處理法、烘焙、沖煮)+ 產品(咖啡豆、器具)
**來源:** 技術骨架複製自另一個私有專案,再完整改造品牌。

## 語言規則
**所有溝通、文件、commit 說明一律使用繁體中文(TC)。** 程式碼與指令維持英文。

## 鐵則
1. 本 repo 與原專案**沒有任何 git 關聯**(無共同歷史、無 remote、非 fork)。
2. **絕對不可**修改、推送或部署到原 repo / 原網站 / 原 Cloudflare 資源。
3. **絕對不可**沿用原專案的 D1 / R2 / KV ID、Pages 專案名稱、網域、Email 或 API 金鑰。
4. 每次 push 前執行 `bash scripts/check-no-original-refs.sh`,必須顯示 `CLEAN`。

## 同事使用方式
- 只認領**一個** ⬜ 步驟,改成 🟨 並寫上姓名與日期,完成後改 ✅ 並在「紀錄」補一行。
- 步驟刻意切小(約 15–60 分鐘),一個 commit 只做一個步驟。
- commit 格式:`S07: 翻譯 zh-Hant 首頁與導覽`
- 狀態:⬜ 待辦 · 🟨 進行中 · ✅ 完成 · 🟥 卡住(寫明原因)
- 標籤:🤖 任何人可做的程式/內容工作 · 👤 需要網站擁有者(帳號、密碼、決策)

## 待擁有者決定
| # | 問題 | 未回覆時的預設 |
|---|------|----------------|
| D1 | 品牌名稱 | 「MyCafe」 |
| D2 | 保留哪些語言 | 先做繁體中文 + 英文,馬來文/印尼文之後再做 |
| D3 | 是否線上販售 | 保留現有預訂制流程 |
| D4 | 聯絡信箱 | hello@mycafe.de5.net(需設定 Cloudflare Email Routing) |
| D5 | 新 GitHub repo 名稱 | `mycafe` |

## 步驟
### A 階段 — 隔離與安全
| ID | 標籤 | 步驟 | 狀態 | 負責人 |
|----|------|------|------|--------|
| S00 | 🤖 | 建立隔離副本、全新 `git init`、無 remote | ✅ | Claude |
| S01 | 🤖 | wrangler.jsonc ID 換成佔位符;修正 deploy.yml、launch.json、lighthouserc、package.json | ✅ | Claude |
| S02 | 🤖 | 刪除舊品牌文件/報告(含舊 ID 與 Email) | ✅ | Claude |
| S03 | 🤖 | 完成 `scripts/check-no-original-refs.sh` 檢查、改寫 LICENSE 與 README | ⬜ | |

### B 階段 — 程式碼層改造(尚不寫文案)
| ID | 標籤 | 步驟 | 狀態 | 負責人 |
|----|------|------|------|--------|
| S04 | 🤖 | 取代寫死的 Email/網址:`src/lib/email.ts`、`api/contact.ts`、`api/orders/create.ts`、`contact.astro` | ⬜ | |
| S05 | 🤖 | 網站名稱/meta/manifest/sw.js/robots/offline.html/404/500、`Layout.astro`、`Footer.astro` | ⬜ | |
| S06 | 🤖 | 路由與分類改名:amber→`beans`、incense→`brewing`、materials→`origins`、craft→`roasting`;問答改為 `quiz/brew-method`、`quiz/taste`;更新 `categories.ts`、`category-kind.ts`、`quiz.ts`、`MobileNav` 等 | ⬜ | |

### C 階段 — 內容(一步一種語言)
| ID | 標籤 | 步驟 | 狀態 | 負責人 |
|----|------|------|------|--------|
| S07 | 🤖 | 重寫繁體中文語系檔(咖啡內容) | ⬜ | |
| S08 | 🤖 | 重寫 `en.json`(依 S07 翻譯) | ⬜ | |
| S09 | 🤖 | `ms-MY.json`、`id-ID.json`(或依 D2 移除) | ⬜ | |
| S10 | 🤖 | 品牌頁:story、beans、brewing、origins、roasting、vision、more、about | ⬜ | |
| S11 | 🤖 | 知識文章種子(產地、水洗 vs 日曬、研磨度、V60、義式、保存) | ⬜ | |
| S12 | 🤖 | 資料庫種子:新 `scripts/seed*.sql`、商品 FAQ、migrations 0007/0009/0011/0014 的站名與分類 | ⬜ | |
| S13 | 🤖 | 更換 `public/images/**`(舊圖屬舊品牌),僅用自有或有授權的照片 | ⬜ | |
| S14 | 🤖 | SEO:sitemap、`llms.txt`、`llms-full.txt`、結構化資料 | ⬜ | |

### D 階段 — 驗證
| ID | 標籤 | 步驟 | 狀態 | 負責人 |
|----|------|------|------|--------|
| S15 | 🤖 | `pnpm install && pnpm check && pnpm test && pnpm build` 全部通過 | ⬜ | |
| S16 | 🤖 | 檢查腳本顯示 `CLEAN`;搜尋「琥珀/香品/牛马」殘留 = 0 | ⬜ | |

### E 階段 — 上線(需擁有者)
| ID | 標籤 | 步驟 | 狀態 | 負責人 |
|----|------|------|------|--------|
| S17 | 👤 | 建立**全新空白** GitHub repo(D5),不要 README/授權檔,提供推送權限 | ⬜ | |
| S18 | 🤖/👤 | `git remote add origin <新 repo>` → `git push -u origin main` | ⬜ | |
| S19 | 👤 | Cloudflare 建立新 D1 `mycafe`、R2 `mycafe-images`、2 個 KV;ID 填入 `wrangler.jsonc` | ⬜ | |
| S20 | 👤 | 套用 migrations:`npx wrangler d1 migrations apply mycafe --remote`,再匯入種子 | ⬜ | |
| S21 | 👤 | Cloudflare Pages 建立新專案 `mycafe` 連接新 repo;GitHub secrets 設定**新的**受限權限 API Token | ⬜ | |
| S22 | 👤 | Pages → 自訂網域 → 新增 `mycafe.de5.net`(自動建立 CNAME → `mycafe.pages.dev`) | ⬜ | |
| S23 | 👤 | 建立管理員帳號與金鑰(管理密碼、JWT secret、Resend key),全部用新值 | ⬜ | |
| S24 | 🤖/👤 | 手機/桌面最終 QA:表單、後台登入、Email | ⬜ | |

## 紀錄
- 2026-11-21 Claude:完成 S00–S02。移除指向原專案 D1/KV/R2 的 ID、deploy.yml 中的原 Pages 專案名稱、lighthouserc 的原網域,並刪除舊文件。
- 2026-11-21 Claude:改為繁體中文文件,新增語言規則。

## 程式碼背景(給新同事)
- Astro SSR + React islands + Tailwind;Cloudflare Pages + D1 + R2 + KV;pnpm(Node ≥ 20)。
- 約 98 個檔案含舊品牌字眼(琥珀飾品/香品),可用下列指令搜尋:
  `grep -rIlE "cnamber|牛馬|牛马|OxHorse|oxsupport|ccwu|0061qwen|shineday999|琥珀|amber|香品|incense" --exclude-dir=.git --exclude=pnpm-lock.yaml .`
- 商品與分類邏輯在 `src/lib/categories.ts`、`category-kind.ts`、`quiz.ts`。
