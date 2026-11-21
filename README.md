# 喝三杯咖啡

> 精品咖啡知識與產品網站 — https://mycafe.de5.net

## 網站定位
- **品牌名**:喝三杯咖啡
- **內容**:精品咖啡知識(產地、處理法、烘焙、沖煮)+ 咖啡豆與器具產品
- **語言**:繁體中文(目前唯一語言)
- **購買方式**:預訂制(下單後客服以 Email 確認);未來會串接物流,讓用戶直接下單
- **聯絡信箱**:weider@0061qwen.cc.cd

## 技術棧
Astro SSR + React islands + TypeScript + Tailwind;Cloudflare Pages + D1 + R2 + KV;套件管理 pnpm(Node ≥ 20)。

## 開發
```bash
pnpm install
pnpm dev      # http://localhost:4321
pnpm check    # 型別檢查
pnpm test     # 單元測試
pnpm build    # 建置
```

## 協作
- 進度與分工:[docs/PLAN.md](docs/PLAN.md)(先認領 ⬜ 步驟,已 ✅ 的不要重做)
- **所有溝通與文件一律使用繁體中文**
- 推送前必跑:`bash scripts/check-no-original-refs.sh`,必須顯示 `CLEAN`

## 授權
Copyright (c) 2026 喝三杯咖啡. All Rights Reserved.
