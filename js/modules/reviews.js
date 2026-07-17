/**
 * Reviews database and rendering
 * Актуальные города селектора: krasnodar, anapa, novorossiysk, sochi, gelendzhik
 * ~10 правдоподобных отзывов на город (+ default)
 */

import { CITIES_DATA } from "./geotargeting.js";

const SITE_ASSET_BASE = document.querySelector('link[href^="../css/"]') ? "../" : "";

const M = "assets/avatar-male.webp";
const M2 = "assets/avatar-male-2.webp";
const F = "assets/avatar-female.webp";
const F2 = "assets/avatar-female-2.webp";

function R(name, city, rating, text, date, initials, avatar, service = "") {
  return { name, city, rating, text, date, initials, avatar, service };
}

export const REVIEWS_DB = {
  krasnodar: [
    R("Игорь Н.", "Краснодар", 5,
      "Заказывал двух грузчиков на переезд с ул. Ставропольской в ЖК «Губернский». Приехали без опоздания, шкаф разобрали аккуратно, технику обмотали плёнкой. По времени вышло чуть больше, чем думал, но ничего не поцарапали.",
      "18 июня 2026", "ИН", M, "Квартирный переезд"),
    R("Марина Л.", "Краснодар", 5,
      "Нужно было поднять диван и холодильник на 6 этаж в ЧМР, лифт не работал. Заранее предупредили по цене за подъём, сделали спокойно. Диспетчер быстро нашла бригаду.",
      "14 июня 2026", "МЛ", F, "Подъём техники"),
    R("Андрей П.", "Краснодар", 4,
      "Разгружали машину со стройматериалами в районе Энки. Один грузчик задержался минут на 15 — за это 4★. По работе: мешки и плитку перенесли аккуратно, мусор собрали.",
      "10 июня 2026", "АП", M2, "Разгрузка"),
    R("Ольга В.", "Краснодар", 5,
      "Переезжала из однушки на ЮМР, вещей оказалось больше, чем сказала по телефону. Бригадир пересчитал объём на месте, цену объяснил до старта. Коробки расставили по комнатам.",
      "6 июня 2026", "ОВ", F2, "Квартирный переезд"),
    R("Сергей К.", "Краснодар", 4,
      "Брали разнорабочих на склад на один день. Работали без простоев, документы отправили на следующий день. Хотелось бы чуть быстрее по закрывающим, в целом устроило.",
      "2 июня 2026", "СК", M, "Разнорабочие"),
    R("Елена М.", "Краснодар", 5,
      "Офисный переезд на ул. Красной: столы, архив, серверный шкаф. Приехали в субботу утром, к вечеру уже сидели на новом месте. За безнал и акт отдельное спасибо.",
      "28 мая 2026", "ЕМ", F, "Офисный переезд"),
    R("Дмитрий С.", "Краснодар", 5,
      "Такелаж сейфа в районе ККБ. Привезли ремни и настил, плитку не задели. Видно, что не первый раз. Цену назвали до начала — без «сюрпризов» на объекте.",
      "22 мая 2026", "ДС", M2, "Такелаж"),
    R("Наталья Р.", "Краснодар", 5,
      "Переезд в ЖК на Петра Метальникова. Газель 4,2 м + двое грузчиков. Мебель разобрали, матрас в плёнку, на новом месте собрали шкаф. Совпало с предварительным расчётом.",
      "15 мая 2026", "НР", F, "Квартирный переезд"),
    R("Павел Т.", "Краснодар", 4,
      "Грузчики на час: разгрузка плитки у частного дома в Пашковском. Из-за пробок на Российской приехали позже минут на 20, предупредили. Работой доволен.",
      "9 мая 2026", "ПТ", M, "Грузчики на час"),
    R("Юлия К.", "Краснодар", 5,
      "Срочно нужно было вынести старую кухню и занести новую в Фестивальном. Приняли заявку днём, вечером уже были. Подъезд оставили чистым, фурнитуру сложили отдельно.",
      "3 мая 2026", "ЮК", F2, "Сборка / перенос мебели"),
  ],

  anapa: [
    R("Валентина К.", "Анапа", 5,
      "Переезд из квартиры у Южного рынка. Приехали утром, помогли упаковать посуду, мебель вынесли аккуратно. Для курортного сезона подача была на удивление вовремя.",
      "21 июня 2026", "ВК", F, "Квартирный переезд"),
    R("Павел Р.", "Анапа", 4,
      "Разгрузка плитки и сантехники в частный дом. Бригада справилась хорошо, машина приехала минут на 20 позже из-за пробок — предупредили, поэтому 4★.",
      "16 июня 2026", "ПР", M, "Разгрузка"),
    R("Людмила С.", "Анапа", 5,
      "Перевозили мебель после ремонта. Матрас и фасады кухни обмотали плёнкой, ничего не потёрлось. Рекомендую, если не хотите сами таскать.",
      "9 июня 2026", "ЛС", F2, "Перевозка мебели"),
    R("Игорь В.", "Анапа", 5,
      "Грузчики на час: занос техники в квартиру на 4 этаж без грузового лифта. Сказали цену за подъём заранее, работали спокойно, стены не задели.",
      "4 июня 2026", "ИВ", M2, "Грузчики на час"),
    R("Светлана Д.", "Анапа", 5,
      "Переезд с дачи в квартиру. Вещей много мелких. Коробки подписали, хрупкое везли отдельно. По деньгам вышло как в предварительном звонке.",
      "29 мая 2026", "СД", F, "Квартирный переезд"),
    R("Роман Н.", "Анапа", 4,
      "Разгрузка стройматериалов на объект. Ребята крепкие, темп нормальный. Снимаю звезду за то, что утром пришлось ещё раз подтвердить время.",
      "23 мая 2026", "РН", M, "Разгрузка"),
    R("Анна П.", "Анапа", 5,
      "Нужно было срочно вынести старую мебель перед сдачей квартиры. Приняли в тот же день, к вечеру освободили комнаты. Чисто и без лишней суеты.",
      "17 мая 2026", "АП", F2, "Вынос мебели"),
    R("Кирилл М.", "Анапа", 5,
      "Газель + грузчики на переезд однушки. Упаковали телевизор и зеркала, в кузове закрепили ремнями. На новом адресе расставили по комнатам.",
      "11 мая 2026", "КМ", M2, "Переезд с машиной"),
    R("Оксана Л.", "Анапа", 5,
      "Сборка шкафа и перенос после покупки в магазине. Инструмент свой, собрали ровно, мусор убрали. Приятно, когда не нужно бегать за отвёрткой.",
      "5 мая 2026", "ОЛ", F, "Сборка мебели"),
    R("Виталий С.", "Анапа", 4,
      "Разнорабочие на участок на полдня: перенос блоков и мусора. Справились. Хотел бы чуть больше людей в бригаде при таком объёме — в следующий раз уточню заранее.",
      "28 апреля 2026", "ВС", M, "Разнорабочие"),
  ],

  novorossiysk: [
    R("Денис М.", "Новороссийск", 5,
      "Разгружали фуру с товаром на складе. Приехали четверо, работали без лишних перерывов, паллеты разложили как просили. Для склада — то, что нужно.",
      "22 июня 2026", "ДМ", M, "Разгрузка фуры"),
    R("Ксения А.", "Новороссийск", 5,
      "Квартирный переезд с подъёмом на этаж. Лифт маленький, часть мебели не вошла — спокойно подняли по лестнице. Ничего не разбили.",
      "15 июня 2026", "КА", F, "Квартирный переезд"),
    R("Олег Т.", "Новороссийск", 4,
      "Разнорабочие на объект на один день. По работе претензий нет, задачи поняли быстро. Оценка 4 — ждали бригаду чуть дольше обещанного окна.",
      "7 июня 2026", "ОТ", M2, "Разнорабочие"),
    R("Марина Ф.", "Новороссийск", 5,
      "Переезд офиса небольшой фирмы. Документы и оргтехнику упаковали, в понедельник уже работали. Закрывающие документы прислали без напоминаний.",
      "1 июня 2026", "МФ", F2, "Офисный переезд"),
    R("Артём Б.", "Новороссийск", 5,
      "Такелаж станка в цеху. Привезли стропы, продумали путь. Долго, но аккуратно — а это главное. Цену согласовали до начала.",
      "25 мая 2026", "АБ", M, "Такелаж"),
    R("Ирина Г.", "Новороссийск", 5,
      "Занос мебели после ремонта, 5 этаж. Предупредили про узкий проём, дверь сняли и вернули. Редко пишу отзывы — тут правда аккуратно.",
      "19 мая 2026", "ИГ", F, "Занос мебели"),
    R("Николай П.", "Новороссийск", 4,
      "Грузчики на разгрузку Газели со стройматериалами. Темп хороший. Один момент: не сразу нашли парковку у двора, потеряли минут 10.",
      "12 мая 2026", "НП", M2, "Разгрузка"),
    R("Елена Ч.", "Новороссийск", 5,
      "Переезд из квартиры в дом. Много коробок и детских вещей. Всё довезли, на месте помогли разнести по комнатам. Спокойный сервис.",
      "6 мая 2026", "ЕЧ", F2, "Квартирный переезд"),
    R("Станислав К.", "Новороссийск", 5,
      "Нужны были люди на склад на смену: перенос и штабелирование. Приехали трезвые, в смене без «пропаж». Будем обращаться ещё.",
      "30 апреля 2026", "СК", M, "Складские работы"),
    R("Татьяна М.", "Новороссийск", 5,
      "Срочный вынос старой мебели перед приёмкой квартиры. Заявку приняли утром, днём уже сделали. Подъезд подмели — мелочь, но приятно.",
      "22 апреля 2026", "ТМ", F, "Вынос мебели"),
  ],

  sochi: [
    R("Артур Г.", "Сочи / Адлер / Сириус", 5,
      "Переезд из Адлера в Сириус, много коробок и техника. Бригада заранее позвонила, подъехали к удобному времени. С учётом серпантина — очень достойно.",
      "20 июня 2026", "АГ", M, "Квартирный переезд"),
    R("Нина В.", "Сочи / Адлер / Сириус", 4,
      "Поднимали мебель в доме без грузового лифта. Работали аккуратно, стены не задели. Минус звезда за ожидание из-за пробок, но предупредили.",
      "13 июня 2026", "НВ", F, "Подъём мебели"),
    R("Руслан Б.", "Сочи / Адлер / Сириус", 5,
      "Разгрузка оборудования для кафе. Приехали трезвые, вежливые, тяжёлые позиции не бросали. Для общепита важно — всё целое.",
      "5 июня 2026", "РБ", M2, "Разгрузка"),
    R("Алина С.", "Сочи / Адлер / Сириус", 5,
      "Переезд квартиры в центре Сочи. Парковка сложная — диспетчер уточнил подъезд заранее. Мебель в плёнке, ничего не потёрлось в узком лифте.",
      "30 мая 2026", "АС", F2, "Квартирный переезд"),
    R("Георгий Д.", "Сочи / Адлер / Сириус", 5,
      "Такелаж сейфа в офисе. Учли уклон и ступени. Сделали дольше, чем «просто грузчики», но результат важнее — пол и стены целы.",
      "24 мая 2026", "ГД", M, "Такелаж"),
    R("Вера К.", "Сочи / Адлер / Сириус", 4,
      "Грузчики на час: занос техники после покупки. Всё ок. Хотелось бы чуть точнее по времени «окна» в сезон, но работу сделали хорошо.",
      "18 мая 2026", "ВК", F, "Грузчики на час"),
    R("Максим Л.", "Сочи / Адлер / Сириус", 5,
      "Офисный переезд небольшой студии. Документы, компьютеры, стеллажи. Упаковали, перевезли, на месте собрали. Работали в воскресенье — удобно.",
      "12 мая 2026", "МЛ", M2, "Офисный переезд"),
    R("Дарья Н.", "Сочи / Адлер / Сириус", 5,
      "Переезд из квартиры в Адлере в дом. Много хрупкого. Коробки с посудой везли отдельно, на месте аккуратно поставили. Спасибо за терпение.",
      "6 мая 2026", "ДН", F2, "Квартирный переезд"),
    R("Илья Р.", "Сочи / Адлер / Сириус", 5,
      "Разгрузка стройматериалов на объект с крутым подъездом. Машину поставили грамотно, перенос без простоев. Нормальный рабочий подход.",
      "1 мая 2026", "ИР", M, "Разгрузка"),
    R("Полина Е.", "Сочи / Адлер / Сириус", 5,
      "Сборка кухни и перенос после доставки. Собрали ровно, зазоры нормальные, мусор убрали. Редко когда после «сборщиков» не приходится доделывать.",
      "25 апреля 2026", "ПЕ", F, "Сборка мебели"),
  ],

  gelendzhik: [
    R("Светлана П.", "Геленджик", 5,
      "Нужно было вынести старую мебель и занести новую. Позвонила утром — к обеду уже двое грузчиков. Для Геленджика в сезон очень бодро.",
      "19 июня 2026", "СП", F, "Перенос мебели"),
    R("Максим Е.", "Геленджик", 4,
      "Разгружали стройматериалы у частного дома. Всё перенесли куда показал, ничего не повредили. Чуть задержались на дороге — отсюда 4★.",
      "12 июня 2026", "МЕ", M, "Разгрузка"),
    R("Алена Ш.", "Геленджик", 5,
      "Переезд из квартиры в дом. Мебель разобрали, фурнитуру сложили отдельно, на месте собрали. Спокойно и без нервов.",
      "4 июня 2026", "АШ", F2, "Квартирный переезд"),
    R("Владимир К.", "Геленджик", 5,
      "Грузчики + Газель на переезд студии. Упаковали телевизор, в кузове закрепили. Цена как в звонке, без допов «на месте».",
      "28 мая 2026", "ВК", M2, "Переезд с машиной"),
    R("Ирина О.", "Геленджик", 5,
      "Подъём холодильника и шкафа на 3 этаж, узкая лестница. Предупредили, что будет дольше. Сделали аккуратно, перила и стены целы.",
      "21 мая 2026", "ИО", F, "Подъём техники"),
    R("Евгений Т.", "Геленджик", 4,
      "Разнорабочие на участок: перенос мусора и материалов. Работа нормальная. Лучше заранее писать объём точнее — я сам недооценил.",
      "14 мая 2026", "ЕТ", M, "Разнорабочие"),
    R("Мария В.", "Геленджик", 5,
      "Вынос мебели перед ремонтом. Быстро, вежливо, подъезд не разгромили. Заказала повторно на занос — снова без сюрпризов.",
      "8 мая 2026", "МВ", F2, "Вынос мебели"),
    R("Алексей Г.", "Геленджик", 5,
      "Разгрузка фуры на небольшой склад. Четверо человек, темп ровный, паллеты поставили как нужно. Для разовой задачи — идеально.",
      "2 мая 2026", "АГ", M2, "Разгрузка фуры"),
    R("Надежда Л.", "Геленджик", 5,
      "Переезд с детьми — стресс. Ребята не суетились, хрупкое отдельно, игрушки не разбросали. Отдельное спасибо за спокойный тон.",
      "26 апреля 2026", "НЛ", F, "Квартирный переезд"),
    R("Сергей Ж.", "Геленджик", 5,
      "Такелаж небольшого сейфа в частный дом. Продумали занос, пол закрыли. Не «шабашка», а нормальная работа с инструментом.",
      "18 апреля 2026", "СЖ", M, "Такелаж"),
  ],

  default: [
    R("Алексей Р.", "Город", 5,
      "Заказывал грузчиков на разгрузку машины после ремонта. Диспетчер уточнил адрес и объём, ребята приехали с перчатками и тележкой. Без суеты, но быстро.",
      "16 июня 2026", "АР", M, "Разгрузка"),
    R("Мария С.", "Город", 5,
      "Квартирный переезд прошёл спокойнее, чем ждала. Мебель разобрали и собрали, коробки с посудой отдельно. Ничего не разбилось.",
      "12 июня 2026", "МС", F, "Квартирный переезд"),
    R("Виктор Н.", "Город", 4,
      "Разнорабочие на стройку. Крепкие, трезвые, по работе нормально. Звезду снимаю только за то, что утром пришлось повторно уточнять время.",
      "8 июня 2026", "ВН", M2, "Разнорабочие"),
    R("Екатерина Б.", "Город", 5,
      "Срочно вынести старую мебель и загрузить новую. Приняли в тот же день, приехали вечером. Подъезд после выноса оставили чистым.",
      "4 июня 2026", "ЕБ", F2, "Перенос мебели"),
    R("Игорь Л.", "Город", 5,
      "Офисный переезд: столы, техника, архив. Промаркировали, перевезли, на новом месте расставили. Утром сотрудники уже работали.",
      "29 мая 2026", "ИЛ", M, "Офисный переезд"),
    R("Светлана К.", "Город", 5,
      "Подъём холодильника без лифта. Цену за этаж сказали до начала. Сделали аккуратно — больше такого сама не потяну.",
      "22 мая 2026", "СК", F, "Подъём техники"),
    R("Роман Д.", "Город", 4,
      "Газель + грузчики. В целом хорошо, чуть задержали подачу из-за пробок. Работой и упаковкой доволен.",
      "15 мая 2026", "РД", M2, "Переезд с машиной"),
    R("Анна М.", "Город", 5,
      "Сборка шкафа и комода после доставки. Собрали ровно, мусор убрали. Приятно, когда не нужно доделывать самой.",
      "9 мая 2026", "АМ", F2, "Сборка мебели"),
    R("Пётр С.", "Город", 5,
      "Разгрузка паллет на склад. Темп хороший, ничего не уронили. Для разовой смены — закрыли вопрос полностью.",
      "2 мая 2026", "ПС", M, "Склад"),
    R("Ольга Т.", "Город", 5,
      "Переезд однушки «под ключ»: разборка, упаковка, перевозка, сборка. Устала меньше, чем думала. Буду советовать знакомым.",
      "25 апреля 2026", "ОТ", F, "Квартирный переезд"),
  ],
};

