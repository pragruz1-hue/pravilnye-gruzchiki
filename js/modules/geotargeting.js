/**
 * City data and geotargeting module
 * Includes CITIES_DATA, Schema.org generation, privacy-safe city selection, and city rendering
 */

import { detectSiteBasePath } from "./helpers.js";

const SITE_PHONE_DISPLAY = "+7 (928) 333-32-81";
const SITE_PHONE_TEL = "+79283333281";
const ALLOWED_CITY_CODES = ["krasnodar", "anapa", "novorossiysk", "sochi", "gelendzhik"];
const CITY_SERVICE_PATHS = {
  loaders: "loaders.html",
  workers: "raznorabochie.html",
  moving: "kvartirnyj-pereezd.html",
  "office-moving": "ofisnyj-pereezd.html",
  rigging: "rigging.html",
  furniture: "furniture.html",
  autsorsing: "autsorsing.html",
  shift: "gruzchiki-na-smenu.html",
  "gazel-3m": "arenda-gazeli-3m.html",
};
const GEO_CACHE_CITY_KEY = "pg_geo_city_code";
const GEO_CACHE_TS_KEY = "pg_geo_checked_at";
const GEO_STATUS_KEY = "pg_geo_status";
const GEO_SNOOZE_UNTIL_KEY = "pg_geo_prompt_snooze_until";
const GEO_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const GEO_PROMPT_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const GEO_SERVICE_RADIUS_KM = 260;

export const CITIES_DATA = {
  krasnodar: {
    name: "Краснодар",
    cases: { nom: "Краснодар", prep: "в Краснодаре", gen: "Краснодара" },
    address: "350004, г. Краснодар, ул. Кропоткина, д. 50, офис 339",
    region: "Краснодарского края",
    phone: SITE_PHONE_DISPLAY,
    coords: { lat: 45.03547, lon: 38.97531 },
  },
  anapa: {
    name: "Анапа",
    cases: { nom: "Анапа", prep: "в Анапе", gen: "Анапы" },
    address: "353440, г. Анапа, ул. Крымская, д. 177, офис 12",
    region: "Краснодарского края",
    phone: SITE_PHONE_DISPLAY,
    coords: { lat: 44.89497, lon: 37.31679 },
  },
  novorossiysk: {
    name: "Новороссийск",
    cases: { nom: "Новороссийск", prep: "в Новороссийске", gen: "Новороссийска" },
    address: "353900, г. Новороссийск, ул. Советов, д. 42, офис 18",
    region: "Краснодарского края",
    phone: SITE_PHONE_DISPLAY,
    coords: { lat: 44.72339, lon: 37.76899 },
  },
  sochi: {
    name: "Сочи / Адлер / Сириус",
    cases: { nom: "Сочи / Адлер / Сириус", prep: "в Сочи, Адлере и Сириусе", gen: "Сочи, Адлера и Сириуса" },
    address: "354340, г. Сочи, Адлерский район, ул. Кирова, д. 58, офис 7",
    region: "Краснодарского края",
    phone: SITE_PHONE_DISPLAY,
    coords: { lat: 43.42742, lon: 39.9231 },
  },
  gelendzhik: {
    name: "Геленджик",
    cases: { nom: "Геленджик", prep: "в Геленджике", gen: "Геленджика" },
    address: "353460, г. Геленджик, ул. Луначарского, д. 6, офис 21",
    region: "Краснодарского края",
    phone: SITE_PHONE_DISPLAY,
    coords: { lat: 44.56301, lon: 38.07877 },
  },
};

function toRad(value) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(latA, lonA, latB, lonB) {
  const earthRadiusKm = 6371;
  const dLat = toRad(latB - latA);
  const dLon = toRad(lonB - lonA);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function getNearestCityByCoords(lat, lon) {
  let nearest = null;

  ALLOWED_CITY_CODES.forEach((cityCode) => {
    const city = CITIES_DATA[cityCode];
    if (!city?.coords) return;
    const distanceKm = getDistanceKm(lat, lon, city.coords.lat, city.coords.lon);
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { cityCode, distanceKm };
    }
  });

  return nearest;
}

