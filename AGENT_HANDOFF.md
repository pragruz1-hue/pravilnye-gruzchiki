# AGENT_HANDOFF — pravilnye-gruzchiki / pragruz.ru

**Branch:** `arena/019f4636-pravilnye-gruzchiki`  
**Date:** 2026-07-09  
**Domain:** https://pragruz.ru  
**Session constraint:** work only on this branch; open PR only when user explicitly asks.

This file is the handoff for the **next agent**. Read fully before editing.

---

## 1. Mission (user intent)

Bring the multi-city static site **Правильные Грузчики** to production quality:

- Fix bugs (404 images, empty reviews, broken footer, logo)
- Full SEO (sitemap, titles, OG, duplicates, Yandex/Google)
- Mobile: images fully visible, no text/image/float overlap
- Legal/trust (privacy, consent links)
- **Do not open PR until user says so** (user: «Прежде чем отправить на PR — обнови AGENT_HANDOFF.md»)

---

## 2. DONE in this session (do not redo blindly)

### 2.1 Initial agreed fixes
| Item | Status | Notes |
|------|--------|--------|
| Team photo `srcset` 404 in 17 cities | ✅ | `srcset="../assets/brigada-..."`; root unchanged |
| Reviews empty carousel | ✅ | `js/app.js` imports `renderReviews` + start with `localStorage.selected_city \|\| "krasnodar"`; `cityChanged` already in `reviews.js` |
| Dangling `</div></section>` after reviews | ✅ | root + 17 city indexes |
| Footer 4 columns + «Для бизнеса» | ✅ | all ~347 footers + `partials/footer.html` |
| Logo width/colors ПРАВИЛЬНЫЕ / ГРУЗЧИКИ | ✅ | CSS in `02-header-nav`, `06-responsive`, `07-project-patch` |
| City service footer addresses aligned to city index | ✅ | 288 service pages |

### 2.2 «Take everything» pass
| Item | Status | Notes |
|------|--------|--------|
| City pages `assets/` → `../assets/` (service/fleet imgs) | ✅ | 102 pages / ~612 refs; verify 0 broken |
| Telegram token removed from `server.js` | ✅ | uses `process.env.TELEGRAM_BOT_TOKEN`; **user must revoke old token in BotFather** |
| `.gitignore` + `.env` | ✅ | |
| Modal `_next` `{{BASE}}` bug | ✅ | all → `https://pragruz.ru/thank-you.html` |
| Duplicate URL canonicals | ✅ | `*/ofisnyj-pereezd.html` → `.../office-moving.html`; `*/raznorabochie.html` → `.../workers.html` |
| Krasnodar root canonical strategy | ✅ kept | `/krasnodar/loaders.html` etc. already canonical → `/loaders.html` |
| `sitemap.xml` rebuild | ✅ | **345** URLs, `lastmod` today; includes new services + blog |
| `robots.txt` | ✅ | removed aggressive `Disallow: /*?*`; thank-you + 404 disallowed |
| `thank-you.html` noindex | ✅ | |
| Open Graph + twitter:card + og:locale | ✅ | bulk; og:image absolute to CDN path |
| Title/description length trim | ✅ | titles ≤60-ish; desc ≤160 with ellipsis |
| Social Telegram/WhatsApp real links | ✅ | `t.me/+79283333281`, `wa.me/79283333281` |
| `privacy.html` + footer/form links | ✅ | 152-FZ oriented text; forms link to privacy |
| `404.html` | ✅ | |
| Mobile CSS (images, hero pad, float safe-area, review width) | ✅ | `03-sections`, `06-responsive`, `07-project-patch` |
| Skip-link + `#main` | ✅ | |
| `button type="button"` sitewide; form submits stay `type="submit"` | ✅ | 1151 submit in forms |
| AggregateRating removed from JSON-LD | ✅ | 318 pages — reduces fake-review risk |
| Junk TXT files deleted | ✅ | |
| Blog typo «вывесить» → «вывезти» | ✅ | |
| theme-color meta | ✅ | |

