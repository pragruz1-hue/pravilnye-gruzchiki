/**
 * City data and geotargeting module
 * Includes CITIES_DATA, Schema.org generation, IP-based city detection, and city rendering
 */

import { detectSiteBasePath } from "./helpers.js";

const SITE_PHONE_DISPLAY = "+7 (928) 333-32-81";
const SITE_PHONE_TEL = "+79283333281";

export const CITIES_DATA = {
  krasnodar: {
    name: "Краснодар",
    cases: { nom: "Краснодар", prep: "в Краснодаре", gen: "Краснодара" },
    address: "350004, г. Краснодар, ул. Кропоткина, д. 50, офис 339",
    region: "Краснодарского края",
    phone: SITE_PHONE_DISPLAY,
  },
  anapa: {
    name: "Анапа",
    cases: { nom: "Анапа", prep: "в Анапе", gen: "Анапы" },
    address: "353440, г. Анапа, ул. Крымская, д. 177, офис 12",
    region: "Краснодарского края",
    phone: SITE_PHONE_DISPLAY,
  },
  novorossiysk: {
    name: "Новороссийск",
    cases: { nom: "Новороссийск", prep: "в Новороссийске", gen: "Новороссийска" },
    address: "353900, г. Новороссийск, ул. Советов, д. 42, офис 18",
    region: "Краснодарского края",
    phone: SITE_PHONE_DISPLAY,
  },
  sochi: {
    name: "Сочи / Адлер / Сириус",
    cases: { nom: "Сочи / Адлер / Сириус", prep: "в Сочи, Адлере и Сириусе", gen: "Сочи, Адлера и Сириуса" },
    address: "354340, г. Сочи, Адлерский район, ул. Кирова, д. 58, офис 7",
    region: "Краснодарского края",
    phone: SITE_PHONE_DISPLAY,
  },
  gelendzhik: {
    name: "Геленджик",
    cases: { nom: "Геленджик", prep: "в Геленджике", gen: "Геленджика" },
    address: "353460, г. Геленджик, ул. Луначарского, д. 6, офис 21",
    region: "Краснодарского края",
    phone: SITE_PHONE_DISPLAY,
  },
  moscow: {
    name: "Москва",
    cases: { nom: "Москва", prep: "в Москве", gen: "Москвы" },
    address: "101000, г. Москва, ул. Мясницкая, д. 24, офис 102",
    region: "Москвы",
    phone: SITE_PHONE_DISPLAY,
  },
  spb: {
    name: "Санкт-Петербург",
    cases: { nom: "Санкт-Петербург", prep: "в Санкт-Петербурге", gen: "Санкт-Петербурга" },
    address: "191025, г. Санкт-Петербург, Невский проспект, д. 42, офис 15",
    region: "Санкт-Петербурга",
    phone: SITE_PHONE_DISPLAY,
  },
  novosibirsk: {
    name: "Новосибирск",
    cases: { nom: "Новосибирск", prep: "в Новосибирске", gen: "Новосибирска" },
    address: "630099, г. Новосибирск, Красный проспект, д. 28, офис 412",
    region: "Новосибирской области",
    phone: SITE_PHONE_DISPLAY,
  },
  ekaterinburg: {
    name: "Екатеринбург",
    cases: { nom: "Екатеринбург", prep: "в Екатеринбурге", gen: "Екатеринбурга" },
    address: "620014, г. Екатеринбург, ул. Малышева, д. 51, офис 805",
    region: "Свердловской области",
    phone: SITE_PHONE_DISPLAY,
  },
  kazan: {
    name: "Казань",
    cases: { nom: "Казань", prep: "в Казани", gen: "Казани" },
    address: "420111, г. Казань, ул. Баумана, д. 12, офис 301",
    region: "Республики Татарстан",
    phone: SITE_PHONE_DISPLAY,
  },
  nn: {
    name: "Нижний Новгород",
    cases: { nom: "Нижний Новгород", prep: "в Нижнем Новгороде", gen: "Нижнего Новгорода" },
    address: "603005, г. Нижний Новгород, ул. Большая Покровская, д. 15, офис 204",
    region: "Нижегородской области",
    phone: SITE_PHONE_DISPLAY,
  },
  chelyabinsk: {
    name: "Челябинск",
    cases: { nom: "Челябинск", prep: "в Челябинске", gen: "Челябинска" },
    address: "454091, г. Челябинск, проспект Ленина, д. 64, офис 512",
    region: "Челябинской области",
    phone: SITE_PHONE_DISPLAY,
  },
  samara: {
    name: "Самара",
    cases: { nom: "Самара", prep: "в Самаре", gen: "Самары" },
    address: "443099, г. Самара, ул. Ленинградская, д. 45, офис 311",
    region: "Самарской области",
    phone: SITE_PHONE_DISPLAY,
  },
  rostov: {
    name: "Ростов-на-Дону",
    cases: { nom: "Ростов-на-Дону", prep: "в Ростове-на-Дону", gen: "Ростова-на-Дону" },
    address: "344002, г. Ростов-на-Дону, ул. Большая Садовая, д. 82, офис 219",
    region: "Ростовской области",
    phone: SITE_PHONE_DISPLAY,
  },
  ufa: {
    name: "Уфа",
    cases: { nom: "Уфа", prep: "в Уфе", gen: "Уфы" },
    address: "450077, г. Уфа, ул. Ленина, д. 32, офис 104",
    region: "Республики Башкортостан",
    phone: SITE_PHONE_DISPLAY,
  },
  voronezh: {
    name: "Воронеж",
    cases: { nom: "Воронеж", prep: "в Воронеже", gen: "Воронежа" },
    address: "394036, г. Воронеж, проспект Революции, д. 18, офис 302",
    region: "Воронежской области",
    phone: SITE_PHONE_DISPLAY,
  },
  volgograd: {
    name: "Волгоград",
    cases: { nom: "Волгоград", prep: "в Волгограде", gen: "Волгограда" },
    address: "400066, г. Волгоград, проспект Ленина, д. 12, офис 410",
    region: "Волгоградской области",
    phone: SITE_PHONE_DISPLAY,
  },
};

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
    "priceRange": "800RUB - 2500RUB",
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

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
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

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * Inject dynamic Schema.org into page head
 */
