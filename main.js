/**
Правильные Грузчики - Interactive Engine
Dynamic Geotargeting, Cost Calculator, Phone Masking, Modal System, FAQ Accordion, and Animations
Author: Виталий С
Date: 2026-06-22
*/
document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. GLOBAL HELPERS & PLURALIZATION
  // ==========================================
  function getWorkersWord(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "человек";
    if (lastDigit === 1) return "человек";
    if (lastDigit >= 2 && lastDigit <= 4) return "человека";
    return "человек";
  }

  function getHoursWord(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "часов";
    if (lastDigit === 1) return "час";
    if (lastDigit >= 2 && lastDigit <= 4) return "часа";
    return "часов";
  }

  function getMinutesWord(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "минут";
    if (lastDigit === 1) return "минуту";
    if (lastDigit >= 2 && lastDigit <= 4) return "минуты";
    return "минут";
  }

  // ==========================================
  // 2. DYNAMIC GEOTARGETING SYSTEM
  // ==========================================
  const CITIES_DATA = {
    krasnodar: {
      name: "Краснодар",
      cases: { nom: "Краснодар", prep: "в Краснодаре", gen: "Краснодара" },
      address: "350004, г. Краснодар, ул. Кропоткина д.50, офис 339",
      region: "Краснодарского края",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 800, workers: 800, moving: 800, truckStd: 2000, truckExt: 2500 }
    },
    moscow: {
      name: "Москва",
      cases: { nom: "Москва", prep: "в Москве", gen: "Москвы" },
      address: "101000, г. Москва, ул. Мясницкая д.24, оф. 102",
      region: "Московской области",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 1000, workers: 950, moving: 1000, truckStd: 2500, truckExt: 3000 }
    },
    spb: {
      name: "Санкт-Петербург",
      cases: { nom: "Санкт-Петербург", prep: "в Санкт-Петербурге", gen: "Санкт-Петербурга" },
      address: "190000, г. Санкт-Петербург, Невский проспект д.42, оф. 15",
      region: "Ленинградской области",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 950, workers: 900, moving: 950, truckStd: 2400, truckExt: 2800 }
    },
    novosibirsk: {
      name: "Новосибирск",
      cases: { nom: "Новосибирск", prep: "в Новосибирске", gen: "Новосибирска" },
      address: "630000, г. Новосибирск, Красный проспект д.28, оф. 412",
      region: "Новосибирской области",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 850, workers: 850, moving: 850, truckStd: 2200, truckExt: 2600 }
    },
    ekaterinburg: {
      name: "Екатеринбург",
      cases: { nom: "Екатеринбург", prep: "в Екатеринбурге", gen: "Екатеринбурга" },
      address: "620000, г. Екатеринбург, ул. Малышева д.51, оф. 805",
      region: "Свердловской области",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 850, workers: 850, moving: 850, truckStd: 2200, truckExt: 2600 }
    },
    kazan: {
      name: "Казань",
      cases: { nom: "Казань", prep: "в Казани", gen: "Казани" },
      address: "420000, г. Казань, ул. Баумана д.12, оф. 301",
      region: "Республики Татарстан",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 800, workers: 800, moving: 800, truckStd: 2100, truckExt: 2500 }
    },
    nn: {
      name: "Нижний Новгород",
      cases: { nom: "Нижний Новгород", prep: "в Нижнем Новгороде", gen: "Нижнего Новгорода" },
      address: "603000, г. Нижний Новгород, ул. Большая Покровская д.15, оф. 204",
      region: "Нижегородской области",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 800, workers: 800, moving: 800, truckStd: 2100, truckExt: 2500 }
    },
    chelyabinsk: {
      name: "Челябинск",
      cases: { nom: "Челябинск", prep: "в Челябинске", gen: "Челябинска" },
      address: "454000, г. Челябинск, проспект Ленина д.64, оф. 512",
      region: "Челябинской области",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 750, workers: 750, moving: 750, truckStd: 2000, truckExt: 2400 }
    },
    samara: {
      name: "Самара",
      cases: { nom: "Самара", prep: "в Самаре", gen: "Самары" },
      address: "443000, г. Самара, ул. Ленинградская д.45, оф. 311",
      region: "Самарской области",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 800, workers: 800, moving: 800, truckStd: 2100, truckExt: 2500 }
    },
    rostov: {
      name: "Ростов-на-Дону",
      cases: { nom: "Ростов-на-Дону", prep: "в Ростове-на-Дону", gen: "Ростова-на-Дону" },
      address: "344000, г. Ростов-на-Дону, Большая Садовая ул. д.82, оф. 219",
      region: "Ростовской области",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 800, workers: 800, moving: 800, truckStd: 2100, truckExt: 2500 }
    },
    ufa: {
      name: "Уфа",
      cases: { nom: "Уфа", prep: "в Уфе", gen: "Уфы" },
      address: "450000, г. Уфа, ул. Ленина д.32, оф. 104",
      region: "Республики Башкортостан",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 750, workers: 750, moving: 750, truckStd: 2000, truckExt: 2400 }
    },
    voronezh: {
      name: "Воронеж",
      cases: { nom: "Воронеж", prep: "в Воронеже", gen: "Воронежа" },
      address: "394000, г. Воронеж, проспект Революции д.18, оф. 302",
      region: "Воронежской области",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 800, workers: 800, moving: 800, truckStd: 2100, truckExt: 2500 }
    },
    volgograd: {
      name: "Волгоград",
      cases: { nom: "Волгоград", prep: "в Волгограде", gen: "Волгограда" },
      address: "400000, г. Волгоград, проспект Ленина д.12, оф. 410",
      region: "Волгоградской области",
      phone: "+7 (928) 333-32-81",
      prices: { loaders: 750, workers: 750, moving: 750, truckStd: 2000, truckExt: 2400 }
    }
  };

  // ==========================================
  // 2.5. REVIEWS DATABASE PER CITY
  // ==========================================
  const REVIEWS_DATA = {
    krasnodar: [
      { name: "Ирина", initial: "И", text: "Отличный сервис для погрузки на склад. Всё чётко, грузчики в масках, всё упаковано как надо.", date: "5 мая 2026" },
      { name: "Дмитрий", initial: "Д", text: "Заказывал грузчиков для переезда квартиры. Приехали вовремя, всё вынесли аккуратно, ничего не поцарапали. Цена адекватная.", date: "2 июня 2026" },
      { name: "Елена", initial: "Е", text: "Перевозили офис с ул. Красной на Северную. Ребята справились за 5 часов, хотя я думала будет дольше. Оргтехнику упаковали отлично.", date: "28 мая 2026" },
      { name: "Александр", initial: "А", text: "Понадобились разнорабочие на стройку. Предоставили 5 человек за сутки. Работали чётко, под присмотром бригадира. Буду обращаться ещё.", date: "15 июня 2026" },
      { name: "Ольга", initial: "О", text: "Собирали кухонный гарнитур из Икеи. Мастер приехал через час, собрал всё за 3 часа. Аккуратно, без повреждений. Спасибо!", date: "10 июня 2026" },
      { name: "Сергей", initial: "С", text: "Заказывал такелаж для перевозки сейфа весом 300 кг. Подняли на 4 этаж без лифта, использовали специальные ремни. Профессионалы!", date: "22 мая 2026" },
      { name: "Анна", initial: "А", text: "Очень довольна переездом. Упаковали все вещи, мебель разобрали, перевезли и собрали на новом месте. Всё быстро и без стресса.", date: "8 июня 2026" },
      { name: "Виктор", initial: "В", text: "Работаем с этой компанией на постоянной основе. Предоставляют комплектовщиков на склад. Никаких нареканий, всегда трезвые и вежливые.", date: "1 июня 2026" },
      { name: "Наталья", initial: "Н", text: "Заказывала грузчиков для разгрузки фуры с товаром. Приехали через 40 минут, разгрузили быстро, всё посчитали. Рекомендую!", date: "19 мая 2026" },
      { name: "Максим", initial: "М", text: "Переезд из Краснодара в Ростов. Организовали всё под ключ: упаковка, погрузка, транспортировка. Вещи доехали в целости.", date: "12 июня 2026" },
      { name: "Татьяна", initial: "Т", text: "Собирали шкаф-купе и спальню. Мастера приехали со своим инструментом, собрали быстро и аккуратно. Цена порадовала.", date: "25 мая 2026" },
      { name: "Иван", initial: "И", text: "Потребовались разнорабочие на производство. Предоставили 10 человек на следующий день. Работали качественно, без нареканий.", date: "3 июня 2026" },
      { name: "Екатерина", initial: "Е", text: "Офисный переезд сделали за выходные. В пятницу после работы всё упаковали, в субботу перевезли, в воскресенье собрали. В понедельник работали как обычно.", date: "30 мая 2026" },
      { name: "Павел", initial: "П", text: "Заказывал такелаж для станка весом 2 тонны. Приехали с гидравлической тележкой, аккуратно переместили по цеху. Очень доволен.", date: "7 июня 2026" },
      { name: "Марина", initial: "М", text: "Переезд 3-комнатной квартиры. Ребята работали слаженно, быстро. Отдельное спасибо за упаковку посуды — ничего не разбилось!", date: "14 июня 2026" }
    ],
    moscow: [
      { name: "Алексей", initial: "А", text: "Быстро приехали, аккуратно упаковали мебель и оформили подъём. Всё прошло без стресса.", date: "12 апреля 2026" },
      { name: "Евгений", initial: "Е", text: "Заказывал грузчиков для разгрузки фуры с оборудованием. Приехали минута в минуту, разгрузили за 2 часа. Профессионалы.", date: "3 мая 2026" },
      { name: "Ольга", initial: "О", text: "Переезд из Москвы в область. Всё организовали отлично, вещи не повредили. Спасибо большое!", date: "18 апреля 2026" },
      { name: "Денис", initial: "Д", text: "Потребовались разнорабочие на склад. Предоставили 8 человек. Работали хорошо, без нареканий.", date: "25 апреля 2026" },
      { name: "Светлана", initial: "С", text: "Собирали мебель в новой квартире. Мастер приехал вовремя, собрал всё качественно. Рекомендую.", date: "9 мая 2026" },
      { name: "Михаил", initial: "М", text: "Офисный переезд сделали за один день. 15 сотрудников, серверная, оргтехника — всё перевезли без простоев.", date: "2 мая 2026" },
      { name: "Анна", initial: "А", text: "Заказывала такелаж для сейфа. Подняли на 5 этаж без проблем. Вежливые и аккуратные ребята.", date: "15 апреля 2026" },
      { name: "Владимир", initial: "В", text: "Постоянно работаем с этой компанией. Надёжные грузчики, всегда вовремя, без сюрпризов.", date: "20 апреля 2026" },
      { name: "Татьяна", initial: "Т", text: "Переезд 2-комнатной квартиры. Очень довольна, всё прошло гладко. Цена фиксированная, без доплат.", date: "28 апреля 2026" },
      { name: "Николай", initial: "Н", text: "Заказывал сборку мебели для офиса. 10 рабочих мест собрали за день. Качественно и быстро.", date: "5 мая 2026" },
      { name: "Елена", initial: "Е", text: "Разгружали контейнер с товаром. Грузчики приехали быстро, работали аккуратно. Спасибо!", date: "11 мая 2026" },
      { name: "Андрей", initial: "А", text: "Хорошая компания. Заказывал разнорабочих на стройку. Всё чётко, без задержек.", date: "22 апреля 2026" }
    ],
    spb: [
      { name: "Марина", initial: "М", text: "Заказали грузчиков для переезда, приехали вовремя и всё вынесли без царапин. Рекомендую.", date: "28 марта 2026" },
      { name: "Константин", initial: "К", text: "Офисный переезд в новое здание. Организовали всё на высшем уровне. Серверную перевезли без проблем.", date: "10 апреля 2026" },
      { name: "Юлия", initial: "Ю", text: "Собирали кухню и шкаф. Мастера аккуратные, всё сделали быстро. Остались довольны.", date: "5 апреля 2026" },
      { name: "Дмитрий", initial: "Д", text: "Заказывал такелаж для банкомата. Подняли на 2 этаж, установили. Всё отлично.", date: "15 марта 2026" },
      { name: "Анастасия", initial: "А", text: "Переезд из Питера в область. Всё упаковали, перевезли, собрали. Очень довольна сервисом.", date: "22 марта 2026" },
      { name: "Георгий", initial: "Г", text: "Разгружали фуру со стройматериалами. Работали быстро, без перекуров. Рекомендую.", date: "30 марта 2026" },
      { name: "Виктория", initial: "В", text: "Заказывала грузчиков для квартирного переезда. Всё прошло отлично, вещи целы.", date: "8 апреля 2026" },
      { name: "Илья", initial: "И", text: "Постоянно заказываем разнорабочих на склад. Надёжная компания, всегда выручают.", date: "12 марта 2026" },
      { name: "Надежда", initial: "Н", text: "Собирали мебель в детскую. Мастер приехал вовремя, собрал аккуратно. Спасибо!", date: "18 апреля 2026" },
      { name: "Артём", initial: "А", text: "Офисный переезд за выходные. В понедельник уже работали. Отличная организация.", date: "25 марта 2026" },
      { name: "Полина", initial: "П", text: "Заказывала такелаж для пианино. Подняли на 3 этаж аккуратно, без повреждений.", date: "2 апреля 2026" },
      { name: "Роман", initial: "Р", text: "Хорошие грузчики, вежливые и аккуратные. Цены адекватные. Буду обращаться ещё.", date: "20 марта 2026" }
    ],
    novosibirsk: [
      { name: "Екатерина", initial: "Е", text: "Переезд из Новосибирска в Бердск. Всё организовали отлично, вещи не повредили.", date: "15 мая 2026" },
      { name: "Алексей", initial: "А", text: "Заказывал грузчиков для разгрузки вагона. Приехали быстро, разгрузили качественно.", date: "8 мая 2026" },
      { name: "Татьяна", initial: "Т", text: "Собирали мебель в новой квартире. Мастер приехал вовремя, собрал всё аккуратно.", date: "20 мая 2026" },
      { name: "Сергей", initial: "С", text: "Офисный переезд. Сделали всё быстро и качественно. Рекомендую.", date: "12 мая 2026" },
      { name: "Ольга", initial: "О", text: "Заказывала такелаж для сейфа. Подняли на 2 этаж без проблем.", date: "5 мая 2026" },
      { name: "Иван", initial: "И", text: "Разнорабочие на склад. Предоставили 6 человек. Работали хорошо.", date: "25 мая 2026" },
      { name: "Мария", initial: "М", text: "Переезд квартиры. Всё прошло отлично, грузчики аккуратные и вежливые.", date: "18 мая 2026" },
      { name: "Дмитрий", initial: "Д", text: "Заказывал сборку мебели. Собрали шкаф и спальню за 4 часа. Качественно.", date: "10 мая 2026" },
      { name: "Анна", initial: "А", text: "Разгружали фуру с товаром. Грузчики приехали вовремя, работали быстро.", date: "3 мая 2026" },
      { name: "Владимир", initial: "В", text: "Постоянно работаем с компанией. Надёжные грузчики, всегда вовремя.", date: "28 апреля 2026" },
      { name: "Елена", initial: "Е", text: "Офисный переезд за 1 день. Всё организовано отлично. Спасибо!", date: "22 мая 2026" },
      { name: "Николай", initial: "Н", text: "Хорошая компания. Заказывал такелаж для станка. Профессионалы.", date: "15 апреля 2026" }
    ],
    ekaterinburg: [
      { name: "Светлана", initial: "С", text: "Переезд из Екатеринбурга в область. Всё прошло отлично, вещи целы.", date: "10 июня 2026" },
      { name: "Андрей", initial: "А", text: "Заказывал грузчиков для разгрузки фуры. Приехали вовремя, разгрузили быстро.", date: "5 июня 2026" },
      { name: "Ольга", initial: "О", text: "Собирали кухонный гарнитур. Мастер аккуратный, всё сделал качественно.", date: "15 июня 2026" },
      { name: "Максим", initial: "М", text: "Офисный переезд. Организовали всё на высшем уровне. Рекомендую.", date: "8 июня 2026" },
      { name: "Елена", initial: "Е", text: "Заказывала такелаж для сейфа. Подняли на 3 этаж без проблем.", date: "1 июня 2026" },
      { name: "Денис", initial: "Д", text: "Разнорабочие на производство. Предоставили 12 человек. Работали хорошо.", date: "20 мая 2026" },
      { name: "Анна", initial: "А", text: "Переезд квартиры. Всё прошло гладко, грузчики вежливые.", date: "12 июня 2026" },
      { name: "Игорь", initial: "И", text: "Заказывал сборку мебели для офиса. Собрали быстро и качественно.", date: "25 мая 2026" },
      { name: "Татьяна", initial: "Т", text: "Разгружали контейнер. Грузчики приехали вовремя, работали аккуратно.", date: "3 июня 2026" },
      { name: "Владимир", initial: "В", text: "Постоянно работаем с компанией. Надёжные грузчики.", date: "28 мая 2026" },
      { name: "Наталья", initial: "Н", text: "Офисный переезд за выходные. Всё отлично организовано.", date: "18 мая 2026" },
      { name: "Павел", initial: "П", text: "Хорошая компания. Заказывал такелаж для оборудования.", date: "10 мая 2026" }
    ],
    kazan: [
      { name: "Айрат", initial: "А", text: "Заказывал грузчиков для переезда. Приехали вовремя, всё сделали аккуратно.", date: "20 мая 2026" },
      { name: "Гульнара", initial: "Г", text: "Собирали мебель в новой квартире. Мастер приехал быстро, собрал качественно.", date: "15 мая 2026" },
      { name: "Марат", initial: "М", text: "Офисный переезд. Организовали всё отлично. Рекомендую.", date: "10 мая 2026" },
      { name: "Лейсан", initial: "Л", text: "Заказывала такелаж для банкомата. Подняли на 2 этаж без проблем.", date: "5 мая 2026" },
      { name: "Ильдар", initial: "И", text: "Разнорабочие на склад. Предоставили 5 человек. Работали хорошо.", date: "25 апреля 2026" },
      { name: "Альбина", initial: "А", text: "Переезд квартиры. Всё прошло отлично, грузчики вежливые.", date: "18 мая 2026" },
      { name: "Радик", initial: "Р", text: "Заказывал сборку мебели. Собрали шкаф и прихожую за 3 часа.", date: "12 мая 2026" },
      { name: "Эльмира", initial: "Э", text: "Разгружали фуру с товаром. Грузчики приехали вовремя.", date: "8 мая 2026" },
      { name: "Булат", initial: "Б", text: "Постоянно работаем с компанией. Надёжные грузчики.", date: "2 мая 2026" },
      { name: "Алия", initial: "А", text: "Офисный переезд за 1 день. Всё организовано отлично.", date: "28 апреля 2026" },
      { name: "Ринат", initial: "Р", text: "Хорошая компания. Заказывал такелаж для оборудования.", date: "22 апреля 2026" },
      { name: "Зульфия", initial: "З", text: "Собирали кухню. Мастер аккуратный, всё сделал качественно.", date: "15 апреля 2026" }
    ],
    nn: [
      { name: "Алексей", initial: "А", text: "Переезд из Нижнего Новгорода в область. Всё прошло отлично.", date: "10 июня 2026" },
      { name: "Елена", initial: "Е", text: "Заказывала грузчиков для разгрузки фуры. Приехали вовремя.", date: "5 июня 2026" },
      { name: "Дмитрий", initial: "Д", text: "Собирали мебель в новой квартире. Мастер аккуратный.", date: "15 июня 2026" },
      { name: "Ольга", initial: "О", text: "Офисный переезд. Организовали всё отлично. Рекомендую.", date: "8 июня 2026" },
      { name: "Сергей", initial: "С", text: "Заказывал такелаж для сейфа. Подняли на 3 этаж.", date: "1 июня 2026" },
      { name: "Татьяна", initial: "Т", text: "Разнорабочие на склад. Предоставили 4 человека.", date: "25 мая 2026" },
      { name: "Иван", initial: "И", text: "Переезд квартиры. Всё прошло гладко.", date: "12 июня 2026" },
      { name: "Марина", initial: "М", text: "Заказывала сборку мебели. Собрали шкаф и спальню.", date: "20 мая 2026" },
      { name: "Андрей", initial: "А", text: "Разгружали контейнер. Грузчики работали аккуратно.", date: "3 июня 2026" },
      { name: "Наталья", initial: "Н", text: "Постоянно работаем с компанией. Надёжные грузчики.", date: "28 мая 2026" },
      { name: "Владимир", initial: "В", text: "Офисный переезд за выходные. Всё отлично.", date: "18 мая 2026" },
      { name: "Екатерина", initial: "Е", text: "Хорошая компания. Заказывала такелаж.", date: "10 мая 2026" }
    ],
    chelyabinsk: [
      { name: "Иван", initial: "И", text: "Заказывал грузчиков для переезда. Приехали вовремя, всё сделали аккуратно.", date: "20 мая 2026" },
      { name: "Ольга", initial: "О", text: "Собирали мебель. Мастер приехал быстро, собрал качественно.", date: "15 мая 2026" },
      { name: "Сергей", initial: "С", text: "Офисный переезд. Организовали всё отлично.", date: "10 мая 2026" },
      { name: "Елена", initial: "Е", text: "Заказывала такелаж для сейфа. Подняли на 2 этаж.", date: "5 мая 2026" },
      { name: "Дмитрий", initial: "Д", text: "Разнорабочие на склад. Предоставили 6 человек.", date: "25 апреля 2026" },
      { name: "Анна", initial: "А", text: "Переезд квартиры. Всё прошло отлично.", date: "18 мая 2026" },
      { name: "Максим", initial: "М", text: "Заказывал сборку мебели. Собрали шкаф и прихожую.", date: "12 мая 2026" },
      { name: "Татьяна", initial: "Т", text: "Разгружали фуру. Грузчики приехали вовремя.", date: "8 мая 2026" },
      { name: "Алексей", initial: "А", text: "Постоянно работаем с компанией. Надёжные грузчики.", date: "2 мая 2026" },
      { name: "Наталья", initial: "Н", text: "Офисный переезд за 1 день. Всё организовано отлично.", date: "28 апреля 2026" },
      { name: "Владимир", initial: "В", text: "Хорошая компания. Заказывал такелаж.", date: "22 апреля 2026" },
      { name: "Екатерина", initial: "Е", text: "Собирали кухню. Мастер аккуратный.", date: "15 апреля 2026" }
    ],
    samara: [
      { name: "Алексей", initial: "А", text: "Переезд из Самары в Тольятти. Всё прошло отлично.", date: "10 июня 2026" },
      { name: "Елена", initial: "Е", text: "Заказывала грузчиков для разгрузки. Приехали вовремя.", date: "5 июня 2026" },
      { name: "Дмитрий", initial: "Д", text: "Собирали мебель. Мастер аккуратный.", date: "15 июня 2026" },
      { name: "Ольга", initial: "О", text: "Офисный переезд. Организовали всё отлично.", date: "8 июня 2026" },
      { name: "Сергей", initial: "С", text: "Заказывал такелаж для сейфа. Подняли на 3 этаж.", date: "1 июня 2026" },
      { name: "Татьяна", initial: "Т", text: "Разнорабочие на склад. Предоставили 5 человек.", date: "25 мая 2026" },
      { name: "Иван", initial: "И", text: "Переезд квартиры. Всё прошло гладко.", date: "12 июня 2026" },
      { name: "Марина", initial: "М", text: "Заказывала сборку мебели. Собрали шкаф.", date: "20 мая 2026" },
      { name: "Андрей", initial: "А", text: "Разгружали контейнер. Грузчики аккуратные.", date: "3 июня 2026" },
      { name: "Наталья", initial: "Н", text: "Постоянно работаем с компанией. Надёжные.", date: "28 мая 2026" },
      { name: "Владимир", initial: "В", text: "Офисный переезд за выходные. Отлично.", date: "18 мая 2026" },
      { name: "Екатерина", initial: "Е", text: "Хорошая компания. Заказывала такелаж.", date: "10 мая 2026" }
    ],
    rostov: [
      { name: "Сергей", initial: "С", text: "Слаженная команда, сразу видно профессионалов. Цена честная, результат отличный.", date: "17 мая 2026" },
      { name: "Анна", initial: "А", text: "Переезд из Ростова в Таганрог. Всё организовали отлично.", date: "10 июня 2026" },
      { name: "Дмитрий", initial: "Д", text: "Заказывал грузчиков для разгрузки фуры. Приехали вовремя.", date: "5 июня 2026" },
      { name: "Елена", initial: "Е", text: "Собирали мебель в новой квартире. Мастер аккуратный.", date: "15 июня 2026" },
      { name: "Александр", initial: "А", text: "Офисный переезд. Организовали всё отлично. Рекомендую.", date: "8 июня 2026" },
      { name: "Ольга", initial: "О", text: "Заказывала такелаж для сейфа. Подняли на 2 этаж.", date: "1 июня 2026" },
      { name: "Иван", initial: "И", text: "Разнорабочие на склад. Предоставили 8 человек.", date: "25 мая 2026" },
      { name: "Татьяна", initial: "Т", text: "Переезд квартиры. Всё прошло отлично.", date: "12 июня 2026" },
      { name: "Максим", initial: "М", text: "Заказывал сборку мебели. Собрали шкаф и спальню.", date: "20 мая 2026" },
      { name: "Наталья", initial: "Н", text: "Разгружали фуру. Грузчики приехали вовремя.", date: "3 июня 2026" },
      { name: "Владимир", initial: "В", text: "Постоянно работаем с компанией. Надёжные грузчики.", date: "28 мая 2026" },
      { name: "Екатерина", initial: "Е", text: "Офисный переезд за 1 день. Всё отлично.", date: "18 мая 2026" }
    ],
    ufa: [
      { name: "Айгуль", initial: "А", text: "Заказывала грузчиков для переезда. Приехали вовремя, всё сделали аккуратно.", date: "20 мая 2026" },
      { name: "Радик", initial: "Р", text: "Собирали мебель. Мастер приехал быстро, собрал качественно.", date: "15 мая 2026" },
      { name: "Гульнара", initial: "Г", text: "Офисный переезд. Организовали всё отлично.", date: "10 мая 2026" },
      { name: "Марат", initial: "М", text: "Заказывал такелаж для сейфа. Подняли на 3 этаж.", date: "5 мая 2026" },
      { name: "Лейсан", initial: "Л", text: "Разнорабочие на склад. Предоставили 4 человека.", date: "25 апреля 2026" },
      { name: "Ильдар", initial: "И", text: "Переезд квартиры. Всё прошло отлично.", date: "18 мая 2026" },
      { name: "Альбина", initial: "А", text: "Заказывала сборку мебели. Собрали шкаф и прихожую.", date: "12 мая 2026" },
      { name: "Ринат", initial: "Р", text: "Разгружали фуру. Грузчики приехали вовремя.", date: "8 мая 2026" },
      { name: "Зульфия", initial: "З", text: "Постоянно работаем с компанией. Надёжные грузчики.", date: "2 мая 2026" },
      { name: "Алия", initial: "А", text: "Офисный переезд за 1 день. Всё организовано отлично.", date: "28 апреля 2026" },
      { name: "Булат", initial: "Б", text: "Хорошая компания. Заказывал такелаж.", date: "22 апреля 2026" },
      { name: "Эльмира", initial: "Э", text: "Собирали кухню. Мастер аккуратный.", date: "15 апреля 2026" }
    ],
    voronezh: [
      { name: "Иван", initial: "И", text: "Заказывал грузчиков для переезда. Приехали вовремя, всё сделали аккуратно.", date: "20 мая 2026" },
      { name: "Ольга", initial: "О", text: "Собирали мебель. Мастер приехал быстро, собрал качественно.", date: "15 мая 2026" },
      { name: "Сергей", initial: "С", text: "Офисный переезд. Организовали всё отлично.", date: "10 мая 2026" },
      { name: "Елена", initial: "Е", text: "Заказывала такелаж для сейфа. Подняли на 2 этаж.", date: "5 мая 2026" },
      { name: "Дмитрий", initial: "Д", text: "Разнорабочие на склад. Предоставили 6 человек.", date: "25 апреля 2026" },
      { name: "Анна", initial: "А", text: "Переезд квартиры. Всё прошло отлично.", date: "18 мая 2026" },
      { name: "Максим", initial: "М", text: "Заказывал сборку мебели. Собрали шкаф и прихожую.", date: "12 мая 2026" },
      { name: "Татьяна", initial: "Т", text: "Разгружали фуру. Грузчики приехали вовремя.", date: "8 мая 2026" },
      { name: "Алексей", initial: "А", text: "Постоянно работаем с компанией. Надёжные грузчики.", date: "2 мая 2026" },
      { name: "Наталья", initial: "Н", text: "Офисный переезд за 1 день. Всё организовано отлично.", date: "28 апреля 2026" },
      { name: "Владимир", initial: "В", text: "Хорошая компания. Заказывал такелаж.", date: "22 апреля 2026" },
      { name: "Екатерина", initial: "Е", text: "Собирали кухню. Мастер аккуратный.", date: "15 апреля 2026" }
    ],
    volgograd: [
      { name: "Алексей", initial: "А", text: "Заказывал грузчиков для переезда. Приехали вовремя, всё сделали аккуратно.", date: "20 мая 2026" },
      { name: "Елена", initial: "Е", text: "Собирали мебель. Мастер приехал быстро, собрал качественно.", date: "15 мая 2026" },
      { name: "Сергей", initial: "С", text: "Офисный переезд. Организовали всё отлично.", date: "10 мая 2026" },
      { name: "Ольга", initial: "О", text: "Заказывала такелаж для сейфа. Подняли на 2 этаж.", date: "5 мая 2026" },
      { name: "Дмитрий", initial: "Д", text: "Разнорабочие на склад. Предоставили 5 человек.", date: "25 апреля 2026" },
      { name: "Анна", initial: "А", text: "Переезд квартиры. Всё прошло отлично.", date: "18 мая 2026" },
      { name: "Максим", initial: "М", text: "Заказывал сборку мебели. Собрали шкаф и прихожую.", date: "12 мая 2026" },
      { name: "Татьяна", initial: "Т", text: "Разгружали фуру. Грузчики приехали вовремя.", date: "8 мая 2026" },
      { name: "Иван", initial: "И", text: "Постоянно работаем с компанией. Надёжные грузчики.", date: "2 мая 2026" },
      { name: "Наталья", initial: "Н", text: "Офисный переезд за 1 день. Всё организовано отлично.", date: "28 апреля 2026" },
      { name: "Владимир", initial: "В", text: "Хорошая компания. Заказывал такелаж.", date: "22 апреля 2026" },
      { name: "Екатерина", initial: "Е", text: "Собирали кухню. Мастер аккуратный.", date: "15 апреля 2026" }
    ]
  };

  function renderReviews(cityCode) {
    const container = document.getElementById("reviews-container");
    const subtitle = document.getElementById("reviews-subtitle");
    if (!container) return;

    const reviews = REVIEWS_DATA[cityCode] || REVIEWS_DATA.krasnodar;
    const cityName = CITIES_DATA[cityCode] ? CITIES_DATA[cityCode].name : "Краснодар";

    if (subtitle) {
      subtitle.textContent = `Реальные отзывы наших клиентов из ${cityName}`;
    }

    container.innerHTML = "";
    reviews.forEach((review) => {
      const card = document.createElement("article");
      card.className = "review-card";
      card.innerHTML = `
        <div class="review-header">
          <div class="review-avatar-placeholder">${review.initial}</div>
          <div class="review-info">
            <h4>${review.name}</h4>
            <div class="review-city">${cityName}</div>
          </div>
        </div>
        <div class="review-stars">★★★★★</div>
        <p class="review-text">${review.text}</p>
        <div class="review-date">${review.date}</div>
      `;
      container.appendChild(card);
    });
  }

  function renderCity(cityCode) {
    if (!CITIES_DATA[cityCode]) return;
    const data = CITIES_DATA[cityCode];
    localStorage.setItem("selected_city", cityCode);

    document.querySelectorAll(".city-name").forEach((span) => {
      const caseName = span.getAttribute("data-case") || "nom";
      if (data.cases[caseName]) span.textContent = data.cases[caseName];
    });

    document.querySelectorAll(".city-address").forEach((span) => {
      span.textContent = data.address;
    });

    document.querySelectorAll(".city-region").forEach((span) => {
      span.textContent = data.region;
    });

    const cleanPhone = data.phone.replace(/\D/g, "");
    const formattedPhone = data.phone;

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

    const pageType = document.body.getAttribute("data-page") || "index";
    let titleStr = "";
    let descStr = "";

    if (pageType === "loaders") {
      titleStr = `Услуги профессиональных грузчиков ${data.cases.prep} | Заказать грузчиков недорого круглосуточно`;
      descStr = `Заказать профессиональных грузчиков ${data.cases.prep} от 800 руб/час. Квартирные и офисные переезды, разгрузка фур, складские работы. Быстрая подача за 30 минут, работаем 24/7.`;
    } else if (pageType === "workers") {
      titleStr = `Услуги разнорабочих ${data.cases.prep} | Разнорабочие на стройку, склад и производство`;
      descStr = `Аренда разнорабочих ${data.cases.prep} от 800 руб/час. Предоставим линейный персонал на склады, производства, демонтаж, подсобные работы. Срочный вывод от 1 до 50 человек за сутки.`;
    } else if (pageType === "moving") {
      titleStr = `Квартирные и офисные переезды ${data.cases.prep} | Заказать переезд под ключ`;
      descStr = `Бережный квартирный и офисный переезд ${data.cases.prep} под ключ. Перевозка мебели, бытовой техники, оргтехники от 800 руб/час. Опытные грузчики, надежные крепежи, чистые Газели.`;
    } else if (pageType === "rigging") {
      titleStr = `Такелажные работы ${data.cases.prep} | Перевозка тяжелого оборудования и сейфов`;
      descStr = `Профессиональный такелаж любой сложности ${data.cases.prep}. Договорные цены. Транспортировка сейфов, банкоматов, медицинского и промышленного оборудования. Опыт более 12 лет.`;
    } else if (pageType === "furniture") {
      titleStr = `Сборка мебели и стеллажей ${data.cases.prep} | Услуги сборщиков мебели`;
      descStr = `Профессиональная сборка мебели, монтаж торгового оборудования и складских стеллажей ${data.cases.prep}. Договорные цены. Опытные сборщики со своим инструментом, работаем аккуратно.`;
    } else {
      titleStr = `Правильные Грузчики ${data.name} | Услуги грузчиков, разнорабочих и такелажников 24/7`;
      descStr = `Услуги профессиональных грузчиков, разнорабочих и такелажников ${data.cases.prep} от 800 руб/час. Квартирные и офисные переезды, аутсорсинг персонала для компаний. Работаем 24/7.`;
    }

    document.title = titleStr;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", descStr);
    }

    const btnText = document.getElementById("city-btn-text");
    if (btnText) btnText.textContent = data.name;

    document.querySelectorAll(".city-item").forEach((item) => {
      if (item.getAttribute("data-city") === cityCode) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Update prices for city
    if (data.prices) {
      document.querySelectorAll(".service-price-tag[data-service-type]").forEach((el) => {
        const type = el.getAttribute("data-service-type");
        if (data.prices[type] !== undefined) {
          const priceValue = el.querySelector(".price-value");
          if (priceValue) {
            priceValue.textContent = data.prices[type];
          } else if (data.prices[type] > 0) {
            el.innerHTML = `от <span class="price-value">${data.prices[type]}</span> ₽/час`;
          }
        }
      });

      document.querySelectorAll(".fleet-price[data-truck-type]").forEach((el) => {
        const type = el.getAttribute("data-truck-type");
        if (data.prices[type] !== undefined) {
          el.textContent = `от ${data.prices[type]} ₽/час`;
        }
      });

      const calcTabs = document.querySelectorAll(".calc-tab");
      calcTabs.forEach((tab) => {
        const tabName = tab.getAttribute("data-name");
        let priceKey = null;
        if (tabName === "Грузчики") priceKey = "loaders";
        else if (tabName === "Разнорабочие") priceKey = "workers";
        else if (tabName === "Переезд") priceKey = "moving";

        if (priceKey && data.prices[priceKey] !== undefined) {
          tab.setAttribute("data-rate", data.prices[priceKey]);
          if (tab.classList.contains("active")) {
            currentRate = data.prices[priceKey];
            updateCalculator();
          }
        }
      });

      let cityPriceLabel = document.getElementById("city-price-label");
      if (!cityPriceLabel) {
        cityPriceLabel = document.createElement("div");
        cityPriceLabel.id = "city-price-label";
        cityPriceLabel.style.cssText = `
          text-align: center;
          padding: 8px 16px;
          margin: 0 auto 20px;
          background: rgba(255, 115, 0, 0.08);
          border: 1px solid rgba(255, 115, 0, 0.2);
          border-radius: 50px;
          color: #ff9f00;
          font-size: 0.85rem;
          font-weight: 600;
          max-width: fit-content;
          display: inline-block;
        `;
        const servicesSection = document.querySelector(".services-section .section-header");
        if (servicesSection) servicesSection.appendChild(cityPriceLabel);
      }
      cityPriceLabel.textContent = ` Актуальные цены для г. ${data.name}`;
    }

    // Update reviews for this city
    renderReviews(cityCode);
  }

  async function detectUserCity() {
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
        if (lowerGeoCity.includes("moscow")) return { cityCode: "moscow", isConfirmed: false };
        if (lowerGeoCity.includes("petersburg")) return { cityCode: "spb", isConfirmed: false };
        if (lowerGeoCity.includes("krasnodar")) return { cityCode: "krasnodar", isConfirmed: false };
        if (lowerGeoCity.includes("novosibirsk")) return { cityCode: "novosibirsk", isConfirmed: false };
        if (lowerGeoCity.includes("ekaterinburg")) return { cityCode: "ekaterinburg", isConfirmed: false };
        if (lowerGeoCity.includes("kazan")) return { cityCode: "kazan", isConfirmed: false };
        if (lowerGeoCity.includes("novgorod")) return { cityCode: "nn", isConfirmed: false };
        if (lowerGeoCity.includes("chelyabinsk")) return { cityCode: "chelyabinsk", isConfirmed: false };
        if (lowerGeoCity.includes("samara")) return { cityCode: "samara", isConfirmed: false };
        if (lowerGeoCity.includes("rostov")) return { cityCode: "rostov", isConfirmed: false };
        if (lowerGeoCity.includes("ufa")) return { cityCode: "ufa", isConfirmed: false };
        if (lowerGeoCity.includes("voronezh")) return { cityCode: "voronezh", isConfirmed: false };
        if (lowerGeoCity.includes("volgograd")) return { cityCode: "volgograd", isConfirmed: false };
      }
    } catch (e) {
      console.warn("Geotargeting auto-detect failed or timed out. Defaulting to Краснодар.", e);
    }

    return { cityCode: defaultCity, isConfirmed: false };
  }

  const cityBtn = document.getElementById("current-selected-city");
  const cityDropdown = document.getElementById("city-dropdown-menu");
  const cityConfirmBanner = document.getElementById("city-confirm-banner");
  const detectedCityName = document.getElementById("detected-city-name");
  const btnYes = document.getElementById("btn-city-confirm-yes");
  const btnNo = document.getElementById("btn-city-confirm-no");
  const cityItems = document.querySelectorAll(".city-item");

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

  cityItems.forEach((item) => {
    item.addEventListener("click", () => {
      const cityCode = item.getAttribute("data-city");
      if (cityCode && CITIES_DATA[cityCode]) {
        localStorage.setItem("city_confirmed", "true");
        renderCity(cityCode);
        renderReviews(cityCode);
        if (cityConfirmBanner) cityConfirmBanner.classList.remove("active");
      }
    });
  });

  async function initGeotargeting() {
    const { cityCode, isConfirmed } = await detectUserCity();
    renderCity(cityCode);
    const wasConfirmed = localStorage.getItem("city_confirmed") === "true";

    if (!wasConfirmed && !isConfirmed) {
      if (cityConfirmBanner && detectedCityName) {
        detectedCityName.textContent = CITIES_DATA[cityCode].name;
        setTimeout(() => {
          cityConfirmBanner.classList.add("active");
        }, 1200);
      }
    }
  }

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

  initGeotargeting();

  // ==========================================
  // 3. HEADER FX (STICKY SCROLL)
  // ==========================================
  const header = document.getElementById("site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    });
  }

  // ==========================================
  // 4. MOBILE MENU TOGGLE
  // ==========================================
  const burgerBtn = document.getElementById("burger-btn");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-link");
  const mobileCta = document.getElementById("mobile-menu-cta");

  function toggleMobileMenu() {
    burgerBtn.classList.toggle("active");
    mobileMenuOverlay.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  }

  if (burgerBtn && mobileMenuOverlay) {
    burgerBtn.addEventListener("click", toggleMobileMenu);
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileMenuOverlay.classList.contains("active")) {
          toggleMobileMenu();
        }
      });
    });

    if (mobileCta) {
      mobileCta.addEventListener("click", () => {
        if (mobileMenuOverlay.classList.contains("active")) {
          toggleMobileMenu();
        }
      });
    }
  }

  // ==========================================
  // 5. PREMIUM CARD SPOTLIGHT GLOW EFFECT
  // ==========================================
  const premiumCards = document.querySelectorAll(".premium-card");
  premiumCards.forEach((card) => {
    if (!card.querySelector(".card-glow")) {
      const glowDiv = document.createElement("div");
      glowDiv.classList.add("card-glow");
      card.appendChild(glowDiv);
    }
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  // ==========================================
  // 6. INTERACTIVE COST CALCULATOR
  // ==========================================
  const calcTabs = document.querySelectorAll(".calc-tab");
  const workersRange = document.getElementById("workers-range");
  const hoursRange = document.getElementById("hours-range");
  const workersVal = document.getElementById("workers-val");
  const hoursVal = document.getElementById("hours-val");
  const rateDisplay = document.getElementById("rate-display");
  const priceDisplay = document.getElementById("price-display");
  const calcSubmitBtn = document.getElementById("calc-submit-btn");
  let currentRate = 800;
  let currentServiceName = "Грузчики";

  function updateCalculator() {
    if (!workersRange || !hoursRange) return;
    const workers = parseInt(workersRange.value, 10);
    const hours = parseInt(hoursRange.value, 10);

    if (workersVal) {
      workersVal.textContent = `${workers} ${getWorkersWord(workers)}`;
    }
    if (hoursVal) {
      hoursVal.textContent = `${hours} ${getHoursWord(hours)}`;
    }

    const isNegotiable = currentRate === 0;
    const totalPrice = currentRate * workers * hours;
    const currencySpan = priceDisplay ? priceDisplay.parentNode.querySelector(".currency") : null;
    const rateInfo = document.querySelector(".result-rate-info");

    if (rateInfo) {
      if (isNegotiable) {
        rateInfo.innerHTML = `Тариф: <span id="rate-display">договорной</span>`;
      } else {
        rateInfo.innerHTML = `Тариф: <span id="rate-display">${currentRate}</span> руб/час`;
      }
    } else if (rateDisplay) {
      rateDisplay.textContent = isNegotiable ? "договорной" : currentRate;
    }

    if (priceDisplay) {
      if (isNegotiable) {
        priceDisplay.textContent = "Договорная";
        if (currencySpan) currencySpan.style.display = "none";
      } else {
        priceDisplay.textContent = totalPrice.toLocaleString("ru-RU");
        if (currencySpan) currencySpan.style.display = "inline";
      }
    }

    return {
      service: currentServiceName,
      workers,
      hours,
      rate: currentRate,
      price: isNegotiable ? "Договорная" : totalPrice
    };
  }

  if (calcTabs.length > 0) {
    calcTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        calcTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        currentRate = parseInt(tab.getAttribute("data-rate"), 10) || 800;
        currentServiceName = tab.getAttribute("data-name") || "Грузчики";
        updateCalculator();
      });
    });
  }

  if (workersRange) workersRange.addEventListener("input", updateCalculator);
  if (hoursRange) hoursRange.addEventListener("input", updateCalculator);
  updateCalculator();

  // ==========================================
  // 7. RUSSIAN PHONE INPUT MASKING
  // ==========================================
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  function setupPhoneMask(input) {
    input.addEventListener("input", (e) => {
      let inputNumbersValue = input.value.replace(/\D/g, "");
      let formattedInputValue = "";
      let selectionStart = input.selectionStart;

      if (!inputNumbersValue) {
        input.value = "";
        return;
      }

      if (input.value.length !== selectionStart) {
        if (e.data && /\D/g.test(e.data)) {
          input.value = inputNumbersValue;
        }
        return;
      }

      if (["7", "8", "9"].indexOf(inputNumbersValue[0]) > -1) {
        if (inputNumbersValue[0] === "9") inputNumbersValue = "7" + inputNumbersValue;
        let firstChar = "+7";
        if (inputNumbersValue[0] === "8") {
          inputNumbersValue = "7" + inputNumbersValue.substring(1);
        }

        formattedInputValue = firstChar + " ";
        if (inputNumbersValue.length > 1) {
          formattedInputValue += "(" + inputNumbersValue.substring(1, 4);
        }
        if (inputNumbersValue.length >= 5) {
          formattedInputValue += ") " + inputNumbersValue.substring(4, 7);
        }
        if (inputNumbersValue.length >= 8) {
          formattedInputValue += "-" + inputNumbersValue.substring(7, 9);
        }
        if (inputNumbersValue.length >= 10) {
          formattedInputValue += "-" + inputNumbersValue.substring(9, 11);
        }
      } else {
        formattedInputValue = "+" + inputNumbersValue.substring(0, 16);
      }

      input.value = formattedInputValue;
    });

    input.addEventListener("keydown", (e) => {
      let numVal = input.value.replace(/\D/g, "");
      if (e.keyCode === 8 && numVal.length <= 1) {
        input.value = "";
      }
    });

    input.addEventListener("focus", () => {
      if (!input.value) {
        input.value = "+7 ";
      }
    });

    input.addEventListener("blur", () => {
      if (input.value === "+7 " || input.value === "+7") {
        input.value = "";
      }
    });
  }
  phoneInputs.forEach(setupPhoneMask);

  // ==========================================
  // 8. MODAL WINDOW SYSTEM
  // ==========================================
  const orderModal = document.getElementById("order-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalSuccessCloseBtn = document.getElementById("modal-success-close-btn");
  const modalBookingForm = document.getElementById("modal-booking-form");
  const modalSuccessConfirm = document.getElementById("modal-success-confirm");
  const modalServiceName = document.getElementById("modal-service-name");
  const modalServiceInput = document.getElementById("modal-service-input");
  const modalDetailsInput = document.getElementById("modal-details-input");
  const modalSummaryBadge = document.getElementById("modal-summary-badge");

  function openModal(serviceName, details, calculatedPrice) {
    if (!orderModal) return;
    if (modalBookingForm) {
      modalBookingForm.reset();
      modalBookingForm.style.display = "block";
    }
    if (modalSuccessConfirm) {
      modalSuccessConfirm.classList.remove("active");
    }

    if (modalServiceName) modalServiceName.textContent = serviceName;
    if (modalServiceInput) modalServiceInput.value = serviceName;
    if (modalDetailsInput) modalDetailsInput.value = details;

    if (modalSummaryBadge) {
      if (calculatedPrice === "Договорная" || calculatedPrice === 0) {
        modalSummaryBadge.style.display = "block";
        modalSummaryBadge.innerHTML = `Сумма расчета: <span>Договорная</span>`;
      } else if (calculatedPrice) {
        modalSummaryBadge.style.display = "block";
        modalSummaryBadge.innerHTML = `Сумма расчета: <span>${calculatedPrice.toLocaleString("ru-RU")}</span> ₽`;
      } else {
        modalSummaryBadge.style.display = "none";
      }
    }

    orderModal.classList.add("active");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    if (!orderModal) return;
    orderModal.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalSuccessCloseBtn) modalSuccessCloseBtn.addEventListener("click", closeModal);
  if (orderModal) {
    orderModal.addEventListener("click", (e) => {
      if (e.target === orderModal) {
        closeModal();
      }
    });
  }

  if (calcSubmitBtn) {
    calcSubmitBtn.addEventListener("click", () => {
      const calcData = updateCalculator();
      if (calcData) {
        const detailsStr = calcData.rate === 0
          ? `${calcData.workers} чел., ${calcData.hours} ч. (Тариф: договорной)`
          : `${calcData.workers} чел., ${calcData.hours} ч. (Тариф: ${calcData.rate} ₽/ч)`;
        openModal(calcData.service, detailsStr, calcData.price);
      }
    });
  }

  const serviceOrderBtns = document.querySelectorAll(".service-order-btn");
  serviceOrderBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const serviceName = btn.getAttribute("data-service") || "Заказ персонала";
      const isNego = serviceName.includes("Такелаж") || serviceName.includes("Сборка мебели") || serviceName.includes("стеллаж") || serviceName.includes("Сборщик");
      let rate = isNego ? 0 : 800;
      let detailsStr = "";
      let minPrice = 0;

      if (isNego) {
        detailsStr = `Заказ услуги: ${serviceName}. Расчет стоимости индивидуальный (договорной).`;
        minPrice = "Договорная";
      } else {
        detailsStr = `Заказ услуги: ${serviceName}. Минимальный заказ от 2 часов.`;
        minPrice = rate * 2;
      }

      openModal(serviceName, detailsStr, minPrice);
    });
  });

  const fleetOrderBtns = document.querySelectorAll(".fleet-order-btn");
  fleetOrderBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const truckName = btn.getAttribute("data-truck") || "Газель";
      let rate = 2000;
      if (truckName.includes("Удлиненная")) rate = 2500;

      const detailsStr = `Аренда грузовика: ${truckName}. Минимальный заказ от 2 часов.`;
      const minPrice = rate * 2;

      openModal(`Аренда авто: ${truckName}`, detailsStr, minPrice);
    });
  });

  const outProposalLink = document.querySelector(".outsourcing-glass .btn");
  if (outProposalLink) {
    outProposalLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("Аутсорсинг персонала", "Запрос коммерческого предложения по аутсорсингу линейного персонала.", null);
    });
  }

  // ==========================================
  // 9. FAQ ACCORDION ENGINE
  // ==========================================
  const faqTriggers = document.querySelectorAll(".faq-trigger");
  faqTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const faqItem = trigger.closest(".faq-item");
      const panel = faqItem.querySelector(".faq-panel");
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".faq-item").forEach((item) => {
        if (item !== faqItem) {
          item.classList.remove("active");
          const itemTrigger = item.querySelector(".faq-trigger");
          if (itemTrigger) itemTrigger.setAttribute("aria-expanded", "false");
          const itemPanel = item.querySelector(".faq-panel");
          if (itemPanel) itemPanel.style.maxHeight = null;
        }
      });

      faqItem.classList.toggle("active");
      trigger.setAttribute("aria-expanded", !isExpanded);

      if (faqItem.classList.contains("active")) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      } else {
        panel.style.maxHeight = null;
      }
    });
  });

  // ==========================================
  // 10. ANIMATED STATISTICS COUNTER
  // ==========================================
  const statNumbers = document.querySelectorAll(".stat-num");
  const countUp = (element) => {
    const target = parseInt(element.getAttribute("data-target"), 10) || 0;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * target);

      element.textContent = currentValue.toLocaleString("ru-RU");

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = target.toLocaleString("ru-RU");
      }
    };

    requestAnimationFrame(animate);
  };

  if ("IntersectionObserver" in window && statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stat = entry.target;
            countUp(stat);
            observer.unobserve(stat);
          }
        });
      },
      { threshold: 0.1 }
    );

    statNumbers.forEach((stat) => {
      statsObserver.observe(stat);
    });
  } else {
    statNumbers.forEach((stat) => {
      stat.textContent = stat.getAttribute("data-target");
    });
  }

  // ==========================================
  // 11. FORM SUBMISSIONS
  // ==========================================
  const WHATSAPP_NUMBER = "79283333281"; // без + и символов
  const TELEGRAM_USERNAME = "flashpointmusik"; // без @
  const CONTACT_EMAIL = "info@pragruz.ru";

  function buildLeadText(leadData) {
    const lines = [
      leadData.name ? `Имя: ${leadData.name}` : null,
      leadData.phone ? `Телефон: ${leadData.phone}` : null,
      leadData.service ? `Услуга: ${leadData.service}` : null,
      leadData.comment ? `Комментарий: ${leadData.comment}` : null,
      leadData.details ? `Детали: ${leadData.details}` : null,
      leadData.promo ? `Промокод: ${leadData.promo}` : null,
      `Источник: ${leadData.source || "Не указано"}`,
      `Время: ${new Date(leadData.timestamp || Date.now()).toLocaleString("ru-RU")}`
    ].filter(Boolean);
    return encodeURIComponent(lines.join("\n"));
  }


  function openUrlInNewTab(url) {
    const newWindow = window.open(url, "_blank", "noopener");
    if (!newWindow) {
      console.warn("Popup blocked for URL:", url);
    }
    return newWindow;
  }

  function selectContactChannel() {
    const choice = window.prompt(
      "Куда отправить заявку?\n1 — WhatsApp\n2 — Telegram\n3 — Email\n\nВведите 1, 2 или 3"
    );
    if (!choice) return null;
    const normalized = choice.trim();
    if (normalized === "1") return "whatsapp";
    if (normalized === "2") return "telegram";
    if (normalized === "3") return "email";
    alert("Выбран неверный вариант. Попробуйте снова.");
    return null;
  }

  function sendLeadToWhatsApp(leadData) {
    const text = buildLeadText(leadData);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    openUrlInNewTab(url);
  }

  function sendLeadToTelegram(leadData) {
    // Эта функция больше не используется - отправка идёт через сервер
    console.log("sendLeadToTelegram called (deprecated - use server instead)");
  }

  function sendLeadToEmail(leadData) {
    const subject = encodeURIComponent(
      `[Pragruz] ${leadData.source || "Заявка"}${leadData.service ? ` — ${leadData.service}` : ""}`
    );
    const body = buildLeadText(leadData);
    const url = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    openUrlInNewTab(url);
  }

  function sendLeadToAllChannels(leadData) {
    sendLeadToWhatsApp(leadData);
    sendLeadToTelegram(leadData);
    sendLeadToEmail(leadData);
  }

  /**
   * sendLeadByUserChoice - отправляет лид на Formspree и перенаправляет на страницу "спасибо"
   */
  async function sendLeadByUserChoice(leadData) {
    try {
      const response = await fetch('https://formspree.io/f/xeebjwkn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      if (response.ok) {
        // Редирект на страницу благодарности
        setTimeout(() => {
          window.location.href = 'thank-you.html';
        }, 100);
        return true;
      } else {
        console.error('Formspree error:', response.status, response.statusText);
        alert('Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз или позвоните нам.');
        return false;
      }
    } catch (e) {
      console.error('Send lead error:', e);
      alert('Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз или позвоните нам.');
      return false;
    }
  }

  const heroForm = document.getElementById("hero-quick-form");
  if (heroForm) {
    heroForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const selectElem = document.getElementById("quick-service");
      const phoneInput = document.getElementById("quick-phone");

      if (selectElem && phoneInput) {
        const serviceVal = selectElem.options[selectElem.selectedIndex].text;
        const phoneVal = phoneInput.value;
        const serviceCode = selectElem.value;

        let rate = 800;
        const isNego = serviceCode === "rigging";
        if (isNego) rate = 0;

        let detailsStr = "";
        let minPrice = 0;

        if (isNego) {
          detailsStr = `Заявка с главного экрана. Номер: ${phoneVal}. Тариф: договорной`;
          minPrice = "Договорная";
        } else {
          detailsStr = `Заявка с главного экрана. Номер: ${phoneVal}. Тариф: от ${rate} ₽/ч`;
          minPrice = rate * 2;
        }

        openModal(serviceVal, detailsStr, minPrice);

        const modalPhoneField = document.getElementById("modal-phone");
        if (modalPhoneField) modalPhoneField.value = phoneVal;
      }
    });
  }

  const mainForm = document.getElementById("main-booking-form");
  const successConfirm = document.getElementById("success-confirm");
  const successBackBtn = document.getElementById("success-back-btn");

  if (mainForm && successConfirm) {
    mainForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameVal = document.getElementById("form-name").value.trim();
      const phoneVal = document.getElementById("form-phone").value.trim();
      const serviceVal = document.getElementById("form-service").options[document.getElementById("form-service").selectedIndex].text;
      const commentVal = document.getElementById("form-comment").value.trim();

      if (!nameVal || phoneVal.length < 10) {
        alert("Пожалуйста, введите корректное имя и номер телефона.");
        return;
      }

      const leadData = {
        name: nameVal,
        phone: phoneVal,
        service: serviceVal,
        comment: commentVal,
        source: "Main Form",
        timestamp: new Date().toISOString()
      };

      console.log("Sending lead to backend (Stub):", leadData);
      const sent = sendLeadByUserChoice(leadData);
      if (!sent) return;

      mainForm.style.display = "none";
      successConfirm.classList.add("active");
    });

    if (successBackBtn) {
      successBackBtn.addEventListener("click", () => {
        mainForm.reset();
        mainForm.style.display = "block";
        successConfirm.classList.remove("active");
      });
    }
  }

  if (modalBookingForm && modalSuccessConfirm) {
    modalBookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameVal = document.getElementById("modal-name").value.trim();
      const phoneVal = document.getElementById("modal-phone").value.trim();
      const serviceVal = modalServiceInput ? modalServiceInput.value : "";
      const detailsVal = modalDetailsInput ? modalDetailsInput.value : "";

      if (!nameVal || phoneVal.length < 10) {
        alert("Пожалуйста, введите имя и номер телефона.");
        return;
      }

      const leadData = {
        name: nameVal,
        phone: phoneVal,
        service: serviceVal,
        details: detailsVal,
        source: "Modal Form",
        timestamp: new Date().toISOString()
      };

      console.log("Sending lead to backend (Stub):", leadData);
      const sent = sendLeadByUserChoice(leadData);
      if (!sent) return;

      modalBookingForm.style.display = "none";
      modalSuccessConfirm.classList.add("active");
    });
  }

  // ==========================================
  // 12. REAL-TIME ACTIVE WORKERS FLUCTUATION
  // ==========================================
  const activeWorkersElement = document.getElementById("active-workers-count");
  if (activeWorkersElement) {
    let currentCount = 128;
    let deltaBadge = document.getElementById("active-workers-delta");
    if (!deltaBadge) {
      deltaBadge = document.createElement("span");
      deltaBadge.id = "active-workers-delta";
      deltaBadge.className = "workers-delta";
      activeWorkersElement.parentNode.insertBefore(deltaBadge, activeWorkersElement.nextSibling);
    }

    setInterval(() => {
      let change = 0;
      while (change === 0) {
        change = Math.floor(Math.random() * 7) - 3;
      }
      currentCount = Math.max(118, Math.min(138, currentCount + change));

      deltaBadge.className = "workers-delta";
      void deltaBadge.offsetWidth;

      if (change > 0) {
        deltaBadge.textContent = `+${change}`;
        deltaBadge.classList.add("delta-positive");
      } else {
        deltaBadge.textContent = `${change}`;
        deltaBadge.classList.add("delta-negative");
      }

      activeWorkersElement.classList.add("number-pulse");

      setTimeout(() => {
        activeWorkersElement.textContent = currentCount;
      }, 150);

      setTimeout(() => {
        activeWorkersElement.classList.remove("number-pulse");
      }, 450);
    }, 6000 + Math.random() * 4000);
  }

  // ==========================================
  // 13. AUTO-SELECT CALCULATOR TAB BASED ON PAGE
  // ==========================================
  const activePage = document.body.getAttribute("data-page") || "index";
  if (calcTabs.length > 0) {
    let tabToClick = null;
    if (activePage === "loaders") {
      tabToClick = Array.from(calcTabs).find((t) => t.getAttribute("data-name") === "Грузчики");
    } else if (activePage === "workers") {
      tabToClick = Array.from(calcTabs).find((t) => t.getAttribute("data-name") === "Разнорабочие");
    } else if (activePage === "moving") {
      tabToClick = Array.from(calcTabs).find((t) => t.getAttribute("data-name") === "Переезд");
    } else if (activePage === "rigging") {
      tabToClick = Array.from(calcTabs).find((t) => t.getAttribute("data-name") === "Такелажники");
    } else if (activePage === "furniture") {
      tabToClick = Array.from(calcTabs).find((t) => t.getAttribute("data-name") === "Грузчики");
    }
    if (tabToClick) {
      tabToClick.click();
    }
  }

  // ==========================================
  // 14. HERO LIVE ACTIVITY COUNTERS (PERSISTENT)
  // ==========================================
  const COUNTER_STORAGE_KEY = "pg_counters_state";
  const COUNTER_UPDATE_INTERVAL = 60000;

  function getCounterState() {
    try {
      const saved = localStorage.getItem(COUNTER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  function saveCounterState(state) {
    try {
      localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Cannot save counter state:", e);
    }
  }

  function generateInitialCounters() {
    return {
      lastOrderMinutes: Math.floor(Math.random() * 60) + 1,
      freeBrigades: Math.floor(Math.random() * 11) + 5,
      todayOrders: Math.floor(Math.random() * 30) + 35,
      lastUpdate: Date.now(),
      lastReset: Date.now()
    };
  }

  function updatePersistentCounters() {
    try {
      let state = getCounterState();

      if (!state) {
        state = generateInitialCounters();
        saveCounterState(state);
      }

      const now = Date.now();
      const elapsedMinutes = Math.min(Math.floor((now - state.lastUpdate) / 60000), 1440);

      state.lastOrderMinutes += elapsedMinutes;

      if (state.lastOrderMinutes > 120) {
        state.lastOrderMinutes = Math.floor(Math.random() * 10) + 1;
      }

      const brigadeChange = Math.floor(Math.random() * 3) - 1;
      state.freeBrigades = Math.max(5, Math.min(15, state.freeBrigades + brigadeChange));

      const lastUpdateDate = new Date(state.lastUpdate);
      const nowDate = new Date(now);

      if (lastUpdateDate.toDateString() !== nowDate.toDateString()) {
        state.todayOrders = Math.floor(Math.random() * 20) + 20;
      } else if (elapsedMinutes > 0) {
        const newOrders = Math.floor(Math.random() * 2) * elapsedMinutes;
        state.todayOrders = Math.min(state.todayOrders + newOrders, 999);
      }

      state.lastUpdate = now;
      saveCounterState(state);

      const minutesText = `${state.lastOrderMinutes} ${getMinutesWord(state.lastOrderMinutes)} назад`;

      const lastOrder = document.getElementById("last-order-time");
      const freeBrigades = document.getElementById("free-brigades-count");
      const todayOrders = document.getElementById("today-orders-count");

      if (lastOrder) {
        lastOrder.textContent = minutesText;
        lastOrder.classList.add("updating");
        setTimeout(() => lastOrder.classList.remove("updating"), 600);
      }
      if (freeBrigades) {
        freeBrigades.textContent = state.freeBrigades;
        freeBrigades.classList.add("updating");
        setTimeout(() => freeBrigades.classList.remove("updating"), 600);
      }
      if (todayOrders) {
        todayOrders.textContent = state.todayOrders;
        todayOrders.classList.add("updating");
        setTimeout(() => todayOrders.classList.remove("updating"), 600);
      }
    } catch (e) {
      console.error("Counter update error:", e);
    }
  }

  updatePersistentCounters();
  setInterval(updatePersistentCounters, COUNTER_UPDATE_INTERVAL);

  // ==========================================
  // 15. EXIT INTENT POPUP
  // ==========================================
  function initExitIntentPopup() {
    if (localStorage.getItem("exit_popup_shown")) {
      return;
    }

    const popupHtml = `
      <div class="exit-modal-overlay" id="exit-intent-overlay">
        <div class="exit-modal-card premium-card">
          <div class="card-glow"></div>
          <button class="exit-modal-close" id="exit-close-btn" aria-label="Закрыть">×</button>
          <div class="exit-modal-content">
            <div class="exit-gift-icon">🎁</div>
            <h2>Подождите, не уходите!</h2>
            <p class="exit-modal-promo">Получите гарантированную <span class="text-gradient">скидку 10%</span> на ваш первый заказ!</p>
            <p class="exit-modal-desc">Закрепите за своим номером скидку. Мы перезвоним, проконсультируем и зафиксируем спецтариф.</p>
            <form id="exit-booking-form" class="exit-form">
              <div class="form-group-custom">
                <input type="tel" id="exit-phone" placeholder="+7 (999) 000-00-00" required class="form-input-custom">
              </div>
              <button type="submit" class="btn btn-primary btn-block btn-lg" id="exit-submit-btn">Получить скидку 10%</button>
            </form>
            <div class="success-screen" id="exit-success-confirm">
              <div class="success-icon-box">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="success-svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3>Скидка 10% забронирована!</h3>
              <p>Ваш промокод: <strong style="color: var(--primary);">OFFER10</strong></p>
              <p>Мы перезвоним вам в течение 5 минут для подтверждения и расчета стоимости со скидкой.</p>
              <button type="button" class="btn btn-secondary btn-sm" id="exit-success-close-btn">Отлично</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = popupHtml.trim();
    const exitPopupOverlay = tempDiv.firstChild;
    document.body.appendChild(exitPopupOverlay);

    const exitCard = exitPopupOverlay.querySelector(".exit-modal-card");
    if (exitCard) {
      exitCard.addEventListener("mousemove", (e) => {
        const rect = exitCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        exitCard.style.setProperty("--mouse-x", `${x}px`);
        exitCard.style.setProperty("--mouse-y", `${y}px`);
      });
    }

    const phoneInput = document.getElementById("exit-phone");
    if (phoneInput) {
      setupPhoneMask(phoneInput);
    }

    const closeBtn = document.getElementById("exit-close-btn");
    const successCloseBtn = document.getElementById("exit-success-close-btn");
    const exitForm = document.getElementById("exit-booking-form");
    const exitSuccessConfirm = document.getElementById("exit-success-confirm");

    function closeExitPopup() {
      exitPopupOverlay.classList.remove("active");
      localStorage.setItem("exit_popup_shown", "true");
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeExitPopup);
    }
    if (successCloseBtn) {
      successCloseBtn.addEventListener("click", closeExitPopup);
    }

    exitPopupOverlay.addEventListener("click", (e) => {
      if (e.target === exitPopupOverlay) {
        closeExitPopup();
      }
    });

    if (exitForm && exitSuccessConfirm) {
      exitForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const phoneVal = phoneInput.value.trim();

        if (phoneVal.length < 10) {
          alert("Пожалуйста, введите корректный номер телефона.");
          return;
        }

        const leadData = {
          phone: phoneVal,
          promo: "OFFER10",
          source: "Exit Intent Form",
          timestamp: new Date().toISOString()
        };

        console.log("Sending exit lead to backend (Stub):", leadData);
        const sent = sendLeadByUserChoice(leadData);
        if (!sent) return;

        exitForm.style.display = "none";
        exitSuccessConfirm.classList.add("active");
        localStorage.setItem("exit_popup_shown", "true");
      });
    }

    document.addEventListener("mouseleave", (e) => {
      if (e.clientY < 50 && !localStorage.getItem("exit_popup_shown")) {
        exitPopupOverlay.classList.add("active");
      }
    });
  }

  setTimeout(initExitIntentPopup, 2000);
});