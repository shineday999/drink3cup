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
4. **公開**(public repo / 正式上線)前,`bash scripts/check-no-original-refs.sh` 必須顯示 `CLEAN`。第一次推到 **Private** repo 作為協作基地可以例外(目前尚有舊品牌字樣,待 S07、S12 清除)。

## 同事使用方式

- 只認領**一個** ⬜ 步驟,改成 🟨 並寫上姓名與日期,完成後改 ✅ 並在「紀錄」補一行。
- 步驟刻意切小(約 15–60 分鐘),一個 commit 只做一個步驟。
- commit 格式(專案有 commitlint 檢查,不符會被擋):`類型(步驟): 說明`,類型限 feat/fix/docs/chore/refactor/perf/test/build/ci/style,例如 `feat(S07): 重寫繁體中文首頁與導覽`
- 狀態:⬜ 待辦 · 🟨 進行中 · ✅ 完成 · 🟥 卡住(寫明原因)
- 標籤:🤖 任何人可做的程式/內容工作 · 👤 需要網站擁有者(帳號、密碼、決策)

## 已確認的決策(擁有者 2026-11-21)

| #   | 項目                | 決定                                         |
| --- | ------------------- | -------------------------------------------- |
| D1  | 品牌名稱            | **喝三杯咖啡**                               |
| D2  | 語言                | **保留 4 語言(繁中、英、馬來、印尼)**        |
| D3  | 購買方式            | **保留預訂制**;未來會串接物流,讓用戶直接下單 |
| D4  | 聯絡信箱            | **weider@0061qwen.cc.cd**(暫定)              |
| D5  | 新 GitHub repo 名稱 | **mycafe**                                   |

## 仍待擁有者提供

- 新品牌的社群帳號(小紅書/IG/LINE 等);目前聯絡頁已自動隱藏空欄位。
- 咖啡產品照片(自有或有授權)。
- 品牌 LOGO / favicon / 192、512 圖示(目前仍是舊品牌圖,見 S13)。

## 步驟

### A 階段 — 隔離與安全

| ID  | 標籤 | 步驟                                                                                  | 狀態 | 負責人 |
| --- | ---- | ------------------------------------------------------------------------------------- | ---- | ------ |
| S00 | 🤖   | 建立隔離副本、全新 `git init`、無 remote                                              | ✅   | Claude |
| S01 | 🤖   | wrangler.jsonc ID 換成佔位符;修正 deploy.yml、launch.json、lighthouserc、package.json | ✅   | Claude |
| S02 | 🤖   | 刪除舊品牌文件/報告(含舊 ID 與 Email)                                                 | ✅   | Claude |
| S03 | 🤖   | 完成原專案檢查腳本、改寫 LICENSE 與 README                                            | ✅   | Claude |

### B 階段 — 程式碼層改造(尚不寫文案)

| ID   | 標籤  | 步驟                                                                                                                                                                                                                                                              | 狀態 | 負責人 |
| ---- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| S04  | 🤖    | 取代寫死的 Email;歡迎信改寫;移除舊品牌小紅書/微信欄位(`social.ts`、`contact.astro`)                                                                                                                                                                               | ✅   | Claude |
| S05  | 🤖    | Cookie/快取/網址/站名改為新品牌(`Layout`、`sw.js`、`robots`、`offline`、`manifest` 等)                                                                                                                                                                            | ✅   | Claude |
| S05b | 🤖    | 語系改為只有繁體中文:`zh-Hans`→`zh-Hant`;移除 en/ms-MY/id-ID 語系檔與程式分支;刪除語言切換器與未使用的翻譯元件/API;`/zh-Hant/*` 301 轉到無前綴網址;後台新增商品不再要求英文說明(英文名稱保留,僅用於產生網址)                                                      | ✅   | Claude |
| S05c | 🤖/👤 | **幣別改為新台幣 TWD**(需先確認 D6)。目前價格以人民幣 CNY 為基準(`lib/format.ts`、`lib/rates.ts`、`exchange_rates.per_cny`、`product_prices` 的 CNY 列、後台「售價(人民幣)」字樣、`schemas/product.ts`)。評估是否直接把基準幣別換成 TWD、移除匯率換算與匯率後台頁 | ✅   |        |
| S05d | 🤖    | 後台介面文字簡體→繁體(後台頁面與 API 錯誤訊息寫死為簡體,非語系檔;可用 OpenCC 轉換後人工校對)。含 `admin/**`、`lib/admin-products.ts`、`lib/auth.ts` 等                                                                                                            | ✅   |        |
| S06  | 🤖    | 路由與分類改名:amber→`beans`、incense→`brewing`、materials→`origins`、craft→`roasting`;問答改為 `quiz/brew-method`、`quiz/taste`;更新 `categories.ts`、`category-kind.ts`、`quiz.ts`、`MobileNav` 等                                                              | ✅   | Claude |