function readCachedGeoCity() {
  try {
    const cityCode = localStorage.getItem(GEO_CACHE_CITY_KEY);
    const checkedAt = Number(localStorage.getItem(GEO_CACHE_TS_KEY) || 0);
    if (!cityCode || !CITIES_DATA[cityCode] || !checkedAt) return null;
    return { cityCode, checkedAt };
  } catch (_) {
    return null;
  }
}

function saveGeoDetectionState(status, cityCode = "") {
  try {
    localStorage.setItem(GEO_STATUS_KEY, status);
    if (cityCode && CITIES_DATA[cityCode]) {
      localStorage.setItem(GEO_CACHE_CITY_KEY, cityCode);
      localStorage.setItem(GEO_CACHE_TS_KEY, String(Date.now()));
    } else {
      localStorage.removeItem(GEO_CACHE_CITY_KEY);
      localStorage.removeItem(GEO_CACHE_TS_KEY);
    }
  } catch (_) {
    // noop
  }
}

function snoozeGeoPrompt() {
  try {
    localStorage.setItem(GEO_SNOOZE_UNTIL_KEY, String(Date.now() + GEO_PROMPT_SNOOZE_MS));
  } catch (_) {
    // noop
  }
}

function isGeoPromptSnoozed() {
  try {
    const until = Number(localStorage.getItem(GEO_SNOOZE_UNTIL_KEY) || 0);
    return until > Date.now();
  } catch (_) {
    return false;
  }
}

async function queryGeoPermissionState() {
  if (!navigator.permissions?.query) return "unknown";
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result?.state || "unknown";
  } catch (_) {
    return "unknown";
  }
}

function getCurrentPositionAsync(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function detectCityByBrowserLocation() {
  if (typeof window === "undefined" || !window.isSecureContext || !("geolocation" in navigator)) {
    saveGeoDetectionState("unsupported");
    return { cityCode: null, source: "unsupported" };
  }

  const cachedGeo = readCachedGeoCity();
  if (cachedGeo && Date.now() - cachedGeo.checkedAt <= GEO_CACHE_TTL_MS) {
    return { cityCode: cachedGeo.cityCode, source: "cache" };
  }

  const permissionState = await queryGeoPermissionState();
  if (permissionState === "denied") {
    saveGeoDetectionState("denied", cachedGeo?.cityCode || "");
    return { cityCode: cachedGeo?.cityCode || null, source: "denied" };
  }

  if (permissionState === "prompt" && isGeoPromptSnoozed()) {
    return { cityCode: cachedGeo?.cityCode || null, source: "snoozed" };
  }

  try {
    const position = await getCurrentPositionAsync({
      enableHighAccuracy: false,
      timeout: 4500,
      maximumAge: 15 * 60 * 1000,
    });
    const nearest = getNearestCityByCoords(position.coords.latitude, position.coords.longitude);
    if (!nearest || nearest.distanceKm > GEO_SERVICE_RADIUS_KM) {
      saveGeoDetectionState("outside-service-area");
      return { cityCode: null, source: "outside-service-area" };
    }
    saveGeoDetectionState("granted", nearest.cityCode);
    return { cityCode: nearest.cityCode, source: "geolocation" };
  } catch (error) {
    saveGeoDetectionState("error", cachedGeo?.cityCode || "");
    if (permissionState === "prompt" || error?.code === 1) {
      snoozeGeoPrompt();
    }
    return { cityCode: cachedGeo?.cityCode || null, source: "error" };
  }
}

/**
 * Generate dynamic Schema.org LocalBusiness JSON-LD for the given city
 */
export function generateLocalBusinessSchema(cityCode) {
  const city = CITIES_DATA[cityCode];
  if (!city) return "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Правильные Грузчики ${city.name}`,
    "image": "https://pragruz.ru/assets/service-pogruzka-razgruzka.webp",
    "telephone": city.phone,
    "url": `https://pragruz.ru/`,
    "priceRange": "800RUB - 2000RUB",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": city.address.split(",").slice(1).join(",").trim(),
      "addressLocality": city.name.split(" / ")[0],
      "addressCountry": "RU"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  };

  return `<script type="application/ld+json" data-generated-schema="local-business">${JSON.stringify(schema)}</script>`;
}

