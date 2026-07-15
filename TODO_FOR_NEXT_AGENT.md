# 📋 SEO задачи для другого агента

> **КОНТЕКСТ:** Это продолжение работы над сайтом pravilnye-gruzchiki.ru (грузчики и переезды в Краснодарском крае).
> Предыдущий агент выполнил задачи 1-5, включая Schema.org, Open Graph, hreflang, Review Schema и перелинковку.

---

## ✅ ВЫПОЛНЕНО ПРЕДЫДУЩИМ АГЕНТОМ

1. **Schema.org** — LocalBusiness, FAQPage, Service, Organization (все страницы)
2. **Open Graph** — og:title, og:description, og:image на 138 страницах
3. **OG Image** — создан `/assets/og-image.jpg` (1200×630px)
4. **Hreflang** — добавлен на 132 страницы
5. **Review Schema** — добавлены отзывы на 132 страницы
6. **Внутренняя перелинковка** — добавлены ссылки на другие города (90 страниц)

---

## 🟡 ЗАДАЧИ 6-9 (средний приоритет)

### 6. Расширение блога (контент-маркетинг)

**Текущее состояние:** 21 статья
**Цель:** 30-50 статей

**Примеры тем для статей:**
- «Как упаковать холодильник при переезде»
- «Что взять с собой в первый день переезда»
- «Как перевезти аквариум безопасно»
- «Переезд с детьми: чек-лист для родителей»
- «Сравнение: Газель 3м vs 4.2м — что выбрать»
- «Как избежать обмана при найме грузчиков»
- «Сезонность грузоперевозок: когда дешевле переезжать»
- «Переезд в Краснодар: руководство по районам»

**Структура статьи:**
```html
<article>
  <h1>Название</h1>
  <time datetime="2026-XX-XX">Дата</time>
  <div class="article-content">
    <!-- Контент -->
  </div>
  <!-- Блок связанных услуг -->
  <div class="related-services">
    <a href="/krasnodar/gruzchiki-na-chas.html">Грузчики на час</a>
    <a href="/krasnodar/kvartirnyj-pereezd.html">Квартирный переезд</a>
  </div>
</article>
```

**Файл:** `/blog/` — создавать новые `.html` файлы по аналогии с существующими.

---

### 7. Минификация CSS и JS

**Цель:** Ускорить загрузку страниц.

**Действия:**
1. Использовать онлайн-минификаторы или npm пакеты (csso, terser)
2. Минифицировать файлы в `/css/` и `/js/`
3. Добавить суффикс `.min` к минифицированным файлам
4. Обновить ссылки в HTML

**Скрипт для проверки размера:**
```bash
# До минификации
ls -lh css/*.css js/*.js

# После минификации
ls -lh css/*.min.css js/*.min.js
```

---

### 8. Яндекс Турбо-страницы

**Файл:** `turbo.html` (главная) и аналогичные для городов

**Пример структуры:**
```html
<!DOCTYPE html>
<html lang="ru" prefix="yap: http://news.yandex.ru">
<head>
  <title>Грузчики в Краснодаре | Правильные Грузчики</title>
  <link rel="canonical" href="https://pragruz.ru/" />
  <meta name="turbo:version" content="1.0" />
  <meta name="turbo:content-type" content="website" />
</head>
<body>
  <header>
    <img src="https://pragruz.ru/assets/logo.png" />
    <h1>Грузчики и переезды в Краснодаре</h1>
  </header>
  <main>
    <button formaction="tel:+79283333281">Позвонить</button>
    <section>
      <h2>Услуги</h2>
      <a href="https://pragruz.ru/krasnodar/loaders.html">Грузчики</a>
      <a href="https://pragruz.ru/krasnodar/kvartirnyj-pereezd.html">Переезды</a>
    </section>
  </main>
</body>
</html>
```

