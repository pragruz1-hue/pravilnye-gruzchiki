/**
 * Reviews database and rendering
 */

import { CITIES_DATA } from "./geotargeting.js";

const SITE_ASSET_BASE = document.querySelector('link[href^="../css/"]') ? "../" : "";

export const REVIEWS_DB = {
  "krasnodar": [
    { name: "Игорь Н.", city: "Краснодар", rating: 5, text: "Заказывал двух грузчиков на переезд с ул. Ставропольской в ЖК «Губернский». Приехали без опоздания, шкаф разобрали аккуратно, технику обмотали пленкой.", date: "18 июня 2026", initials: "ИН", avatar: "/assets/avatar-male.webp" },
    { name: "Марина Л.", city: "Краснодар", rating: 5, text: "Нужно было поднять диван и холодильник на 6 этаж, лифт как назло не работал. Ребята заранее предупредили по цене за подъем.", date: "14 июня 2026", initials: "МЛ", avatar: "/assets/avatar-female.webp" },
    { name: "Андрей П.", city: "Краснодар", rating: 4, text: "Разгружали машину со стройматериалами в районе Энки. Один грузчик задержался минут на 15, но по самой работе претензий нет.", date: "10 июня 2026", initials: "АП", avatar: "/assets/avatar-male.webp" },
    { name: "Ольга В.", city: "Краснодар", rating: 5, text: "Переезжала из однушки, вещей оказалось больше, чем указала по телефону. Бригадир на месте пересчитал объем, цену объяснил до начала работ.", date: "6 июня 2026", initials: "ОВ", avatar: "/assets/avatar-female.webp" }
  ],
  "anapa": [
    { name: "Валентина К.", city: "Анапа", rating: 5, text: "Нужны были грузчики для переезда из квартиры у Южного рынка. Ребята приехали утром, помогли упаковать посуду и аккуратно вынесли мебель.", date: "21 июня 2026", initials: "ВК", avatar: "/assets/avatar-female.webp" },
    { name: "Павел Р.", city: "Анапа", rating: 4, text: "Заказывал разгрузку плитки и сантехники в частный дом. Бригада справилась хорошо, машина приехала на 20 минут позже из-за пробок.", date: "16 июня 2026", initials: "ПР", avatar: "/assets/avatar-male.webp" },
    { name: "Людмила С.", city: "Анапа", rating: 5, text: "Перевозили мебель после ремонта. Очень понравилось, что матрас и фасады кухни обмотали пленкой.", date: "9 июня 2026", initials: "ЛС", avatar: "/assets/avatar-female.webp" }
  ],
  "novorossiysk": [
    { name: "Денис М.", city: "Новороссийск", rating: 5, text: "Разгружали фуру с товаром на складе. Приехали четверо, работали без лишних перерывов, паллеты разложили как просили.", date: "22 июня 2026", initials: "ДМ", avatar: "/assets/avatar-male.webp" },
    { name: "Ксения А.", city: "Новороссийск", rating: 5, text: "Заказывала квартирный переезд с подъемом на этаж. Лифт маленький, часть мебели не вошла, но ребята спокойно подняли по лестнице.", date: "15 июня 2026", initials: "КА", avatar: "/assets/avatar-female.webp" },
    { name: "Олег Т.", city: "Новороссийск", rating: 4, text: "Нужны были разнорабочие на объект на один день. По работе претензий нет, инструмент и задачи поняли быстро.", date: "7 июня 2026", initials: "ОТ", avatar: "/assets/avatar-male.webp" }
  ],
  "sochi": [
    { name: "Артур Г.", city: "Сочи / Адлер / Сириус", rating: 5, text: "Переезд был из Адлера в Сириус, много коробок и техника. Бригада заранее позвонила, подъехали к удобному времени.", date: "20 июня 2026", initials: "АГ", avatar: "/assets/avatar-male.webp" },
    { name: "Нина В.", city: "Сочи / Адлер / Сириус", rating: 4, text: "Поднимали мебель в доме без грузового лифта. Работали аккуратно, стены не задели.", date: "13 июня 2026", initials: "НВ", avatar: "/assets/avatar-female.webp" },
    { name: "Руслан Б.", city: "Сочи / Адлер / Сириус", rating: 5, text: "Брали людей на разгрузку оборудования для кафе. Приехали трезвые, вежливые, тяжелые позиции не бросали.", date: "5 июня 2026", initials: "РБ", avatar: "/assets/avatar-male.webp" }
  ],
  "gelendzhik": [
    { name: "Светлана П.", city: "Геленджик", rating: 5, text: "Нужно было вынести старую мебель и занести новую. Позвонила утром, к обеду уже приехали двое грузчиков.", date: "19 июня 2026", initials: "СП", avatar: "/assets/avatar-female.webp" },
    { name: "Максим Е.", city: "Геленджик", rating: 4, text: "Разгружали стройматериалы у частного дома. Все перенесли куда показал, ничего не повредили.", date: "12 июня 2026", initials: "МЕ", avatar: "/assets/avatar-male.webp" },
    { name: "Алена Ш.", city: "Геленджик", rating: 5, text: "Переезд из квартиры в дом прошел спокойно. Мебель разобрали, фурнитуру сложили отдельно.", date: "4 июня 2026", initials: "АШ", avatar: "/assets/avatar-female.webp" }
  ],
  "moscow": [
    { name: "Иван П.", city: "Москва", rating: 5, text: "Перевозили небольшой офис на Дмитровском шоссе. Столы промаркировали, мониторы упаковали отдельно.", date: "20 июня 2026", initials: "ИП", avatar: "/assets/avatar-male.webp" },
    { name: "Сергей Л.", city: "Москва", rating: 4, text: "Нужны были разнорабочие на демонтаж перегородок. Приехали примерно через два часа, но предупредили заранее.", date: "17 июня 2026", initials: "СЛ", avatar: "/assets/avatar-male.webp" },
    { name: "Анна К.", city: "Москва", rating: 5, text: "Перевозили тяжелый сейф из офиса. Привезли ремни и настил, плитку и стены не задели.", date: "13 июня 2026", initials: "АК", avatar: "/assets/avatar-female.webp" }
  ],
  "spb": [
    { name: "Михаил Д.", city: "Санкт-Петербург", rating: 5, text: "Поднимали пианино на пятый этаж в старом доме. Лестница узкая, но ребята заранее все промерили.", date: "22 июня 2026", initials: "МД", avatar: "/assets/avatar-male.webp" },
    { name: "Татьяна В.", city: "Санкт-Петербург", rating: 4, text: "Берем персонал на подработку в магазин уже несколько месяцев. Один раз была замена, но вопрос решили быстро.", date: "19 июня 2026", initials: "ТВ", avatar: "/assets/avatar-female.webp" },
    { name: "Роман А.", city: "Санкт-Петербург", rating: 5, text: "Помогали с переездом с Васильевского острова. Машина подъехала в согласованное окно.", date: "11 июня 2026", initials: "РА", avatar: "/assets/avatar-male.webp" }
  ],
  "novosibirsk": [
    { name: "Евгений Ф.", city: "Новосибирск", rating: 5, text: "Разгружали машину с мебелью на складе. Бригада приехала вовремя, работали быстро, но без спешки.", date: "18 июня 2026", initials: "ЕФ", avatar: "/assets/avatar-male.webp" },
    { name: "Ирина Ч.", city: "Новосибирск", rating: 4, text: "Квартирный переезд прошел нормально, вещи целые. Снимаю звезду за то, что не сразу дозвонилась диспетчеру.", date: "10 июня 2026", initials: "ИЧ", avatar: "/assets/avatar-female.webp" },
    { name: "Георгий С.", city: "Новосибирск", rating: 5, text: "Нужны были грузчики на подъем стройматериалов. Этажность посчитали заранее.", date: "3 июня 2026", initials: "ГС", avatar: "/assets/avatar-male.webp" }
  ],
  "ekaterinburg": [
    { name: "Мария Н.", city: "Екатеринбург", rating: 5, text: "Перевозили вещи из квартиры в новостройку. Ребята аккуратно сняли зеркало и обмотали пленкой.", date: "21 июня 2026", initials: "МН", avatar: "/assets/avatar-female.webp" },
    { name: "Дмитрий Я.", city: "Екатеринбург", rating: 4, text: "Заказывал разнорабочих на склад. Работали нормально, один человек был новичок.", date: "14 июня 2026", initials: "ДЯ", avatar: "/assets/avatar-male.webp" },
    { name: "Оксана Р.", city: "Екатеринбург", rating: 5, text: "Нужно было вынести старую мебель. Приехали в тот же день, аккуратно вынесли диван и шкаф.", date: "8 июня 2026", initials: "ОР", avatar: "/assets/avatar-female.webp" }
  ],
  "kazan": [
    { name: "Альберт Х.", city: "Казань", rating: 5, text: "Разгружали товар для магазина. Все коробки пересчитали, поставили по зонам.", date: "19 июня 2026", initials: "АХ", avatar: "/assets/avatar-male.webp" },
    { name: "Гульнара М.", city: "Казань", rating: 5, text: "Переезд прошел без нервов. Мебель разобрали и собрали, стиральную машину вынесли аккуратно.", date: "12 июня 2026", initials: "ГМ", avatar: "/assets/avatar-female.webp" },
    { name: "Петр Л.", city: "Казань", rating: 4, text: "Брал грузчиков на подъем плитки. Работу сделали хорошо, хотелось бы более точное время приезда.", date: "6 июня 2026", initials: "ПЛ", avatar: "/assets/avatar-male.webp" }
  ],
  "nn": [
    { name: "Виктория Е.", city: "Нижний Новгород", rating: 5, text: "Заказывала грузчиков для переезда офиса. Документы и технику переносили отдельно.", date: "23 июня 2026", initials: "ВЕ", avatar: "/assets/avatar-female.webp" },
    { name: "Артем З.", city: "Нижний Новгород", rating: 4, text: "Разгрузка стройматериалов прошла нормально. Один паллет был тяжелее, чем ожидали.", date: "16 июня 2026", initials: "АЗ", avatar: "/assets/avatar-male.webp" },
    { name: "Наталья О.", city: "Нижний Новгород", rating: 5, text: "Перевозили мебель после ремонта. Приехали со своим инструментом, шкаф разобрали быстро.", date: "9 июня 2026", initials: "НО", avatar: "/assets/avatar-female.webp" }
  ],
  "chelyabinsk": [
    { name: "Кирилл В.", city: "Челябинск", rating: 5, text: "Нужны были грузчики на разгрузку машины. Приехали без опоздания, работали слаженно.", date: "20 июня 2026", initials: "КВ", avatar: "/assets/avatar-male.webp" },
    { name: "Елена Г.", city: "Челябинск", rating: 4, text: "Квартирный переезд сделали аккуратно. Был небольшой спор по количеству коробок.", date: "13 июня 2026", initials: "ЕГ", avatar: "/assets/avatar-female.webp" },
    { name: "Станислав Р.", city: "Челябинск", rating: 5, text: "Заказывал разнорабочих на производство на смену. Люди адекватные, пришли в форме.", date: "5 июня 2026", initials: "СР", avatar: "/assets/avatar-male.webp" }
  ],
  "samara": [
    { name: "Денис К.", city: "Самара", rating: 5, text: "Перевозили вещи из квартиры в частный дом. Машина чистая, мебель закрепили.", date: "22 июня 2026", initials: "ДК", avatar: "/assets/avatar-male.webp" },
    { name: "Маргарита С.", city: "Самара", rating: 4, text: "Поднимали холодильник и диван без лифта. Все сделали аккуратно.", date: "15 июня 2026", initials: "МС", avatar: "/assets/avatar-female.webp" },
    { name: "Олег Б.", city: "Самара", rating: 5, text: "Разгружали фуру с товаром. Бригаду дали на следующий день, работали ровно.", date: "8 июня 2026", initials: "ОБ", avatar: "/assets/avatar-male.webp" }
  ],
  "rostov": [
    { name: "Яна П.", city: "Ростов-на-Дону", rating: 5, text: "Переезд был из двух адресов. Ребята не путались, коробки подписали.", date: "21 июня 2026", initials: "ЯП", avatar: "/assets/avatar-female.webp" },
    { name: "Роман Т.", city: "Ростов-на-Дону", rating: 4, text: "Нужны были грузчики на склад. Работу выполнили, замечаний по качеству нет.", date: "14 июня 2026", initials: "РТ", avatar: "/assets/avatar-male.webp" },
    { name: "Вера Л.", city: "Ростов-на-Дону", rating: 5, text: "Выносили старую мебель после ремонта. Приехали вечером, сделали быстро.", date: "7 июня 2026", initials: "ВЛ", avatar: "/assets/avatar-female.webp" }
  ],
  "ufa": [
    { name: "Ильдар Н.", city: "Уфа", rating: 5, text: "Заказывал подъем стройматериалов. Этаж без лифта, но ребята справились.", date: "18 июня 2026", initials: "ИН", avatar: "/assets/avatar-male.webp" },
    { name: "Алия С.", city: "Уфа", rating: 5, text: "Квартирный переезд прошел спокойно. Технику упаковали, мебель разобрали.", date: "11 июня 2026", initials: "АС", avatar: "/assets/avatar-female.webp" },
    { name: "Павел Д.", city: "Уфа", rating: 4, text: "Брали двух разнорабочих на день. Работали нормально.", date: "4 июня 2026", initials: "ПД", avatar: "/assets/avatar-male.webp" }
  ],
  "voronezh": [
    { name: "Екатерина Ж.", city: "Воронеж", rating: 5, text: "Перевозили мебель из квартиры родителей. Ребята были вежливые.", date: "23 июня 2026", initials: "ЕЖ", avatar: "/assets/avatar-female.webp" },
    { name: "Александр У.", city: "Воронеж", rating: 4, text: "Разгружали машину с товаром. Немного задержались, но предупредили.", date: "16 июня 2026", initials: "АУ", avatar: "/assets/avatar-male.webp" },
    { name: "Николай Е.", city: "Воронеж", rating: 5, text: "Заказывал грузчиков с Газелью. Вещей было много, но уложили грамотно.", date: "9 июня 2026", initials: "НЕ", avatar: "/assets/avatar-male.webp" }
  ],
  "volgograd": [
    { name: "Сергей Ф.", city: "Волгоград", rating: 5, text: "Нужны были грузчики на переезд офиса. Системные блоки и мониторы переносили отдельно.", date: "20 июня 2026", initials: "СФ", avatar: "/assets/avatar-male.webp" },
    { name: "Полина К.", city: "Волгоград", rating: 4, text: "Поднимали мебель на этаж без лифта. Работали аккуратно.", date: "12 июня 2026", initials: "ПК", avatar: "/assets/avatar-female.webp" },
    { name: "Антон М.", city: "Волгоград", rating: 5, text: "Разгрузили стройматериалы у дома. Приехали со своими перчатками.", date: "5 июня 2026", initials: "АМ", avatar: "/assets/avatar-male.webp" }
  ],
  "default": [
    { name: "Алексей Р.", city: "Город", rating: 5, text: "Заказывал грузчиков на разгрузку машины после ремонта. Диспетчер уточнил адрес и объем.", date: "16 июня 2026", initials: "АР", avatar: "/assets/avatar-male.webp" },
    { name: "Мария С.", city: "Город", rating: 5, text: "Квартирный переезд прошел спокойнее, чем ожидала. Мебель разобрали и собрали обратно.", date: "12 июня 2026", initials: "МС", avatar: "/assets/avatar-female.webp" },
    { name: "Виктор Н.", city: "Город", rating: 4, text: "Брали разнорабочих на стройку. По работе все нормально, ребята крепкие и трезвые.", date: "8 июня 2026", initials: "ВН", avatar: "/assets/avatar-male.webp" }
  ]
};

export function renderReviews(cityCode) {
  const container = document.querySelector(".reviews-carousel-track");
  if (!container) return;

  const reviews = REVIEWS_DB[cityCode] || REVIEWS_DB["default"];
  container.innerHTML = "";
  const allReviews = [...reviews, ...reviews];

  allReviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "review-card";
    const avatarPath = review.avatar || "/assets/avatar-male.webp";
    const avatarSrc = avatarPath.startsWith("/") ? SITE_ASSET_BASE + avatarPath.slice(1) : avatarPath;
    const rating = Math.max(1, Math.min(5, parseInt(review.rating, 10) || 5));
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

    card.innerHTML = `
      <div class="review-header">
        <img src="${avatarSrc}" alt="${review.name}" class="review-avatar-img">
        <div class="review-info"><h4>${review.name}</h4><span class="review-city">${review.city}</span></div>
      </div>
      <div class="review-stars" aria-label="Оценка ${rating} из 5">${stars}</div>
      <p class="review-text">"${review.text}"</p>
      <span class="review-date">${review.date}</span>`;
    container.appendChild(card);
  });
}

// Re-render reviews when city changes
document.addEventListener("cityChanged", (e) => {
  renderReviews(e.detail.cityCode);
});