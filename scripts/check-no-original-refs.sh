#!/usr/bin/env bash
# Fails if anything points at the ORIGINAL project. Run before every push.
cd "$(dirname "$0")/.."
PATTERN='cnamber|OxHorse|oxsupport|ccwu\.cc|shineday999@gmail|adbf8443|4c8f1d2d|17d4d358|牛馬|牛马|一般牛|5b26583d'
HITS=$(grep -rInE "$PATTERN" --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.astro --exclude-dir=.wrangler --exclude=pnpm-lock.yaml --exclude=check-no-original-refs.sh --exclude=PLAN.md . )
if [ -n "$HITS" ]; then echo "$HITS"; echo "NOT CLEAN: references to original project found"; exit 1; fi
if git remote -v | grep -qi cnamber; then echo "NOT CLEAN: git remote points at original"; exit 1; fi
echo CLEAN