**Ресурсы:**
- [Документация Яндекс Турбо](https://yandex.ru/dev/turbo/)
- Валидатор: https://webmaster.yandex.ru/turbo/

---

### 9. Локальные ссылки (цитирования)

**Регистрация в справочниках:**

| Сервис | URL | Что заполнить |
|--------|-----|---------------|
| Яндекс.Карты | https://business.yandex.ru | Компания, фото, часы |
| Google Business | https://business.google.com | Компания, фото, отзывы |
| 2GIS | https://partner.2gis.ru | Компания, контакты |
| Flamp | https://flamp.ru | Отзывы, фото |
| Яндекс Справочник | https://sprav.ru | Компания, услуги |

**Важно:** Название компании единое: **ООО «Правильные Грузчики»**
**Телефон:** +7 (928) 333-32-81
**Адреса по городам:**
- Краснодар: ул. Кропоткина, 50, офис 339
- Анапа: ул. Крымская, 177, офис 12
- Сочи: ул. Горького, 87
- Новороссийск: ул. Советов, 42
- Геленджик: ул. Горького, 56

---

## 🟢 ЗАДАЧИ 10-12 (дополнительно)

### 10. Изображения — сжать и оптимизировать

**Текущее:** большинство в WebP ✅
**Доработать:**
```bash
# Проверить размер изображений
find assets/ -name "*.webp" -exec ls -lh {} \;

# Сжать без потери качества (если есть):
# cwebp -q 80 input.png -o output.webp
```

---

### 11. Страница "Города" (хаб)

**Файл:** `/cities/index.html`

```html
<h1>Грузчики и переезды в городах Краснодарского края</h1>

<div class="city-cards">
  <a href="/krasnodar/" class="city-card">
    <h2>Краснодар</h2>
    <p>Выезд от 30 минут</p>
  </a>
  <a href="/anapa/" class="city-card">
    <h2>Анапа</h2>
    <p>Город и район</p>
  </a>
  <!-- и т.д. -->
</div>
```

**Добавить в навигацию:**
```html
<li><a href="/cities/">Города</a></li>
```

---

### 12. Видео-контент

**Добавить на страницы:**
- YouTube/Vimeo embed в блоке "Как мы работаем"
- Видео-отзывы клиентов

**Код для встраивания:**
```html
<div class="video-container">
  <iframe 
    src="https://www.youtube.com/embed/VIDEO_ID" 
    allowfullscreen>
  </iframe>
</div>
```

---

## 📊 Чеклист перед деплоем

- [ ] Все Schema.org валидны (проверить в https://validator.schema.org/)
- [ ] Hreflang на всех страницах городов
- [ ] OG Image загружен на хостинг
- [ ] robots.txt не блокирует важные страницы
- [ ] sitemap.xml актуальна
- [ ] Проверить в Яндекс Вебмастере
- [ ] Проверить в Google Search Console

---

## 🔧 Быстрые команды для проверки

```bash
# Проверить hreflang
grep -r "hreflang" --include="*.html" -l | wc -l

# Проверить Schema
grep -r '"@type": "LocalBusiness"' --include="*.html" | wc -l

# Проверить OG Image
grep -r 'og:image.*og-image' --include="*.html" | wc -l

# Найти страницы без перелинковки
find . -name "*.html" -path "*/krasnodar/*" | while read f; do
  grep -q "other-cities-section" "$f" || echo "$f"
done
```

---

## 📝 Рекомендации

1. **Приоритет задач:** 6 → 7 → 8 → 9 → 10 → 11 → 12
2. **Блог** (задача 6) — самый важный для долгосрочного SEO
3. **Минификация** (задача 7) — улучшит Core Web Vitals
4. **Локальные ссылки** (задача 9) — напрямую влияют на ранжирование в Яндексе

---

*Создано: 2026-07-14*
*Бранч: arena/019f61e9-pravilnye-gruzchiki*
*PR: https://github.com/pragruz1-hue/pravilnye-gruzchiki/pull/19*