// fix typo gelendzhik city label if any slipped
REVIEWS_DB.gelendzhik = REVIEWS_DB.gelendzhik.map((r) => ({
  ...r,
  city: "Геленджик",
}));

export function renderReviews(cityCode) {
  const container = document.querySelector(".reviews-carousel-track");
  if (!container) return;

  const reviews = REVIEWS_DB[cityCode] || REVIEWS_DB["default"];
  container.innerHTML = "";
  // Сброс флага дублирования карточек для автоплея (см. setupReviewsAutoplay)
  delete container.dataset.duped;

  // Одна лента (без дублей) — удобнее листать вручную
  reviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "review-card";
    const avatarPath = review.avatar || "assets/avatar-male.webp";
    const avatarSrc = avatarPath.startsWith("/")
      ? SITE_ASSET_BASE + avatarPath.slice(1)
      : SITE_ASSET_BASE + avatarPath;
    const rating = Math.max(1, Math.min(5, parseInt(review.rating, 10) || 5));
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const serviceTag = review.service
      ? `<span class="review-service-tag">${review.service}</span>`
      : "";

    card.innerHTML = `
      <div class="review-header">
        <img src="${avatarSrc}" alt="${review.name}" class="review-avatar-img" width="52" height="52" loading="lazy">
        <div class="review-info"><h4>${review.name}</h4><span class="review-city">${review.city}</span></div>
      </div>
      ${serviceTag}
      <div class="review-stars" aria-label="Оценка ${rating} из 5">${stars}</div>
      <p class="review-text">"${review.text}"</p>
      <span class="review-date">${review.date}</span>`;
    container.appendChild(card);
  });

  const uniqueCount = reviews.length || 4;
  container.style.setProperty("--reviews-count", String(uniqueCount));
  container.style.animationDuration = `${Math.max(40, uniqueCount * 5)}s`;

  // После перерисовки — переинициализировать управление
  initReviewsCarouselControls();
}

