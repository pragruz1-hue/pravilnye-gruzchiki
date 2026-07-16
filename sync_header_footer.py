from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CITY_CODES = ["krasnodar", "anapa", "novorossiysk", "sochi", "gelendzhik"]
CITY_SET = set(CITY_CODES)

CITY_META = {
    "krasnodar": {
        "label": "Краснодар",
        "address": "350004, г. Краснодар, ул. Кропоткина, д. 50, офис 339",
    },
    "anapa": {
        "label": "Анапа",
        "address": "353440, г. Анапа, ул. Крымская, д. 177, офис 12",
    },
    "novorossiysk": {
        "label": "Новороссийск",
        "address": "353900, г. Новороссийск, ул. Советов, д. 42, офис 18",
    },
    "sochi": {
        "label": "Сочи / Адлер / Сириус",
        "address": "354340, г. Сочи, Адлерский район, ул. Кирова, д. 58, офис 7",
    },
    "gelendzhik": {
        "label": "Геленджик",
        "address": "353460, г. Геленджик, ул. Луначарского, д. 6, офис 21",
    },
}

CITY_SERVICE_PATHS = {
    "loaders": "loaders.html",
    "workers": "raznorabochie.html",
    "moving": "kvartirnyj-pereezd.html",
    "office-moving": "ofisnyj-pereezd.html",
    "rigging": "rigging.html",
    "furniture": "furniture.html",
    "autsorsing": "autsorsing.html",
    "shift": "gruzchiki-na-smenu.html",
    "gazel-3m": "arenda-gazeli-3m.html",
}

LEGAL_PAGES = {
    Path("privacy.html"),
    Path("cookies.html"),
    Path("consent-personal-data.html"),
    Path("consent-review-publication.html"),
}

EXCLUDED_FILES = {
    Path("404.html"),
    Path("preview-homepage-redesign.html"),
}

EXCLUDED_PREFIXES = {
    "partials",
    "pages",
    "blog-redesign-preview",
}


def is_redirect_stub(text: str) -> bool:
    return '<meta http-equiv="refresh"' in text and "Страница переехала" in text


def should_process(page: Path, text: str) -> bool:
    if page in EXCLUDED_FILES:
        return False
    if page.parts and page.parts[0] in EXCLUDED_PREFIXES:
        return False
    if page.name.startswith("yandex_"):
        return False
    if is_redirect_stub(text):
        return False
    if page.suffix != ".html":
        return False
    return (
        "main-header" in text
        or "site-footer" in text
        or page in LEGAL_PAGES
        or page.parts[:1] == ("blog",)
        or page == Path("about.html")
        or page == Path("index.html")
        or page == Path("thank-you.html")
        or page == Path("gruzoperevozki.html")
        or page == Path("mezhdugorodnie-pereezdy.html")
    )


def root_prefix(page: Path) -> str:
    return "" if len(page.parts) == 1 else "../"


def current_city(page: Path) -> str | None:
    if page == Path("index.html"):
        return "krasnodar"
    if page.parts and page.parts[0] in CITY_SET:
        return page.parts[0]
    return None


def in_city_folder(page: Path) -> bool:
    return bool(page.parts and page.parts[0] in CITY_SET)


def is_home_page(page: Path) -> bool:
    return page == Path("index.html") or (in_city_folder(page) and page.name == "index.html")


def is_blog_page(page: Path) -> bool:
    return bool(page.parts and page.parts[0] == "blog")


def nav_section(page: Path) -> str | None:
    if page == Path("about.html"):
        return "about"
    if is_blog_page(page):
        return "blog"
    if is_home_page(page):
        return "home"
    if in_city_folder(page) and page.name != "index.html":
        return "services"
    if page in {Path("gruzoperevozki.html"), Path("mezhdugorodnie-pereezdy.html")}:
        return "services"
    return None


def current_city_label(page: Path) -> str:
    code = current_city(page) or "krasnodar"
    return CITY_META[code]["label"]


def current_city_address(page: Path) -> str:
    code = current_city(page) or "krasnodar"
    return CITY_META[code]["address"]


def home_href(page: Path) -> str:
    if in_city_folder(page):
        return "index.html"
    return f"{root_prefix(page)}index.html"


def anchor_href(page: Path, anchor: str) -> str:
    if is_home_page(page):
        return f"#{anchor}"
    return f"{home_href(page)}#{anchor}"


