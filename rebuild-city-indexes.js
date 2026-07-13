#!/usr/bin/env node
/**
 * rebuild-city-indexes.js
 *
 * Пересобирает все городские лендинги (city/index.html) как полные клоны корневого
 * index.html с локализацией под город, правильными путями ../ на assets/css/js,
 * локальными якорями, и вставленным блоком city-seo-detail (из старой версии
 * файла, если он был).
 *
 * Логика:
 *   1. Читает корневой index.html как эталон.
 *   2. Для каждого города из CITIES:
 *      - вырезает существующий city-seo-detail из старого city index.html (если есть)
 *      - копирует эталон, заменяя:
 *          * <body data-page="index"> → <body data-page="city" data-city="{code}">
 *          * ссылки на assets/, css/, js/, blog/ → ../assets/ ../css/ ../js/ ../blog/
 *          * href="index.html" (logo, footer brand) → href="../index.html"
 *          * href="about.html" → href="../about.html"
 *          * href="gruzoperevozki.html" → href="../gruzoperevozki.html"
 *          * ссылки на сервисные страницы (loaders.html, workers.html и т.п.) —
 *            оставляем как есть (у каждого города в папке есть свои service-страницы)
 *          * якоря #services/#faq/#reviews/#order-form-section/#calculator/#hero
 *            /#fleet/#team/#about в навигации — оставляем локальными (без ../index.html)
 *          * title / meta description / og:title / og:description / canonical
 *          * JSON-LD addressLocality, address, city-name, detected-city-name,
 *            city-btn-text, sub-title-gradient, "Краснодара" в текстах, alt с
 *            "в Краснодаре" и т.п.
 *          * закрывает сломанные <form method="POST"> без ">"
 *      - вставляет city-seo-detail перед секцией faq-section (или перед </main> если нет faq)
 *      - вставляет inline-script localStorage lock (selected_city + city_confirmed)
 *        ПЕРЕД закрывающим </body>, чтобы geotargeting сразу видел правильный город.
 *   3. Проверяет результат (отсутствие "Выберите услугу" как h1-заголовка stub'а,
 *      наличие hero/services/calculator/fleet/faq/city-seo-detail).
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

const CITIES = {
  krasnodar:   { nom: 'Краснодар',           prep: 'в Краснодаре',            gen: 'Краснодара',            shortNom: 'Краснодар',          address: '350004, г. Краснодар, ул. Кропоткина, д. 50, офис 339',       region: 'Краснодарского края' },
  anapa:       { nom: 'Анапа',               prep: 'в Анапе',                 gen: 'Анапы',                 shortNom: 'Анапе',              address: '353440, г. Анапа, ул. Крымская, д. 177, офис 12',            region: 'Краснодарского края' },
  novorossiysk:{ nom: 'Новороссийск',        prep: 'в Новороссийске',         gen: 'Новороссийска',         shortNom: 'Новороссийске',      address: '353900, г. Новороссийск, ул. Советов, д. 42, офис 18',       region: 'Краснодарского края' },
  sochi:       { nom: 'Сочи / Адлер / Сириус', prep: 'в Сочи, Адлере и Сириусе', gen: 'Сочи, Адлера и Сириуса', shortNom: 'Сочи',              address: '354340, г. Сочи, Адлерский район, ул. Кирова, д. 58, офис 7', region: 'Краснодарского края' },
  gelendzhik:  { nom: 'Геленджик',           prep: 'в Геленджике',            gen: 'Геленджика',            shortNom: 'Геленджике',         address: '353460, г. Геленджик, ул. Луначарского, д. 6, офис 21',      region: 'Краснодарского края' },
};

// Список html-файлов, которые лежат в корне, не являются сервисными страницами
// (about.html, gruzoperevozki.html) и на которые надо сослаться через ../
// Сервисные страницы (loaders, workers, moving, …) лежат в папке каждого города,
// поэтому остаются без ../.
const ROOT_HTML_FILES = new Set([
  'about.html',
  'gruzoperevozki.html',
]);

// Регулярка для извлечения блока <section class="city-seo-detail" ...>...</section>
const SEO_BLOCK_RE = /<section[^>]*class="[^"]*city-seo-detail[^"]*"[^>]*>[\s\S]*?<\/section>/i;

function extractSeoBlock(oldHtml) {
  const m = oldHtml.match(SEO_BLOCK_RE);
  return m ? m[0] : null;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fixForms(html) {
  // Закрыть сломанные теги вида:
  //   ...method="POST"
  //   <input ...
  // где ">" у открывающего <form ...> пропущен.
  return html.replace(/method="POST"\s*\n\s*</g, 'method="POST">\n<');
}

/**
 * Создаёт city-landing как клон index.html.
 */
