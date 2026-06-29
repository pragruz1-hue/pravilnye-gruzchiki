/**
 * Правильные Грузчики - Interactive Engine
 * Dynamic Geotargeting, Cost Calculator, Phone Masking, Modal System, FAQ Accordion, and Animations
 * Author: Виталий С
 * Date: 2026-06-26
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

  // ==========================================
  // 2. REVIEWS DATABASE (BY CITY)
  // ==========================================

  const REVIEWS_DB = {
    "krasnodar": [
        {
            "name": "Игорь Н.",
            "city": "Краснодар",
            "rating": 5,
            "text": "Заказывал двух грузчиков на переезд с ул. Ставропольской в ЖК «Губернский». Приехали без опоздания, шкаф разобрали аккуратно, технику обмотали пленкой. По времени вышло чуть больше, чем думал, но ничего не поцарапали.",
            "date": "18 июня 2026",
            "initials": "ИН",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Марина Л.",
            "city": "Краснодар",
            "rating": 5,
            "text": "Нужно было поднять диван и холодильник на 6 этаж, лифт как назло не работал. Ребята заранее предупредили по цене за подъем, сделали спокойно и без лишних разговоров.",
            "date": "14 июня 2026",
            "initials": "МЛ",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Андрей П.",
            "city": "Краснодар",
            "rating": 4,
            "text": "Разгружали машину со стройматериалами в районе Энки. Один грузчик задержался минут на 15, поэтому ставлю 4, но по самой работе претензий нет.",
            "date": "10 июня 2026",
            "initials": "АП",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Ольга В.",
            "city": "Краснодар",
            "rating": 5,
            "text": "Переезжала из однушки, вещей оказалось больше, чем указала по телефону. Бригадир на месте пересчитал объем, цену объяснил до начала работ. Все коробки доехали целыми.",
            "date": "6 июня 2026",
            "initials": "ОВ",
            "avatar": "/assets/avatar-female.webp"
        }
    ],
    "anapa": [
        {
            "name": "Валентина К.",
            "city": "Анапа",
            "rating": 5,
            "text": "Нужны были грузчики для переезда из квартиры у Южного рынка. Ребята приехали утром, помогли упаковать посуду и аккуратно вынесли мебель. По цене вышло как заранее обсудили.",
            "date": "21 июня 2026",
            "initials": "ВК",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Павел Р.",
            "city": "Анапа",
            "rating": 4,
            "text": "Заказывал разгрузку плитки и сантехники в частный дом. Бригада справилась хорошо, но машина приехала на 20 минут позже из-за пробок. В остальном все нормально.",
            "date": "16 июня 2026",
            "initials": "ПР",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Людмила С.",
            "city": "Анапа",
            "rating": 5,
            "text": "Перевозили мебель после ремонта. Очень понравилось, что матрас и фасады кухни обмотали пленкой, ничего не испачкали и не поцарапали.",
            "date": "9 июня 2026",
            "initials": "ЛС",
            "avatar": "/assets/avatar-female.webp"
        }
    ],
    "novorossiysk": [
        {
            "name": "Денис М.",
            "city": "Новороссийск",
            "rating": 5,
            "text": "Разгружали фуру с товаром на складе. Приехали четверо, работали без лишних перерывов, паллеты разложили как просили. Закрыли все за одну смену.",
            "date": "22 июня 2026",
            "initials": "ДМ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Ксения А.",
            "city": "Новороссийск",
            "rating": 5,
            "text": "Заказывала квартирный переезд с подъемом на этаж. Лифт маленький, часть мебели не вошла, но ребята спокойно подняли по лестнице. Спасибо за аккуратность.",
            "date": "15 июня 2026",
            "initials": "КА",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Олег Т.",
            "city": "Новороссийск",
            "rating": 4,
            "text": "Нужны были разнорабочие на объект на один день. По работе претензий нет, инструмент и задачи поняли быстро. Ставлю 4 только за долгий расчет по времени в начале.",
            "date": "7 июня 2026",
            "initials": "ОТ",
            "avatar": "/assets/avatar-male.webp"
        }
    ],
    "sochi": [
        {
            "name": "Артур Г.",
            "city": "Сочи / Адлер / Сириус",
            "rating": 5,
            "text": "Переезд был из Адлера в Сириус, много коробок и техника. Бригада заранее позвонила, подъехали к удобному времени, вещи закрепили в машине ремнями.",
            "date": "20 июня 2026",
            "initials": "АГ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Нина В.",
            "city": "Сочи / Адлер / Сириус",
            "rating": 4,
            "text": "Поднимали мебель в доме без грузового лифта. Работали аккуратно, стены не задели. Немного дольше согласовывали подачу машины, но результат хороший.",
            "date": "13 июня 2026",
            "initials": "НВ",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Руслан Б.",
            "city": "Сочи / Адлер / Сириус",
            "rating": 5,
            "text": "Брали людей на разгрузку оборудования для кафе. Приехали трезвые, вежливые, тяжелые позиции не бросали, все занесли по местам.",
            "date": "5 июня 2026",
            "initials": "РБ",
            "avatar": "/assets/avatar-male.webp"
        }
    ],
    "gelendzhik": [
        {
            "name": "Светлана П.",
            "city": "Геленджик",
            "rating": 5,
            "text": "Нужно было вынести старую мебель и занести новую. Позвонила утром, к обеду уже приехали двое грузчиков. Подъезд после работ оставили чистым.",
            "date": "19 июня 2026",
            "initials": "СП",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Максим Е.",
            "city": "Геленджик",
            "rating": 4,
            "text": "Разгружали стройматериалы у частного дома. Все перенесли куда показал, ничего не повредили. Четверка только потому, что расчет по телефону был чуть оптимистичнее.",
            "date": "12 июня 2026",
            "initials": "МЕ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Алена Ш.",
            "city": "Геленджик",
            "rating": 5,
            "text": "Переезд из квартиры в дом прошел спокойно. Мебель разобрали, фурнитуру сложили отдельно, на новом месте помогли собрать шкаф.",
            "date": "4 июня 2026",
            "initials": "АШ",
            "avatar": "/assets/avatar-female.webp"
        }
    ],
    "moscow": [
        {
            "name": "Иван П.",
            "city": "Москва",
            "rating": 5,
            "text": "Перевозили небольшой офис на Дмитровском шоссе. Столы промаркировали, мониторы упаковали отдельно, в понедельник сотрудники уже работали на новом месте.",
            "date": "20 июня 2026",
            "initials": "ИП",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Сергей Л.",
            "city": "Москва",
            "rating": 4,
            "text": "Нужны были разнорабочие на демонтаж перегородок. Приехали примерно через два часа, но предупредили заранее. Работу сделали чисто.",
            "date": "17 июня 2026",
            "initials": "СЛ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Анна К.",
            "city": "Москва",
            "rating": 5,
            "text": "Перевозили тяжелый сейф из офиса. Привезли ремни и настил, плитку и стены не задели. Видно, что не первый раз делают такую работу.",
            "date": "13 июня 2026",
            "initials": "АК",
            "avatar": "/assets/avatar-female.webp"
        }
    ],
    "spb": [
        {
            "name": "Михаил Д.",
            "city": "Санкт-Петербург",
            "rating": 5,
            "text": "Поднимали пианино на пятый этаж в старом доме. Лестница узкая, но ребята заранее все промерили и занесли без повреждений.",
            "date": "22 июня 2026",
            "initials": "МД",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Татьяна В.",
            "city": "Санкт-Петербург",
            "rating": 4,
            "text": "Берем персонал на подработку в магазин уже несколько месяцев. Один раз была замена в середине смены, но вопрос решили быстро.",
            "date": "19 июня 2026",
            "initials": "ТВ",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Роман А.",
            "city": "Санкт-Петербург",
            "rating": 5,
            "text": "Помогали с переездом с Васильевского острова. Машина подъехала в согласованное окно, стеклянный стол довезли целым.",
            "date": "11 июня 2026",
            "initials": "РА",
            "avatar": "/assets/avatar-male.webp"
        }
    ],
    "novosibirsk": [
        {
            "name": "Евгений Ф.",
            "city": "Новосибирск",
            "rating": 5,
            "text": "Разгружали машину с мебелью на складе. Бригада приехала вовремя, работали быстро, но без спешки. Упаковку сложили отдельно.",
            "date": "18 июня 2026",
            "initials": "ЕФ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Ирина Ч.",
            "city": "Новосибирск",
            "rating": 4,
            "text": "Квартирный переезд прошел нормально, вещи целые. Снимаю звезду за то, что не сразу дозвонилась диспетчеру утром.",
            "date": "10 июня 2026",
            "initials": "ИЧ",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Георгий С.",
            "city": "Новосибирск",
            "rating": 5,
            "text": "Нужны были грузчики на подъем стройматериалов. Этажность посчитали заранее, неприятных сюрпризов по цене не было.",
            "date": "3 июня 2026",
            "initials": "ГС",
            "avatar": "/assets/avatar-male.webp"
        }
    ],
    "ekaterinburg": [
        {
            "name": "Мария Н.",
            "city": "Екатеринбург",
            "rating": 5,
            "text": "Перевозили вещи из квартиры в новостройку. Ребята аккуратно сняли зеркало и обмотали пленкой, ничего не разбилось.",
            "date": "21 июня 2026",
            "initials": "МН",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Дмитрий Я.",
            "city": "Екатеринбург",
            "rating": 4,
            "text": "Заказывал разнорабочих на склад. Работали нормально, один человек был новичок, но бригадир быстро распределил задачи.",
            "date": "14 июня 2026",
            "initials": "ДЯ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Оксана Р.",
            "city": "Екатеринбург",
            "rating": 5,
            "text": "Нужно было вынести старую мебель. Приехали в тот же день, аккуратно вынесли диван и шкаф, подъезд не испачкали.",
            "date": "8 июня 2026",
            "initials": "ОР",
            "avatar": "/assets/avatar-female.webp"
        }
    ],
    "kazan": [
        {
            "name": "Альберт Х.",
            "city": "Казань",
            "rating": 5,
            "text": "Разгружали товар для магазина. Все коробки пересчитали, поставили по зонам, с документами помогли свериться.",
            "date": "19 июня 2026",
            "initials": "АХ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Гульнара М.",
            "city": "Казань",
            "rating": 5,
            "text": "Переезд прошел без нервов. Мебель разобрали и собрали, стиральную машину вынесли аккуратно, пол не поцарапали.",
            "date": "12 июня 2026",
            "initials": "ГМ",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Петр Л.",
            "city": "Казань",
            "rating": 4,
            "text": "Брал грузчиков на подъем плитки. Работу сделали хорошо, но хотелось бы более точное время приезда.",
            "date": "6 июня 2026",
            "initials": "ПЛ",
            "avatar": "/assets/avatar-male.webp"
        }
    ],
    "nn": [
        {
            "name": "Виктория Е.",
            "city": "Нижний Новгород",
            "rating": 5,
            "text": "Заказывала грузчиков для переезда офиса. Документы и технику переносили отдельно, ничего не потеряли.",
            "date": "23 июня 2026",
            "initials": "ВЕ",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Артем З.",
            "city": "Нижний Новгород",
            "rating": 4,
            "text": "Разгрузка стройматериалов прошла нормально. Один паллет был тяжелее, чем ожидали, цену пересчитали на месте и объяснили почему.",
            "date": "16 июня 2026",
            "initials": "АЗ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Наталья О.",
            "city": "Нижний Новгород",
            "rating": 5,
            "text": "Перевозили мебель после ремонта. Приехали со своим инструментом, шкаф разобрали быстро и собрали обратно.",
            "date": "9 июня 2026",
            "initials": "НО",
            "avatar": "/assets/avatar-female.webp"
        }
    ],
    "chelyabinsk": [
        {
            "name": "Кирилл В.",
            "city": "Челябинск",
            "rating": 5,
            "text": "Нужны были грузчики на разгрузку машины. Приехали без опоздания, работали слаженно, тяжелые коробки не бросали.",
            "date": "20 июня 2026",
            "initials": "КВ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Елена Г.",
            "city": "Челябинск",
            "rating": 4,
            "text": "Квартирный переезд сделали аккуратно. Был небольшой спор по количеству коробок, но бригадир спокойно все пересчитал.",
            "date": "13 июня 2026",
            "initials": "ЕГ",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Станислав Р.",
            "city": "Челябинск",
            "rating": 5,
            "text": "Заказывал разнорабочих на производство на смену. Люди адекватные, пришли в форме, задачи поняли быстро.",
            "date": "5 июня 2026",
            "initials": "СР",
            "avatar": "/assets/avatar-male.webp"
        }
    ],
    "samara": [
        {
            "name": "Денис К.",
            "city": "Самара",
            "rating": 5,
            "text": "Перевозили вещи из квартиры в частный дом. Машина чистая, мебель закрепили, коробки доехали без повреждений.",
            "date": "22 июня 2026",
            "initials": "ДК",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Маргарита С.",
            "city": "Самара",
            "rating": 4,
            "text": "Поднимали холодильник и диван без лифта. Все сделали аккуратно, но по времени вышло немного дольше.",
            "date": "15 июня 2026",
            "initials": "МС",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Олег Б.",
            "city": "Самара",
            "rating": 5,
            "text": "Разгружали фуру с товаром. Бригаду дали на следующий день, работали ровно, без простоев.",
            "date": "8 июня 2026",
            "initials": "ОБ",
            "avatar": "/assets/avatar-male.webp"
        }
    ],
    "rostov": [
        {
            "name": "Яна П.",
            "city": "Ростов-на-Дону",
            "rating": 5,
            "text": "Переезд был из двух адресов. Ребята не путались, коробки подписали, на новом месте все разнесли по комнатам.",
            "date": "21 июня 2026",
            "initials": "ЯП",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Роман Т.",
            "city": "Ростов-на-Дону",
            "rating": 4,
            "text": "Нужны были грузчики на склад. Работу выполнили, замечаний по качеству нет. Ставлю 4 из-за задержки машины.",
            "date": "14 июня 2026",
            "initials": "РТ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Вера Л.",
            "city": "Ростов-на-Дону",
            "rating": 5,
            "text": "Выносили старую мебель после ремонта. Приехали вечером, сделали быстро, лифт и подъезд не испачкали.",
            "date": "7 июня 2026",
            "initials": "ВЛ",
            "avatar": "/assets/avatar-female.webp"
        }
    ],
    "ufa": [
        {
            "name": "Ильдар Н.",
            "city": "Уфа",
            "rating": 5,
            "text": "Заказывал подъем стройматериалов. Этаж без лифта, но ребята справились, мешки сложили аккуратно в комнате.",
            "date": "18 июня 2026",
            "initials": "ИН",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Алия С.",
            "city": "Уфа",
            "rating": 5,
            "text": "Квартирный переезд прошел спокойно. Технику упаковали, мебель разобрали, ничего не потерялось.",
            "date": "11 июня 2026",
            "initials": "АС",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Павел Д.",
            "city": "Уфа",
            "rating": 4,
            "text": "Брали двух разнорабочих на день. Работали нормально, но в следующий раз буду заказывать заранее, срочно получилось дороже.",
            "date": "4 июня 2026",
            "initials": "ПД",
            "avatar": "/assets/avatar-male.webp"
        }
    ],
    "voronezh": [
        {
            "name": "Екатерина Ж.",
            "city": "Воронеж",
            "rating": 5,
            "text": "Перевозили мебель из квартиры родителей. Ребята были вежливые, тяжелый шкаф не тащили волоком, все подняли аккуратно.",
            "date": "23 июня 2026",
            "initials": "ЕЖ",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Александр У.",
            "city": "Воронеж",
            "rating": 4,
            "text": "Разгружали машину с товаром. Немного задержались, но предупредили. По самой разгрузке все хорошо.",
            "date": "16 июня 2026",
            "initials": "АУ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Николай Е.",
            "city": "Воронеж",
            "rating": 5,
            "text": "Заказывал грузчиков с Газелью. Вещей было много, но уложили грамотно, ничего не болталось по кузову.",
            "date": "9 июня 2026",
            "initials": "НЕ",
            "avatar": "/assets/avatar-male.webp"
        }
    ],
    "volgograd": [
        {
            "name": "Сергей Ф.",
            "city": "Волгоград",
            "rating": 5,
            "text": "Нужны были грузчики на переезд офиса. Системные блоки и мониторы переносили отдельно, все приехало целым.",
            "date": "20 июня 2026",
            "initials": "СФ",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Полина К.",
            "city": "Волгоград",
            "rating": 4,
            "text": "Поднимали мебель на этаж без лифта. Работали аккуратно, но из-за узкой лестницы вышло дольше, чем планировали.",
            "date": "12 июня 2026",
            "initials": "ПК",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Антон М.",
            "city": "Волгоград",
            "rating": 5,
            "text": "Разгрузили стройматериалы у дома. Приехали со своими перчатками, мешки сложили ровно, мусор от упаковки собрали.",
            "date": "5 июня 2026",
            "initials": "АМ",
            "avatar": "/assets/avatar-male.webp"
        }
    ],
    "default": [
        {
            "name": "Алексей Р.",
            "city": "Город",
            "rating": 5,
            "text": "Заказывал грузчиков на разгрузку машины после ремонта. Диспетчер уточнил адрес и объем, ребята приехали со своими перчатками и тележкой.",
            "date": "16 июня 2026",
            "initials": "АР",
            "avatar": "/assets/avatar-male.webp"
        },
        {
            "name": "Мария С.",
            "city": "Город",
            "rating": 5,
            "text": "Квартирный переезд прошел спокойнее, чем ожидала. Мебель разобрали и собрали обратно, коробки с посудой перенесли отдельно.",
            "date": "12 июня 2026",
            "initials": "МС",
            "avatar": "/assets/avatar-female.webp"
        },
        {
            "name": "Виктор Н.",
            "city": "Город",
            "rating": 4,
            "text": "Брали разнорабочих на стройку. По работе все нормально, ребята крепкие и трезвые.",
            "date": "8 июня 2026",
            "initials": "ВН",
            "avatar": "/assets/avatar-male.webp"
        }
    ]
};

  // Function to render reviews based on city
function renderReviews(cityCode) {
  const container = document.querySelector(".reviews-carousel-track");
  if (!container) return;

  // Get reviews for city or fallback to default
  const reviews = REVIEWS_DB[cityCode] || REVIEWS_DB["default"];

  // Clear existing content
  container.innerHTML = "";

  // Create cards (Original + Duplicates for infinite scroll)
  const allReviews = [...reviews, ...reviews];

  allReviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "review-card";
    
    // Используем относительный путь, чтобы аватары работали и в корне, и в городских папках.
    const avatarPath = review.avatar || "/assets/avatar-male.webp";
    const avatarSrc = avatarPath.startsWith("/") ? SITE_ASSET_BASE + avatarPath.slice(1) : avatarPath;

    const rating = Math.max(1, Math.min(5, parseInt(review.rating, 10) || 5));
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

    card.innerHTML = `
      <div class="review-header">
        <img src="${avatarSrc}" alt="${review.name}" class="review-avatar-img">
        <div class="review-info">
          <h4>${review.name}</h4>
          <span class="review-city">${review.city}</span>
        </div>
      </div>
      <div class="review-stars" aria-label="Оценка ${rating} из 5">${stars}</div>
      <p class="review-text">"${review.text}"</p>
      <span class="review-date">${review.date}</span>
    `;
    container.appendChild(card);
  });
}

  // ==========================================
  // 3. DYNAMIC GEOTARGETING SYSTEM (MULTI-CITY)
  // ==========================================

  const SITE_PHONE_DISPLAY = "+7 (928) 333-32-81";
  const SITE_PHONE_TEL = "+79283333281";
  const SITE_ASSET_BASE = document.querySelector('link[href^="../css/"]') ? "../" : "";

  const CITIES_DATA = {
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
      cases: {
        nom: "Сочи / Адлер / Сириус",
        prep: "в Сочи, Адлере и Сириусе",
        gen: "Сочи, Адлера и Сириуса",
      },
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
      cases: {
        nom: "Санкт-Петербург",
        prep: "в Санкт-Петербурге",
        gen: "Санкт-Петербурга",
      },
      address: "191025, г. Санкт-Петербург, Невский проспект, д. 42, офис 15",
      region: "Санкт-Петербурга",
      phone: SITE_PHONE_DISPLAY,
    },
    novosibirsk: {
      name: "Новосибирск",
      cases: {
        nom: "Новосибирск",
        prep: "в Новосибирске",
        gen: "Новосибирска",
      },
      address: "630099, г. Новосибирск, Красный проспект, д. 28, офис 412",
      region: "Новосибирской области",
      phone: SITE_PHONE_DISPLAY,
    },
    ekaterinburg: {
      name: "Екатеринбург",
      cases: {
        nom: "Екатеринбург",
        prep: "в Екатеринбурге",
        gen: "Екатеринбурга",
      },
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
      cases: {
        nom: "Нижний Новгород",
        prep: "в Нижнем Новгороде",
        gen: "Нижнего Новгорода",
      },
      address:
        "603005, г. Нижний Новгород, ул. Большая Покровская, д. 15, офис 204",
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
      cases: {
        nom: "Ростов-на-Дону",
        prep: "в Ростове-на-Дону",
        gen: "Ростова-на-Дону",
      },
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

  function getCityPageRedirect(cityCode) {
    const cityFolders = Object.keys(CITIES_DATA);
    const cityServiceFiles = [
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

  // Render city specific content
  function renderCity(cityCode, options = {}) {
    if (!CITIES_DATA[cityCode]) return;

    // Save to LocalStorage
    localStorage.setItem("selected_city", cityCode);

    if (options.navigate === true) {
      const redirectUrl = getCityPageRedirect(cityCode);
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
    }

    const data = CITIES_DATA[cityCode];

    // 1. Update text spans for city names with correct declensions
    const citySpans = document.querySelectorAll(".city-name");
    citySpans.forEach((span) => {
      const caseName = span.getAttribute("data-case") || "nom";
      if (data.cases[caseName]) {
        span.textContent = data.cases[caseName];
      }
    });

    // 1.1. Update dynamic SEO/service links when user changes city in the header
    const dynamicCityName = document.querySelectorAll(".js-city-name");
    dynamicCityName.forEach((node) => { node.textContent = data.name; });

    const dynamicCityPrep = document.querySelectorAll(".js-city-prep");
    dynamicCityPrep.forEach((node) => { node.textContent = data.cases.prep; });

    const citySeoSection = document.querySelector(".seo-links-section[data-dynamic-city-links]");
    if (citySeoSection) {
      const basePath = cityCode + "/";
      citySeoSection.querySelectorAll("a[data-service-path]").forEach((link) => {
        const servicePath = link.getAttribute("data-service-path") || "";
        link.setAttribute("href", basePath + servicePath);
      });
    }

    // 2. Update address fields
    const addressSpans = document.querySelectorAll(".city-address");
    addressSpans.forEach((span) => {
      span.textContent = data.address;
    });

    // 3. Update region fields
    const regionSpans = document.querySelectorAll(".city-region");
    regionSpans.forEach((span) => {
      span.textContent = data.region;
    });

    // 4. Update phone links dynamically
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
    const footerPhone = document.querySelector(
      '.footer-contacts a[href^="tel:"]',
    );
    if (footerPhone) {
      footerPhone.textContent = formattedPhone;
      footerPhone.href = `tel:${cleanPhone}`;
    }
    document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
      link.href = `tel:${cleanPhone}`;
      if (link.classList.contains("phone-link") || link.classList.contains("mobile-phone-link") || link.closest(".footer-contacts") || link.textContent.trim().match(/^\+?7/)) {
        link.textContent = formattedPhone;
      }
    });

    // 5. Update browser window title and meta description for premium SEO
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
    } else if (pageType === "cargo") {
      titleStr = `Грузоперевозки ${data.cases.prep} и по РФ | Визуальный подбор Газели и фургона`;
      descStr = `Грузоперевозки ${data.cases.prep}, по краю и по России. Попутные грузы, переезды, доставка мебели и оборудования. Визуальный калькулятор загрузки кузова, машины 3–6 м, подбор диспетчером.`;
    } else {
      titleStr = `Правильные Грузчики ${data.name} | Услуги грузчиков, разнорабочих и такелажников 24/7`;
      descStr = `Услуги профессиональных грузчиков, разнорабочих и такелажников ${data.cases.prep} от 800 руб/час. Квартирные и офисные переезды, аутсорсинг персонала для компаний. Работаем 24/7.`;
    }

    document.title = titleStr;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", descStr);
    }

    // 6. Update selector button text
    const btnText = document.getElementById("city-btn-text");
    if (btnText) {
      btnText.textContent = data.name;
    }

    // 7. Update active state in dropdown
    const cityItems = document.querySelectorAll(".city-item");
    cityItems.forEach((item) => {
      if (item.getAttribute("data-city") === cityCode) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // 8. RENDER REVIEWS FOR CURRENT CITY
    renderReviews(cityCode);
  }

  // Geotargeting IP Auto-Detect Logic
  async function detectUserCity() {
    const defaultCity = "krasnodar";
    const savedCity = localStorage.getItem("selected_city");
    if (savedCity && CITIES_DATA[savedCity]) {
      return { cityCode: savedCity, isConfirmed: true };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const response = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Response error");
      const data = await response.json();

      const geoCityName = data.city;
      if (geoCityName) {
        const lowerGeoCity = geoCityName.toLowerCase();
        if (lowerGeoCity.includes("moscow"))
          return { cityCode: "moscow", isConfirmed: false };
        if (lowerGeoCity.includes("petersburg"))
          return { cityCode: "spb", isConfirmed: false };
        if (lowerGeoCity.includes("krasnodar"))
          return { cityCode: "krasnodar", isConfirmed: false };
        if (lowerGeoCity.includes("anapa"))
          return { cityCode: "anapa", isConfirmed: false };
        if (lowerGeoCity.includes("novorossiysk"))
          return { cityCode: "novorossiysk", isConfirmed: false };
        if (lowerGeoCity.includes("sochi"))
          return { cityCode: "sochi", isConfirmed: false };
        if (lowerGeoCity.includes("adler") || lowerGeoCity.includes("sirius"))
          return { cityCode: "sochi", isConfirmed: false };
        if (lowerGeoCity.includes("gelendzhik"))
          return { cityCode: "gelendzhik", isConfirmed: false };
        if (lowerGeoCity.includes("novosibirsk"))
          return { cityCode: "novosibirsk", isConfirmed: false };
        if (lowerGeoCity.includes("ekaterinburg"))
          return { cityCode: "ekaterinburg", isConfirmed: false };
        if (lowerGeoCity.includes("kazan"))
          return { cityCode: "kazan", isConfirmed: false };
        if (lowerGeoCity.includes("novgorod"))
          return { cityCode: "nn", isConfirmed: false };
        if (lowerGeoCity.includes("chelyabinsk"))
          return { cityCode: "chelyabinsk", isConfirmed: false };
        if (lowerGeoCity.includes("samara"))
          return { cityCode: "samara", isConfirmed: false };
        if (lowerGeoCity.includes("rostov"))
          return { cityCode: "rostov", isConfirmed: false };
        if (lowerGeoCity.includes("ufa"))
          return { cityCode: "ufa", isConfirmed: false };
        if (lowerGeoCity.includes("voronezh"))
          return { cityCode: "voronezh", isConfirmed: false };
        if (lowerGeoCity.includes("volgograd"))
          return { cityCode: "volgograd", isConfirmed: false };
      }
    } catch (e) {
      console.warn(
        "Geotargeting auto-detect failed or timed out. Defaulting to Краснодар.",
        e,
      );
    }

    return { cityCode: defaultCity, isConfirmed: false };
  }

  // Geotargeting DOM Binding
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
        renderCity(cityCode, { navigate: true });
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
  // 4. HEADER FX (STICKY SCROLL)
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
  // 5. MOBILE MENU TOGGLE
  // ==========================================
  const burgerBtn = document.getElementById("burger-btn");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-link");
  const mobileCta = document.getElementById("mobile-menu-cta");
  const mobileMenuClose = document.getElementById("mobile-menu-close");

  function toggleMobileMenu() {
    burgerBtn.classList.toggle("active");
    mobileMenuOverlay.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  }

  if (burgerBtn && mobileMenuOverlay) {
    burgerBtn.addEventListener("click", toggleMobileMenu);
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", () => {
        if (mobileMenuOverlay.classList.contains("active")) toggleMobileMenu();
      });
    }
    mobileMenuOverlay.addEventListener("click", (e) => {
      if (e.target === mobileMenuOverlay && mobileMenuOverlay.classList.contains("active")) {
        toggleMobileMenu();
      }
    });
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileMenuOverlay.classList.contains("active")) toggleMobileMenu();
      });
    });

    if (mobileCta) {
      mobileCta.addEventListener("click", () => {
        if (mobileMenuOverlay.classList.contains("active")) toggleMobileMenu();
      });
    }
  }

  // ==========================================
  // 6. PREMIUM CARD SPOTLIGHT GLOW EFFECT
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
  // 7. INTERACTIVE COST CALCULATOR
  // ==========================================
  const calcTabs = document.querySelectorAll(".calc-tab");
  const workersRange = document.getElementById("workers-range");
  const hoursRange = document.getElementById("hours-range");
  const workersVal = document.getElementById("workers-val");
  const hoursVal = document.getElementById("hours-val");
  const rateDisplay = document.getElementById("rate-display");
  const priceDisplay = document.getElementById("price-display");
  const calcSubmitBtn = document.getElementById("calc-submit-btn");
  const floorRange = document.getElementById("floor-range");
  const floorVal = document.getElementById("floor-val");
  const elevatorSelect = document.getElementById("elevator-select");
  const truckSelect = document.getElementById("truck-select");
  const distanceSelect = document.getElementById("distance-select");
  const heavySelect = document.getElementById("heavy-select");

  let currentRate = 800;
  let currentServiceName = "Грузчики";

  function getFloorWord(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "этаж";
    if (lastDigit === 1) return "этаж";
    if (lastDigit >= 2 && lastDigit <= 4) return "этаж";
    return "этаж";
  }

  function getCalculatorExtras(workers, hours) {
    const floor = floorRange ? parseInt(floorRange.value, 10) || 1 : 1;
    const elevator = elevatorSelect ? elevatorSelect.value : "yes";
    const truck = truckSelect ? truckSelect.value : "none";
    const distanceSurcharge = distanceSelect ? parseInt(distanceSelect.value, 10) || 0 : 0;
    const heavySurcharge = heavySelect ? parseInt(heavySelect.value, 10) || 0 : 0;

    const floorSurcharge = elevator === "no" && floor > 1 ? (floor - 1) * workers * 250 : 0;
    const truckRate = truck === "extended" ? 2500 : truck === "standard" ? 2000 : 0;
    const truckSurcharge = truckRate ? truckRate * hours : 0;
    const extrasTotal = floorSurcharge + truckSurcharge + distanceSurcharge + heavySurcharge;

    const truckLabel = truck === "extended" ? "Газель 4.2 м" : truck === "standard" ? "Газель 3 м" : "без машины";
    const elevatorLabel = elevator === "no" ? "лифта нет/нельзя использовать" : "лифт есть";
    const distanceLabel = distanceSelect ? distanceSelect.options[distanceSelect.selectedIndex].text : "до 20 метров";
    const heavyLabel = heavySelect ? heavySelect.options[heavySelect.selectedIndex].text : "нет";

    return {
      floor,
      elevator,
      truck,
      distanceSurcharge,
      heavySurcharge,
      floorSurcharge,
      truckSurcharge,
      extrasTotal,
      truckLabel,
      elevatorLabel,
      distanceLabel,
      heavyLabel,
    };
  }

  function updateCalculator() {
    if (!workersRange || !hoursRange) return;
    const workers = parseInt(workersRange.value, 10);
    const hours = parseInt(hoursRange.value, 10);

    if (workersVal)
      workersVal.textContent = `${workers} ${getWorkersWord(workers)}`;
    if (hoursVal) hoursVal.textContent = `${hours} ${getHoursWord(hours)}`;
    if (floorRange && floorVal) {
      const floor = parseInt(floorRange.value, 10) || 1;
      floorVal.textContent = `${floor} ${getFloorWord(floor)}`;
    }

    const isNegotiable = currentRate === 0;
    const basePrice = currentRate * workers * hours;
    const extras = getCalculatorExtras(workers, hours);
    const totalPrice = basePrice + extras.extrasTotal;
    const currencySpan = priceDisplay
      ? priceDisplay.parentNode.querySelector(".currency")
      : null;
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
      basePrice,
      price: isNegotiable ? "Договорная" : totalPrice,
      extras,
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
  if (floorRange) floorRange.addEventListener("input", updateCalculator);
  if (elevatorSelect) elevatorSelect.addEventListener("change", updateCalculator);
  if (truckSelect) truckSelect.addEventListener("change", updateCalculator);
  if (distanceSelect) distanceSelect.addEventListener("change", updateCalculator);
  if (heavySelect) heavySelect.addEventListener("change", updateCalculator);
  updateCalculator();

  // ==========================================
  // 8. RUSSIAN PHONE INPUT MASKING
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
        if (e.data && /\D/g.test(e.data)) input.value = inputNumbersValue;
        return;
      }

      if (["7", "8", "9"].indexOf(inputNumbersValue[0]) > -1) {
        if (inputNumbersValue[0] === "9")
          inputNumbersValue = "7" + inputNumbersValue;
        let firstChar = "+7";
        if (inputNumbersValue[0] === "8")
          inputNumbersValue = "7" + inputNumbersValue.substring(1);

        formattedInputValue = firstChar + " ";
        if (inputNumbersValue.length > 1)
          formattedInputValue += "(" + inputNumbersValue.substring(1, 4);
        if (inputNumbersValue.length >= 5)
          formattedInputValue += ") " + inputNumbersValue.substring(4, 7);
        if (inputNumbersValue.length >= 8)
          formattedInputValue += "-" + inputNumbersValue.substring(7, 9);
        if (inputNumbersValue.length >= 10)
          formattedInputValue += "-" + inputNumbersValue.substring(9, 11);
      } else {
        formattedInputValue = "+" + inputNumbersValue.substring(0, 16);
      }

      input.value = formattedInputValue;
    });

    input.addEventListener("keydown", (e) => {
      let numVal = input.value.replace(/\D/g, "");
      if (e.keyCode === 8 && numVal.length <= 1) input.value = "";
    });

    input.addEventListener("focus", () => {
      if (!input.value) input.value = "+7 ";
    });
    input.addEventListener("blur", () => {
      if (input.value === "+7 " || input.value === "+7") input.value = "";
    });
  }
  phoneInputs.forEach(setupPhoneMask);

  // ==========================================
  // 9. MODAL WINDOW SYSTEM
  // ==========================================
  const orderModal = document.getElementById("order-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalSuccessCloseBtn = document.getElementById(
    "modal-success-close-btn",
  );
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
    if (modalSuccessConfirm) modalSuccessConfirm.classList.remove("active");

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
  if (modalSuccessCloseBtn)
    modalSuccessCloseBtn.addEventListener("click", closeModal);
  if (orderModal) {
    orderModal.addEventListener("click", (e) => {
      if (e.target === orderModal) closeModal();
    });
  }

  if (calcSubmitBtn) {
    calcSubmitBtn.addEventListener("click", () => {
      const calcData = updateCalculator();
      if (calcData) {
        const extra = calcData.extras;
        const detailsStr =
          calcData.rate === 0
            ? `${calcData.workers} чел., ${calcData.hours} ч. (Тариф: договорной). Этаж: ${extra.floor}, ${extra.elevatorLabel}, машина: ${extra.truckLabel}, переноска: ${extra.distanceLabel}, тяжелые предметы: ${extra.heavyLabel}.`
            : `${calcData.workers} чел., ${calcData.hours} ч. (Тариф: ${calcData.rate} ₽/ч). Этаж: ${extra.floor}, ${extra.elevatorLabel}, машина: ${extra.truckLabel}, переноска: ${extra.distanceLabel}, тяжелые предметы: ${extra.heavyLabel}.`;
        openModal(calcData.service, detailsStr, calcData.price);
      }
    });
  }

  const serviceOrderBtns = document.querySelectorAll(".service-order-btn");
  serviceOrderBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const serviceName = btn.getAttribute("data-service") || "Заказ персонала";
      const isNego =
        serviceName.includes("Такелаж") ||
        serviceName.includes("Сборка мебели");
      let rate = isNego ? 0 : 800;
      let detailsStr = isNego
        ? `Заказ услуги: ${serviceName}. Расчет стоимости индивидуальный.`
        : `Заказ услуги: ${serviceName}. Минимальный заказ от 2 часов.`;
      let minPrice = isNego ? "Договорная" : rate * 2;
      openModal(serviceName, detailsStr, minPrice);
    });
  });

  const fleetOrderBtns = document.querySelectorAll(".fleet-order-btn");
  fleetOrderBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const truckName = btn.getAttribute("data-truck") || "Газель";
      let rate = truckName.includes("Удлиненная") ? 2500 : 2000;
      const detailsStr = `Аренда грузовика: ${truckName}. Минимальный заказ от 2 часов.`;
      openModal(`Аренда авто: ${truckName}`, detailsStr, rate * 2);
    });
  });

  const outProposalLink = document.querySelector(".outsourcing-glass .btn");
  if (outProposalLink) {
    outProposalLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(
        "Аутсорсинг персонала",
        "Запрос коммерческого предложения по аутсорсингу линейного персонала.",
        null,
      );
    });
  }

  // ==========================================
  // 10. FAQ ACCORDION ENGINE
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
  // 11. ANIMATED STATISTICS COUNTER
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
      if (progress < 1) requestAnimationFrame(animate);
      else element.textContent = target.toLocaleString("ru-RU");
    };
    requestAnimationFrame(animate);
  };

  if ("IntersectionObserver" in window && statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        if (entries[0].isIntersecting) {
          statNumbers.forEach((stat) => countUp(stat));
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    const statsGrid = document.querySelector(".stats-grid");
    if (statsGrid) statsObserver.observe(statsGrid);
  }


  // ==========================================
  // 11.1 ANTI-SPAM + SECURE LEAD SUBMIT HELPERS
  // ==========================================
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/xeebjwkn";
  const MIN_FORM_TIME_MS = 2500;

  function ensureAntiSpamFields(form) {
    if (!form || form.dataset.antiSpamReady === "true") return;
    form.dataset.antiSpamReady = "true";
    form.dataset.formStartedAt = String(Date.now());

    if (!form.querySelector('input[name="_gotcha"]')) {
      const hpWrap = document.createElement("div");
      hpWrap.className = "form-hp-field";
      hpWrap.setAttribute("aria-hidden", "true");
      hpWrap.innerHTML = `
        <label>Не заполняйте это поле</label>
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off">
      `;
      form.appendChild(hpWrap);
    }

    const started = document.createElement("input");
    started.type = "hidden";
    started.name = "_startedAt";
    started.value = form.dataset.formStartedAt;
    form.appendChild(started);

    const token = document.createElement("input");
    token.type = "hidden";
    token.name = "_formToken";
    const nonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    token.value = btoa(`${form.dataset.formStartedAt}:${nonce}`);
    form.appendChild(token);
  }

  function getAntiSpamPayload(form) {
    ensureAntiSpamFields(form);
    const hp = form.querySelector('input[name="_gotcha"]');
    const started = form.querySelector('input[name="_startedAt"]');
    const token = form.querySelector('input[name="_formToken"]');
    return {
      _gotcha: hp ? hp.value : "",
      _startedAt: started ? started.value : form.dataset.formStartedAt || "",
      _formToken: token ? token.value : "",
      page: window.location.pathname,
    };
  }

  function isLikelyBot(form) {
    const anti = getAntiSpamPayload(form);
    const elapsed = Date.now() - Number(anti._startedAt || 0);
    return Boolean(anti._gotcha) || !anti._formToken || elapsed < MIN_FORM_TIME_MS;
  }

  async function submitLeadToFormspree(payload, form) {
    ensureAntiSpamFields(form);
    if (isLikelyBot(form)) {
      throw new Error("Проверка формы не пройдена. Пожалуйста, попробуйте еще раз через несколько секунд.");
    }

    const endpoint = form && form.action ? form.action : FORMSPREE_ENDPOINT;
    const data = new FormData(form);
    Object.entries({
      ...payload,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) data.set(key, String(value));
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
    });

    if (!response.ok) {
      let message = "Не удалось отправить заявку. Позвоните нам напрямую.";
      try {
        const result = await response.json();
        if (result && result.errors && result.errors[0] && result.errors[0].message) {
          message = result.errors[0].message;
        }
      } catch (_) {}
      throw new Error(message);
    }
    return true;
  }

  document.querySelectorAll("form").forEach(ensureAntiSpamFields);

  // ==========================================
  // 12. FORM SUBMISSIONS
  // ==========================================
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
        let rate = serviceCode === "rigging" ? 0 : 800;
        let detailsStr =
          rate === 0
            ? `Заявка с главного экрана. Номер: ${phoneVal}. Тариф: договорной`
            : `Заявка с главного экрана. Номер: ${phoneVal}. Тариф: от ${rate} ₽/ч`;
        let minPrice = rate === 0 ? "Договорная" : rate * 2;
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
    mainForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameVal = document.getElementById("form-name").value.trim();
      const phoneVal = document.getElementById("form-phone").value.trim();
      const serviceEl = document.getElementById("form-service");
      const commentEl = document.getElementById("form-comment");
      if (!nameVal || phoneVal.length < 10) {
        alert("Пожалуйста, введите корректное имя и номер телефона.");
        return;
      }
      try {
        await submitLeadToFormspree({
          name: nameVal,
          phone: phoneVal,
          service: serviceEl ? serviceEl.options[serviceEl.selectedIndex].text : "Заявка с основной формы",
          comment: commentEl ? commentEl.value.trim() : "",
          source: "Main Booking Form",
        }, mainForm);
        mainForm.style.display = "none";
        successConfirm.classList.add("active");
      } catch (error) {
        alert(error.message || "Не удалось отправить заявку. Позвоните нам напрямую.");
      }
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
    modalBookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameVal = document.getElementById("modal-name").value.trim();
      const phoneVal = document.getElementById("modal-phone").value.trim();
      const serviceVal = modalServiceInput ? modalServiceInput.value : (modalServiceName ? modalServiceName.textContent : "Заявка из модального окна");
      const detailsVal = modalDetailsInput ? modalDetailsInput.value : "";
      if (!nameVal || phoneVal.length < 10) {
        alert("Пожалуйста, введите имя и номер телефона.");
        return;
      }
      try {
        await submitLeadToFormspree({
          name: nameVal,
          phone: phoneVal,
          service: serviceVal,
          details: detailsVal,
          source: "Order Modal",
        }, modalBookingForm);
        modalBookingForm.style.display = "none";
        modalSuccessConfirm.classList.add("active");
      } catch (error) {
        alert(error.message || "Не удалось отправить заявку. Позвоните нам напрямую.");
      }
    });
  }

  // ==========================================
  // 13. REAL-TIME ACTIVE WORKERS FLUCTUATION
  // ==========================================
  const activeWorkersElement = document.getElementById("active-workers-count");
  if (activeWorkersElement) {
    let currentCount = 128;
    let deltaBadge = document.getElementById("active-workers-delta");
    if (!deltaBadge) {
      deltaBadge = document.createElement("span");
      deltaBadge.id = "active-workers-delta";
      deltaBadge.className = "workers-delta";
      activeWorkersElement.parentNode.insertBefore(
        deltaBadge,
        activeWorkersElement.nextSibling,
      );
    }

    setInterval(
      () => {
        let change = 0;
        while (change === 0) change = Math.floor(Math.random() * 7) - 3;
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
      },
      6000 + Math.random() * 4000,
    );
  }

  // ==========================================
  // 14. AUTO-SELECT CALCULATOR TAB BASED ON PAGE
  // ==========================================
  const activePage = document.body.getAttribute("data-page") || "index";
  if (calcTabs.length > 0) {
    let tabToClick = null;
    if (activePage === "loaders")
      tabToClick = Array.from(calcTabs).find(
        (t) => t.getAttribute("data-name") === "Грузчики",
      );
    else if (activePage === "workers")
      tabToClick = Array.from(calcTabs).find(
        (t) => t.getAttribute("data-name") === "Разнорабочие",
      );
    else if (activePage === "moving")
      tabToClick = Array.from(calcTabs).find(
        (t) => t.getAttribute("data-name") === "Переезд",
      );
    else if (activePage === "rigging")
      tabToClick = Array.from(calcTabs).find(
        (t) => t.getAttribute("data-name") === "Такелажники",
      );
    else if (activePage === "furniture")
      tabToClick = Array.from(calcTabs).find(
        (t) => t.getAttribute("data-name") === "Грузчики",
      );

    if (tabToClick) tabToClick.click();
  }

  // ==========================================
  // 15. DYNAMIC EXIT-INTENT RETENTION POPUP
  // ==========================================
  function initExitIntentPopup() {
    if (localStorage.getItem("exit_popup_shown")) return;

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
        exitCard.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        exitCard.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
    }

    const phoneInput = document.getElementById("exit-phone");
    if (phoneInput) setupPhoneMask(phoneInput);

    const closeBtn = document.getElementById("exit-close-btn");
    const successCloseBtn = document.getElementById("exit-success-close-btn");
    const exitForm = document.getElementById("exit-booking-form");
    const exitSuccessConfirm = document.getElementById("exit-success-confirm");

    function closeExitPopup() {
      exitPopupOverlay.classList.remove("active");
      localStorage.setItem("exit_popup_shown", "true");
    }

    if (closeBtn) closeBtn.addEventListener("click", closeExitPopup);
    if (successCloseBtn)
      successCloseBtn.addEventListener("click", closeExitPopup);
    exitPopupOverlay.addEventListener("click", (e) => {
      if (e.target === exitPopupOverlay) closeExitPopup();
    });

    if (exitForm && exitSuccessConfirm) {
      exitForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const phoneVal = phoneInput.value.trim();
        if (phoneVal.length < 10) {
          alert("Пожалуйста, введите корректный номер телефона.");
          return;
        }
        try {
          await submitLeadToFormspree({
            phone: phoneVal,
            service: "Скидка 10%",
            promo: "OFFER10",
            source: "Exit Intent Popup",
          }, exitForm);
          exitForm.style.display = "none";
          exitSuccessConfirm.classList.add("active");
          localStorage.setItem("exit_popup_shown", "true");
        } catch (error) {
          alert(error.message || "Не удалось отправить заявку. Позвоните нам напрямую.");
        }
      });
    }

    document.addEventListener("mouseleave", (e) => {
      if (e.clientY < 50 && !localStorage.getItem("exit_popup_shown")) {
        exitPopupOverlay.classList.add("active");
      }
    });
  }

  // Задержка перед показом попапа выхода
  setTimeout(initExitIntentPopup, 2000);

  // ==========================================
  // 16. REVIEW MODAL SYSTEM (ВНУТРИ DOMContentLoaded!)
  // ==========================================

  function openReviewModal() {
    const modal = document.getElementById("review-modal");
    if (!modal) return;

    // Подставляем текущий город из геотаргетинга
    const currentCity = localStorage.getItem("selected_city") || "krasnodar";
    const cityData = CITIES_DATA[currentCity];
    const cityInput = document.getElementById("review-city");
    if (cityInput && cityData) {
      cityInput.value = cityData.name;
    }

    // Сброс формы и показ формы вместо экрана успеха
    const form = document.getElementById("review-form");
    const success = document.getElementById("review-success");
    if (form) form.style.display = "block";
    if (success) success.classList.remove("active");

    // Сброс рейтинга на 5 звезд
    setRating(5);

    modal.classList.add("active");
    document.body.classList.add("no-scroll");
  }

  function closeReviewModal() {
    const modal = document.getElementById("review-modal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }
  // Привязка кнопки закрытия модалки отзывов
  const reviewModalCloseBtn = document.getElementById("review-modal-close");
  if (reviewModalCloseBtn) {
    reviewModalCloseBtn.addEventListener("click", closeReviewModal);
  }

  // Закрытие по клику на оверлей
  const reviewModalOverlay = document.getElementById("review-modal");
  if (reviewModalOverlay) {
    reviewModalOverlay.addEventListener("click", (e) => {
      if (e.target === reviewModalOverlay) {
        closeReviewModal();
      }
    });
  }
  // Управление звездами
  function setRating(value) {
    const stars = document.querySelectorAll(".star-rating span");
    const input = document.getElementById("review-rating");

    stars.forEach((star) => {
      const starValue = parseInt(star.getAttribute("data-value"));
      if (starValue <= value) {
        star.classList.add("active");
      } else {
        star.classList.remove("active");
      }
    });

    if (input) input.value = value;
  }
  // Привязка клика по звездам
  const starRatingContainer = document.getElementById("star-rating");
  if (starRatingContainer) {
    starRatingContainer.addEventListener("click", (e) => {
      if (e.target.tagName === "SPAN") {
        const value = parseInt(e.target.getAttribute("data-value"));
        setRating(value);
      }
    });
  }
  // Отправка формы
  async function submitReview(e) {
    e.preventDefault();

    const name = document.getElementById("review-name").value.trim();
    const phone = document.getElementById("review-phone").value.trim();
    const service = document.getElementById("review-service").value;
    const text = document.getElementById("review-text").value.trim();
    const rating = document.getElementById("review-rating").value;
    const city = document.getElementById("review-city").value;

    if (!name || phone.length < 10 || !service || !text) {
      alert("Пожалуйста, заполните все поля корректно.");
      return;
    }

    // Данные для отправки на бэкенд
    const reviewData = {
      name,
      phone,
      service,
      text,
      rating,
      city,
      source: "Review Modal",
      timestamp: new Date().toISOString(),
    };

    try {
      await submitLeadToFormspree(reviewData, document.getElementById("review-form"));
      // Показываем экран успеха
      document.getElementById("review-form").style.display = "none";
      document.getElementById("review-success").classList.add("active");
    } catch (error) {
      alert(error.message || "Не удалось отправить отзыв. Попробуйте позже.");
    }
  }

  // Делаем функции доступными для inline-обработчиков в HTML
  window.submitReview = submitReview;
  window.closeReviewModal = closeReviewModal;

  // Привязка маски телефона к полю в модалке отзыва
  const reviewPhone = document.getElementById("review-phone");
  if (reviewPhone) setupPhoneMask(reviewPhone);
  // Привязка кнопки "Оставить отзыв" к функции открытия модалки
  const reviewBtn = document.getElementById("open-review-btn");
  if (reviewBtn) {
    reviewBtn.addEventListener("click", openReviewModal);
  }


  // ==========================================
  // 18. CARGO VISUAL 2.5D CALCULATOR
  // ==========================================
  const cargoRoot = document.getElementById("cargo-visual-calculator");
  if (cargoRoot) {
    const vehicles = {
      gazel3: { name: "Газель 3 м", length: 300, width: 190, height: 180, volume: 10.2, weight: 1500, price: "от 2 000 ₽/час" },
      gazel42: { name: "Газель 4.2 м", length: 420, width: 200, height: 210, volume: 17.6, weight: 2000, price: "от 2 500 ₽/час" },
      truck5: { name: "Фургон 5 м", length: 500, width: 210, height: 220, volume: 23.1, weight: 2500, price: "индивидуально" },
      truck6: { name: "Машина 6 м", length: 600, width: 220, height: 230, volume: 30.4, weight: 3000, price: "индивидуально" },
    };

    const cargoItems = {
      box: { name: "Коробка", length: 60, width: 40, height: 40, weight: 12, color: "orange" },
      bigbox: { name: "Большая коробка", length: 80, width: 60, height: 50, weight: 22, color: "orange" },
      bags: { name: "Мешки / баулы", length: 75, width: 45, height: 45, weight: 18, color: "orange" },
      sofa: { name: "Диван", length: 210, width: 90, height: 85, weight: 85, color: "gray" },
      armchair: { name: "Кресло", length: 95, width: 85, height: 90, weight: 35, color: "gray" },
      wardrobe: { name: "Шкаф", length: 120, width: 60, height: 210, weight: 90, color: "dark" },
      dresser: { name: "Комод", length: 100, width: 50, height: 85, weight: 45, color: "gray" },
      bed: { name: "Кровать", length: 205, width: 95, height: 45, weight: 70, color: "gray" },
      mattress: { name: "Матрас", length: 200, width: 90, height: 25, weight: 28, color: "light" },
      fridge: { name: "Холодильник", length: 70, width: 70, height: 190, weight: 80, color: "light" },
      washer: { name: "Стиральная машина", length: 60, width: 60, height: 85, weight: 65, color: "light" },
      tv: { name: "Телевизор", length: 120, width: 18, height: 75, weight: 18, color: "dark" },
      table: { name: "Стол", length: 130, width: 80, height: 75, weight: 38, color: "gray" },
      chairs: { name: "4 стула", length: 80, width: 80, height: 95, weight: 28, color: "gray" },
    };

    let selectedVehicle = "gazel3";
    let selectedItems = [];

    const bay = document.getElementById("cargo-bay");
    const fill = document.getElementById("cargo-progress-fill");
    const volumeEl = document.getElementById("cargo-volume-used");
    const areaEl = document.getElementById("cargo-area-used");
    const weightEl = document.getElementById("cargo-weight-used");
    const vehicleEl = document.getElementById("cargo-current-vehicle");
    const dimsEl = document.getElementById("cargo-current-dims");
    const recEl = document.getElementById("cargo-recommendation");
    const listEl = document.getElementById("cargo-selected-list");
    const hiddenEl = document.getElementById("cargo-hidden-summary");
    const vehicleHiddenEl = document.getElementById("cargo-hidden-vehicle");
    const requestBtn = document.getElementById("cargo-request-btn");
    const clearBtn = document.getElementById("cargo-clear-btn");

    function itemVolume(item) { return (item.length * item.width * item.height) / 1000000; }
    function itemArea(item) { return (item.length * item.width) / 10000; }

    function summarizeItems() {
      if (!selectedItems.length) return "Предметы пока не выбраны";
      const counts = {};
      selectedItems.forEach((key) => { counts[key] = (counts[key] || 0) + 1; });
      return Object.entries(counts).map(([key, count]) => `${cargoItems[key].name} — ${count} шт.`).join("; ");
    }

    function layoutItems(vehicle) {
      const gap = 8;
      const bayWidth = bay.clientWidth || 700;
      const bayHeight = bay.clientHeight || 300;
      const usableWidth = bayWidth - 54;
      const scaleX = usableWidth / vehicle.length;
      const scaleY = bayHeight / vehicle.width;
      let x = 8, y = 8, rowH = 0;
      return selectedItems.map((key) => {
        const item = cargoItems[key];
        let w = Math.max(34, item.length * scaleX);
        let h = Math.max(28, item.width * scaleY);
        if (w > usableWidth && h <= usableWidth) {
          const temp = w; w = h; h = temp;
        }
        if (x + w > usableWidth) { x = 8; y += rowH + gap; rowH = 0; }
        const over = y + h > bayHeight - 8;
        const pos = { key, item, x, y, w, h, over };
        x += w + gap;
        rowH = Math.max(rowH, h);
        return pos;
      });
    }

    function updateCargoCalculator() {
      const vehicle = vehicles[selectedVehicle];
      const usedVolume = selectedItems.reduce((sum, key) => sum + itemVolume(cargoItems[key]), 0);
      const usedArea = selectedItems.reduce((sum, key) => sum + itemArea(cargoItems[key]), 0);
      const usedWeight = selectedItems.reduce((sum, key) => sum + cargoItems[key].weight, 0);
      const floorArea = (vehicle.length * vehicle.width) / 10000;
      const volumePercent = Math.round((usedVolume / vehicle.volume) * 100);
      const areaPercent = Math.round((usedArea / floorArea) * 100);
      const weightPercent = Math.round((usedWeight / vehicle.weight) * 100);
      const percent = Math.max(volumePercent, areaPercent, weightPercent);

      document.querySelectorAll(".cargo-car-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.vehicle === selectedVehicle);
      });

      vehicleEl.textContent = vehicle.name;
      dimsEl.textContent = `${vehicle.length}×${vehicle.width}×${vehicle.height} см · ${vehicle.volume.toFixed(1)} м³ · ${vehicle.price}`;
      volumeEl.textContent = `${usedVolume.toFixed(1)} м³`;
      areaEl.textContent = `${Math.min(999, areaPercent)}%`;
      weightEl.textContent = `${usedWeight} кг`;
      fill.style.width = `${Math.min(100, percent)}%`;

      let rec = "Добавьте предметы — покажем подходящий кузов и подскажем, когда лучше взять машину больше.";
      recEl.style.borderColor = "rgba(16,185,129,0.24)";
      recEl.style.background = "rgba(16,185,129,0.11)";
      if (selectedItems.length) {
        if (percent <= 72) rec = `${vehicle.name} предварительно подходит. Диспетчер уточнит упаковку, этаж, вес и маршрут.`;
        else if (percent <= 100) rec = `${vehicle.name} может подойти, но запас небольшой. Для аккуратной укладки диспетчер может предложить кузов больше.`;
        else {
          rec = `По расчету текущего кузова мало. Лучше рассмотреть машину 4.2–6 м, вторую ходку или индивидуальную схему перевозки.`;
          recEl.style.borderColor = "rgba(239,68,68,0.32)";
          recEl.style.background = "rgba(239,68,68,0.11)";
        }
      }
      recEl.textContent = rec;

      bay.innerHTML = "";
      layoutItems(vehicle).forEach((pos, index) => {
        const el = document.createElement("div");
        el.className = `cargo-load-item ${pos.over ? "over" : ""}`;
        el.style.left = `${pos.x}px`;
        el.style.top = `${pos.y}px`;
        el.style.width = `${pos.w}px`;
        el.style.height = `${pos.h}px`;
        if (pos.item.color === "gray") el.style.background = "linear-gradient(135deg,#7c8797,#334155)";
        if (pos.item.color === "dark") el.style.background = "linear-gradient(135deg,#1f2937,#05070c)";
        if (pos.item.color === "light") { el.style.background = "linear-gradient(135deg,#eef2f7,#94a3b8)"; el.style.color = "#111827"; }
        el.innerHTML = `<span>${pos.item.name}<br>${pos.item.length}×${pos.item.width}</span>`;
        bay.appendChild(el);
      });

      listEl.innerHTML = "";
      if (!selectedItems.length) {
        listEl.innerHTML = `<div class="cargo-selected-row"><span>Список пуст. Добавьте мебель, коробки или технику.</span></div>`;
      } else {
        selectedItems.forEach((key, index) => {
          const row = document.createElement("div");
          row.className = "cargo-selected-row";
          row.innerHTML = `<span>${cargoItems[key].name} · ${cargoItems[key].length}×${cargoItems[key].width}×${cargoItems[key].height} см</span><button type="button" aria-label="Удалить">×</button>`;
          row.querySelector("button").addEventListener("click", () => { selectedItems.splice(index, 1); updateCargoCalculator(); });
          listEl.appendChild(row);
        });
      }

      const summary = `${vehicle.name}; ${summarizeItems()}; объем ${usedVolume.toFixed(1)} м³; вес ${usedWeight} кг; заполнение ${percent}%`;
      if (hiddenEl) hiddenEl.value = summary;
      if (vehicleHiddenEl) vehicleHiddenEl.value = vehicle.name;
    }

    document.querySelectorAll(".cargo-car-btn").forEach((btn) => {
      btn.addEventListener("click", () => { selectedVehicle = btn.dataset.vehicle; updateCargoCalculator(); });
    });
    document.querySelectorAll(".cargo-item-btn").forEach((btn) => {
      btn.addEventListener("click", () => { selectedItems.push(btn.dataset.item); updateCargoCalculator(); });
    });
    if (clearBtn) clearBtn.addEventListener("click", () => { selectedItems = []; updateCargoCalculator(); });
    if (requestBtn) requestBtn.addEventListener("click", () => {
      updateCargoCalculator();
      document.getElementById("cargo-order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    window.addEventListener("resize", updateCargoCalculator, { passive: true });

    const cargoPhone = document.getElementById("cargo-phone");
    if (cargoPhone) setupPhoneMask(cargoPhone);

    const cargoForm = document.getElementById("cargo-order-form");
    if (cargoForm) {
      ensureAntiSpamFields(cargoForm);
      cargoForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        updateCargoCalculator();
        const btn = cargoForm.querySelector('button[type="submit"]');
        const originalText = btn ? btn.textContent : "";
        try {
          if (btn) { btn.disabled = true; btn.textContent = "Отправляем..."; }
          await submitLeadToFormspree({
            name: document.getElementById("cargo-name")?.value || "",
            phone: document.getElementById("cargo-phone")?.value || "",
            route: document.getElementById("cargo-route")?.value || "",
            direction: document.getElementById("cargo-direction")?.value || "",
            comment: document.getElementById("cargo-comment")?.value || "",
            vehicle: vehicleHiddenEl?.value || vehicles[selectedVehicle].name,
            cargo_summary: hiddenEl?.value || summarizeItems(),
            source: "Visual Cargo Calculator",
            timestamp: new Date().toISOString(),
          }, cargoForm);
          cargoForm.reset();
          selectedItems = [];
          updateCargoCalculator();
          alert("Заявка отправлена. Диспетчер свяжется с вами и подберет подходящую машину.");
        } catch (error) {
          alert(error.message || "Не удалось отправить заявку. Попробуйте позже.");
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = originalText; }
        }
      });
    }

    updateCargoCalculator();
  }

  // ==========================================
  // 17. GLOBAL FLOATING BUTTONS
  // ==========================================
  const globalScrollTopBtn = document.getElementById("scrollTopBtn");
  if (globalScrollTopBtn && !globalScrollTopBtn.dataset.bound) {
    globalScrollTopBtn.dataset.bound = "true";
    const toggleScrollTopBtn = () => {
      globalScrollTopBtn.style.display = window.scrollY > 300 ? "flex" : "none";
    };
    toggleScrollTopBtn();
    window.addEventListener("scroll", toggleScrollTopBtn, { passive: true });
    globalScrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

}); // <-- ВОТ ЭТА ПОСЛЕДНЯЯ ЗАКРЫВАЮЩАЯ СКОБКА ДОЛЖНА БЫТЬ САМОЙ НИЖНЕЙ