/**
 * Generate FAQ page Schema.org JSON-LD dynamically for the current city
 */
export function generateFAQSchema() {
  const cityCode = localStorage.getItem("selected_city") || "krasnodar";
  const data = CITIES_DATA[cityCode];
  if (!data) return "";

  const questions = [
    {
      name: "Есть ли скрытые наценки за этаж или тяжелые вещи?",
      text: "Нет, у нас абсолютно честная почасовая оплата! Все базовые тарифы начинаются от 800 руб/час за наличный расчет. Подъемы на этаж рассчитываются индивидуально в зависимости от веса груза и наличия лифта, чтобы предложить вам наиболее выгодные условия."
    },
    {
      name: "Каков минимальный объем заказа по времени?",
      text: "Минимальный заказ для выезда грузчика или разнорабочего составляет всего 2 часа. Это позволяет вам экономно заказать персонал для мелких квартирных дел, разгрузки небольшой мебели или бытовой техники."
    },
    {
      name: "Как быстро бригада приедет на объект?",
      text: `При срочном заказе свободная бригада, находящаяся в вашем районе ${data.cases.gen}, выезжает немедленно. Среднее время прибытия составляет 30 - 45 минут после звонка. Однако для гарантированного наличия транспорта и рабочих на определенный час рекомендуем делать заказ заранее.`
    },
    {
      name: "Как вы работаете по безналичному расчету с ООО и ИП?",
      text: "Да, мы официально зарегистрированное юридическое лицо (ООО). Работа с юридическими лицами ведется по безналичному расчету (с НДС и без НДС) по индивидуальным тарифам. Предоставляем полный комплект закрывающих документов по ЭДО или почтой."
    },
    {
      name: "Что происходит, если грузчик что-то сломает или разобьет?",
      text: "Мы гарантируем максимальную аккуратность и профессионализм сотрудников при погрузке и транспортировке. Используем надежные крепежные ремни в машинах и защитную упаковку для хрупких предметов. Все спорные ситуации решаются индивидуально в пользу клиента."
    }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.name,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.text
      }
    }))
  };

  return `<script type="application/ld+json" data-generated-schema="faq">${JSON.stringify(schema)}</script>`;
}

/**
 * Inject dynamic Schema.org into page head
 */
export function injectSchemas(cityCode) {
  document.querySelectorAll('script[data-generated-schema="local-business"], script[data-generated-schema="faq"]').forEach((el) => el.remove());

  const head = document.head;
  head.insertAdjacentHTML("beforeend", generateLocalBusinessSchema(cityCode));

  if (document.getElementById("faq") || document.querySelector(".faq-item")) {
    head.insertAdjacentHTML("beforeend", generateFAQSchema());
  }
}

function getFixedPageCity() {
  const bodyCity = document.body?.dataset.city;
  if (ALLOWED_CITY_CODES.includes(bodyCity)) return bodyCity;

  const pathSegments = (window.location.pathname || "").split("/").filter(Boolean);
  const pathCity = pathSegments.find((segment) => ALLOWED_CITY_CODES.includes(segment));
  return pathCity || null;
}

function getCityHomeHref(cityCode) {
  const basePath = detectSiteBasePath();
  return cityCode === "krasnodar" ? `${basePath}index.html` : `${basePath}${cityCode}/index.html`;
}

function getCityAnchorHref(cityCode, anchorId) {
  return `${getCityHomeHref(cityCode)}#${anchorId}`;
}

function getCityServiceHref(cityCode, serviceKey) {
  const servicePath = CITY_SERVICE_PATHS[serviceKey];
  if (!servicePath) return null;
  const basePath = detectSiteBasePath();
  return `${basePath}${cityCode}/${servicePath}`;
}