/**
 * Ручное листание отзывов: кнопки, drag, wheel, keyboard, touch.
 * Плюс JS-автопрокрутка (плавный дрейф) с паузой при взаимодействии.
 * Автопрокрутка двигает scrollLeft того же скроллера — конфликтов с ручным
 * управлением нет: при любом действии пользователя ставится пауза, а после
 * короткого простоя движение возобновляется.
 */

/**
 * Автоплея ленты: дублируем карточки для бесшовного зацикливания, плавно
 * сдвигаем scrollLeft, при достижении границы набора незаметно переносимся
 * на начало (набор-дубль идентичен оригиналу).
 * Возвращает функцию очистки (отмена rAF / таймеров).
 */
function setupReviewsAutoplay(wrapper, scroller, track, opts) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return () => {};

  // Дублируем карточки один раз — для бесшовного цикла
  if (!track.dataset.duped) {
    Array.from(track.children).forEach((node) =>
      track.appendChild(node.cloneNode(true))
    );
    track.dataset.duped = "1";
  }

  const singleWidth = () => {
    const card = track.querySelector(".review-card");
    if (!card) return 0;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "24") || 24;
    const half = Math.max(1, Math.round(track.childElementCount / 2));
    return half * (card.getBoundingClientRect().width + gap);
  };

  const SPEED = 0.05; // px/ms ≈ 50px/сек — спокойный дрейф
  let paused = false;
  let last = performance.now();
  let rafId = null;
  let resumeTimer = null;
  let cachedW = singleWidth();

  // На старте дрейф активен — отключаем обязательный snap, чтобы браузер
  // не «дёргал» ленту к точкам привязки при непрерывном scrollLeft.
  scroller.classList.add("is-autoplay-drifting");

  const pause = () => {
    paused = true;
    // Возвращаем snap — удобно для ручного листания карточка-к-карточке.
    scroller.classList.remove("is-autoplay-drifting");
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  };
  const scheduleResume = () => {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      paused = false;
      scroller.classList.add("is-autoplay-drifting");
      last = performance.now();
    }, 2500);
  };

  const loop = (now) => {
    const dt = Math.min(now - last, 64); // защита от скачков после фона вкладки
    last = now;
    if (!paused && document.visibilityState === "visible") {
      let x = scroller.scrollLeft + SPEED * dt;
      if (cachedW > 0 && x >= cachedW) x -= cachedW;
      scroller.scrollLeft = x;
    }
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);

  // Пауза при любом взаимодействии пользователя, возобновление после простоя
  scroller.addEventListener("pointerenter", pause, opts);
  scroller.addEventListener("pointerleave", scheduleResume, opts);
  scroller.addEventListener("pointerdown", pause, opts);
  scroller.addEventListener("pointerup", scheduleResume, opts);
  scroller.addEventListener("pointercancel", scheduleResume, opts);
  scroller.addEventListener("wheel", () => { pause(); scheduleResume(); }, opts);
  scroller.addEventListener("focusin", pause, opts);
  scroller.addEventListener("focusout", scheduleResume, opts);
  wrapper.querySelectorAll(".reviews-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => { pause(); scheduleResume(); }, opts);
  });

  // Пересчёт ширины набора при изменении размеров окна
  window.addEventListener("resize", () => { cachedW = singleWidth(); }, opts);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (resumeTimer) clearTimeout(resumeTimer);
    scroller.classList.remove("is-autoplay-drifting");
  };
}