def footer_city_service_href(page: Path, service_key: str) -> str:
    service_path = CITY_SERVICE_PATHS[service_key]
    if in_city_folder(page):
        return service_path
    prefix = root_prefix(page)
    return f"{prefix}krasnodar/{service_path}"


def desktop_nav_link(page: Path, section_id: str, label: str, href: str, data_attr: str | None = None) -> str:
    current = nav_section(page) == section_id
    attrs = []
    if current:
        attrs.append('class="nav-link active"')
        attrs.append('aria-current="page"')
    else:
        attrs.append('class="nav-link"')
    if data_attr:
        attrs.append(data_attr)
    joined_attrs = " ".join(attrs)
    return f'<li><a href="{href}" {joined_attrs}>{label}</a></li>'


def mobile_nav_link(page: Path, section_id: str, label: str, href: str, data_attr: str | None = None) -> str:
    current = nav_section(page) == section_id
    attrs = []
    if current:
        attrs.append('class="mobile-link active"')
        attrs.append('aria-current="page"')
    else:
        attrs.append('class="mobile-link"')
    if data_attr:
        attrs.append(data_attr)
    joined_attrs = " ".join(attrs)
    return f'<li><a href="{href}" {joined_attrs}>{label}</a></li>'


def build_header(page: Path) -> str:
    base = root_prefix(page)
    city_label = current_city_label(page)
    home = home_href(page)
    desktop_links = "\n            ".join([
        desktop_nav_link(page, "home", "Главная", "#hero" if is_home_page(page) else home, 'data-city-home-link="true"'),
        desktop_nav_link(page, "about", "О нас", f"{base}about.html"),
        desktop_nav_link(page, "services", "Услуги", anchor_href(page, "services"), 'data-city-anchor-link="services"'),
        desktop_nav_link(page, "reviews", "Отзывы", anchor_href(page, "reviews"), 'data-city-anchor-link="reviews"'),
        desktop_nav_link(page, "faq", "Вопросы", anchor_href(page, "faq"), 'data-city-anchor-link="faq"'),
        desktop_nav_link(page, "blog", "Блог", f"{base}blog/"),
    ])
    mobile_links = "\n          ".join([
        mobile_nav_link(page, "home", "Главная", "#hero" if is_home_page(page) else home, 'data-city-home-link="true"'),
        mobile_nav_link(page, "about", "О нас", f"{base}about.html"),
        mobile_nav_link(page, "services", "Услуги", anchor_href(page, "services"), 'data-city-anchor-link="services"'),
        mobile_nav_link(page, "reviews", "Отзывы", anchor_href(page, "reviews"), 'data-city-anchor-link="reviews"'),
        mobile_nav_link(page, "faq", "Вопросы", anchor_href(page, "faq"), 'data-city-anchor-link="faq"'),
        mobile_nav_link(page, "blog", "Блог", f"{base}blog/"),
    ])
    cta_href = anchor_href(page, "order-form-section")
    return f'''<header class="main-header" id="site-header">
  <div class="container header-container">
    <a href="{home}" class="logo-area" id="header-logo-link" data-city-home-link="true">
      <img src="{base}assets/logo.png" alt="Правильные Грузчики" class="logo-icon-img u-logo-size" width="64" height="64" />
      <div class="logo-text"><span class="logo-title">ПРАВИЛЬНЫЕ</span><span class="logo-subtitle">ГРУЗЧИКИ</span></div>
    </a>
    <nav class="desktop-nav" aria-label="Основная навигация">
      <ul>
        {desktop_links}
      </ul>
    </nav>
    <div class="header-right">
      <div class="city-selector-wrap">
        <button class="city-selector-btn" id="current-selected-city" type="button" aria-label="Выбрать город" aria-haspopup="true" aria-expanded="false" aria-controls="city-dropdown-menu">
          <span class="city-icon-pin">📍</span>
          <span class="city-selector-current" id="city-btn-text">{city_label}</span>
          <span class="city-selector-arrow">▼</span>
        </button>
        <div class="city-dropdown" id="city-dropdown-menu" aria-hidden="true">
          <div class="city-dropdown-list">
            <button type="button" class="city-item" data-city="krasnodar">Краснодар</button>
            <button type="button" class="city-item" data-city="anapa">Анапа</button>
            <button type="button" class="city-item" data-city="novorossiysk">Новороссийск</button>
            <button type="button" class="city-item" data-city="sochi">Сочи / Адлер / Сириус</button>
            <button type="button" class="city-item" data-city="gelendzhik">Геленджик</button>
          </div>
        </div>
        <div class="city-confirm-banner" id="city-confirm-banner">
          <p>Ваш город — <strong id="detected-city-name">{city_label}</strong>?</p>
          <div class="city-confirm-btns">
            <button type="button" class="btn btn-primary btn-sm" id="btn-city-confirm-yes">Да, верно</button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-city-confirm-no">Другой</button>
          </div>
        </div>
      </div>
      <div class="header-phone-box">
        <a href="tel:+79283333281" class="phone-link" id="header-phone">+7 (928) 333-32-81</a>
        <span class="work-hours-badge">Звонки 8:00–20:00 · выезды 24/7</span>
      </div>
      <a href="{cta_href}" class="btn btn-primary btn-sm header-cta" id="header-cta-btn" data-city-order-link="true">Заказать звонок</a>
      <button class="burger-menu-btn" id="burger-btn" aria-label="Открыть меню" aria-expanded="false" aria-controls="mobile-menu-overlay" type="button">
        <span class="burger-bar"></span><span class="burger-bar"></span><span class="burger-bar"></span>
      </button>
    </div>
  </div>
</header>
<div class="mobile-nav-overlay" id="mobile-menu-overlay" aria-hidden="true">
  <div class="mobile-nav-content">
    <button class="mobile-menu-close" id="mobile-menu-close" type="button" aria-label="Закрыть меню"><span></span><span></span></button>
    <ul class="mobile-nav-links">
      {mobile_links}
    </ul>
    <div class="mobile-nav-footer">
      <a href="tel:+79283333281" class="mobile-phone-link">+7 (928) 333-32-81</a>
      <p class="mobile-hours">Звонки 8:00–20:00 · выезды 24/7</p>
      <a href="{cta_href}" class="btn btn-primary" id="mobile-menu-cta" data-city-order-link="true">Быстрый заказ</a>
    </div>
  </div>
</div>'''