function updateGlobalShellLinks(cityCode) {
  if (getFixedPageCity()) return;

  const homeHref = getCityHomeHref(cityCode);
  document.querySelectorAll("[data-city-home-link]").forEach((link) => {
    link.setAttribute("href", homeHref);
  });

  document.querySelectorAll("[data-city-anchor-link]").forEach((link) => {
    const anchorId = link.getAttribute("data-city-anchor-link");
    if (!anchorId) return;
    link.setAttribute("href", getCityAnchorHref(cityCode, anchorId));
  });

  document.querySelectorAll("[data-city-order-link]").forEach((link) => {
    link.setAttribute("href", getCityAnchorHref(cityCode, "order-form-section"));
  });

  document.querySelectorAll("[data-city-service-link]").forEach((link) => {
    const serviceKey = link.getAttribute("data-city-service-link");
    const href = getCityServiceHref(cityCode, serviceKey);
    if (href) link.setAttribute("href", href);
  });
}

/**
 * Get redirect URL when changing city
 */
export function getCityPageRedirect(cityCode) {
  const cityFolders = ALLOWED_CITY_CODES;
  const cityServiceFiles = [
    "loaders.html", "workers.html", "moving.html", "office-moving.html",
    "rigging.html", "furniture.html", "kvartirnyj-pereezd.html",
    "ofisnyj-pereezd.html", "raznorabochie.html", "arenda-gazeli-3m.html",
    "arenda-gazeli-udlinennoj.html", "autsorsing.html",
    "gruzchiki-na-chas.html", "gruzchiki-na-smenu.html",
    "raznorabochie-na-sklad.html", "raznorabochie-na-stroyku.html",
    "perevozka-mebeli.html", "vyvoz-musora.html"
  ];

  const path = window.location.pathname || "";
  const segments = path.split("/").filter(Boolean);
  const cityIndex = segments.findIndex((segment) => cityFolders.includes(segment));
  const lastSegment = segments[segments.length - 1] || "";
  const isDirectoryUrl = path.endsWith("/");

  // Краснодар = корень сайта (/), отдельной главной /krasnodar/ нет
  const cityHome = (code) => (code === "krasnodar" ? "../index.html" : `../${code}/index.html`);
  const cityHomeFromRoot = (code) => (code === "krasnodar" ? "index.html" : `${code}/index.html`);

  if (cityIndex !== -1) {
    const currentCity = segments[cityIndex];
    const tail = segments.slice(cityIndex + 1).join("/");
    const isCityHome = !tail || tail === "index.html" || (isDirectoryUrl && segments.length === cityIndex + 1);

    // На /krasnodar/ (старый URL) — всегда уводим на корень, если выбран Краснодар
    if (currentCity === "krasnodar" && isCityHome) {
      return cityCode === "krasnodar" ? "../index.html" : cityHome(cityCode);
    }

    if (currentCity === cityCode) return null;

    if (isCityHome) {
      return cityHome(cityCode);
    }
    // Сервисные страницы города: krasnodar/loaders.html и т.п. — оставляем
    if (cityCode === "krasnodar") {
      // для Краснодара сервисные могут жить в /krasnodar/*.html или в корне — сохраняем tail в папке krasnodar
      return `../krasnodar/${tail}`;
    }
    return `../${cityCode}/${tail}`;
  }

  // Мы на корне или корневой услуге
  if (cityServiceFiles.includes(lastSegment)) {
    // корневые услуги: при смене города уходим в city/service
    if (cityCode === "krasnodar") return null; // остаёмся на корневой услуге / донастроим при необходимости
    return `${cityCode}/${lastSegment}`;
  }

  if (!lastSegment || lastSegment === "index.html") {
    // главная /
    if (cityCode === "krasnodar") return null;
    return cityHomeFromRoot(cityCode);
  }

  return null;
}

/**
 * Render city-specific content on the page
 * Updates all text spans, phone numbers, addresses, SEO links, page titles, and reviews
 */
