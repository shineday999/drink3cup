# 協作者接手指南

更新日期:2026-11-22。進度看板請同時看 [PLAN.md](PLAN.md)。

## 1. 專案概況

| 項目     | 內容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 網站     | https://mycafe.de5.net(品牌:喝三杯咖啡,精品咖啡知識 + 咖啡豆與器具預訂) |
| 技術     | Astro 7(SSR)+ `@astrojs/cloudflare`、Tailwind v4(`@tailwindcss/vite`)   |
| 套件管理 | **只用 pnpm**(不要執行 `npm install`,`package-lock.json` 已忽略)        |
| 資料庫   | Cloudflare D1 `mycafe`(migrations 在 `migrations/`)                     |
| 圖片     | R2 binding `PRODUCT_IMAGES` → bucket `mycafe-images`                    |
| 部署     | Cloudflare Pages 專案 `mycafe`,連接本 repo,**push 到 `main` 自動部署**  |
| 語言     | 目前只有 `zh-Hant` 語言檔(見「待辦」)                                   |
| 幣別     | 新台幣 TWD(欄位名 `per_cny` 為歷史名稱,現在代表「1 TWD 換多少該幣別」)  |

## 2. 本機開發

```bash
git pull
pnpm install
pnpm dev          # 本機預覽
pnpm check        # 型別檢查
pnpm test         # 單元測試
pnpm build        # 建置(含 postbuild 腳本)
```

- `scripts/postbuild-fix-assets-binding.cjs` 與 `scripts/postbuild-copy-client.cjs` 是部署必要的,**不要移除**(後者把 `dist/client` 複製到 `dist`,否則 `/_astro/*` 樣式檔會 404)。
- 本機不需要 Cloudflare 帳號即可改前端與文案;連線遠端資料庫與部署只有擁有者能做。

## 3. 提交規則

- commit 格式:`類型(步驟): 說明`,說明用繁體中文,例如 `feat(S10): 重寫品牌故事頁`。類型限 feat / fix / docs / chore / refactor / perf / test / build / ci / style。
- 提交前會自動跑 husky + lint-staged(Prettier),不符格式的 commit 會被擋。
- CI 三項必須全綠:`lint`(`prettier --check .`)、`build-check`、`secret-scan`。
- 一個 commit 只做一個步驟;認領步驟時在 `PLAN.md` 把 ⬜ 改成 🟨 並寫上姓名與日期,完成後改 ✅ 並在「紀錄」補一行。
- push 前先 `git pull --rebase`。
- 部署只走 Cloudflare Pages 的 Git 整合,**不要新增 GitHub Actions 部署流程**(需要 API token,擁有者不使用)。

## 4. 鐵則(摘自 PLAN.md)

1. 本 repo 與原專案沒有任何 git 關聯,也不可沿用其資料、金鑰、Email、網域。
2. 公開前執行 `bash scripts/check-no-original-refs.sh`,必須顯示 `CLEAN`。
3. **repo 是 public**:任何金鑰、密碼、Token、客戶資料都不可提交。

## 5. 資料庫

```bash
# 套用 migrations(僅擁有者;需先 pnpm exec wrangler login)
pnpm exec wrangler d1 migrations apply mycafe --remote
```

- 新增 migration:在 `migrations/` 建立下一個編號的 `.sql`,**不要修改已套用過的檔案**。
- `scripts/seed-coffee.sql` 會**清空**商品、文章、評論再匯入示範資料,**不要在正式環境重跑**。
- 分類代碼目前沿用舊名:`jewelry` = 咖啡豆、`incense` = 沖煮器具(對應顯示名稱在 `src/lib/sheet-sync-api.ts` 的 `CATEGORY_LABELS`)。S06 完成改名時,要同步調整這裡。

## 6. 後台與金鑰(擁有者管理)

- 後台:`/admin/login`。管理員帳號由擁有者建立(密碼以 bcrypt 存在 `admin_users`)。需要後台權限請向擁有者要。
- Cloudflare Pages secrets:`SESSION_SECRET`(登入 cookie 簽章)、`SYNC_TOKEN`(試算表同步)。**只存在 Cloudflare 與 Apps Script 指令碼屬性,不在 repo。**
- 設定 secret:`pnpm exec wrangler pages secret put <名稱> --project-name mycafe`。

## 7. 商品試算表同步

