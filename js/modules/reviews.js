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