export function injectSchemas(cityCode) {
  // Remove old JSON-LD scripts
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

  // Insert new ones
  const localBusiness = generateLocalBusinessSchema(cityCode);
  const faq = generateFAQSchema();
  const head = document.head;
  head.insertAdjacentHTML("beforeend", localBusiness);
  head.insertAdjacentHTML("beforeend", faq);
}

/**
 * Get redirect URL when changing city
 */
export function getCityPageRedirect(cityCode) {
  const cityFolders = Object.keys(CITIES_DATA);
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

  if (cityIndex !== -1) {
    const currentCity = segments[cityIndex];
    if (currentCity === cityCode) return null;
    const tail = segments.slice(cityIndex + 1).join("/");
    if (!tail || tail === "index.html" || isDirectoryUrl) {
      return `../${cityCode}/index.html`;
    }
    return `../${cityCode}/${tail}`;
  }

  if (cityServiceFiles.includes(lastSegment)) {
    return `${cityCode}/${lastSegment}`;
  }

  if (!lastSegment || lastSegment === "index.html") {
    return `${cityCode}/index.html`;
  }

  return null;
}

/**
 * Render city-specific content on the page
 * Updates all text spans, phone numbers, addresses, SEO links, page titles, and reviews
 */
export function renderCity(cityCode, options = {}) {
  if (!CITIES_DATA[cityCode]) return;

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

  // Update SEO links
  const citySeoSection = document.querySelector(".seo-links-section[data-dynamic-city-links]");
  if (citySeoSection) {
    const basePath = cityCode + "/";
    citySeoSection.querySelectorAll("a[data-service-path]").forEach((link) => {
      const servicePath = link.getAttribute("data-service-path") || "";
      link.setAttribute("href", basePath + servicePath);
    });
  }

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
  if (headerPhone) { headerPhone.textContent = formattedPhone; headerPhone.href = `tel:${cleanPhone}`; }

  const mobilePhone = document.querySelector(".mobile-phone-link");
  if (mobilePhone) { mobilePhone.textContent = formattedPhone; mobilePhone.href = `tel:${cleanPhone}`; }

  const footerPhone = document.querySelector('.footer-contacts a[href^="tel:"]');
  if (footerPhone) { footerPhone.textContent = formattedPhone; footerPhone.href = `tel:${cleanPhone}`; }

  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.href = `tel:${cleanPhone}`;
    if (link.classList.contains("phone-link") || link.classList.contains("mobile-phone-link") ||
        link.closest(".footer-contacts") || link.textContent.trim().match(/^\+?7/)) {
      link.textContent = formattedPhone;
    }
  });

  // Update page title and meta
  const pageType = document.body.getAttribute("data-page") || "index";
  const titles = {
    loaders: [`Услуги профессиональных грузчиков \${data.cases.prep} | Заказать грузчиков недорого круглосуточно`,
              `Заказать профессиональных грузчиков \${data.cases.prep} от 800 руб/час. Быстрая подача за 30 минут, работаем 24/7.`],
    loaders_hourly: [`Грузчики на час \${data.cases.prep} | Заказать грузчика на час недорого`,
                     `Услуги профессиональных грузчиков на час \${data.cases.prep} от 800 руб/час. Быстрая подача за 30 минут, почасовая оплата, работаем 24/7.`],
    loaders_shift: [`Грузчики на смену \${data.cases.prep} | Аренда грузчиков на смену (8 часов)`,
                    `Услуги грузчиков на смену \${data.cases.prep} от 800 руб/час. Срочное предоставление персонала на склады и производства.`],
    workers: [`Услуги разнорабочих \${data.cases.prep} | Разнорабочие на стройку, склад и производство`,
              `Аренда разнорабочих \${data.cases.prep} от 800 руб/час. Срочный вывод от 1 до 50 человек за сутки.`],
    workers_warehouse: [`Разнорабочие на склад \${data.cases.prep} | Складские рабочие и комплектовщики`,
                        `Аренда разнорабочих на склад \${data.cases.prep} от 800 руб/час. Комплектовка, фасовка, стикеровка, погрузочные работы.`],
    workers_construction: [`Разнорабочие на стройку \${data.cases.prep} | Подсобники и строительные рабочие`,
                          `Услуги разнорабочих и подсобных рабочих на стройку \${data.cases.prep} от 800 руб/час. Уборка мусора, поднос материалов.`],
    moving: [`Квартирные и офисные переезды \${data.cases.prep} | Заказать переезд под ключ`,
             `Бережный квартирный и офисный переезд \${data.cases.prep} под ключ от 800 руб/час.`],
    moving_furniture: [`Перевозка мебели с грузчиками \${data.cases.prep} | Заказать перевозку мебели недорого`,
                       `Бережная перевозка мебели \${data.cases.prep} с грузчиками от 800 руб/час. Разборка, сборка, упаковка под ключ.`],
    moving_waste: [`Вывоз мусора с грузчиками \${data.cases.prep} | Вывесить строительный мусор недорого`,
                   `Быстрый вывоз мусора с грузчиками \${data.cases.prep} от 800 руб/час. Строительный и бытовой мусор, старая мебель на полигон.`],
    rigging: [`Такелажные работы \${data.cases.prep} | Перевозка тяжелого оборудования и сейфов`,
              `Профессиональный такелаж любой сложности \${data.cases.prep}. Договорные цены.`],
    furniture: [`Сборка мебели и стеллажей \${data.cases.prep} | Услуги сборщиков мебели`,
                `Профессиональная сборка мебели и монтаж стеллажей \${data.cases.prep}.`],
    cargo: [`Грузоперевозки \${data.cases.prep} и по РФ | Визуальный подбор Газели и фургона`,
            `Грузоперевозки \${data.cases.prep}, по краю и по России. Визуальный калькулятор загрузки кузова.`],
  };

  const [titleStr, descStr] = titles[pageType] || [
    `Правильные Грузчики ${data.name} | Услуги грузчиков, разнорабочих и такелажников 24/7`,
    `Услуги профессиональных грузчиков, разнорабочих и такелажников ${data.cases.prep} от 800 руб/час. Работаем 24/7.`
  ];

  document.title = titleStr;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", descStr);

  // Update selector button
  const btnText = document.getElementById("city-btn-text");
  if (btnText) btnText.textContent = data.name;

  // Update dropdown active state
  document.querySelectorAll(".city-item").forEach((item) => {
    item.classList.toggle("active", item.getAttribute("data-city") === cityCode);
  });

  // Inject dynamic Schema.org
  injectSchemas(cityCode);

  // Dispatch event for other modules to react
  document.dispatchEvent(new CustomEvent("cityChanged", { detail: { cityCode, data } }));
}