function buildCityIndex(code, city, rootHtml, oldHtml) {
  let html = rootHtml;

  // 1. <body data-page="index"> → <body data-page="city" data-city="{code}">
  html = html.replace(/<body([^>]*)data-page="index"([^>]*)>/,
    `<body$1data-page="city" data-city="${code}"$2>`);

  // 2. Пути на ресурсы: "assets/", "css/", "js/" → "../assets/" и т.п.
  //    Осторожно: не трогаем внутри строк, которые уже начинаются с "../", "http", "data:"
  //    Простая, но надёжная замена по префиксам атрибутов href/src/action.
  const pathReplacements = [
    ['href="assets/',  'href="../assets/'],
    ['src="assets/',   'src="../assets/'],
    ['href="css/',     'href="../css/'],
    ['src="css/',      'src="../css/'],
    ['href="js/',      'href="../js/'],
    ['src="js/',       'src="../js/'],
    ["href='assets/",  "href='../assets/"],
    ["src='assets/",   "src='../assets/"],
    ["href='css/",     "href='../css/"],
    ["src='css/",      "src='../css/"],
    ["href='js/",      "href='../js/"],
    ["src='js/",       "src='../js/"],
    // blog
    ['href="blog/',    'href="../blog/'],
    ["href='blog/",    "href='../blog/"],
  ];
  for (const [from, to] of pathReplacements) {
    html = html.split(from).join(to);
  }

  // 3. Ссылки на корневые html (about.html, gruzoperevozki.html) → ../
  //    Но только в href="…"; не трогать title/текст.
  for (const f of ROOT_HTML_FILES) {
    html = html.split(`href="${f}"`).join(`href="../${f}"`);
    html = html.split(`href="${f}#`).join(`href="../${f}#`);
  }

  // logo link / "Главная": href="index.html" (без якоря) → ../index.html
  //
  // Но навигационные пункты "Услуги/Отзывы/Вопросы" и CTA-кнопки "Заказать звонок"/
  // "Быстрый заказ" на главной в эталоне указывают на href="index.html#services" и т.п.
  // На городской странице эти секции ЕСТЬ ЛОКАЛЬНО (клон главной), поэтому их надо
  // перевести на локальные якоря "#services", "#reviews", "#faq", "#order-form-section".
  //
  // Сначала переведём все "index.html#ANCHOR" на локальные "#ANCHOR" (где ANCHOR —
  // известная секция на странице), а затем заменим оставшийся "href=\"index.html\""
  // (без якоря — лого и пункт "Главная") на "../index.html".
  const LOCAL_ANCHORS = ['services', 'reviews', 'faq', 'order-form-section',
                        'calculator', 'hero', 'fleet', 'team', 'about'];
  for (const a of LOCAL_ANCHORS) {
    html = html.split(`href="index.html#${a}"`).join(`href="#${a}"`);
  }
  // logo/Главная (без якоря)
  html = html.split('href="index.html"').join('href="../index.html"');

  // Навигационные ссылки, которые должны указывать ЛОКАЛЬНО (а не на ../index.html#…):
  // В корне index.html эти ссылки уже локальные (href="#services" и т.п.), поэтому после
  // наших замен они остались локальными (мы не трогали "#"). Проверим — в эталоне
  // desktop-nav ссылки на Главную/Услуги/Отзывы/Вопросы уже используют локальные якоря
  // для sections на этой же странице и href="index.html" только для "Главная" (которую
  // мы перекинули на ../index.html). Исправим: пункт "Главная" должен вести на
  // ../index.html? Нет: с точки зрения SEO это правильно; но для UX на странице города
  // пользователь должен возвращаться к / — пусть ведёт на ../index.html.
  // При этом мобильное меню тоже ссылается на ../index.html#services и т.п. — это ОК,
  // т.к. все сервисы на локальной странице есть. Однако лучше сделать эти якоря
  // локальными: если человек уже на /anapa/index.html, клик по «Услуги» должен
  // открыть #services на этой же странице (где уже есть services-section с карточками
  // услуг города). Проверим, что в эталоне:
  //   <a href="#services" class="nav-link">Услуги</a>  — локально
  // Тогда наши замены не затронут их (не начинаются с assets/css/js/index.html).
  // Но старый stub использовал ../index.html#services — мы же строим из ЭТАЛОНА,
  // где якоря уже локальные. Отлично.

  // 4. Служебные ссылки на страницы (thank-you.html) — они лежат в корне, но формы
  // имеют безопасный action="about:blank"; JS отправляет только после проверки `/api/health`
  // (абсолютные URL), поэтому трогать не надо.

  // 5. Meta / title / canonical
  // По образцу локализации корневого (Краснодар):
  //   title: "Правильные Грузчики {nom} | Услуги грузчиков, разнорабочих и такелажников 24/7"
  //   description: "... в {prep} от 800 руб/час. ..."
  //   og:title, og:description — аналогично.
  //   canonical: "https://pragruz.ru/{code}/"
  //   og:url если есть.
  const title = `Правильные Грузчики ${city.nom} | Услуги грузчиков, разнорабочих и такелажников 24/7`;
  const descr = `Услуги профессиональных грузчиков, разнорабочих и такелажников ${city.prep} от 800 руб/час. Квартирные и офисные переезды, аутсорсинг персонала для компаний. Работаем 24/7.`;
  const ogTitle = `Правильные Грузчики ${city.nom} | Услуги грузчиков 24/7`;
  const ogDescr = `Заказ профессиональных грузчиков и разнорабочих ${city.prep}. Работаем без выходных, круглосуточно. Наличный и безналичный расчет (ООО).`;
  const canonical = `https://pragruz.ru/${code}/`;

  // title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  // meta description
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta name="description" content="${descr}" />`);
  // og:title
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta property="og:title" content="${ogTitle}" />`);
  // og:description
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta property="og:description" content="${ogDescr}" />`);
  // og:url — добавим, если нет; иначе обновим
  if (/<meta\s+property="og:url"/i.test(html)) {
    html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?\s*>/i,
      `<meta property="og:url" content="${canonical}" />`);
  } else {
    html = html.replace(/<meta\s+property="og:type"[^>]*>/i,
      `<meta property="og:url" content="${canonical}" />\n    <meta property="og:type" content="website" />`);
  }
  // canonical
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/i,
    `<link rel="canonical" href="${canonical}" />`);

  // og:image абсолютный
  html = html.replace(/<meta\s+property="og:image"\s+content="assets\//i,
    `<meta property="og:image" content="https://pragruz.ru/assets/`);

  // 6. JSON-LD LocalBusiness (Краснодар → город)
  //    "addressLocality": "Краснодар" → city.nom (для Москвы/СПБ подходит, для Сочи — норм)
  //    "url": "https://pragruz.ru/" → canonical
  html = html.replace(/"addressLocality"\s*:\s*"Краснодар"/, `"addressLocality": "${city.nom}"`);
  html = html.replace(/"postalCode"\s*:\s*"350004",\s*"addressCountry":\s*"RU"[\s\S]*?"streetAddress"\s*:\s*"[^"]*"/,
    `"streetAddress": "${city.address.replace(/^\d{6},\s*г\.\s*[^,]+,\s*/, '')}",\n          "addressLocality": "${city.nom}",\n          "postalCode": "${city.address.match(/^\d{6}/)?.[0] || ''}",\n          "addressCountry": "RU"`);
  // Проще — заменить весь блок адреса. Мы уже сделали addressLocality. Полностью перепишем адрес:
  // Найдём блок "address": { ... } и подставим правильные значения.
  html = html.replace(
    /"address"\s*:\s*\{[\s\S]*?"streetAddress"\s*:\s*"[^"]*"[\s\S]*?"addressLocality"\s*:\s*"[^"]*"[\s\S]*?"postalCode"\s*:\s*"[^"]*"[\s\S]*?"addressCountry"\s*:\s*"[^"]*"[\s\S]*?\}/,
    `"address": {
          "@type": "PostalAddress",
          "streetAddress": "${city.address.replace(/^\d{6},\s*г\.\s*[^,]+,\s*/, '').replace(/"/g, '&quot;')}",
          "addressLocality": "${city.nom}",
          "postalCode": "${(city.address.match(/^\d{6}/) || [''])[0]}",
          "addressCountry": "RU"
        }`
  );
  html = html.replace(/"url"\s*:\s*"https:\/\/pragruz\.ru\/"/, `"url": "${canonical}"`);

  // 7. Локализация текстов:
  //    - в hero h1: <span class="city-name" data-case="prep">в Краснодаре</span> → prep
  //    - прочие <span class="city-name" data-case="prep">…</span> → prep
  //    - <span class="city-name" data-case="gen">Краснодара</span> → gen
  //    - id="city-btn-text" → nom
  //    - id="detected-city-name" → nom
  //    - sub-title-gradient в hero ("⭐ Более 12 лет..." не трогаем, но есть sub-title-gradient в секциях)
  //    - "Реальные отзывы наших клиентов из Краснодара" → "из {gen}"
  //    - alt с "в Краснодаре" → prep
  //    - партнёры "Кнауф Гипс Краснодар" — оставляем, это реальные партнёры в Краснодаре.
  //      Для других городов это нерелевантно, но допустимо (оставим как есть).
  //    - "из Краснодара" в прочих текстах
  //    - address в футере и elsewhere
  html = html.replace(/<span class="city-btn-text"[^>]*>[^<]*<\/span>/g, ''); // нет такого
  html = html.replace(/(<span[^>]*id="city-btn-text"[^>]*>)[^<]*(<\/span>)/g,
    `$1${city.nom}$2`);
  html = html.replace(/(<strong[^>]*id="detected-city-name"[^>]*>)[^<]*(<\/strong>)/g,
    `$1${city.nom}$2`);

  // city-name spans — заменяем содержимое согласно data-case
  html = html.replace(/(<span[^>]*class="city-name"[^>]*data-case="prep"[^>]*>)[^<]*(<\/span>)/g,
    `$1${city.prep}$2`);
  html = html.replace(/(<span[^>]*data-case="prep"[^>]*class="city-name"[^>]*>)[^<]*(<\/span>)/g,
    `$1${city.prep}$2`);
  html = html.replace(/(<span[^>]*class="city-name"[^>]*data-case="gen"[^>]*>)[^<]*(<\/span>)/g,
    `$1${city.gen}$2`);
  html = html.replace(/(<span[^>]*data-case="gen"[^>]*class="city-name"[^>]*>)[^<]*(<\/span>)/g,
    `$1${city.gen}$2`);

  // Реальные отзывы наших клиентов из <span class="city-name" data-case="gen">…</span> — уже поправлен.
  // Проверим и обычный текст с "из Краснодара" в отзывах (если city-name обёрнут).
  // На главной он обёрнут в city-name (строка 853: "из Краснодара" без обёртки в некоторых местах?)
  // Посмотрим — строка: <p class="section-desc">Реальные отзывы наших клиентов из Краснодара</p>
  // Без city-name. Заменим:
  html = html.replace(/Реальные отзывы наших клиентов из Краснодара/g,
    `Реальные отзывы наших клиентов из ${city.gen}`);

  // Адреса в футере/хедере (city-address)
  html = html.replace(/(<span[^>]*class="city-address"[^>]*>)[^<]*(<\/span>)/g,
    `$1${city.address}$2`);

  // Альты с "в Краснодаре"
  html = html.replace(/alt="([^"]*)в Краснодаре([^"]*)"/g,
    (m, p1, p2) => `alt="${p1}${city.prep}${p2}"`);

  // "вашем районе Краснодара" → "вашем районе {gen}" (JSON-LD описание или JS-строка?)
  // На главной это JSON-LD строка внутри <script type="application/ld+json">:
  //   "...в вашем районе Краснодара, выезжает немедленно..."
  html = html.replace(/вашем районе Краснодара/g, `вашем районе ${city.gen}`);

  // 8. Вставка (если не было) или обновление og:image с абсолютным путём
  // (уже сделано выше)

  // 9. Удалим старый city-seo-detail из целевого (мы клонируем из корня, там его нет)
  // и вставим вырезанный из старой версии перед faq-section.
  // ВАЖНО: в корневом index.html нет city-seo-detail — мы просто вставим блок из oldHtml.
  const seoBlock = extractSeoBlock(oldHtml || '') || buildDefaultSeoBlock(city);
  // Вставляем перед <section class="faq-section" …>
  if (/<section[^>]*class="[^"]*faq-section/.test(html)) {
    html = html.replace(/(<section[^>]*class="[^"]*faq-section[\s\S]*?<\/section>)/i,
      `\n${seoBlock}\n\n$1`);
  } else {
    html = html.replace('</main>', `${seoBlock}\n</main>`);
  }

  // 10. Inline-скрипт: предустановка localStorage selected_city + city_confirmed,
  // чтобы geotargeting сразу подхватил правильный город и не показывал баннер.
  const lockScript = `<script>
try {
  localStorage.setItem('selected_city', '${code}');
  localStorage.setItem('city_confirmed', 'true');
  // Запрет авто-редиректа с этой страницы (защита от петли geotargeting)
  window.__PG_CITY_LOCKED__ = true;
} catch(e) {}
</script>`;
  html = html.replace('</body>', `${lockScript}\n</body>`);

  // 11. Починить сломанные формы (method="POST"\n< → method="POST">\n<)
  html = fixForms(html);

  // 12. Удостоверимся, что якоря на локальные секции НЕ ушли на ../index.html
  // (после наших сплитов href="index.html#anchor" становится href="../index.html#anchor",
  // что правильно для перехода с города на главную; но пункты меню Услуги/Отзывы/Вопросы
  // на city-странице должны вести к #services/#reviews/#faq на текущей странице).
  // На корневом index.html пункты меню — это href="#services" (без index.html),
  // поэтому они остались локальными. Проверим:
  const nav = html.match(/<nav class="desktop-nav"[\s\S]*?<\/nav>/i);
  // (ничего не делаем, это из корректного эталона)

  // 13. Footer service links (loaders.html и т.п.) — в корне они без префикса и
  // в папке каждого города они тоже есть. Значит href="loaders.html" должен
  // остаться как есть — они и остаются, т.к. мы не заменяем такие пути. ОК.

  return html;
}

