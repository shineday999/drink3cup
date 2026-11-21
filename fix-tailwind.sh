#!/usr/bin/env bash
# 自動遷移 @astrojs/tailwind → tailwindcss v4 (@tailwindcss/vite),安裝 prettier,build,再跑 setup.sh
# 所有修改前會備份到 .backup-tailwind/
set -euo pipefail

[ -f package.json ] || { echo "找不到 package.json,請在專案根目錄執行"; exit 1; }

mkdir -p .backup-tailwind
cp package.json .backup-tailwind/ 2>/dev/null || true
cp package-lock.json .backup-tailwind/ 2>/dev/null || true
for f in astro.config.*; do [ -f "$f" ] && cp "$f" .backup-tailwind/; done
for f in tailwind.config.*; do [ -f "$f" ] && cp "$f" .backup-tailwind/; done

echo "==> 安裝依賴"
npm uninstall @astrojs/tailwind --legacy-peer-deps || true
npm i -D tailwindcss @tailwindcss/vite prettier --legacy-peer-deps

echo "==> 自動修改設定檔"
node - <<'NODE'
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p, out); }
    else out.push(p);
  }
  return out;
}
const rel = (from, to) => {
  let r = path.relative(path.dirname(from), to).split(path.sep).join('/');
  return r.startsWith('.') ? r : './' + r;
};

// ---- astro.config ----
const cfgPath = ['astro.config.mjs', 'astro.config.ts', 'astro.config.js'].find(fs.existsSync);
if (!cfgPath) { console.error('找不到 astro.config.*'); process.exit(1); }
let cfg = fs.readFileSync(cfgPath, 'utf8');

cfg = cfg.replace(/^\s*import\s+\w+\s+from\s+['"]@astrojs\/tailwind['"];?\s*\n/m, '');
cfg = cfg.replace(/\btailwind\s*\([^)]*\)\s*,?\s*/g, '');
cfg = cfg.replace(/integrations\s*:\s*\[\s*,?\s*\]\s*,?\s*\n?/g, '');

if (!/@tailwindcss\/vite/.test(cfg)) {
  cfg = cfg.replace(/(\n?)(export\s+default)/, `\nimport tailwindcss from '@tailwindcss/vite';\n$2`);
  // import 放到最後一個 import 之後
  const imports = [...cfg.matchAll(/^import .*$/gm)];
  if (imports.length > 1) {
    cfg = cfg.replace(/\nimport tailwindcss from '@tailwindcss\/vite';\n/, '\n');
    const last = [...cfg.matchAll(/^import .*$/gm)].pop();
    const idx = last.index + last[0].length;
    cfg = cfg.slice(0, idx) + `\nimport tailwindcss from '@tailwindcss/vite';` + cfg.slice(idx);
  }
  if (/vite\s*:\s*\{/.test(cfg)) {
    if (/plugins\s*:\s*\[/.test(cfg.slice(cfg.search(/vite\s*:\s*\{/)))) {
      cfg = cfg.replace(/(vite\s*:\s*\{[\s\S]*?plugins\s*:\s*\[)/, '$1tailwindcss(), ');
    } else {
      cfg = cfg.replace(/(vite\s*:\s*\{)/, '$1\n    plugins: [tailwindcss()],');
    }
  } else {
    cfg = cfg.replace(/defineConfig\(\s*\{/, 'defineConfig({\n  vite: { plugins: [tailwindcss()] },');
  }
}
fs.writeFileSync(cfgPath, cfg);
console.log('已更新', cfgPath);

// ---- CSS ----
const twCfg = ['tailwind.config.mjs', 'tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.ts'].find(fs.existsSync);
const cssFiles = walk('src').filter(f => /\.(css|pcss)$/.test(f));
let target = cssFiles.find(f => /@tailwind\s+base/.test(fs.readFileSync(f, 'utf8')));

if (target) {
  let css = fs.readFileSync(target, 'utf8');
  css = css.replace(/@tailwind\s+(base|components|utilities)\s*;?\s*\n?/g, '');
  let head = '@import "tailwindcss";\n';
  if (twCfg) head += `@config "${rel(target, twCfg)}";\n`;
  css = head + '\n' + css.trimStart();
  fs.writeFileSync(target, css);
  console.log('已更新', target);
} else if (!cssFiles.some(f => /@import\s+["']tailwindcss["']/.test(fs.readFileSync(f, 'utf8')))) {
  target = 'src/styles/global.css';
  fs.mkdirSync(path.dirname(target), { recursive: true });
  let head = '@import "tailwindcss";\n';
  if (twCfg) head += `@config "${rel(target, twCfg)}";\n`;
  fs.writeFileSync(target, head);
  const layout = walk('src/layouts').find(f => f.endsWith('.astro'));
  if (layout) {
    let s = fs.readFileSync(layout, 'utf8');
    const imp = `import '${rel(layout, target)}';`;
    if (s.startsWith('---')) s = s.replace(/^---\s*\n/, `---\n${imp}\n`);
    else s = `---\n${imp}\n---\n` + s;
    fs.writeFileSync(layout, s);
    console.log('已建立', target, '並匯入至', layout);
  } else {
    console.log('已建立', target, '(找不到 layout,未自動匯入)');
  }
}
NODE

echo "==> prettier 格式化"
npx prettier --write . --ignore-unknown >/dev/null 2>&1 || true

echo "==> build 驗證"
npm run build

echo "==> 初始化 repo 並 push"
bash setup.sh shineday999/mycafe