export function initReviewsCarouselControls() {
  const wrapper = document.querySelector(".reviews-carousel-wrapper");
  const track = document.querySelector(".reviews-carousel-track");
  if (!wrapper || !track) return;

  let scroller = wrapper.querySelector(".reviews-carousel-scroller");
  // Fallback: если scroller не в HTML — создаём обёртку на лету
  if (!scroller) {
    scroller = document.createElement("div");
    scroller.className = "reviews-carousel-scroller";
    scroller.tabIndex = 0;
    scroller.setAttribute(
      "aria-label",
      "Лента отзывов — листайте стрелками, свайпом или перетаскиванием"
    );
    track.parentNode.insertBefore(scroller, track);
    scroller.appendChild(track);
  }

  // Кнопки
  let prevBtn = wrapper.querySelector(".reviews-prev");
  let nextBtn = wrapper.querySelector(".reviews-next");
  if (!prevBtn || !nextBtn) {
    let nav = wrapper.querySelector(".reviews-nav");
    if (!nav) {
      nav = document.createElement("div");
      nav.className = "reviews-nav";
      nav.setAttribute("aria-label", "Листать отзывы");
      nav.innerHTML = `
        <button type="button" class="reviews-nav-btn reviews-prev" aria-label="Предыдущие отзывы">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button type="button" class="reviews-nav-btn reviews-next" aria-label="Следующие отзывы">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        </button>`;
      wrapper.insertBefore(nav, scroller);
    }
    prevBtn = wrapper.querySelector(".reviews-prev");
    nextBtn = wrapper.querySelector(".reviews-next");
  }

  // Ручной скроллер и автоплей живут на одном scrollLeft — конфликта нет.
  // Автоплей ставится на паузу при взаимодействии (см. setupReviewsAutoplay).

  const getStep = () => {
    const card = track.querySelector(".review-card");
    if (!card) return Math.max(280, scroller.clientWidth * 0.8);
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "24") || 24;
    return card.getBoundingClientRect().width + gap;
  };

  const maxScroll = () => Math.max(0, scroller.scrollWidth - scroller.clientWidth);

  const updateButtons = () => {
    const max = maxScroll();
    const x = scroller.scrollLeft;
    if (prevBtn) prevBtn.disabled = x <= 2;
    if (nextBtn) nextBtn.disabled = x >= max - 2;
  };

  const scrollByCards = (dir) => {
    scroller.scrollBy({ left: dir * getStep(), behavior: "smooth" });
  };

  // Avoid double-binding on re-render: use AbortController stored on wrapper.
  // Also tear down the previous autoplay loop (rAF isn't auto-cancelled by abort).
  if (wrapper._reviewsAutoplayDestroy) {
    wrapper._reviewsAutoplayDestroy();
    wrapper._reviewsAutoplayDestroy = null;
  }
  if (wrapper._reviewsAbort) {
    wrapper._reviewsAbort.abort();
  }
  const ac = new AbortController();
  wrapper._reviewsAbort = ac;
  const opts = { signal: ac.signal };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => scrollByCards(-1), opts);
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => scrollByCards(1), opts);
  }

  scroller.addEventListener("scroll", updateButtons, { passive: true, signal: ac.signal });

  // Keyboard when scroller focused
  scroller.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollByCards(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollByCards(1);
      } else if (e.key === "Home") {
        e.preventDefault();
        scroller.scrollTo({ left: 0, behavior: "smooth" });
      } else if (e.key === "End") {
        e.preventDefault();
        scroller.scrollTo({ left: maxScroll(), behavior: "smooth" });
      }
    },
    opts
  );

  // Horizontal wheel / trackpad
  scroller.addEventListener(
    "wheel",
    (e) => {
      // Prefer horizontal; convert vertical wheel to horizontal when over carousel
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX > absY) return; // native horizontal
      if (absY < 2) return;
      // only hijack if can scroll in that direction
      const max = maxScroll();
      const atStart = scroller.scrollLeft <= 0;
      const atEnd = scroller.scrollLeft >= max - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
      e.preventDefault();
      scroller.scrollBy({ left: e.deltaY, behavior: "auto" });
    },
    { passive: false, signal: ac.signal }
  );

  // Pointer drag-to-scroll (mouse / pen; touch uses native)
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;

  scroller.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "touch") return; // native swipe
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = scroller.scrollLeft;
      scroller.classList.add("is-dragging");
      try {
        scroller.setPointerCapture(e.pointerId);
      } catch (_) {}
    },
    opts
  );

  scroller.addEventListener(
    "pointermove",
    (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      scroller.scrollLeft = startScroll - dx;
    },
    opts
  );

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    scroller.classList.remove("is-dragging");
    try {
      scroller.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };
  scroller.addEventListener("pointerup", endDrag, opts);
  scroller.addEventListener("pointercancel", endDrag, opts);

  // Prevent click-through after drag
  scroller.addEventListener(
    "click",
    (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    },
    { capture: true, signal: ac.signal }
  );

  updateButtons();
  // After images load, recompute
  requestAnimationFrame(updateButtons);
  window.addEventListener("resize", updateButtons, opts);

  // Запускаем автодвижение ленты (совместимо с ручным листанием выше)
  wrapper._reviewsAutoplayDestroy =
    setupReviewsAutoplay(wrapper, scroller, track, opts) || null;
}

// Re-render reviews when city changes
document.addEventListener("cityChanged", (e) => {
  renderReviews(e.detail.cityCode);
});