def build_footer(page: Path) -> str:
    base = root_prefix(page)
    home = home_href(page)
    address = current_city_address(page)
    hours = "Звонки 8:00–20:00 · выезды 24/7"
    return f'''<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-col brand-col">
      <a href="{home}" class="logo-area" data-city-home-link="true">
        <img src="{base}assets/logo.png" alt="Правильные Грузчики" class="logo-icon-img u-logo-size" width="64" height="64" />
        <div class="logo-text"><span class="logo-title">ПРАВИЛЬНЫЕ</span><span class="logo-subtitle">ГРУЗЧИКИ</span></div>
      </a>
      <p class="footer-pitch">Профессиональные грузчики, разнорабочие, переезды, такелаж и аренда Газели. Работаем для вашего комфорта с 2014 года.</p>
      <span class="footer-copy">© 2014–2026 ООО «Правильные грузчики».<br />Все права защищены.</span>
      <p class="footer-copy footer-legal-links"><a href="{base}privacy.html">Персональные данные</a> · <a href="{base}cookies.html">Cookies</a></p>
    </div>
    <div class="footer-col">
      <h4>Услуги</h4>
      <ul class="footer-links">
        <li><a href="{footer_city_service_href(page, 'loaders')}" data-city-service-link="loaders">Услуги грузчиков</a></li>
        <li><a href="{footer_city_service_href(page, 'workers')}" data-city-service-link="workers">Разнорабочие</a></li>
        <li><a href="{footer_city_service_href(page, 'moving')}" data-city-service-link="moving">Квартирные переезды</a></li>
        <li><a href="{footer_city_service_href(page, 'office-moving')}" data-city-service-link="office-moving">Офисные переезды</a></li>
        <li><a href="{footer_city_service_href(page, 'rigging')}" data-city-service-link="rigging">Такелажные работы</a></li>
        <li><a href="{footer_city_service_href(page, 'furniture')}" data-city-service-link="furniture">Сборка мебели</a></li>
        <li><a href="{base}gruzoperevozki.html">Грузоперевозки</a></li>
        <li><a href="{base}mezhdugorodnie-pereezdy.html">Междугородние переезды</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Для бизнеса</h4>
      <ul class="footer-links">
        <li><a href="{footer_city_service_href(page, 'autsorsing')}" data-city-service-link="autsorsing">Аутсорсинг персонала</a></li>
        <li><a href="{footer_city_service_href(page, 'shift')}" data-city-service-link="shift">Грузчики на смену</a></li>
        <li><a href="{footer_city_service_href(page, 'workers')}" data-city-service-link="workers">Разнорабочие</a></li>
        <li><a href="{footer_city_service_href(page, 'rigging')}" data-city-service-link="rigging">Такелаж</a></li>
        <li><a href="{footer_city_service_href(page, 'gazel-3m')}" data-city-service-link="gazel-3m">Аренда Газели</a></li>
        <li><a href="{anchor_href(page, 'order-form-section')}" data-city-order-link="true">Работа с юрлицами / безнал</a></li>
      </ul>
    </div>
    <div class="footer-col contact-col">
      <h4>Контакты</h4>
      <ul class="footer-contacts">
        <li><span class="f-contact-icon">📞</span><a href="tel:+79283333281">+7 (928) 333-32-81</a></li>
        <li><span class="f-contact-icon">📍</span><span class="city-address">{address}</span></li>
        <li><span class="f-contact-icon">🕒</span><span>{hours}</span></li>
      </ul>
      <div class="social-links-stub">
        <a class="social-icon" href="https://t.me/+79283333281" target="_blank" rel="noopener noreferrer">Telegram</a>
        <a class="social-icon" href="https://wa.me/79283333281" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
    </div>
  </div>
</footer>'''