function buildDefaultSeoBlock(city) {
  // Резерв: если у города нет блока — генерируем дефолтный.
  return `<section class="city-seo-detail" id="local-seo-info">
  <div class="container city-seo-detail-grid">
    <div class="city-seo-detail-card">
      <span class="sub-title-gradient">Локальные условия</span>
      <h2>Как мы работаем ${city.prep}</h2>
      <p>Мы предоставляем услуги грузчиков и разнорабочих ${city.prep}. Работаем ${city.region}, с быстрой подачей бригады от 30 минут и прозрачными ценами от 800 руб/час.</p>
    </div>
    <div class="city-seo-detail-card">
      <span class="sub-title-gradient">Контакты</span>
      <h3>Единый номер для заявок ${city.prep}</h3>
      <p>Звоните: +7 (928) 333-32-81. Подача по всему городу и близлежащим населённым пунктам ${city.region}. Работаем 24/7 без выходных.</p>
    </div>
  </div>
</section>`;
}

// ========== MAIN ==========
const rootPath = path.join(ROOT, 'index.html');
const rootHtml = fs.readFileSync(rootPath, 'utf8');

// Сохраним бэкап старого кода городов (на всякий случай)
const backupDir = path.join(ROOT, '.city-backup-' + Date.now());
fs.mkdirSync(backupDir, { recursive: true });