Google 試算表 `mycafe` 分頁與網站商品雙向同步,約每分鐘一次。詳見 [PRODUCT-SHEET-SYNC.md](PRODUCT-SHEET-SYNC.md)。

- 網站端:`src/lib/sheet-sync-api.ts`、`src/pages/api/sync/products.ts`。
- 試算表端:`scripts/apps-script/mycafe-sync.gs`(貼進試算表的 Apps Script,執行 `mycafeStart`)。
- 改分頁名稱時,要同步修改 Apps Script 內的 `MC_TAB`。
- 修改同步欄位時,網站端 `SYNC_HEADERS` 是唯一來源,Apps Script 會自動讀取。

## 8. 目前進度(2026-11-22)

**已完成**

- Repo 公開、CI 全綠;Tailwind v4;pnpm lockfile 同步
- 幣別改新台幣(S05c);後台與程式內文字繁體化(S05d)
- D1 資料庫、咖啡與器具示範資料(各 4 語言翻譯)、Cloudflare Pages 自動部署、網域 `mycafe.de5.net`(S12、S19–S22)
- 後台管理員帳號(S23)
- 首頁品牌文案改咖啡並全檔轉繁體(S07 大部分);配色改咖啡色系與新 favicon(S13b)
- 商品試算表雙向同步
- S06:路由改名(舊網址 301)、測驗改成咖啡口味題並移除選茶、結果依分數排序

**進行中**

- (目前無;S06 剩資料庫分類代碼改名,見待辦)

**待辦(可認領)**

| 項目                                                        | 步驟          | 備註                                                             |
| ----------------------------------------------------------- | ------------- | ---------------------------------------------------------------- |
| 資料庫分類代碼改名(`jewelry`/`incense` → `beans`/`brewing`) | S06           | 需 migration + 更新 `CATEGORY_LABELS` 與 `category-kind.ts`      |
| 重建 `en`、`ms-MY`、`id-ID` 語言檔                          | —             | 目前 `src/i18n/messages` 只有 `zh-Hant.json`;商品資料已有 4 語言 |
| 品牌頁文案:story、vision、about、more 等                    | S10           | 文案在 `zh-Hant.json`                                            |
| 商品與頁面圖片、首頁插圖(目前仍是舊的森林插圖)              | S13           | 只能用自有或有授權的照片,需擁有者提供                            |
| SEO:sitemap、`llms.txt`、`llms-full.txt`、結構化資料        | S14           |                                                                  |
| 驗收:殘留字樣為 0、手機與桌面 QA、表單與 Email              | S15、S16、S24 |                                                                  |
| 寄信(Resend)金鑰與寄件人設定                                | S23           | 擁有者                                                           |
| 確認 R2 bucket `mycafe-images` 已建立並可上傳               | S19           | 擁有者                                                           |
| 資料庫內文字(後台設定、橫幅)是否仍有簡體                    | S05d          | 擁有者在後台檢查,或請協作者寫轉換 migration                      |

## 9. 只有擁有者能做的事

Cloudflare 後台操作(D1、R2、Pages、網域、secrets)、Resend 金鑰、後台帳號建立、提供照片與社群帳號、`wrangler login`。需要這些時,請在 `PLAN.md` 該步驟標 🟥 並寫明原因。

## 10. 常見問題

- **網頁沒有樣式:** 確認 `pnpm build` 的輸出有「copied dist/client → dist」,且 `dist/_astro/*.css` 存在。
- **`pnpm install` 失敗:** 不要用 npm;確認 `pnpm-lock.yaml` 已更新並一起提交。
- **lint 失敗:** 執行 `pnpm exec prettier --write .` 後再提交。
- **新增頁面或網址:** 同步更新 `src/pages/sitemap.xml.ts`。

## 2026-11-26 進度更新(S13b)

- 首頁封面:照片保留原色,標題與文字改為白色並加強陰影
- 首頁封面遮罩加深(左側 black/80、底部 black/60),解決文字與背景混在一起
- `kindOf` 移除未使用的 `_zhTitle` 參數與 tea 測驗種類,同步修改 admin/products/new.astro、quiz/index.astro 呼叫端
- 已 build 並 deploy 到 Cloudflare Pages(mycafe)
- 待辦:到 mycafe.de5.net 確認封面可讀性,必要時再調整遮罩