def replace_header(text: str, page: Path) -> str:
    marker = '<header class="main-header" id="site-header">'
    start = text.find(marker)
    if start == -1:
        return text
    main_start = text.find("<main", start)
    if main_start == -1:
        return text
    before = text[:start].rstrip()
    after = text[main_start:]
    return before + "\n" + build_header(page) + "\n" + after


def replace_or_insert_footer(text: str, page: Path) -> str:
    marker = '<footer class="site-footer"'
    footer = build_footer(page)
    start = text.find(marker)
    if start != -1:
        end = text.find("</footer>", start)
        if end == -1:
            return text
        end += len("</footer>")
        without_footer = text[:start].rstrip() + text[end:]
        main_end = without_footer.rfind("</main>")
        script_after_main = without_footer.find("<script", main_end if main_end != -1 else 0)
        if main_end != -1 and script_after_main != -1:
            return without_footer[:script_after_main].rstrip() + "\n" + footer + "\n\n" + without_footer[script_after_main:]
        body_end = without_footer.rfind("</body>")
        if body_end == -1:
            return without_footer[:start].rstrip() + "\n" + footer + without_footer[start:]
        return without_footer[:body_end].rstrip() + "\n\n" + footer + "\n\n" + without_footer[body_end:]

    main_end = text.rfind("</main>")
    script_after_main = text.find("<script", main_end if main_end != -1 else 0)
    if main_end != -1 and script_after_main != -1:
        return text[:script_after_main].rstrip() + "\n" + footer + "\n\n" + text[script_after_main:]

    body_end = text.rfind("</body>")
    if body_end == -1:
        return text
    return text[:body_end].rstrip() + "\n\n" + footer + "\n\n" + text[body_end:]


def ensure_legal_body_data(text: str) -> str:
    body_match = re.search(r"<body(?![^>]*data-page=)([^>]*)>", text)
    if not body_match:
        return text
    original = body_match.group(0)
    replacement = f'<body data-page="legal"{body_match.group(1)}>'
    return text.replace(original, replacement, 1)


def ensure_app_script(text: str, page: Path) -> str:
    base = root_prefix(page)
    script_tag = f'<script type="module" src="{base}js/app.js"></script>'
    if script_tag in text:
        return text
    body_end = text.rfind("</body>")
    if body_end == -1:
        return text
    return text[:body_end].rstrip() + f"\n  {script_tag}\n" + text[body_end:]


