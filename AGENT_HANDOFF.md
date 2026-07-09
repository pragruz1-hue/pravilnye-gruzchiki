
## 2026-07-09 — RF privacy/compliance migration

- Removed all unconditional Yandex.Metrika snippets and 345 noscript tracking pixels from baked HTML.
- Analytics loads only after explicit opt-in; Webvisor and clickmap are disabled.
- Added versioned cookie choice (180 days), permanent settings/withdrawal button and `cookies.html`.
- Removed baked Formspree actions and unpkg client. JS prefers `/api/submit-lead`; while `/api/health` is unavailable it uses a temporary Formspree fallback only after a visible warning and separate checkbox.
- Added separate form consent and separate review-publication consent with version/timestamp logging.
- Replaced `server.js`: same-origin API, local NDJSON, 90-day cleanup, rate/body/origin controls, no Telegram/foreign forwarding.
- Removed IP geolocation (`ipapi.co`) and switched to URL/saved explicit city selection.
- Self-hosted Inter/Montserrat (18 WOFF2 files); removed Google Fonts requests.
- Rewrote `privacy.html`; added `consent-personal-data.html` and `consent-review-publication.html`.
- **Migration state:** current GitHub Pages cannot execute `/api/submit-lead`. Until RF deployment, forms use the explicitly disclosed Formspree fallback; this is temporary and must be removed after migration.

# AGENT_HANDOFF — pravilnye-gruzchiki / pragruz.ru

**Branch:** `arena/019f4786-pravilnye-gruzchiki`
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
| `sitemap.xml` rebuild | ✅ | **119** URLs after SEO pivot; far-city sections removed; includes intercity landing + new blog post |
| `robots.txt` | ✅ | removed aggressive `Disallow: /*?*`; thank-you + 404 disallowed; far city pages use meta noindex, not robots disallow |
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

### 2.3 July 09 SEO pivot: Krasnodar Krai only + intercity routes
| Item | Status | Notes |
|------|--------|--------|
| Multi-region SEO risk reduced | ✅ | Far city pages removed from `sitemap.xml`; only Krasnodar Krai city sections remain indexed: `krasnodar`, `anapa`, `novorossiysk`, `sochi`, `gelendzhik` |
| Far city folders phased out | ✅ | `moscow`, `spb`, `kazan`, `ekaterinburg`, `novosibirsk`, `nn`, `chelyabinsk`, `samara`, `rostov`, `ufa`, `voronezh`, `volgograd` got `meta robots="noindex, follow"` + meta refresh to `/mezhdugorodnie-pereezdy.html` |
| City selector narrowed | ✅ | Header dropdown + `js/modules/geotargeting.js` now allow only Krasnodar Krai cities; saved far city in `localStorage` resets to Краснодар |
| New intercity landing | ✅ | `/mezhdugorodnie-pereezdy.html` created: routes from Krasnodar Krai to Moscow/SPb/Rostov/etc. are presented as routes, not local branches |
| Intercity blocks on Krai pages | ✅ | Added safe “междугородние переезды” blocks to `/`, `/krasnodar/`, `/anapa/`, `/novorossiysk/`, `/sochi/`, `/gelendzhik/` |
| Blog interlinking | ✅ | New post `/blog/mezhdugorodnij-pereezd-iz-krasnodarskogo-kraya.html`; related boxes added to relevant blog posts; blog index card added |
| Footer links | ✅ | `Междугородние переезды` added to baked footers and `partials/footer.html` |
| YML feeds cleaned | ✅ | Deleted far-region feeds; left `feed.xml` and `feeds/feed-krasnodarskiy-krai.xml`; `feed.xml` no longer contains far-city offers/sets |
| Yandex.Metrika consent gate | ✅ | No static counter/pixel. Counter loads dynamically only after explicit analytics opt-in; Webvisor/clickmap disabled. |
| Build-breaking invalid image syntax | ✅ | Fixed `<img ... / width=...>` → valid `<img ... width=...>` |
| Thank-you page cleanup | ✅ | Rebuilt `thank-you.html` to remove duplicated footer/modal/floating buttons/scripts and duplicate `scrollTopBtn` |
| Blog duplicate `<main>` cleanup | ✅ | Removed nested duplicate `<main>` wrappers from 5 legacy blog posts; structural check now reports 0 duplicate IDs and 0 duplicate `<main>` on real pages |
| Verification | ✅ | `npm run build` passes; local HTTP smoke test on `/`, `/mezhdugorodnie-pereezdy.html`, blog, `thank-you.html`, `/anapa/`, `/moscow/` returned 200; internal link check found 0 missing links; duplicate ID/metrika/main structural check found 0 issues |

