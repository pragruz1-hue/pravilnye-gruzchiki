#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bento+Medium blog redesign — transforms all 20 blog article pages to the
approved concept C layout. Safe to re-run: skips files already transformed.
Keeps: content text, H1-H3 hierarchy, schema.org, canonical, data-service attrs.
"""
import re, glob, sys
from urllib.parse import quote

BLOG = "blog"
SITE = "https://pragruz.ru"

# slug -> (tag_latin, tag_display, img, date_display, minutes)
DATA = {
    "mezhdugorodnij-pereezd-iz-krasnodarskogo-kraya":            ("mezh",      "Междугородние", "../assets/blog/mezhdugorodnij-pereezd.jpg",  "9 июля 2026",  "6"),
    "kak-vybrat-gruzchikov-v-krasnodare":                        ("soveti",    "Советы",         "../assets/blog/kak-vybrat-gruzchikov.jpg",   "22 июня 2026", "4"),
    "kak-podgotovitsya-k-kvartirnomu-pereezdu":                  ("pereezd",   "Переезд",        "../assets/blog/kvartirnyj-pereezd.jpg",      "28 июня 2026", "5"),
    "pravila-upakovki-mebeli-pri-pereezde":                      ("upakovka",  "Упаковка",       "../assets/blog/upakovka-mebeli.jpg",         "30 июня 2026", "4"),
    "kak-vybrat-mashinu-dlya-perevozki-veshchey":                ("transport", "Транспорт",      "../assets/blog/vybor-mashiny.jpg",           "3 июля 2026",  "4"),
    "osobennosti-ofisnogo-pereezda-bez-pauzy":                   ("biznes",    "Бизнес",         "../assets/blog/ofisnyj-pereezd.jpg",         "5 июля 2026",  "5"),
    "kak-vyvesti-stroitelnyj-musor-zakonno":                     ("zakon",     "Закон",          "../assets/blog/stroitelnyj-musor.jpg",       "8 июля 2026",  "4"),
    "gruzchiki-na-chas-ili-na-smenu-chto-vygodnee":              ("sravn",     "Сравнение",      "../assets/blog/gruzchiki-chas-smena.jpg",    "10 июля 2026", "7"),
    "osobennosti-pereezda-v-sochi-relef-propuska-parkovki":      ("local",     "Локальное",      "../assets/blog/pereezd-sochi.jpg",           "8 июля 2026",  "8"),
    "kak-razobrat-i-sobrat-shkaf-kupe-pri-pereezde":             ("instr",     "Инструкция",     "../assets/blog/shkaf-kupe.jpg",              "5 июля 2026",  "8"),
    "tseny-na-gruzchikov-v-krasnodare-obzor-2026":               ("ceny",      "Цены",           "../assets/brigada-gruzchikov-krasnodar.webp","1 июля 2026",  "9"),
    "kak-upakovat-khrupkie-veshchi-pri-pereezde-posuda-zerkala-tekhnika": ("upakovka", "Упаковка", "../assets/service-kvartirniy-pereezd.webp", "28 июня 2026", "9"),
    "pereezd-v-anape-kurortnyj-sezon-uzkie-ulitsy-parkovki":     ("local",     "Локальное",      "../assets/feed/anapa_moving.webp",           "10 июля 2026", "9"),
    "pereezd-v-novorossijske-nord-ost-port-tsementnaya-pyl":     ("local",     "Локальное",      "../assets/feed/novorossiysk_moving.webp",    "11 июля 2026", "9"),
    "pereezd-v-gelendzhike-sklony-uzkie-dorogi-sezonnost":       ("local",     "Локальное",      "../assets/feed/gelendzhik_moving.webp",      "12 июля 2026", "8"),
    "gazel-3-metra-ili-udlinennaya-kak-vybrat":                  ("sravn",     "Сравнение",      "../assets/fleet-gazel-4.2m.webp",            "8 июля 2026",  "7"),
    "zimnij-pereezd-chto-uchest-pri-minusovoj-temperature":      ("soveti",    "Советы",         "../assets/pereezd.webp",                     "9 июля 2026",  "8"),
    "kak-my-perevezli-ofis-na-40-sotrudnikov-za-vyhodnye":       ("keys",      "Кейс",           "../assets/blog/ofisnyj-pereezd.jpg",         "6 июля 2026",  "10"),
    "kak-razobrat-i-sobrat-kuhnyu-pri-pereezde":                 ("instr",     "Инструкция",     "../assets/service-sborka-mebeli.webp",       "7 июля 2026",  "9"),
    "autsorsing-raznorabochih-kogda-vygodnee-nanyat-so-storony": ("biznes",    "Бизнес",         "../assets/service-autsorsing.webp",          "13 июля 2026", "8"),
}

TITLE = {}   # slug -> plain h1
MONTHS = {"января":1,"февраля":2,"марта":3,"апреля":4,"мая":5,"июня":6,"июля":7,"августа":8,"сентября":9,"октября":10,"ноября":11,"декабря":12}

def date_key(s):
    m = re.match(r"\s*(\d+)\s+(\w+)\s+(\d+)", s)
    if not m: return (2026, 1, 1)
    return (int(m.group(3)), MONTHS.get(m.group(2), 1), int(m.group(1)))

def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s, flags=re.S).strip()

def esc_attr(s):
    return s.replace('"', "&quot;")

SVG_BACK  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>'
SVG_TG    = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3L18.9 19c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6L18.5 7c.4-.3-.1-.5-.5-.2L7.4 13.1 2.9 11.7c-1-.3-1-1 .2-1.4l17.5-6.7c.8-.3 1.5.2 1.3.7z"/></svg>'
SVG_WA    = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.2-.7l.5-.6c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.1 2.2-.2 3.9a11.4 11.4 0 0 0 4.6 4.3c1.7.8 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.1-.5-.2z"/></svg>'
SVG_LINK  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'

def classify_label(label):
    l = label.lower()
    if "важно" in l: return "warn"
    if "пример" in l or "расч" in l: return "case"
    return "tip"

def transform_h2s(content, fname):
    """Normalize numbered H2s, add anchors, collect list for TLDR."""
    items = []
    def repl_span(m):
        num, title = m.group(1).strip(), m.group(2).strip()
        items.append((num, strip_tags(title)))
        return f'<h2 id="s{num}"><span class="n">{num}.</span> {title}</h2>'
    content = re.sub(r"<h2><span class=\"h2-num\">\s*(\d+)\s*</span>(.*?)</h2>", repl_span, content, flags=re.S)
    def repl_plain(m):
        num, title = m.group(1).strip(), m.group(2).strip()
        items.append((num, strip_tags(title)))
        return f'<h2 id="s{num}"><span class="n">{num}.</span> {title}</h2>'
    # plain-numbered h2 (no span) but not blog-services-title (it has a class attr)
    content = re.sub(r"<h2>(\d+)\.\s*(.*?)</h2>", repl_plain, content, flags=re.S)
    return content, items

def transform_hb(content):
    """highlight-box -> color-coded .blk by label."""
    def repl(m):
        label = m.group(1).strip().rstrip(":")
        rest = m.group(2).strip()
        kind = classify_label(label)
        return (f'<div class="blk blk-{kind}"><span class="t">{label}</span>'
                f'<p>{rest}</p></div>')
    return re.sub(
        r'<div class="highlight-box">\s*<p>\s*[💡📋]\s*<strong>([^<]+)</strong>\s*(.*?)</p>\s*</div>',
        repl, content, flags=re.S)

def transform_tables(content):
    # strip inline styles within tables, add class
    def clean(m):
        tag = m.group(0)
        tag = re.sub(r'\s*style="[^"]*"', "", tag)
        return tag
    content = re.sub(r"<(?:table|thead|tbody|tr|th|td)(?:\s[^>]*)?>", clean, content)
    content = content.replace("<table>", '<table class="post-table">')
    return content

def main():
    files = [f for f in glob.glob(f"{BLOG}/*.html") if not f.endswith("index.html")]
    # first pass: collect titles
    for f in files:
        h = open(f, encoding="utf-8").read()
        slug = f[len(BLOG)+1:-5]
        m = re.search(r"<h1>(.*?)</h1>", h, re.S)
        TITLE[slug] = strip_tags(m.group(1)) if m else slug

    order = sorted(DATA.keys(), key=lambda s: date_key(DATA[s][3]), reverse=True)

    # related map: same tag first (recent), then global recent
    rel = {}
    for slug in order:
        same = [s for s in order if s != slug and DATA[s][0] == DATA[slug][0]][:1]
        rest = [s for s in order if s != slug and s not in same][:2]
        picks = (same + rest)[:2]
        rel[slug] = picks

    done, skipped = 0, []
    for f in files:
        slug = f[len(BLOG)+1:-5]
        h = open(f, encoding="utf-8").read()

        if 'class="railzone container"' in h:
            skipped.append(slug); continue

        tag_lat, tag_ru, img, date_s, mins = DATA[slug]
        title_plain = TITLE[slug]

        # meta extras
        views_m = re.search(r"👁\s*([^<]+?)\s*<", h)
        views = views_m.group(1).strip() if views_m else None
        mins_m = re.search(r"⏱\s*(\d+\s*мин)", h)
        mins_txt = mins_m.group(1) if mins_m else f"{mins} мин"

        # cover image + alt
        cover_m = re.search(r'article-featured-media[^>]*>\s*<img\s+src="([^"]+)"\s+alt="([^"]*)"', h, re.S)
        cover_src = cover_m.group(1) if cover_m else img
        cover_alt = cover_m.group(2) if cover_m else title_plain

        # canonical for sharing
        can_m = re.search(r'<link rel="canonical" href="([^"]+)"', h)
        canon = can_m.group(1) if can_m else f"{SITE}/blog/{slug}.html"

        # article body content
        body_m = re.search(r'<section class="article-body">(.*?)</section>', h, re.S)
        if not body_m:
            print(f"!! no article-body in {slug}"); continue
        content = body_m.group(1)
        content = re.sub(r"^\s*<div class=\"container\">", "", content)
        content = re.sub(r"</div>\s*$", "", content)

        # first paragraph -> standfirst
        stand = ""
        p_m = re.match(r"\s*<p>(.*?)</p>", content, re.S)
        if p_m:
            txt = strip_tags(p_m.group(1))
            if 60 <= len(txt) <= 340:
                stand = f'<p class="stand">{p_m.group(1).strip()}</p>'
                content = content[p_m.end():]

        content, h2_items = transform_h2s(content, f)
        content = transform_hb(content)
        content = transform_tables(content)
        content = re.sub(r'<div class="article-nav">.*?</div>', "", content, flags=re.S)
        content = content.strip()

        # TLDR
        tldr_links = "\n".join(
            f'          <li><a href="#s{n}">{t}</a></li>' for n, t in h2_items)
        tldr = ""
        if h2_items:
            tldr = f'''
      <div class="tldr">
        <h6>Коротко о статье</h6>
        <ul>
{tldr_links}
        </ul>
        <div class="tldr-foot">{mins_txt} чтения · {len(h2_items)} разделов · плюс чек-листы и цены ниже по тексту</div>
      </div>'''

        views_part = f" · {views} просмотров" if views else ""
        new_main = f'''<main id="main">
  <div class="railzone container">
    <aside class="rail" aria-label="Действия со статьёй">
      <a href="index.html" title="Все статьи блога" aria-label="Все статьи блога">{SVG_BACK}</a>
      <a href="https://t.me/share/url?url={quote(canon)}&text={quote(title_plain)}" target="_blank" rel="noopener noreferrer" title="Поделиться в Telegram" aria-label="Поделиться в Telegram">{SVG_TG}</a>
      <a href="https://wa.me/?text={quote(title_plain + " — " + canon)}" target="_blank" rel="noopener noreferrer" title="Поделиться в WhatsApp" aria-label="Поделиться в WhatsApp">{SVG_WA}</a>
      <button type="button" data-copy="{esc_attr(canon)}" title="Скопировать ссылку" aria-label="Скопировать ссылку">{SVG_LINK}</button>
      <div class="ring" data-p="0%" aria-hidden="true"></div>
      <span class="copied-note">Ссылка скопирована</span>
    </aside>

    <div class="col">
      <a class="backlink" href="index.html">← Все статьи блога</a>
      <span class="rub-chip">{tag_ru}</span>
      <h1>{title_plain}</h1>
      {stand}
      <div class="meta-row">
        <span class="av" aria-hidden="true">ПГ</span>
        <div class="who"><b>Редакция «Правильных Грузчиков»</b><span>{date_s} · {mins_txt} чтения{views_part} · проверено директором компании</span></div>
        <a class="flw" href="index.html">Все статьи</a>
      </div>

      <figure class="bigcover">
        <div class="imgw"><img src="{cover_src}" alt="{esc_attr(cover_alt)}" width="860" height="480" loading="eager" fetchpriority="high"></div>
      </figure>
{tldr}

      <article class="post">
{content}
      </article>

      <div class="done"><span class="cir" aria-hidden="true">✓</span><div><b>Вы дочитали до конца</b><span>Сохраните статью или поделитесь — кнопки слева</span></div></div>

      <div class="author-c">
        <span class="av" aria-hidden="true">ПГ</span>
        <div><b>Редакция «Правильных Грузчиков»</b><p>Материал проверен директором компании. 5 000+ переездов и разгрузок с 2014 года в Краснодаре и крае.</p></div>
      </div>

      <div class="more">
        <h5>Дальше по теме</h5>
        <div class="more-grid">
{chr(10).join(f'          <a class="more-card" href="{s}.html"><div class="im"><img src="{DATA[s][2]}" alt="{esc_attr(TITLE[s])}" width="400" height="210" loading="lazy"></div><div class="bd"><span class="rub">{DATA[s][1]}</span><h4>{TITLE[s]}</h4></div></a>' for s in rel[slug])}
        </div>
      </div>

      <nav class="pn-nav" aria-label="Навигация по статьям">
{pn_nav(slug, order)}
      </nav>
    </div>
  </div>
</main>'''

        # replace <main>...</main>
        h2 = re.sub(r"<main[^>]*>.*?</main>", lambda m: new_main, h, flags=re.S, count=1)
        if h2 == h:
            print(f"!! main not replaced in {slug}"); continue

        # add article js before app.js
        if "blog-article.js" not in h2:
            h2 = h2.replace('<script type="module" src="../js/app.js"></script>',
                            '<script src="../js/blog-article.js" defer></script>\n<script type="module" src="../js/app.js"></script>', 1)

        open(f, "w", encoding="utf-8").write(h2)
        done += 1
        print(f"OK {slug}  (h2: {len(h2_items)}, stand: {'yes' if stand else 'no'})")

    print(f"\ntransformed: {done}, skipped (already): {len(skipped)}")

def pn_nav(slug, order):
    i = order.index(slug)
    newer = order[i-1] if i > 0 else None
    older = order[i+1] if i < len(order)-1 else None
    parts = []
    if older:
        parts.append(f'        <a href="{older}.html" class="prev"><span>← Предыдущая статья</span><b>{TITLE[older]}</b></a>')
    if newer:
        parts.append(f'        <a href="{newer}.html" class="next"><span>Следующая статья →</span><b>{TITLE[newer]}</b></a>')
    if not parts:
        parts.append('        <a href="index.html" class="alone"><span>Все статьи блога</span></a>')
    return "\n".join(parts)

if __name__ == "__main__":
    sys.exit(main())