### C 階段 — 內容(一步一種語言)

| ID   | 標籤 | 步驟                                                                                                                                   | 狀態 | 負責人 |
| ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| S07  | 🤖   | 重寫 `zh-Hant.json`(咖啡內容;需先完成 S05b,並處理 `site_name`、`hero_title`、`faq_a2_a`、後台 `brand` 等舊品牌鍵)                      | ⬜   |        |
| S10  | 🤖   | 品牌頁:story、beans、brewing、origins、roasting、vision、more、about                                                                   | ✅   | Claude |
| S11  | 🤖   | 知識文章種子(產地、水洗 vs 日曬、研磨度、V60、義式、保存)                                                                              | ⬜   |        |
| S12  | 🤖   | 資料庫種子:新 `scripts/seed*.sql`、商品 FAQ、migrations 0007/0009/0011/0014 的站名與分類                                               | ✅   |        |
| S13  | 🤖   | 更換 `public/images/**`(舊圖屬舊品牌),僅用自有或有授權的照片                                                                           | ⬜   |        |
| S13b | 🤖   | 配色/設計 token 由「森林綠」改為咖啡色系(`tailwind.config.cjs`、`global.css`,class 名稱 `forest-*` 可保留或改名);重新製作 favicon/圖示 | ⬜   |        |
| S14  | 🤖   | SEO:sitemap、`llms.txt`、`llms-full.txt`、結構化資料                                                                                   | ⬜   |        |

### D 階段 — 驗證

| ID  | 標籤 | 步驟                                                             | 狀態 | 負責人 |
| --- | ---- | ---------------------------------------------------------------- | ---- | ------ |
| S15 | 🤖   | `pnpm install && pnpm check && pnpm test && pnpm build` 全部通過 | ⬜   |        |
| S16 | 🤖   | 檢查腳本顯示 `CLEAN`;搜尋「琥珀/香品/牛马」殘留 = 0              | ⬜   |        |

### E 階段 — 上線(需擁有者)

