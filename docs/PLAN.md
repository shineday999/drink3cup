# MyCafe — Project Plan & Progress Board

**Site:** https://mycafe.de5.net (DNS managed in Cloudflare)
**Topic:** Specialty coffee — knowledge (origins, processing, roast, brewing) + products (beans, gear).
**Origin:** Technical skeleton copied from a different private project, then fully rebranded.
**HARD RULES**
1. This repo has **no git relation** to the original (no shared history, no remote, no fork).
2. **Never** modify, push to, or deploy to the original repo / website / Cloudflare resources.
3. **Never** reuse the original's D1 / R2 / KV IDs, Pages project name, domain, emails or API keys.
4. Before every push run: `bash scripts/check-no-original-refs.sh` — it must print `CLEAN`.

## How co-workers use this file
- Pick ONE ⬜ step, change it to 🟨 + put your name + date, do it, then mark ✅ and add a line in the Log.
- Steps are small on purpose (≈ 15–60 min). Do not do two steps in one commit.
- Commit message format: `S07: translate zh-Hans home + nav`.
- Status: ⬜ todo · 🟨 in progress · ✅ done · 🟥 blocked (write why).
- Tag: 🤖 code/content work anyone can do · 👤 needs the OWNER (accounts, passwords, decisions).

## Decisions needed from owner (blocks some steps)
| # | Question | Default if no answer |
|---|----------|----------------------|
| D1 | Brand name | "MyCafe" |
| D2 | Languages to keep | zh-Hans + en first; ms-MY / id-ID later (S09) |
| D3 | Sell online (checkout) or knowledge + inquiry only | keep existing pre-order flow |
| D4 | Contact email | hello@mycafe.de5.net (needs Cloudflare Email Routing) |
| D5 | New GitHub repo name | `mycafe` |

## Steps
### Phase A — Isolation & safety
| ID | Tag | Step | Status | Owner |
|----|-----|------|--------|-------|
| S00 | 🤖 | Make isolated copy, fresh `git init`, no remote | ✅ | Claude |
| S01 | 🤖 | Replace wrangler.jsonc IDs with placeholders; fix deploy.yml, launch.json, lighthouserc, package.json names | ✅ | Claude |
| S02 | 🤖 | Delete old-brand docs/reports (held old IDs & emails) | ✅ | Claude |
| S03 | 🤖 | Add `scripts/check-no-original-refs.sh` guard + replace LICENSE/README | ⬜ | |

### Phase B — Code-level rebrand (no creative writing yet)
| ID | Tag | Step | Status | Owner |
|----|-----|------|--------|-------|
| S04 | 🤖 | Replace hard-coded emails/URLs: `src/lib/email.ts`, `src/pages/api/contact.ts`, `src/pages/api/orders/create.ts`, `src/pages/contact.astro` | ⬜ | |
| S05 | 🤖 | Site name/meta/manifest/sw.js/robots/offline.html/404/500, `Layout.astro`, `Footer.astro` | ⬜ | |
| S06 | 🤖 | Rename routes & categories: amber→`beans`, incense→`brewing`, materials→`origins`, craft→`roasting`; quiz jewelry/incense/tea→`quiz/brew-method`, `quiz/taste`; update `categories.ts`, `category-kind.ts`, `quiz.ts`, `MobileNav`, `Leaf` etc. Keep old URLs out. | ⬜ | |

### Phase C — Content (one language per step)
| ID | Tag | Step | Status | Owner |
|----|-----|------|--------|-------|
| S07 | 🤖 | `src/i18n/messages/zh-Hans.json` full rewrite for coffee | ⬜ | |
| S08 | 🤖 | `en.json` rewrite (translate from S07) | ⬜ | |
| S09 | 🤖 | `ms-MY.json` + `id-ID.json` (or remove locales per D2) | ⬜ | |
| S10 | 🤖 | Brand pages: story, beans, brewing, origins, roasting, vision, more, about | ⬜ | |
| S11 | 🤖 | Knowledge/blog seed posts (origins, washed vs natural, grind size, V60, espresso, storage) | ⬜ | |
| S12 | 🤖 | DB seeds: new `scripts/seed*.sql` + product FAQs + site_settings in migrations 0007/0009/0011/0014 | ⬜ | |
| S13 | 🤖 | Replace images in `public/images/**` (old photos belong to old brand). Use own/licensed photos only | ⬜ | |
| S14 | 🤖 | SEO: sitemap, `llms.txt`, `llms-full.txt`, schema components | ⬜ | |

### Phase D — Verify
| ID | Tag | Step | Status | Owner |
|----|-----|------|--------|-------|
| S15 | 🤖 | `pnpm install && pnpm check && pnpm test && pnpm build` all green | ⬜ | |
| S16 | 🤖 | Run guard script → `CLEAN`; grep Chinese "琥珀/香/牛马" leftovers = 0 | ⬜ | |

### Phase E — Publish (needs owner)
| ID | Tag | Step | Status | Owner |
|----|-----|------|--------|-------|
| S17 | 👤 | Create **new empty** GitHub repo (D5), no README/licence. Give push access (token or run commands below) | ⬜ | |
| S18 | 🤖/👤 | `git remote add origin <new repo>` → `git push -u origin main` | ⬜ | |
| S19 | 👤 | Cloudflare: create NEW D1 `mycafe`, R2 `mycafe-images`, 2 KV namespaces; paste IDs into `wrangler.jsonc` | ⬜ | |
| S20 | 👤 | Apply migrations to new D1: `npx wrangler d1 migrations apply mycafe --remote`, then seeds | ⬜ | |
| S21 | 👤 | Cloudflare Pages: new project `mycafe` → connect new repo; add GitHub secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (new token, scoped) | ⬜ | |
| S22 | 👤 | Pages → Custom domains → add `mycafe.de5.net` (Cloudflare creates CNAME → `mycafe.pages.dev`) | ⬜ | |
| S23 | 👤 | Create admin user + secrets (admin password/JWT secret, Resend key) — NEW values, never copied | ⬜ | |
| S24 | 🤖/👤 | Final QA on mobile + desktop, forms, admin login, emails | ⬜ | |

## Log
- 2026-11-21 Claude: S00–S02 done. Found & removed pointers to original D1/KV/R2 IDs, Pages project name `cnamber-store` in deploy.yml, and original domain in lighthouserc. Old docs removed.

## Known facts about the codebase (for newcomers)
- Astro SSR + React islands + Tailwind, Cloudflare Pages + D1 + R2 + KV, pnpm (Node ≥ 20).
- ~98 files contained old-brand words (amber jewelry/incense). Search with:
  `grep -rIlE "cnamber|牛馬|牛马|OxHorse|oxsupport|ccwu|0061qwen|shineday999|琥珀|amber|香品|incense" --exclude-dir=.git --exclude=pnpm-lock.yaml .`
- Product/category logic lives in `src/lib/categories.ts`, `category-kind.ts`, `quiz.ts`.