/**
 * IP-based city detection
 */
export async function detectUserCity() {
  const defaultCity = "krasnodar";
  const savedCity = localStorage.getItem("selected_city");
  if (savedCity && CITIES_DATA[savedCity]) {
    return { cityCode: savedCity, isConfirmed: true };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const response = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error("Response error");
    const data = await response.json();

    const geoCityName = data.city;
    if (geoCityName) {
      const lowerGeoCity = geoCityName.toLowerCase();
      const cityMap = {
        moscow: "moscow", petersburg: "spb", krasnodar: "krasnodar",
        anapa: "anapa", novorossiysk: "novorossiysk", sochi: "sochi",
        adler: "sochi", sirius: "sochi", gelendzhik: "gelendzhik",
        novosibirsk: "novosibirsk", ekaterinburg: "ekaterinburg",
        kazan: "kazan", novgorod: "nn", chelyabinsk: "chelyabinsk",
        samara: "samara", rostov: "rostov", ufa: "ufa",
        voronezh: "voronezh", volgograd: "volgograd",
      };
      for (const [key, code] of Object.entries(cityMap)) {
        if (lowerGeoCity.includes(key)) return { cityCode: code, isConfirmed: false };
      }
    }
  } catch (e) {
    console.warn("Geotargeting auto-detect failed. Defaulting to Краснодар.", e);
  }

  return { cityCode: defaultCity, isConfirmed: false };
}