### 2.3 Intentionally partial / not fully done
| Item | Status | Why / next step |
|------|--------|------------------|
| Unique city content (districts, local FAQ) | ⚠️ thin | Still template + city name; needs copywriting |
| Root pages for `autsorsing` / `arenda-gazeli-*` | ⚠️ missing | Footer links to `krasnodar/...` as fallback |
| `gruzoperevozki` only at root | ⚠️ | No city clones |
| Blog articles still load `main.js` | ✅ fixed | 6 posts → `js/app.js` + `css/style.css`; duplicate `</html>` removed |
| BreadcrumbList not on all pages | ✅ mostly | City pages + many services got BreadcrumbList JSON-LD |
| Real width/height on most `<img>` | ⚠️ | CLS still possible; CSS aspect-ratio helps cards |
| Empty `alt=""` on Metrika pixel | OK leave | tracking pixel |
| Cookie banner | ❌ not built | optional RU practice |
| YML feeds date refresh | ✅ | `feed.xml` + 13 regional feeds `date=` updated |
| Custom favicon.ico / apple-touch | ✅ partial | `apple-touch-icon` → logo.png on pages; dedicated .ico still optional |
| Duplicate slug soft-redirect | ✅ | `meta refresh` + canonical on `ofisnyj-pereezd` / `raznorabochie` (34 city pages) |
| Blog broken HTML closers | ✅ | duplicate `</body></html>` removed on 6 articles |
| Blog address footer newline | ✅ | normalized Krasnodar address |
| Self-hosted fonts | ❌ | still Google Fonts |
| 301 redirects for duplicate slugs | ⚠️ | only canonical (static GH-pages may need meta refresh or host redirects) |
| PR | ❌ | **user forbade until handoff updated** |

---

## 3. Architecture cheat-sheet

```
/                       root = default Krasnodar marketing pages
/{city}/                17 cities: anapa, chelyabinsk, ekaterinburg, gelendzhik,
                        kazan, krasnodar, moscow, nn, novorossiysk, novosibirsk,
                        rostov, samara, sochi, spb, ufa, volgograd, voronezh
/blog/                  6 articles + index (legacy main.js on articles)
/css/style.css          @imports 01…10 partials
/js/app.js              ES modules entry (most pages)
/js/modules/*           geotargeting, reviews, forms, modals, calculator, …
/partials/*             header, footer, modals, metrika, … (source for build.js)
/assets/*               webp images, logo
/feeds/feed-*.xml       Yandex YML regional
build.js                assembles pages from partials ({{BASE}})
```

**City storage key:** `localStorage.selected_city`  
**Event:** `document` → `cityChanged` `{ detail: { cityCode, data } }`  
**Reviews DB:** `js/modules/reviews.js` → `REVIEWS_DB`  
**Forms:** Formspree `https://formspree.io/f/xeebjwkn`  
**Phone:** `+7 (928) 333-32-81` / `tel:+79283333281`

---

## 4. Canonical / URL policy (current)

1. **Root service pages** (`/loaders.html`, …) = primary for Krasnodar-default SEO.  
2. **`/krasnodar/{service}.html`** for core services → canonical points to **root** (already).  
3. **Other cities** → self-canonical under `/{city}/…`.  
4. **Duplicates (soft):**
   - `ofisnyj-pereezd.html` canonical → `office-moving.html` (same city)
   - `raznorabochie.html` canonical → `workers.html` (same city)
5. Prefer **English slugs** as master for office-moving / workers; Russian slug kept for old links.

If host supports redirects (not pure GH-pages static), add 301 later.

---

## 5. PRIORITY queue for NEXT agent

### P0 — verify & ship hygiene
1. **Revoke Telegram bot token** that was previously committed (see git history `server.js`). Confirm env-only deploy.
2. Visual QA mobile **320 / 375 / 414** + desktop: hero, team photo, service cards, fleet, float call button vs form submit, city selector.
3. Spot-check Formspree submit + thank-you redirect.
4. When user says **«делай PR»**: commit all, push `arena/019f4636-pravilnye-gruzchiki`, open PR → `main`.

### P1 — SEO / content depth
5. Unique intro + «районы выезда» for top cities (krasnodar, sochi, moscow, spb, rostov, novorossiysk).
6. BreadcrumbList JSON-LD on all service pages.
7. Refresh `feed.xml` + `feeds/*.xml` `date=` and offers list to match sitemap services.
8. Migrate blog articles from `main.js` → `js/app.js` + shared header/footer partials.
9. Add root landing pages or clean redirects: `autsorsing.html`, `arenda-gazeli-3m.html`.
10. Optional host-level 301 for duplicate slugs.