let rebuilt = 0, failed = [];

for (const [code, city] of Object.entries(CITIES)) {
  const cityDir = path.join(ROOT, code);
  const cityIndexPath = path.join(cityDir, 'index.html');

  if (!fs.existsSync(cityDir)) {
    console.warn(`[SKIP] dir ${code}/ not found`);
    continue;
  }

  let oldHtml = '';
  if (fs.existsSync(cityIndexPath)) {
    oldHtml = fs.readFileSync(cityIndexPath, 'utf8');
    fs.writeFileSync(path.join(backupDir, `${code}.html`), oldHtml);
  }

  try {
    const newHtml = buildCityIndex(code, city, rootHtml, oldHtml);
    fs.writeFileSync(cityIndexPath, newHtml);

    // Проверки
    const checks = {
      hero: /hero-section/.test(newHtml),
      services: /services-section/.test(newHtml),
      calculator: /calculator-section/.test(newHtml),
      fleet: /fleet-section/.test(newHtml),
      faq: /faq-section/.test(newHtml),
      team: /pg-team-section/.test(newHtml),
      reviews: /reviews-section/.test(newHtml),
      seo: /city-seo-detail/.test(newHtml),
      noStub: !(/<h1[^>]*>[^<]*Выберите услугу/i.test(newHtml)),
      hasCityCase: newHtml.includes(`data-case="prep"`) && newHtml.includes(city.prep),
      hasDataCity: newHtml.includes(`data-city="${code}"`),
      formFixed: !(/method="POST"\s*\n\s*</.test(newHtml)),
      hasLock: newHtml.includes(`localStorage.setItem('selected_city', '${code}')`),
    };
    const fail = Object.entries(checks).filter(([,v]) => !v).map(([k])=>k);
    if (fail.length) {
      failed.push({code, fail});
    }
    console.log(`[OK] ${code}/index.html — ${newHtml.split('\n').length} lines, fail: ${fail.length ? fail.join(',') : 'none'}`);
    rebuilt++;
  } catch (e) {
    console.error(`[ERR] ${code}:`, e.message);
    failed.push({code, fail: [e.message]});
  }
}

console.log(`\nDone. Rebuilt ${rebuilt} city pages. Backup: ${path.relative(ROOT, backupDir)}`);
if (failed.length) {
  console.log('Failures:');
  for (const f of failed) console.log(' ', f.code, '—', f.fail);
  process.exit(1);
}