/**
 * Initialize city selector UI and geo-targeting
 */
export async function initGeotargeting() {
  const { cityCode, isConfirmed } = await detectUserCity();
  renderCity(cityCode);

  const cityConfirmBanner = document.getElementById("city-confirm-banner");
  const wasConfirmed = localStorage.getItem("city_confirmed") === "true";
  if (!wasConfirmed && !isConfirmed && cityConfirmBanner) {
    const detectedCityName = document.getElementById("detected-city-name");
    if (detectedCityName) detectedCityName.textContent = CITIES_DATA[cityCode].name;
    setTimeout(() => cityConfirmBanner.classList.add("active"), 1200);
  }

  // Event bindings
  const cityBtn = document.getElementById("current-selected-city");
  const cityDropdown = document.getElementById("city-dropdown-menu");
  const btnYes = document.getElementById("btn-city-confirm-yes");
  const btnNo = document.getElementById("btn-city-confirm-no");

  if (cityBtn && cityDropdown) {
    cityBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cityDropdown.classList.toggle("active");
      if (cityConfirmBanner) cityConfirmBanner.classList.remove("active");
    });
  }

  document.addEventListener("click", () => {
    if (cityDropdown) cityDropdown.classList.remove("active");
  });

  document.querySelectorAll(".city-item").forEach((item) => {
    item.addEventListener("click", () => {
      const code = item.getAttribute("data-city");
      if (code && CITIES_DATA[code]) {
        localStorage.setItem("city_confirmed", "true");
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
      if (cityDropdown) cityDropdown.classList.add("active");
    });
  }
}