### P2 — UX / a11y / perf
11. Real `width`/`height` on content images (or consistent `aspect-ratio` utility classes).
12. `favicon.ico` + `apple-touch-icon.png`.
13. Cookie/consent banner if legal requires for Metrika (privacy page already exists).
14. `prefers-reduced-motion` already partially in patch — extend to marquees if needed.
15. Consider self-host Montserrat/Inter for RU latency.

### P3 — product
16. Real Telegram username (currently `t.me/+79283333281` — works as phone deep link; may want `@username`).
17. Company requisites (ИНН/ОГРН) on about/privacy when provided by client.
18. More blog posts 1200+ words; internal links to city landings.

---

## 6. Known risks / footguns

| Risk | Detail |
|------|--------|
| **Secret in git history** | Token was in `server.js`; sanitizing file ≠ removing from history. Rotate token. |
| **Static hosting & 301** | Canonical ≠ redirect; duplicates may still be crawled. |
| **Formspree single endpoint** | All forms → one form id; rate limits / spam. |
| **Geotargeting overwrites `.city-address`** | Footer addresses set per city folder; JS may still swap on city change on root pages. |
| **build.js vs baked HTML** | Many pages are pre-baked; editing only `partials/` without rebuild leaves drift. Prefer edit baked HTML **and** partials (as this session did). |
| **main.js vs app.js** | Dual stacks; blog articles outdated UX. |
| **AggregateRating removed** | Stars in UI/reviews remain; schema no longer claims rating — good for policy; re-add only with real sources. |
| **Skip-link / main wrapper** | Added programmatically; if a page already had `<main>`, only id injected. Unbalanced count currently 0 — recheck after big HTML edits. |

---

## 7. Quick verification commands

```bash
# Broken relative assets in cities (must be 0)
rg -n '(src|srcset)="assets/' --glob '*/*/*.html' -g '!blog/**' | wc -l

# Reviews wired
rg -n 'renderReviews|reviews.js' js/app.js

# Business footer
rg -l 'Для бизнеса' --glob '*.html' | wc -l

# Sitemap size
rg -c '<loc>' sitemap.xml

# Secrets
rg -n 'TELEGRAM_BOT_TOKEN = "\d' server.js || echo OK
```

---

## 8. Files most important to know

| Path | Role |
|------|------|
| `js/app.js` | App bootstrap |
| `js/modules/geotargeting.js` | Cities, `selected_city`, `cityChanged` |
| `js/modules/reviews.js` | Reviews DB + render |
| `partials/footer.html` | Footer source |
| `partials/modals.html` | Order/review modals + Formspree |
| `css/06-responsive.css` | Mobile layout / images / floats |
| `css/07-project-patch.css` | Logo polish + mobile safety + reduced-motion |
| `css/03-sections.css` | Hero, services, fleet, footer, reviews |
| `sitemap.xml` / `robots.txt` | Crawl |
| `privacy.html` / `404.html` | Legal + errors |
| `server.js` | Optional Telegram relay — **env token only** |
| `build.js` | Static page assembler |

---

## 9. User communication preferences

- Russian language.
- **Agree before large changes** when possible; this session got «берём всё».
- **No short survey UI** (hangs in their chat) — ask in plain text.
- **One PR attempt** mindset earlier; still: push only after explicit OK.
- Wants mobile images complete, no overlays of text/buttons on content.

---

## 10. Suggested first message for next agent

> Продолжи с `AGENT_HANDOFF.md`. Сначала mobile QA + revoke-token reminder. Затем P1 unique city content и blog→app.js. PR не открывать, пока пользователь не скажет.

---

## 11. Diff summary (high level)

- Hundreds of HTML files: footers, meta, assets paths, skip-links, buttons, canonicals, social, privacy links  
- `js/app.js` — reviews  
- `css/02|03|06|07` — logo + mobile + sections  
- `server.js` — token scrub  
- `sitemap.xml`, `robots.txt` — crawl  
- New: `privacy.html`, `404.html`, `AGENT_HANDOFF.md`  
- Removed: junk TXT  

---

*End of handoff. Keep this file updated when completing P1–P3 items (checkboxes above).*