export function renderCity(cityCode, options = {}) {
  if (!CITIES_DATA[cityCode] || !ALLOWED_CITY_CODES.includes(cityCode)) cityCode = "krasnodar";

  localStorage.setItem("selected_city", cityCode);

  if (options.navigate === true) {
    const redirectUrl = getCityPageRedirect(cityCode);
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
  }

  const data = CITIES_DATA[cityCode];

  // Update city name spans
  document.querySelectorAll(".city-name").forEach((span) => {
    const caseName = span.getAttribute("data-case") || "nom";
    if (data.cases[caseName]) span.textContent = data.cases[caseName];
  });

  document.querySelectorAll(".js-city-name").forEach((node) => {
    node.textContent = data.name;
  });
  document.querySelectorAll(".js-city-prep").forEach((node) => {
    node.textContent = data.cases.prep;
  });

  // Update SEO links and shell links that should follow the selected city on global pages
  const citySeoSection = document.querySelector(".seo-links-section[data-dynamic-city-links]");
  if (citySeoSection) {
    citySeoSection.querySelectorAll("a[data-service-path]").forEach((link) => {
      const servicePath = link.getAttribute("data-service-path") || "";
      const basePath = detectSiteBasePath();
      const href = `${basePath}${cityCode}/${servicePath}`;
      link.setAttribute("href", href);
    });
  }
  updateGlobalShellLinks(cityCode);

  // Update address fields
  document.querySelectorAll(".city-address").forEach((span) => {
    span.textContent = data.address;
  });
  document.querySelectorAll(".city-region").forEach((span) => {
    span.textContent = data.region;
  });

  // Update phone links
  const cleanPhone = SITE_PHONE_TEL;
  const formattedPhone = SITE_PHONE_DISPLAY;

  const headerPhone = document.getElementById("header-phone");
  if (headerPhone) {
    headerPhone.textContent = formattedPhone;
    headerPhone.href = `tel:${cleanPhone}`;
  }

  const mobilePhone = document.querySelector(".mobile-phone-link");
  if (mobilePhone) {
    mobilePhone.textContent = formattedPhone;
    mobilePhone.href = `tel:${cleanPhone}`;
  }

  const footerPhone = document.querySelector('.footer-contacts a[href^="tel:"]');
  if (footerPhone) {
    footerPhone.textContent = formattedPhone;
    footerPhone.href = `tel:${cleanPhone}`;
  }

  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.href = `tel:${cleanPhone}`;
    if (
      link.classList.contains("phone-link") ||
      link.classList.contains("mobile-phone-link") ||
      link.closest(".footer-contacts") ||
      link.textContent.trim().match(/^\+?7/)
    ) {
      link.textContent = formattedPhone;
    }
  });

  // Update page title and meta only for pages that intentionally use dynamic geo-SEO
  const pageType = document.body.getAttribute("data-page") || "";
  const titles = {
    index: [
      `Правильные Грузчики ${data.name} | Услуги грузчиков, разнорабочих и такелажников 24/7`,
      `Услуги профессиональных грузчиков, разнорабочих и такелажников ${data.cases.prep} от 800 руб/час. Работаем 24/7.`,
    ],
    loaders: [
      `Услуги профессиональных грузчиков ${data.cases.prep} | Заказать грузчиков недорого круглосуточно`,
      `Заказать профессиональных грузчиков ${data.cases.prep} от 800 руб/час. Быстрая подача за 30 минут, работаем 24/7.`,
    ],
    loaders_hourly: [
      `Грузчики на час ${data.cases.prep} | Заказать грузчика на час недорого`,
      `Услуги профессиональных грузчиков на час ${data.cases.prep} от 800 руб/час. Быстрая подача за 30 минут, почасовая оплата, работаем 24/7.`,
    ],
    loaders_shift: [
      `Грузчики на смену ${data.cases.prep} | Аренда грузчиков на смену (8 часов)`,
      `Услуги грузчиков на смену ${data.cases.prep} от 800 руб/час. Срочное предоставление персонала на склады и производства.`,
    ],
    workers: [
      `Услуги разнорабочих ${data.cases.prep} | Разнорабочие на стройку, склад и производство`,
      `Аренда разнорабочих ${data.cases.prep} от 800 руб/час. Срочный вывод от 1 до 50 человек за сутки.`,
    ],
    workers_warehouse: [
      `Разнорабочие на склад ${data.cases.prep} | Складские рабочие и комплектовщики`,
      `Аренда разнорабочих на склад ${data.cases.prep} от 800 руб/час. Комплектовка, фасовка, стикеровка, погрузочные работы.`,
    ],
    workers_construction: [
      `Разнорабочие на стройку ${data.cases.prep} | Подсобники и строительные рабочие`,
      `Услуги разнорабочих и подсобных рабочих на стройку ${data.cases.prep} от 800 руб/час. Уборка мусора, поднос материалов.`,
    ],
    moving: [
      `Квартирные и офисные переезды ${data.cases.prep} | Заказать переезд под ключ`,
      `Бережный квартирный и офисный переезд ${data.cases.prep} под ключ от 800 руб/час.`,
    ],
    moving_furniture: [
      `Перевозка мебели с грузчиками ${data.cases.prep} | Заказать перевозку мебели недорого`,
      `Бережная перевозка мебели ${data.cases.prep} с грузчиками от 800 руб/час. Разборка, сборка, упаковка под ключ.`,
    ],
    moving_waste: [
      `Вывоз мусора с грузчиками ${data.cases.prep} | Вывесить строительный мусор недорого`,
      `Быстрый вывоз мусора с грузчиками ${data.cases.prep} от 800 руб/час. Строительный и бытовой мусор, старая мебель на полигон.`,
    ],
    rigging: [
      `Такелажные работы ${data.cases.prep} | Перевозка тяжелого оборудования и сейфов`,
      `Профессиональный такелаж любой сложности ${data.cases.prep}. Договорные цены.`,
    ],
    furniture: [
      `Сборка мебели и стеллажей ${data.cases.prep} | Услуги сборщиков мебели`,
      `Профессиональная сборка мебели и монтаж стеллажей ${data.cases.prep}.`,
    ],
    cargo: [
      `Грузоперевозки ${data.cases.prep} и по РФ | Визуальный подбор Газели и фургона`,
      `Грузоперевозки ${data.cases.prep}, по краю и по России. Визуальный калькулятор загрузки кузова.`,
    ],
    intercity: [
      `Междугородние переезды ${data.cases.prep} | Перевозка вещей и мебели по России`,
      `Междугородние переезды ${data.cases.prep} и по России: квартира, офис, мебель и личные вещи с грузчиками и транспортом под ключ.`,
    ],
  };

  const seoPair = titles[pageType];
  if (seoPair) {
    const [titleStr, descStr] = seoPair;
    document.title = titleStr;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", descStr);
  }

  // Update selector button
  const btnText = document.getElementById("city-btn-text");
  if (btnText) btnText.textContent = data.name;

  // Update dropdown active state
  document.querySelectorAll(".city-item").forEach((item) => {
    item.classList.toggle("active", item.getAttribute("data-city") === cityCode);
  });

  // Inject managed Schema.org only on geo-target landing pages
  if (new Set(["index", "city", "loaders", "loaders_hourly", "loaders_shift", "workers", "workers_warehouse", "workers_construction", "moving", "moving_furniture", "moving_waste", "rigging", "furniture", "cargo", "intercity"]).has(pageType)) {
    injectSchemas(cityCode);
  }

  // Dispatch event for other modules to react
  document.dispatchEvent(new CustomEvent("cityChanged", { detail: { cityCode, data } }));
}