### 2.4 Intentionally partial / not fully done
| Item | Status | Why / next step |
|------|--------|------------------|
| Unique city content (districts, local FAQ) | ⚠️ thin | Still template + city name; needs copywriting |
| Root pages for `autsorsing` / `arenda-gazeli-*` | ⚠️ missing | Footer links to `krasnodar/...` as fallback |
| `gruzoperevozki` only at root | ⚠️ | No city clones |
| Blog articles still load `main.js` | ✅ fixed | 7 posts → `js/app.js` + `css/style.css`; duplicate `</html>` removed |
| BreadcrumbList not on all pages | ✅ mostly | City pages + many services got BreadcrumbList JSON-LD |
| Real width/height on most `<img>` | ⚠️ | CLS still possible; CSS aspect-ratio helps cards |
| Metrika noscript pixel | ✅ removed | It bypassed consent. |
| Cookie consent manager | ✅ | Dynamic on every real page; versioned choice, 180-day renewal, permanent settings button. |
| YML feeds | ✅ | Far-region feeds deleted; left main `feed.xml` + `feeds/feed-krasnodarskiy-krai.xml` |
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
/{city}/                Indexed/selector cities: krasnodar, anapa, novorossiysk, sochi, gelendzhik.
                        Far-city legacy folders still exist but are `noindex, follow` + meta-refresh to intercity landing.
/mezhdugorodnie-pereezdy.html
                        Intercity moving landing: Moscow/SPb/Rostov/etc. are route destinations, not local филиалы.
