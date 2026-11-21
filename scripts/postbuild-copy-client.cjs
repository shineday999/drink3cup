// 把 dist/client 的靜態檔複製到 dist 根目錄,讓 /_astro/*、/images/* 等網址對得上
const fs = require("fs");
const path = require("path");
const dist = path.join(__dirname, "..", "dist");
const client = path.join(dist, "client");
if (fs.existsSync(client)) {
  fs.cpSync(client, dist, { recursive: true, force: false });
  console.log("[postbuild] ✓ copied dist/client → dist");
}