/**
 * Resolve the current city.
 * Priority: fixed city page -> explicitly confirmed visitor choice -> browser geolocation -> remembered fallback -> Краснодар.
 */
export async function detectUserCity() {
  const defaultCity = "krasnodar";
  const pathSegments = (window.location.pathname || "").split("/").filter(Boolean);
  const pathCity = pathSegments.find((segment) => ALLOWED_CITY_CODES.includes(segment));
  const bodyCity = document.body?.dataset.city;
  const pageCity = ALLOWED_CITY_CODES.includes(bodyCity) ? bodyCity : pathCity;

  if (pageCity && CITIES_DATA[pageCity]) {
    return { cityCode: pageCity, isConfirmed: true, source: "page" };
  }

  const savedCity = localStorage.getItem("selected_city");
  const savedCityConfirmed = localStorage.getItem("city_confirmed") === "true";
  if (savedCityConfirmed && savedCity && CITIES_DATA[savedCity] && ALLOWED_CITY_CODES.includes(savedCity)) {
    return { cityCode: savedCity, isConfirmed: true, source: "manual" };
  }

  const geoDetection = await detectCityByBrowserLocation();
  if (geoDetection.cityCode && CITIES_DATA[geoDetection.cityCode]) {
    return { cityCode: geoDetection.cityCode, isConfirmed: false, source: geoDetection.source };
  }

  if (savedCity && CITIES_DATA[savedCity] && ALLOWED_CITY_CODES.includes(savedCity)) {
    return { cityCode: savedCity, isConfirmed: savedCityConfirmed, source: "stored-fallback" };
  }

  if (savedCity) {
    localStorage.removeItem("selected_city");
    localStorage.removeItem("city_confirmed");
  }
  return { cityCode: defaultCity, isConfirmed: false, source: "default" };
}