| ID  | 標籤  | 步驟                                                                                                                                                                                                                                                         | 狀態 | 負責人 |
| --- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------ |
| S17 | 👤    | 建立**全新空白 Public** GitHub repo `mycafe`(不要勾 README/.gitignore/授權檔)。若要讓 Claude 代為推送:建立 **Fine-grained token,Repository access 只選 mycafe**,權限 Contents: Read and write,效期 7 天,用完撤銷。**不要用能存取原專案的 token**(違反鐵則 2) | ⬜   |        |
| S18 | 👤/🤖 | 推送:`git remote add origin https://github.com/shineday999/mycafe.git` → `git push -u origin main`(Claude 沙盒無 GitHub 憑證,擁有者在本機執行即可)                                                                                                           | ⬜   |        |
| S19 | 👤    | Cloudflare 建立新 D1 `mycafe`、R2 `mycafe-images`、2 個 KV;ID 填入 `wrangler.jsonc`                                                                                                                                                                          | ✅   |        |
| S20 | 👤    | 套用 migrations:`npx wrangler d1 migrations apply mycafe --remote`,再匯入種子                                                                                                                                                                                | ✅   |        |
| S21 | 👤    | Cloudflare Pages 建立新專案 `mycafe` 連接新 repo;GitHub secrets 設定**新的**受限權限 API Token                                                                                                                                                               | ✅   |        |
| S22 | 👤    | Pages → 自訂網域 → 新增 `mycafe.de5.net`(自動建立 CNAME → `mycafe.pages.dev`)                                                                                                                                                                                | ✅   |        |
| S23 | 👤    | 建立管理員帳號與金鑰(管理密碼、JWT secret、Resend key),全部用新值                                                                                                                                                                                            | ✅   |        |
| S25 | 🤖    | 【未來】物流串接與直接下單(取代預訂制):先調查物流商 API、金流、運費規則,另開計畫                                                                                                                                                                             | ⬜   |        |
| S24 | 🤖/👤 | 手機/桌面最終 QA:表單、後台登入、Email                                                                                                                                                                                                                       | ⬜   |        |

## 紀錄

- 2026-11-22 Claude:完成 S06(測驗改咖啡口味題,網址為 `/quiz/beans`、`/quiz/brewing`,舊網址 301;資料庫分類代碼改為 `beans`/`brewing`,migration 0020)與 S10(品牌頁文案重寫)。

- 2026-11-21 Claude:嘗試建立 repo,沙盒沒有 GitHub 憑證,無法代建/推送。已改寫 S17/S18 交接說明與鐵則 4(Private 首次推送可例外)。

- 2026-11-21 Claude:完成 S05b。驗證:`pnpm check` 0 錯誤、`pnpm test` 37/37 通過、`pnpm build` 成功。順帶發現專案有 husky + commitlint,commit 必須符合 `類型(步驟): 說明`。新增 S05c(幣別)、S05d(後台簡轉繁)。

- 2026-11-21 Claude:完成 S03–S05(各自獨立 commit)。收到決策 D1–D4。新增 S05b(語系改繁中)、S13b(咖啡色系)、S25(未來物流下單);S08/S09 因只做繁中而移除。守衛腳本目前仍為 NOT CLEAN,剩餘殘留僅在語系檔(S07)與 SQL/腳本(S12)。
- 2026-11-21 Claude:完成 S00–S02。移除指向原專案 D1/KV/R2 的 ID、deploy.yml 中的原 Pages 專案名稱、lighthouserc 的原網域,並刪除舊文件。
- 2026-11-21 Claude:改為繁體中文文件,新增語言規則。

## 程式碼背景(給新同事)

- Astro SSR + React islands + Tailwind;Cloudflare Pages + D1 + R2 + KV;pnpm(Node ≥ 20)。
- 約 98 個檔案含舊品牌字眼(琥珀飾品/香品),可用下列指令搜尋:
  `grep -rIlE "cnamber|牛馬|牛马|OxHorse|oxsupport|ccwu|0061qwen|shineday999|琥珀|amber|香品|incense" --exclude-dir=.git --exclude=pnpm-lock.yaml .`
- 商品與分類邏輯在 `src/lib/categories.ts`、`category-kind.ts`、`quiz.ts`。
- 2026-11-21 Claude:完成 S05c(新台幣)、S05d(後台繁體)、S12(咖啡種子資料,4 語言)、S19–S23(D1、Pages 自動部署、網域、後台帳號)。
- 2026-11-21 Claude:新增商品試算表雙向同步(網站端 /api/sync/products + Apps Script),說明見 docs/PRODUCT-SHEET-SYNC.md。
- 2026-11-21 Claude:新增商品試算表雙向同步(網站端 /api/sync/products + Apps Script),說明見 docs/PRODUCT-SHEET-SYNC.md。
