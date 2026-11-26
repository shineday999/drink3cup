// 檢查語言檔:各語言鍵是否一致、程式碼引用的鍵是否存在。用法:pnpm check:i18n
import fs from "node:fs";
import path from "node:path";

const dir = "src/i18n/messages";
const flat = (o, p = "") =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" ? flat(v, p + k + ".") : [p + k],
  );
const sets = {};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  sets[f] = new Set(
    flat(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))),
  );
}
const base = sets["zh-Hant.json"];
let bad = 0;
for (const [f, s] of Object.entries(sets)) {
  if (f === "zh-Hant.json") continue;
  for (const k of base)
    if (!s.has(k)) {
      console.log(`[${f}] 缺少 ${k}`);
      bad++;
    }
  for (const k of s)
    if (!base.has(k)) {
      console.log(`[${f}] 多出 ${k}`);
      bad++;
    }
}
const sections = [...new Set([...base].map((k) => k.split(".")[0]))];
const re = new RegExp(
  `["'\`]((?:${sections.join("|")})\\.[A-Za-z0-9_.]+)["'\`]`,
  "g",
);
const walk = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? e.name === "i18n" || e.name === "__tests__" || e.name === "repo"
          ? []
          : walk(path.join(d, e.name))
        : /\.(astro|ts|tsx)$/.test(e.name)
          ? [path.join(d, e.name)]
          : [],
    );
for (const file of walk("src")) {
  const txt = fs.readFileSync(file, "utf8");
  for (const m of txt.matchAll(re)) {
    const k = m[1];
    if (!base.has(k) && ![...base].some((b) => b.startsWith(k + "."))) {
      console.log(`${file}: 找不到語言檔鍵 ${k}`);
      bad++;
    }
  }
}
console.log(bad ? `共 ${bad} 個問題` : "i18n 鍵檢查通過");
process.exit(bad ? 1 : 0);
