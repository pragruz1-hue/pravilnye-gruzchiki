#!/usr/bin/env node
/**
 * Build script for Правильные Грузчики
 * Assembles HTML pages from partials by replacing {{BASE}} and injecting components.
 *
 * Usage: node build.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname);
const PARTIALS_DIR = path.join(ROOT, "partials");
const PAGES_DIR = path.join(ROOT, "pages");

// Read partial
function readPartial(name) {
  const filePath = path.join(PARTIALS_DIR, name);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

// Replace {{BASE}} with the given base path
function resolve(partialName, base) {
  return readPartial(partialName).replace(/\{\{BASE\}\}/g, base);
}

// Shared page end (modals + floating buttons + scripts)
function sharedPageEnd(base) {
  return [
    resolve("modals.html", base),
    resolve("floating-buttons.html", base),
  ].join("\n");
}

// All cities matching geotargeting.js
const CITIES = [
  "krasnodar", "anapa", "novorossiysk", "sochi", "gelendzhik",
  "moscow", "spb", "novosibirsk", "ekaterinburg", "kazan",
  "nn", "chelyabinsk", "samara", "rostov", "ufa",
  "voronezh", "volgograd"
];

const CITIES_DATA = {
  krasnodar: {
    name: "Краснодар",
    cases: { nom: "Краснодар", prep: "в Краснодаре", gen: "Краснодара" },
    address: "350004, г. Краснодар, ул. Кропоткина, д. 50, офис 339",
    region: "Краснодарского края",
    phone: "+7 (928) 333-32-81",
  },
  anapa: {
    name: "Анапа",
    cases: { nom: "Анапа", prep: "в Анапе", gen: "Анапы" },
    address: "353440, г. Анапа, ул. Крымская, д. 177, офис 12",
    region: "Краснодарского края",
    phone: "+7 (928) 333-32-81",
  },
  novorossiysk: {
    name: "Новороссийск",
    cases: { nom: "Новороссийск", prep: "в Новороссийске", gen: "Новороссийска" },
    address: "353900, г. Новороссийск, ул. Советов, д. 42, офис 18",
    region: "Краснодарского края",
    phone: "+7 (928) 333-32-81",
  },
  sochi: {
    name: "Сочи / Адлер / Сириус",
    cases: { nom: "Сочи / Адлер / Сириус", prep: "в Сочи, Адлере и Сириусе", gen: "Сочи, Адлера и Сириуса" },
    address: "354340, г. Сочи, Адлерский район, ул. Кирова, д. 58, офис 7",
    region: "Краснодарского края",
    phone: "+7 (928) 333-32-81",
  },
  gelendzhik: {
    name: "Геленджик",
    cases: { nom: "Геленджик", prep: "в Геленджике", gen: "Геленджика" },
    address: "353460, г. Геленджик, ул. Луначарского, д. 6, офис 21",
    region: "Краснодарского края",
    phone: "+7 (928) 333-32-81",
  },
  moscow: {
    name: "Москва",
    cases: { nom: "Москва", prep: "в Москве", gen: "Москвы" },
    address: "101000, г. Москва, ул. Мясницкая, д. 24, офис 102",
    region: "Москвы",
    phone: "+7 (928) 333-32-81",
  },
  spb: {
    name: "Санкт-Петербург",
    cases: { nom: "Санкт-Петербург", prep: "в Санкт-Петербурге", gen: "Санкт-Петербурга" },
    address: "191025, г. Санкт-Петербург, Невский проспект, д. 42, офис 15",
    region: "Санкт-Петербурга",
    phone: "+7 (928) 333-32-81",
  },
  novosibirsk: {
    name: "Новосибирск",
    cases: { nom: "Новосибирск", prep: "в Новосибирске", gen: "Новосибирска" },
    address: "630099, г. Новосибирск, Красный проспект, д. 28, офис 412",
    region: "Новосибирской области",
    phone: "+7 (928) 333-32-81",
  },
  ekaterinburg: {
    name: "Екатеринбург",
    cases: { nom: "Екатеринбург", prep: "в Екатеринбурге", gen: "Екатеринбурга" },
    address: "620014, г. Екатеринбург, ул. Малышева, д. 51, офис 805",
    region: "Свердловской области",
    phone: "+7 (928) 333-32-81",
  },
  kazan: {
    name: "Казань",
    cases: { nom: "Казань", prep: "в Казани", gen: "Казани" },
    address: "420111, г. Казань, ул. Баумана, д. 12, офис 301",
    region: "Республики Татарстан",
    phone: "+7 (928) 333-32-81",
  },
  nn: {
    name: "Нижний Новгород",
    cases: { nom: "Нижний Новгород", prep: "в Нижнем Новгороде", gen: "Нижнего Новгорода" },
    address: "603005, г. Нижний Новгород, ул. Большая Покровская, д. 15, офис 204",
    region: "Нижегородской области",
    phone: "+7 (928) 333-32-81",
  },
  chelyabinsk: {
    name: "Челябинск",
    cases: { nom: "Челябинск", prep: "в Челябинске", gen: "Челябинска" },
    address: "454091, г. Челябинск, проспект Ленина, д. 64, офис 512",
    region: "Челябинской области",
    phone: "+7 (928) 333-32-81",
  },
  samara: {
    name: "Самара",
    cases: { nom: "Самара", prep: "в Самаре", gen: "Самары" },
    address: "443099, г. Самара, ул. Ленинградская, д. 45, офис 311",
    region: "Самарской области",
    phone: "+7 (928) 333-32-81",
  },
  rostov: {
    name: "Ростов-на-Дону",
    cases: { nom: "Ростов-на-Дону", prep: "в Ростове-на-Дону", gen: "Ростова-на-Дону" },
    address: "344002, г. Ростов-на-Дону, ул. Большая Садовая, д. 82, офис 219",
    region: "Ростовской области",
    phone: "+7 (928) 333-32-81",
  },
  ufa: {
    name: "Уфа",
    cases: { nom: "Уфа", prep: "в Уфе", gen: "Уфы" },
    address: "450077, г. Уфа, ул. Ленина, д. 32, офис 104",
    region: "Республики Башкортостан",
    phone: "+7 (928) 333-32-81",
  },
  voronezh: {
    name: "Воронеж",
    cases: { nom: "Воронеж", prep: "в Воронеже", gen: "Воронежа" },
    address: "394036, г. Воронеж, проспект Революции, д. 18, офис 302",
    region: "Воронежской области",
    phone: "+7 (928) 333-32-81",
  },
  volgograd: {
    name: "Волгоград",
    cases: { nom: "Волгоград", prep: "в Волгограде", gen: "Волгограда" },
    address: "400066, г. Волгоград, проспект Ленина, д. 12, офис 410",
    region: "Волгоградской области",
    phone: "+7 (928) 333-32-81",
  },
};

const SERVICES_METADATA = {
  "loaders.html": {
    name: "Услуги грузчиков",
    desc: "Услуги профессиональных грузчиков: квартирные и офисные переезды, погрузка и разгрузка фур, складские работы.",
    price: "800",
    reviews: "154"
  },
  "workers.html": {
    name: "Услуги разнорабочих",
    desc: "Аренда разнорабочих: подсобные работы на стройке, помощь на складах, уборка территорий, фасовочные работы.",
    price: "800",
    reviews: "112"
  },
  "moving.html": {
    name: "Квартирные переезды",
    desc: "Бережный квартирный переезд под ключ: разборка, упаковка, погрузка, транспортировка и сборка мебели.",
    price: "800",
    reviews: "138"
  },
  "office-moving.html": {
    name: "Офисные переезды",
    desc: "Профессиональный переезд офиса любой сложности с грузчиками и мебельным фургоном под ключ.",
    price: "800",
    reviews: "95"
  },
  "rigging.html": {
    name: "Такелажные работы",
    desc: "Профессиональный такелаж: перевозка тяжелого оборудования, сейфов, станков, пианино и хрупких грузов.",
    price: "1000",
    reviews: "87"
  },
  "furniture.html": {
    name: "Сборка мебели",
    desc: "Профессиональные сборщики мебели: разборка и сборка шкафов, кухонных гарнитуров, диванов, монтаж стеллажей.",
    price: "800",
    reviews: "104"
  },
  "arenda-gazeli-3m.html": {
    name: "Аренда Газели 3м",
    desc: "Аренда грузовой Газели длиной 3 метра для перевозки мебели, бытовой техники и строительных материалов.",
    price: "1500",
    reviews: "127"
  },
  "arenda-gazeli-udlinennoj.html": {
    name: "Аренда удлиненной Газели",
    desc: "Аренда грузовой Газели длиной 4.2 метра для перевозки негабаритных грузов и крупных объемов вещей.",
    price: "1800",
    reviews: "98"
  },
  "autsorsing.html": {
    name: "Аутсорсинг персонала",
    desc: "Предоставление временного рабочего персонала (грузчики, разнорабочие, комплектовщики) для бизнеса.",
    price: "800",
    reviews: "76"
  },
  "kvartirnyj-pereezd.html": {
    name: "Квартирный переезд",
    desc: "Организация переезда квартиры под ключ с грузчиками и автотранспортом.",
    price: "800",
    reviews: "123"
  },
  "ofisnyj-pereezd.html": {
    name: "Офисный переезд",
    desc: "Профессиональный офисный переезд: упаковка техники, сейфов, сборка-разборка столов и стеллажей.",
    price: "800",
    reviews: "64"
  },
  "raznorabochie.html": {
    name: "Услуги разнорабочих",
    desc: "Разнорабочие для любых вспомогательных, подсобных, строительных или складских задач.",
    price: "800",
    reviews: "115"
  },
  // Our 6 new low-competition service pages
  "gruzchiki-na-chas.html": {
    name: "Грузчики на час",
    desc: "Услуги профессиональных грузчиков на час. Оперативная подача за 30 минут, почасовая оплата, работаем 24/7.",
    price: "800",
    reviews: "142",
    pageType: "loaders_hourly",
    keywords: "грузчики на час, заказать грузчика на час, грузчики с почасовой оплатой",
    heroTitle: 'Грузчики на час <span class="text-gradient"><span class="city-name" data-case="prep">{{CITY_PREP}}</span></span>',
    heroSubtitle: "Оперативная подача бригады или одного грузчика на час от 30 минут. Почасовая оплата без скрытых наценок. Поможем с любыми мелкими и крупными работами.",
    seoHeading: "Особенности заказа грузчиков с почасовой оплатой",
    seoTextBlock: "Заказ грузчика на час — идеальное решение для небольших бытовых или офисных задач. Вам не нужно переплачивать за полную смену или минимальные 4 часа, если работу можно выполнить за час-два. Мы предлагаем честные условия и прозрачный расчет.",
    accordions: [
      { q: "Выгодно ли заказывать грузчика на один час?", a: "Да, это максимально выгодно для мелких задач: перенести холодильник, поднять стиральную машину, собрать несколько шкафов или разгрузить небольшой фургон. Вы оплачиваете только фактическое время работы от 800 рублей за час." },
      { q: "Как быстро приедет грузчик после звонка?", a: "При срочном выезде специалист прибудет в любой район {{CITY_GEN}} в течение 30-45 минут. Мы распределяем заказы между ближайшими свободными бригадами, чтобы сократить время ожидания." },
      { q: "Есть ли доплата за работу в ночное время?", a: "Нет, наша компания работает в круглосуточном режиме 24/7. Тарифы на услуги грузчиков на час остаются фиксированными как днем, так и в ночные смены." }
    ]
  },
  "gruzchiki-na-smenu.html": {
    name: "Грузчики на смену",
    desc: "Аренда грузчиков на полную смену (8 часов). Надежный и выносливый персонал для складов, производств и крупных переездов.",
    price: "800",
    reviews: "89",
    pageType: "loaders_shift",
    keywords: "грузчики на смену, аренда грузчиков на смену, заказать грузчиков на рабочую смену",
    heroTitle: 'Грузчики на смену <span class="text-gradient"><span class="city-name" data-case="prep">{{CITY_PREP}}</span></span>',
    heroSubtitle: "Предоставляем опытный и выносливый персонал для работы на полную смену (8 часов) на склады, производства, строительные площадки и переезды.",
    seoHeading: "Преимущества аренды грузчиков на смену",
    seoTextBlock: "Заказ персонала на полную смену позволяет значительно сократить расходы при больших объемах работ. Это оптимальный выбор для производственных предприятий, распределительных центров и торговых сетей, которым требуются надежные рабочие руки без простоев.",
    accordions: [
      { q: "Что входит в обязанности грузчика на смену?", a: "Грузчики выполняют любые погрузочно-разгрузочные работы, укладку товара на паллеты, перемещение грузов по складу, помощь в комплектации заказов и фасовке. Рабочий день составляет стандартные 8 часов с перерывом на обед." },
      { q: "Какая стоимость смены грузчика?", a: "Стоимость рассчитывается индивидуально исходя из базовой ставки от 800 рублей в час. Для постоянных клиентов и при заказе от 5 человек действуют специальные сниженные тарифы и гибкая система скидок." },
      { q: "Предоставляется ли замена, если сотрудник заболеет?", a: "Да, мы гарантируем 100% выход персонала. В случае непредвиденных обстоятельств или болезни сотрудника мы оперативно и бесплатно предоставим равноценную замену в кратчайшие сроки." }
    ]
  },
  "raznorabochie-na-sklad.html": {
    name: "Разнорабочие на склад",
    desc: "Аренда разнорабочих на склад. Комплектовка, фасовка, стикеровка, погрузочные работы и поддержание порядка.",
    price: "800",
    reviews: "78",
    pageType: "workers_warehouse",
    keywords: "разнорабочие на склад, складские разнорабочие, комплектовщики на склад",
    heroTitle: 'Разнорабочие на склад <span class="text-gradient"><span class="city-name" data-case="prep">{{CITY_PREP}}</span></span>',
    heroSubtitle: "Опытный складской персонал: разнорабочие, комплектовщики, упаковщики и фасовщики. Быстрый вывод на объект, работаем по договору с НДС и без.",
    seoHeading: "Услуги разнорабочих для складских комплексов",
    seoTextBlock: "Складская логистика требует высокой скорости и аккуратности. Наши разнорабочие помогут оперативно справиться с пиковыми нагрукзами, разгрузить сезонные поступления товаров, провести инвентаризацию или поддерживать идеальный порядок в зонах хранения.",
    accordions: [
      { q: "Какие работы выполняют разнорабочие на складе?", a: "Спектр задач включает: разгрузку и погрузку фур, сборку и сортировку заказов, наклеивание штрих-кодов (стикеровку), фасовку продукции, паллетирование, уборку упаковочных материалов и перемещение грузов с помощью рохли." },
      { q: "Как быстро вы можете вывести бригаду рабочих на склад?", a: "Мы можем предоставить от 1 до 20 подготовленных разнорабочих в течение 24 часов с момента подтверждения заявки. При долгосрочном сотрудничестве график выходов согласовывается заранее." },
      { q: "Как осуществляется оплата для юридических лиц?", a: "Мы работаем официально как ООО по договору. Оплата производится по безналичному расчету (с НДС или без НДС). Предоставляем полный пакет закрывающих документов и актов выполненных работ." }
    ]
  },
  "raznorabochie-na-stroyku.html": {
    name: "Разнорабочие на стройку",
    desc: "Услуги разнорабочих и подсобных рабочих на стройку. Дисциплинированные бригады для уборки мусора, подноса материалов и демонтажа.",
    price: "800",
    reviews: "93",
    pageType: "workers_construction",
    keywords: "разнорабочие на стройку, подсобники на стройку, строительные разнорабочие",
    heroTitle: 'Разнорабочие на стройку <span class="text-gradient"><span class="city-name" data-case="prep">{{CITY_PREP}}</span></span>',
    heroSubtitle: "Предоставляем подсобных рабочих на строительные площадки для любых вспомогательных и физических работ. Выносливые, трудолюбивые и без вредных привычек.",
    seoHeading: "Вспомогательные строительные работы любой сложности",
    seoTextBlock: "Строительные площадки нуждаются в постоянной поддержке чистоты и снабжении квалифицированных мастеров материалами. Наши разнорабочие снимут с ваших специалистов рутинные задачи, повышая общую скорость и эффективность строительства.",
    accordions: [
      { q: "Какие задачи можно поручить разнорабочим на стройплощадке?", a: "Рабочие выполняют: замес цементных растворов, перенос кирпича, блоков, гипсокартона и других материалов, очистку площадки от строительного мусора, демонтажные работы, земляные работы (копка траншей) и помощь в монтаже лесов." },
      { q: "Контролируется ли дисциплина сотрудников?", a: "Да, мы строго следим за дисциплиной, пунктуальностью и соблюдением техники безопасности. На объекты выводятся только трезвые, адекватные и готовые к тяжелому труду рабочие под руководством бригадира." },
      { q: "Можно ли заказать подсобников на выходные дни?", a: "Да, мы работаем без выходных и праздничных дней. Вы можете заказать необходимое количество подсобных рабочих на субботу и воскресенье по стандартной ставке без праздничных наценок." }
    ]
  },
  "perevozka-mebeli.html": {
    name: "Перевозка мебели",
    desc: "Профессиональная перевозка мебели с грузчиками. Разборка, сборка, бережная упаковка и доставка под ключ.",
    price: "800",
    reviews: "116",
    pageType: "moving_furniture",
    keywords: "перевозка мебели, перевезти мебель с грузчиками, заказать перевозку мебели",
    heroTitle: 'Бережная перевозка мебели <span class="text-gradient"><span class="city-name" data-case="prep">{{CITY_PREP}}</span></span>',
    heroSubtitle: "Профессиональная перевозка диванов, шкафов, кухонных гарнитуров и бытовой техники под ключ. Разборка, сборка и бережная упаковка.",
    seoHeading: "Как проходит безопасная перевозка мебели",
    seoTextBlock: "Перевозка мебели требует деликатного отношения, качественного упаковочного материала и надежного закрепления в транспортном средстве. Наши грузчики обладают большим опытом работы со всеми видами мебели, гарантируя сохранность лакированных, стеклянных и деревянных поверхностей.",
    accordions: [
      { q: "Предоставляете ли вы упаковочные материалы?", a: "Да, наши специалисты привозят с собой все необходимые упаковочные материалы: воздушно-пузырьковую пленку, стрейч-пленку, плотный картон, скотч и защитные уголки. Стоимость упаковки рассчитывается отдельно." },
      { q: "Входит ли в стоимость разборка и сборка мебели?", a: "Разборка крупногабаритной мебели (шкафы-купе, кровати, сложные столы) и ее последующая сборка на новом месте выполняются нашими грузчиками-сборщиками. Эта услуга оплачивается по стандартному тарифу от 800 рублей в час без наценок." },
      { q: "Застрахована ли мебель при транспортировке?", a: "Мы несем полную материальную ответственность за сохранность вашего имущества в процессе переноски, погрузки и перевозки. Все обязательства четко прописаны в официальном договоре, который заключается перед началом работ." }
    ]
  },
  "vyvoz-musora.html": {
    name: "Вывоз мусора",
    desc: "Вывоз строительного мусора, старой мебели и бытовых отходов на специализированные полигоны с грузчиками.",
    price: "800",
    reviews: "135",
    pageType: "moving_waste",
    keywords: "вывоз мусора, вывезти строительный мусор с грузчиками, вывоз мусора из квартиры",
    heroTitle: 'Вывоз строительного мусора <span class="text-gradient"><span class="city-name" data-case="prep">{{CITY_PREP}}</span></span>',
    heroSubtitle: "Оперативный вывоз строительного мусора, старого хлама и крупногабаритной мебели из квартир, офисов и загородных участков на полигоны ТБО.",
    seoHeading: "Правильная утилизация строительных и бытовых отходов",
    seoTextBlock: "Строительный мусор категорически запрещено выбрасывать в обычные бытовые контейнеры. Мы предлагаем законный и быстрый вывоз мусора на специализированные полигоны. Предоставим вместительный транспорт (Газели) и аккуратных грузчиков для выноса мусора с любого этажа.",
    accordions: [
      { q: "Какой мусор вы вывозите на утилизацию?", a: "Мы вывозим любые виды неопасных отходов: остатки кирпича, бетона, штукатурки после демонтажа, старые оконные рамы, двери, напольные покрытия, мешки со строительной пылью, сломанную бытовую технику и ветхую мебель." },
      { q: "Включает ли услуга сбор мусора в мешки?", a: "Да, при необходимости наши разнорабочие могут самостоятельно собрать мелкий строительный мусор в мешки, вынести его к машине и погрузить. Стоимость мешков и фасовки согласовывается индивидуально." },
      { q: "Куда вывозится собранный строительный мусор?", a: "Мы сотрудничаем исключительно с официальными загородными полигонами по переработке и захоронению твердых бытовых и строительных отходов. Работаем по закону, не допуская несанкционированных свалок." }
    ]
  }
};

// All service pages that exist for each city (including the 6 new ones)
const CITY_SERVICE_PAGES = [
  "index.html",
  "loaders.html",
  "workers.html",
  "moving.html",
  "office-moving.html",
  "rigging.html",
  "furniture.html",
  "kvartirnyj-pereezd.html",
  "ofisnyj-pereezd.html",
  "raznorabochie.html",
  "arenda-gazeli-3m.html",
  "arenda-gazeli-udlinennoj.html",
  "autsorsing.html",
  // 6 new low-competition pages
  "gruzchiki-na-chas.html",
  "gruzchiki-na-smenu.html",
  "raznorabochie-na-sklad.html",
  "raznorabochie-na-stroyku.html",
  "perevozka-mebeli.html",
  "vyvoz-musora.html"
];

// Root pages (including the 6 new ones)
const rootPages = [
  "index.html",
  "about.html",
  "loaders.html",
  "workers.html",
  "moving.html",
  "office-moving.html",
  "rigging.html",
  "furniture.html",
  "gruzoperevozki.html",
  "thank-you.html",
  // 6 new low-competition pages
  "gruzchiki-na-chas.html",
  "gruzchiki-na-smenu.html",
  "raznorabochie-na-sklad.html",
  "raznorabochie-na-stroyku.html",
  "perevozka-mebeli.html",
  "vyvoz-musora.html"
];

// Generate dynamic Schema.org Service+Offer+AggregateRating
function generateServiceSchema(pageName, cityCode) {
  const meta = SERVICES_METADATA[pageName];
  if (!meta) return "";

  const city = CITIES_DATA[cityCode] || CITIES_DATA["krasnodar"];
  const region = city.region || "Краснодарского края";
  const cityNamePrep = city.cases.prep || "в Краснодаре";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${meta.name} ${cityNamePrep}`,
    "description": `${meta.desc.replace(/в Краснодаре/g, cityNamePrep).replace(/Краснодар/g, city.name)}`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Правильные Грузчики",
      "telephone": city.phone,
      "image": "https://pragruz.ru/assets/logo.png"
    },
    "areaServed": {
      "@type": "State",
      "name": region
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "RUB",
      "price": meta.price,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "priceCurrency": "RUB",
        "price": parseInt(meta.price),
        "unitText": pageName.includes("gazel") ? "выезд" : "час"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": meta.reviews
    }
  };

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

// Ensure the page source file exists; if not, pre-generate it from template
function ensurePageSourceExists(cityCode, pageName, base = "") {
  const destDir = cityCode ? path.join(ROOT, cityCode) : ROOT;
  const destPath = path.join(destDir, pageName);

  if (fs.existsSync(destPath)) {
    return; // Already exists
  }

  // Generate only for the 6 new service pages
  const meta = SERVICES_METADATA[pageName];
  if (!meta || !meta.pageType) return;

  const city = CITIES_DATA[cityCode] || CITIES_DATA["krasnodar"];
  const cityCases = city.cases;

  // Read our template
  const templatePath = path.join(PAGES_DIR, "city-service.html");
  if (!fs.existsSync(templatePath)) {
    console.error(`  ⚠ Service template not found at ${templatePath}`);
    return;
  }
  let template = fs.readFileSync(templatePath, "utf-8");

  // Format Title & Description
  const title = `${meta.name} ${cityCases.prep} | Заказать ${meta.name.toLowerCase()} недорого`;
  const desc = `${meta.desc.replace(/в Краснодаре/g, cityCases.prep).replace(/Краснодар/g, city.name)}`;
  const kws = `${meta.keywords}, ${meta.keywords} ${cityCases.prep}, ${meta.keywords} ${cityCases.nom}`;
  const canonical = `https://pragruz.ru/${cityCode ? cityCode + '/' : ''}${pageName}`;

  // Build Accordions
  const accordionItemsHtml = meta.accordions.map((acc, index) => {
    return `            <details class="seo-accordion-item"${index === 0 ? " open" : ""}>
              <summary>${acc.q.replace(/\{\{CITY_GEN\}\}/g, cityCases.gen).replace(/\{\{CITY_NOM\}\}/g, city.name)}</summary>
              <div class="seo-accordion-content">
                <p>
                  ${acc.a.replace(/\{\{CITY_GEN\}\}/g, cityCases.gen).replace(/\{\{CITY_NOM\}\}/g, city.name)}
                </p>
              </div>
            </details>`;
  }).join("\n");

  // Perform replacements
  let pageContent = template
    .replace(/\{\{METRIKA\}\}/g, readPartial("metrika.html"))
    .replace(/\{\{HEAD_COMMON\}\}/g, resolve("head-common.html", base))
    .replace(/\{\{HEADER\}\}/g, resolve("header.html", base))
    .replace(/\{\{FOOTER\}\}/g, resolve("footer.html", base))
    .replace(/\{\{FOOTER_SCRIPTS\}\}/g, sharedPageEnd(base))
    .replace(/\{\{BASE\}\}/g, base)
    .replace(/\{\{PAGE_TITLE\}\}/g, title)
    .replace(/\{\{PAGE_DESCRIPTION\}\}/g, desc)
    .replace(/\{\{PAGE_KEYWORDS\}\}/g, kws)
    .replace(/\{\{PAGE_CANONICAL\}\}/g, canonical)
    .replace(/\{\{PAGE_TYPE\}\}/g, meta.pageType)
    .replace(/\{\{HERO_TITLE\}\}/g, meta.heroTitle.replace(/\{\{CITY_PREP\}\}/g, cityCases.prep))
    .replace(/\{\{HERO_SUBTITLE\}\}/g, meta.heroSubtitle.replace(/\{\{CITY_PREP\}\}/g, cityCases.prep))
    .replace(/\{\{SEO_HEADING\}\}/g, meta.seoHeading)
    .replace(/\{\{SEO_TEXT_BLOCK\}\}/g, meta.seoTextBlock.replace(/\{\{CITY_GEN\}\}/g, cityCases.gen))
    .replace(/\{\{SEO_ACCORDION_ITEMS\}\}/g, accordionItemsHtml);

  // Create directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(destPath, pageContent, "utf-8");
  console.log(`  ✓ Pre-generated source page: ${cityCode ? cityCode + '/' : ''}${pageName}`);
}

// Find page content between markers in original HTML files
function extractPageContent(html, pageType) {
  let mainMatch = html.match(/<main>([\s\S]*?)<\/main>/i);
  if (mainMatch) return mainMatch[1];

  let bodyMatch = html.match(/<\/header>([\s\S]*?)<footer/i);
  if (bodyMatch) return bodyMatch[1];

  let bodyMatch2 = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch2) return bodyMatch2[1];

  return "";
}

// Extract <head> title and meta from original
function extractHeadMeta(html) {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const keywordsMatch = html.match(/<meta\s+name="keywords"\s+content="([^"]*)"/i);
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
  const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const jsonLdMatches = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi);

  let meta = "";
  if (titleMatch) meta += `    <title>${titleMatch[1].trim()}</title>\n`;
  if (descMatch) meta += `    <meta name="description" content="${descMatch[1]}" />\n`;
  if (keywordsMatch) meta += `    <meta name="keywords" content="${keywordsMatch[1]}" />\n`;
  meta += `    <meta name="author" content="Правильные Грузчики" />\n`;
  if (ogTitleMatch) meta += `    <meta property="og:title" content="${ogTitleMatch[1]}" />\n`;
  if (ogDescMatch) meta += `    <meta property="og:description" content="${ogDescMatch[1]}" />\n`;
  if (ogImageMatch) meta += `    <meta property="og:image" content="${ogImageMatch[1]}" />\n`;
  meta += `    <meta property="og:type" content="website" />\n`;
  if (canonicalMatch) meta += `    <link rel="canonical" href="${canonicalMatch[1]}" />\n`;

  if (jsonLdMatches) {
    jsonLdMatches.forEach(m => {
      // Avoid copying existing BreadcrumbList or old Service schemas, we will generate them fresh!
      if (!m.includes("BreadcrumbList") && !m.includes('"Service"') && !m.includes('"@type": "Service"')) {
        meta += `    ${m}\n`;
      }
    });
  }

  return meta;
}

// Assemble a root-level page
function buildRootPage(pageName, base = "") {
  // Ensure source exists
  ensurePageSourceExists("", pageName, base);

  const srcPath = path.join(ROOT, pageName);
  if (!fs.existsSync(srcPath)) {
    console.log(`  ⚠ Skipping ${pageName} — source not found`);
    return;
  }

  const originalHtml = fs.readFileSync(srcPath, "utf-8");
  let headMeta = extractHeadMeta(originalHtml);
  const pageContent = extractPageContent(originalHtml);
  const pageType = pageName.replace(".html", "");

  // Determine body data-page attribute
  let bodyAttr = 'data-page="index"';
  const meta = SERVICES_METADATA[pageName];
  if (meta && meta.pageType) {
    bodyAttr = `data-page="${meta.pageType}"`;
  } else if (pageName === "about.html") bodyAttr = 'data-page="about"';
  else if (pageName === "loaders.html") bodyAttr = 'data-page="loaders"';
  else if (pageName === "workers.html") bodyAttr = 'data-page="workers"';
  else if (pageName === "moving.html") bodyAttr = 'data-page="moving"';
  else if (pageName === "office-moving.html") bodyAttr = 'data-page="moving"';
  else if (pageName === "rigging.html") bodyAttr = 'data-page="rigging"';
  else if (pageName === "furniture.html") bodyAttr = 'data-page="furniture"';
  else if (pageName === "gruzoperevozki.html") bodyAttr = 'data-page="cargo"';
  else if (pageName === "thank-you.html") bodyAttr = 'data-page="thank-you"';

  // Inject BreadcrumbList on all root-level pages (except main index.html)
  if (pageName !== "index.html") {
    const pageTitleMatch = originalHtml.match(/<title>([\s\S]*?)<\/title>/i);
    const pageTitle = pageTitleMatch ? pageTitleMatch[1].trim() : "Правильные Грузчики";
    const breadcrumb = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Главная",
          "item": "https://pragruz.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "${pageTitle.replace(/"/g, '\\"')}",
          "item": "https://pragruz.ru/${pageName}"
        }
      ]
    }
    </script>`;
    headMeta += breadcrumb;
  }

  // Inject dynamic Service+Offer+AggregateRating schema
  const serviceSchema = generateServiceSchema(pageName, "krasnodar");
  if (serviceSchema) {
    headMeta += "\n" + serviceSchema;
  }

  const assembled = [
    '<!doctype html>',
    '<html lang="ru">',
    '  <head>',
    readPartial("metrika.html"),
    '',
    resolve("head-common.html", base),
    headMeta,
    '  </head>',
    '',
    `  <body ${bodyAttr}>`,
    '    <div class="glow-bg">',
    '      <div class="glow-orb orb-1"></div>',
    '      <div class="glow-orb orb-2"></div>',
    '    </div>',
    '',
    resolve("header.html", base),
    '<main>',
    pageContent,
    '</main>',
    resolve("footer.html", base),
    sharedPageEnd(base),
    '</body>',
    '</html>',
  ].join("\n");

  fs.writeFileSync(srcPath, assembled);
  console.log(`  ✓ Built ${pageName}`);
}

// Build city subpage
function buildCityPage(city, pageName, base = "../") {
  // Ensure source exists
  ensurePageSourceExists(city, pageName, base);

  const srcPath = path.join(ROOT, city, pageName);
  if (!fs.existsSync(srcPath)) {
    console.log(`  ⚠ Skipping ${city}/${pageName} — source not found`);
    return;
  }

  const originalHtml = fs.readFileSync(srcPath, "utf-8");
  let headMeta = extractHeadMeta(originalHtml);

  // For city pages, the body content is simpler
  let bodyMatch = originalHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return;

  let bodyContent = bodyMatch[1];

  // Remove existing header, footer, mobile menu, modals, floating buttons, scripts
  bodyContent = bodyContent
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<div class="mobile-nav-overlay"[\s\S]*?<\/div>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<div class="modal-overlay"[\s\S]*?<\/div>\s*<\/div>/gi, "")
    .replace(/<div class="glass-float-btn[\s\S]*?<\/div>/gi, "")
    .replace(/<button class="scroll-to-top"[\s\S]*?<\/button>/gi, "")
    .replace(/<script>localStorage[\s\S]*?<\/script>/gi, "")
    .replace(/<script src="[^"]*"><\/script>/gi, "");

  let bodyAttr = 'data-page="city"';
  const meta = SERVICES_METADATA[pageName];
  if (meta && meta.pageType) {
    bodyAttr = `data-page="${meta.pageType}"`;
  }

  // Inject dynamic Service+Offer+AggregateRating schema
  const serviceSchema = generateServiceSchema(pageName, city);
  if (serviceSchema) {
    headMeta += "\n" + serviceSchema;
  }

  const assembled = [
    '<!doctype html>',
    '<html lang="ru">',
    '  <head>',
    readPartial("metrika.html"),
    '',
    resolve("head-common.html", base),
    headMeta,
    '  </head>',
    '',
    `  <body ${bodyAttr}>`,
    resolve("header.html", base),
    '<main>',
    bodyContent.trim(),
    '</main>',
    resolve("footer.html", base),
    sharedPageEnd(base),
    `<script>localStorage.setItem("selected_city", "${city}"); localStorage.setItem("city_confirmed", "true");</script>`,
    '</body>',
    '</html>',
  ].join("\n");

  fs.writeFileSync(srcPath, assembled);
  console.log(`  ✓ Built ${city}/${pageName}`);
}

// ========== MAIN ==========
console.log("\n🔨 Building Правильные Грузчики static site...\n");

console.log("📄 Root pages:");
rootPages.forEach(page => buildRootPage(page, ""));

// City pages
console.log("\n🏙️  City subpages:");
CITIES.forEach(city => {
  CITY_SERVICE_PAGES.forEach(page => {
    buildCityPage(city, page, "../");
  });
});

console.log("\n✅ Build complete!\n");