def build_placeholder_header() -> str:
    return '''<header class="main-header" id="site-header">
  <div class="container header-container">
    <a href="{{BASE}}index.html" class="logo-area" id="header-logo-link" data-city-home-link="true">
      <img src="{{BASE}}assets/logo.png" alt="Правильные Грузчики" class="logo-icon-img u-logo-size" width="64" height="64" />
      <div class="logo-text"><span class="logo-title">ПРАВИЛЬНЫЕ</span><span class="logo-subtitle">ГРУЗЧИКИ</span></div>
    </a>
    <nav class="desktop-nav" aria-label="Основная навигация">
      <ul>
        <li><a href="{{BASE}}index.html" class="nav-link" data-city-home-link="true">Главная</a></li>
        <li><a href="{{BASE}}about.html" class="nav-link">О нас</a></li>
        <li><a href="{{BASE}}index.html#services" class="nav-link" data-city-anchor-link="services">Услуги</a></li>
        <li><a href="{{BASE}}index.html#reviews" class="nav-link" data-city-anchor-link="reviews">Отзывы</a></li>
        <li><a href="{{BASE}}index.html#faq" class="nav-link" data-city-anchor-link="faq">Вопросы</a></li>
        <li><a href="{{BASE}}blog/" class="nav-link">Блог</a></li>
      </ul>
    </nav>
    <div class="header-right">
      <div class="city-selector-wrap">
        <button class="city-selector-btn" id="current-selected-city" type="button" aria-label="Выбрать город" aria-haspopup="true" aria-expanded="false" aria-controls="city-dropdown-menu">
          <span class="city-icon-pin">📍</span>
          <span class="city-selector-current" id="city-btn-text">Краснодар</span>
          <span class="city-selector-arrow">▼</span>
        </button>
        <div class="city-dropdown" id="city-dropdown-menu" aria-hidden="true">
          <div class="city-dropdown-list">
            <button type="button" class="city-item" data-city="krasnodar">Краснодар</button>
            <button type="button" class="city-item" data-city="anapa">Анапа</button>
            <button type="button" class="city-item" data-city="novorossiysk">Новороссийск</button>
            <button type="button" class="city-item" data-city="sochi">Сочи / Адлер / Сириус</button>
            <button type="button" class="city-item" data-city="gelendzhik">Геленджик</button>
          </div>
        </div>
        <div class="city-confirm-banner" id="city-confirm-banner">
          <p>Ваш город — <strong id="detected-city-name">Краснодар</strong>?</p>
          <div class="city-confirm-btns">
            <button type="button" class="btn btn-primary btn-sm" id="btn-city-confirm-yes">Да, верно</button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-city-confirm-no">Другой</button>
          </div>
        </div>
      </div>
      <div class="header-phone-box">
        <a href="tel:+79283333281" class="phone-link" id="header-phone">+7 (928) 333-32-81</a>
        <span class="work-hours-badge">Звонки 8:00–20:00 · выезды 24/7</span>
      </div>
      <a href="{{BASE}}index.html#order-form-section" class="btn btn-primary btn-sm header-cta" id="header-cta-btn" data-city-order-link="true">Заказать звонок</a>
      <button class="burger-menu-btn" id="burger-btn" aria-label="Открыть меню" aria-expanded="false" aria-controls="mobile-menu-overlay" type="button">
        <span class="burger-bar"></span><span class="burger-bar"></span><span class="burger-bar"></span>
      </button>
    </div>
  </div>
</header>
<div class="mobile-nav-overlay" id="mobile-menu-overlay" aria-hidden="true">
  <div class="mobile-nav-content">
    <button class="mobile-menu-close" id="mobile-menu-close" type="button" aria-label="Закрыть меню"><span></span><span></span></button>
    <ul class="mobile-nav-links">
      <li><a href="{{BASE}}index.html" class="mobile-link" data-city-home-link="true">Главная</a></li>
      <li><a href="{{BASE}}about.html" class="mobile-link">О нас</a></li>
      <li><a href="{{BASE}}index.html#services" class="mobile-link" data-city-anchor-link="services">Услуги</a></li>
      <li><a href="{{BASE}}index.html#reviews" class="mobile-link" data-city-anchor-link="reviews">Отзывы</a></li>
      <li><a href="{{BASE}}index.html#faq" class="mobile-link" data-city-anchor-link="faq">Вопросы</a></li>
      <li><a href="{{BASE}}blog/" class="mobile-link">Блог</a></li>
    </ul>
    <div class="mobile-nav-footer">
      <a href="tel:+79283333281" class="mobile-phone-link">+7 (928) 333-32-81</a>
      <p class="mobile-hours">Звонки 8:00–20:00 · выезды 24/7</p>
      <a href="{{BASE}}index.html#order-form-section" class="btn btn-primary" id="mobile-menu-cta" data-city-order-link="true">Быстрый заказ</a>
    </div>
  </div>
</div>
'''


