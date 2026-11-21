#!/usr/bin/env bash
# mycafe 初始化:git init → .gitignore/README/PROGRESS → 設為 public → push
# 用法: bash setup.sh [owner/repo]   (已有 origin 可省略參數)
set -euo pipefail

REPO="${1:-}"

command -v git >/dev/null || { echo "需要安裝 git"; exit 1; }
command -v gh  >/dev/null || { echo "需要安裝 gh (https://cli.github.com) 並執行 gh auth login"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "請先執行: gh auth login"; exit 1; }

# 1. git init
[ -d .git ] || git init -b main

# 2. remote
if ! git remote get-url origin >/dev/null 2>&1; then
  [ -n "$REPO" ] || { echo "尚無 origin,請帶參數: bash setup.sh owner/repo"; exit 1; }
  git remote add origin "https://github.com/${REPO}.git"
fi
REPO="$(git remote get-url origin | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"

# 3. .gitignore(public 前先擋住機密)
touch .gitignore
for p in ".env" ".env.*" "*.pem" "*.key" "node_modules/" ".DS_Store" "*.log" "dist/" "__pycache__/"; do
  grep -qxF "$p" .gitignore || echo "$p" >> .gitignore
done

# 4. README / PROGRESS
[ -f README.md ] || cat > README.md <<'EOF'
# mycafe

專案說明請寫在這裡。進度請見 [PROGRESS.md](PROGRESS.md)。
EOF

[ -f PROGRESS.md ] || cat > PROGRESS.md <<'EOF'
# 進度追蹤

## 進行中
- [ ] 

## 已完成
- [x] 建立 repo

## 下一步
- [ ] 
EOF

# 5. public 前檢查是否有敏感檔案
git add -A
if git diff --cached --name-only | grep -Ei '(^|/)(\.env|.*\.pem|.*\.key|id_rsa)' ; then
  echo "!! 上面檔案看起來是機密,已中止,請先移除再執行"
  git reset -q
  exit 1
fi

# 6. commit & push
git diff --cached --quiet || git commit -m "chore: initial setup"
git push -u origin main

# 7. 設為 public
gh repo edit "$REPO" --visibility public --accept-visibility-change-consequences

echo "完成: https://github.com/${REPO} (public)"