/blog/                  7 articles + index; all real pages use `js/app.js` and `css/style.css`
/css/style.css          @imports 01…10 partials
/js/app.js              ES modules entry (most pages)
/js/modules/*           geotargeting, reviews, forms, modals, calculator, …
/partials/*             header, footer, modals, metrika, … (reference/source for baked HTML)
/assets/*               webp images, logo
/feeds/feed-krasnodarskiy-krai.xml  Yandex YML regional feed for Краснодарский край
fix-site.js             idempotent one-off cleaner (dedupe review-modal,
                        rebuild broken <main> structure, unique FAQ, schema fixes)
```

**City storage key:** `localStorage.selected_city`
**Event:** `document` → `cityChanged` `{ detail: { cityCode, data } }`
**Reviews DB:** `js/modules/reviews.js` → `REVIEWS_DB`
**Forms:** RF `/api/submit-lead` preferred; disclosed Formspree fallback during migration
**Phone:** `+7 (928) 333-32-81` / `tel:+79283333281`

---

## 4. Canonical / URL policy (current)

1. **Root service pages** (`/loaders.html`, …) = primary for Krasnodar-default SEO.
2. **`/krasnodar/{service}.html`** for core services → canonical points to **root** (already).
3. **Indexed city folders now only Краснодарский край** (`krasnodar`, `anapa`, `novorossiysk`, `sochi`, `gelendzhik`). Far legacy folders are phased out with `noindex, follow` + meta refresh to `/mezhdugorodnie-pereezdy.html`.
4. **Distant cities in copy** should be used only as route destinations (e.g. “Анапа → Москва”), not as local филиалы.
5. **Duplicates (soft):**
   - `ofisnyj-pereezd.html` canonical → `office-moving.html` (same city)
   - `raznorabochie.html` canonical → `workers.html` (same city)
6. Prefer **English slugs** as master for office-moving / workers; Russian slug kept for old links.

If host supports redirects (not pure GH-pages static), add 301 later.

---

## 5. PRIORITY queue for NEXT agent

### P0 — verify & ship hygiene
1. **Revoke Telegram bot token** that was previously committed (see git history `server.js`). Confirm env-only deploy.
2. Visual QA mobile **320 / 375 / 414** + desktop: hero, team photo, service cards, fleet, float call button vs form submit, city selector.
3. Deploy on a server physically located in РФ; spot-check same-origin `/api/submit-lead` and local NDJSON storage.
4. When user says **«делай PR»**: commit all, push `arena/019f4786-pravilnye-gruzchiki`, open PR → `main`.

### P1 — SEO / content depth
5. Unique intro + «районы выезда» for indexed Krai cities only (krasnodar, anapa, novorossiysk, sochi, gelendzhik). Do **not** rebuild fake local pages for Moscow/SPb/etc.
6. BreadcrumbList JSON-LD on all service pages.
7. Keep `feed.xml` + `feeds/feed-krasnodarskiy-krai.xml` aligned with Krai-only sitemap; do not restore far-region feeds unless real филиалы appear.
8. Blog articles already use `js/app.js`; optional next step is to normalize all blog headers/footers from shared partials.
9. Add root landing pages or clean redirects: `autsorsing.html`, `arenda-gazeli-3m.html`.
10. Optional host-level 301 for duplicate slugs.

### P2 — UX / a11y / perf
11. Real `width`/`height` on content images (or consistent `aspect-ratio` utility classes).
12. `favicon.ico` + `apple-touch-icon.png`.
13. Cookie/consent completed: delayed Metrika, settings/withdrawal, cookie policy.
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
| **Lead endpoint migration** | RF endpoint preferred; temporary disclosed Formspree fallback remains until deployment. |
| **Geotargeting overwrites `.city-address`** | Footer addresses set per city folder; JS may still swap on city change on root pages. |
| **No build.js anymore** | `build.js` was removed — its `buildCityPage()` was the source of `<main>` accumulation and review-modal duplication across re-builds. Pages are now self-contained baked HTML. `partials/` are reference only; editing them does NOT propagate (edit baked HTML directly, or re-run `fix-site.js` patterns). |
| **main.js legacy file** | `main.js` still exists but real pages checked now use `js/app.js`; avoid reintroducing legacy stack. |
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
rg -n 'formspree|api\.telegram|ipapi\.co' server.js js || echo OK
```

---

## 8. Files most important to know

| Path | Role |
|------|------|
| `js/app.js` | App bootstrap |
| `js/modules/geotargeting.js` | Cities, `selected_city`, `cityChanged` |
| `js/modules/reviews.js` | Reviews DB + render |
| `partials/footer.html` | Footer source |
| `partials/modals.html` | Order/review modals + same-origin forms |
| `css/06-responsive.css` | Mobile layout / images / floats |
| `css/07-project-patch.css` | Logo polish + mobile safety + reduced-motion |
| `css/03-sections.css` | Hero, services, fleet, footer, reviews |
| `sitemap.xml` / `robots.txt` | Crawl |
| `privacy.html` / `404.html` | Legal + errors |
| `server.js` | Optional Telegram relay — **env token only** |
| `fix-site.js` | Idempotent site cleaner (review-modal dedupe, FAQ, schema) |

---

## 9. User communication preferences

- Russian language.
- **Agree before large changes** when possible; this session got «берём всё».
- **No short survey UI** (hangs in their chat) — ask in plain text.
- **One PR attempt** mindset earlier; still: push only after explicit OK.
- Wants mobile images complete, no overlays of text/buttons on content.

---

## 10. Suggested first message for next agent

> Продолжи с `AGENT_HANDOFF.md`. Сначала проверь перенос production с GitHub Pages на российский VPS: формы требуют same-origin `/api/submit-lead`. PR не открывать, пока пользователь не скажет.

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

## 12. Changes in arena/019f4674-pravilnye-gruzchiki session (2026-07-09)

### New improvements

| Item | Status | Notes |
|------|--------|-------|
| **Self-hosted fonts CSS** | ✅ | `css/00-fonts.css` — Inter + Montserrat @font-face rules with `font-display: swap`; only cyrillic + latin subsets; comments with local paths ready for when woff2 files are downloaded |
| **index.html → removed Google Fonts link** | ✅ | Now uses local `css/style.css` which imports `00-fonts.css`; Google Fonts link replaced with preconnect hints; fallback still works via CDN |
| **Broken HTML in contacts section** | ✅ | Fixed unclosed `<p>` tag before nested `<div>` in index.html contacts |
| **Empty hero feature icon** | ✅ | Added missing emoji 📄 to "Работа с юрлицами" feature |
| **Broken `extended_gazelle` file** | ✅ | Deleted 1-byte junk file from `/assets/` |
| **Cookie consent manager** | ✅ | UI создаётся из JS на всех страницах; Метрика не загружается до opt-in; постоянные настройки и отзыв. |
| **Form submission spinners** | ✅ | `showButtonSpinner`/`hideButtonSpinner` in forms.js; added to modal form, main form, review form, exit-intent form |
| **aspect-ratio CSS вместо width/height на 350+ страницах** | ✅ | CSS `aspect-ratio` rules для `.service-image-box` (16/10), `.fleet-img-box` (3/2), `.pg-team-photo-wrapper` (3/1), `.review-avatar-img` — применяется ко всем 350+ страницам без правки HTML |
| **SVG favicon** | ✅ | Uses `assets/favicon.svg` (ПГ logo) + PNG fallback |
| **Web manifest** | ✅ | `manifest.json` for PWA-like behavior |
| **Logo.png сжат** | ✅ | 1,045 KB → 76 KB (93% экономии) через ImageMagick |
| **Mobile CSS improvements** | ✅ | Cookie banner styles; form spinner styles; toast animation; hero feature icons with background |
| **FONTS_SETUP.md** | ✅ | Detailed instructions for manual font download |

### Fixed files

- `index.html` — local fonts, dynamic consent UI, same-origin forms, spinner
- `css/00-fonts.css` — **NEW** self-hosted fonts with `@font-face` + local path comments
- `css/style.css` — imports 00-fonts.css
- `css/07-project-patch.css` — cookie banner, spinner, aspect-ratio, mobile improvements
- `js/modules/forms.js` — consent-gated Metrika, separate PD consent, same-origin lead submit, spinner/toasts
- `js/modules/modals.js` — spinner on all form submissions
- `js/app.js` — initializes consent manager before the rest of the UI
- `partials/floating-buttons.html` — floating controls; consent UI is injected centrally
- `manifest.json` — **NEW** PWA manifest
- `assets/extended_gazelle` — **DELETED** (1-byte junk)
- `assets/logo.png` — **COMPRESSED** 1070KB → 76KB
- `FONTS_SETUP.md` — **NEW** font download instructions

### Still to do (for next agent)

1. **Revoke Telegram token** in git history, create new one
2. **Download woff2 files** — follow `FONTS_SETUP.md`, put files in `assets/fonts/`, then uncomment local `src` lines in `css/00-fonts.css`
3. **Mobile QA on real devices** — 320 / 375 / 414 / 768
4. **Unique city content** — districts, local FAQ, prices per city

*End of handoff. Keep this file updated when completing P1–P3 items (checkboxes above).*

---

## 13. Changes in arena/019f4754-pravilnye-gruzchiki session (2026-07-09)

### Cleanup + unique FAQ + schema fixes (`fix-site.js`, idempotent)

| Item | Status | Notes |
|------|--------|-------|
| **Dedup review-modal** | ✅ | Removed from all service pages (root + city). Left ONLY on 18 index pages (root + 17 cities) where the `open-review-btn` trigger exists. Elsewhere it was unreachable dead code. |
| **Rebuild broken city service HTML** | ✅ | 306 city service pages: 1× `<main id="main">`, 1× header, footer outside main, 1× order-modal/app.js/same-origin form endpoint. |
| **AI phrase removed** | ✅ | "Не стали создавать отдельные однотипные страницы…" → neutral phrasing in 18 `loaders.html`. |
| **Unique FAQ per city×service** | ✅ | 336 pages: HTML accordion + `FAQPage` JSON-LD **synchronized** (0 mismatches). Two markups supported: `.faq-accordion-box` and details (`u-style-075`). Districts/delivery/local specifics per city. |
| **Schema fixes** | ✅ | `LocalBusiness.url` → `/{city}/{service}.html`; `keywords "грузчики краснодар"` → actual city. |
| **`build.js` deleted** | ✅ | It was the root cause of HTML corruption (`buildCityPage` re-wrapped pages on each run). `package.json` build script → `vite build` only. Pages are now self-contained baked HTML. |

**Commit stats:** 340 files changed, +18 186 / −116 536 lines (removed ~98k lines of accumulated duplication).

### Still relevant (do NOT reintroduce build.js)
- `partials/modals.html` still contains `review-modal` — it is reference only now; do NOT inject into all pages.
- If a rebuild of pages is ever needed, use targeted scripts (like `fix-site.js` patterns), never the old monolithic assembler.
- Superseded later in this session: 2× `<main>` on 5 blog posts was fixed; latest structural check reports 0 duplicate `<main>`/IDs on real pages. Recheck after large HTML edits.