/**
 * Initialize city selector UI and geo-targeting
 */
export async function initGeotargeting() {
  const cityConfirmBanner = document.getElementById("city-confirm-banner");
  const cityBtn = document.getElementById("current-selected-city");
  const cityDropdown = document.getElementById("city-dropdown-menu");
  const btnYes = document.getElementById("btn-city-confirm-yes");
  const btnNo = document.getElementById("btn-city-confirm-no");
  let userSelectedCity = false;

  const setCityDropdownOpen = (isOpen) => {
    if (!cityDropdown) return;
    cityDropdown.classList.toggle("active", isOpen);
    cityDropdown.setAttribute("aria-hidden", String(!isOpen));
    if (cityBtn) cityBtn.setAttribute("aria-expanded", String(isOpen));
  };

  // Bind the selector before city state resolution so it responds immediately.
  setCityDropdownOpen(false);

  if (cityBtn && cityDropdown) {
    cityBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setCityDropdownOpen(!cityDropdown.classList.contains("active"));
      if (cityConfirmBanner) cityConfirmBanner.classList.remove("active");
    });
  }

  document.addEventListener("click", () => {
    setCityDropdownOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cityDropdown?.classList.contains("active")) {
      setCityDropdownOpen(false);
      cityBtn?.focus();
    }
  });

  document.querySelectorAll(".city-item").forEach((item) => {
    item.addEventListener("click", () => {
      const code = item.getAttribute("data-city");
      if (code && CITIES_DATA[code]) {
        userSelectedCity = true;
        localStorage.setItem("city_confirmed", "true");
        setCityDropdownOpen(false);
        renderCity(code, { navigate: true });
        if (cityConfirmBanner) cityConfirmBanner.classList.remove("active");
      }
    });
  });

  if (btnYes) {
    btnYes.addEventListener("click", () => {
      localStorage.setItem("city_confirmed", "true");
      if (cityConfirmBanner) cityConfirmBanner.classList.remove("active");
    });
  }

  if (btnNo) {
    btnNo.addEventListener("click", (e) => {
      e.stopPropagation();
      if (cityConfirmBanner) cityConfirmBanner.classList.remove("active");
      setCityDropdownOpen(true);
    });
  }

  const { cityCode, isConfirmed } = await detectUserCity();
  if (userSelectedCity) return;

  renderCity(cityCode);

  const wasConfirmed = localStorage.getItem("city_confirmed") === "true";
  if (!wasConfirmed && !isConfirmed && cityConfirmBanner) {
    const detectedCityName = document.getElementById("detected-city-name");
    if (detectedCityName) detectedCityName.textContent = CITIES_DATA[cityCode].name;
    setTimeout(() => cityConfirmBanner.classList.add("active"), 1200);
  }
}