def build_placeholder_footer() -> str:
    return '''<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-col brand-col">
      <a href="{{BASE}}index.html" class="logo-area" data-city-home-link="true">
        <img src="{{BASE}}assets/logo.png" alt="Правильные Грузчики" class="logo-icon-img u-logo-size" width="64" height="64" />
        <div class="logo-text"><span class="logo-title">ПРАВИЛЬНЫЕ</span><span class="logo-subtitle">ГРУЗЧИКИ</span></div>
      </a>
      <p class="footer-pitch">Профессиональные грузчики, разнорабочие, переезды, такелаж и аренда Газели. Работаем для вашего комфорта с 2014 года.</p>
      <span class="footer-copy">© 2014–2026 ООО «Правильные грузчики».<br />Все права защищены.</span>
      <p class="footer-copy footer-legal-links"><a href="{{BASE}}privacy.html">Персональные данные</a> · <a href="{{BASE}}cookies.html">Cookies</a></p>
    </div>
    <div class="footer-col">
      <h4>Услуги</h4>
      <ul class="footer-links">
        <li><a href="{{BASE}}krasnodar/loaders.html" data-city-service-link="loaders">Услуги грузчиков</a></li>
        <li><a href="{{BASE}}krasnodar/raznorabochie.html" data-city-service-link="workers">Разнорабочие</a></li>
        <li><a href="{{BASE}}krasnodar/kvartirnyj-pereezd.html" data-city-service-link="moving">Квартирные переезды</a></li>
        <li><a href="{{BASE}}krasnodar/ofisnyj-pereezd.html" data-city-service-link="office-moving">Офисные переезды</a></li>
        <li><a href="{{BASE}}krasnodar/rigging.html" data-city-service-link="rigging">Такелажные работы</a></li>
        <li><a href="{{BASE}}krasnodar/furniture.html" data-city-service-link="furniture">Сборка мебели</a></li>
        <li><a href="{{BASE}}gruzoperevozki.html">Грузоперевозки</a></li>
        <li><a href="{{BASE}}mezhdugorodnie-pereezdy.html">Междугородние переезды</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Для бизнеса</h4>
      <ul class="footer-links">
        <li><a href="{{BASE}}krasnodar/autsorsing.html" data-city-service-link="autsorsing">Аутсорсинг персонала</a></li>
        <li><a href="{{BASE}}krasnodar/gruzchiki-na-smenu.html" data-city-service-link="shift">Грузчики на смену</a></li>
        <li><a href="{{BASE}}krasnodar/raznorabochie.html" data-city-service-link="workers">Разнорабочие</a></li>
        <li><a href="{{BASE}}krasnodar/rigging.html" data-city-service-link="rigging">Такелаж</a></li>
        <li><a href="{{BASE}}krasnodar/arenda-gazeli-3m.html" data-city-service-link="gazel-3m">Аренда Газели</a></li>
        <li><a href="{{BASE}}index.html#order-form-section" data-city-order-link="true">Работа с юрлицами / безнал</a></li>
      </ul>
    </div>
    <div class="footer-col contact-col">
      <h4>Контакты</h4>
      <ul class="footer-contacts">
        <li><span class="f-contact-icon">📞</span><a href="tel:+79283333281">+7 (928) 333-32-81</a></li>
        <li><span class="f-contact-icon">📍</span><span class="city-address">350004, г. Краснодар, ул. Кропоткина, д. 50, офис 339</span></li>
        <li><span class="f-contact-icon">🕒</span><span>Звонки 8:00–20:00 · выезды 24/7</span></li>
      </ul>
      <div class="social-links-stub">
        <a class="social-icon" href="https://t.me/+79283333281" target="_blank" rel="noopener noreferrer">Telegram</a>
        <a class="social-icon" href="https://wa.me/79283333281" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
    </div>
  </div>
</footer>
'''


def sync_partials() -> None:
    (ROOT / "partials/header.html").write_text(build_placeholder_header(), encoding="utf-8")
    (ROOT / "partials/footer.html").write_text(build_placeholder_footer(), encoding="utf-8")


def main() -> None:
    sync_partials()
    for page in ROOT.rglob("*.html"):
        rel = page.relative_to(ROOT)
        text = page.read_text(encoding="utf-8", errors="ignore")
        if not should_process(rel, text):
            continue
        updated = text
        if rel in LEGAL_PAGES:
            updated = ensure_legal_body_data(updated)
        updated = replace_header(updated, rel)
        updated = replace_or_insert_footer(updated, rel)
        if rel in LEGAL_PAGES:
            updated = ensure_app_script(updated, rel)
        if updated != text:
            page.write_text(updated, encoding="utf-8")
            print(rel)


if __name__ == "__main__":
    main()
