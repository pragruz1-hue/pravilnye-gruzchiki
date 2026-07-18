# 3D калькулятор грузоперевозок — handoff для следующего агента

Дата: 2026-07-18 (финальное обновление)
Ветка Arena: `arena/019f7312-pravilnye-gruzchiki`
PR: https://github.com/pragruz1-hue/pravilnye-gruzchiki/pull/37

---

## ⚠️ Важно — не ломать отзывы и общий JS сайта

Блок отзывов на главной (`renderReviews`) переставал работать из-за статического импорта Three.js через `js/app.js`. Сейчас `js/app.js` НЕ импортирует Three.js — калькулятор живёт в отдельном React-приложении и встраивается через iframe.

**Правила:**
- Никогда не импортируй Three.js статически в `js/app.js` или `js/modules/` — отзывы и основной сайт должны работать даже если 3D-калькулятор сломан
- 3D-калькулятор — отдельное React-приложение в `cargo-calculator/`, билд копируется в `cargo-3d-calculator/`
- Если правишь встроенный калькулятор на `gruzoperevozki.html` — используй локальные модули из `js/vendor/three/`

---

## 📊 Состояние проекта (на дату handoff)

| Метрика | Значение |
|---|---|
| **Строк кода** | ~4200 (src) |
| **Файлов** | 33 |
| **Тестов** | **31** (vitest) |
| **Билд** | 1006 модулей, ~1.9 MB, three 1.05 MB (290 KB gzip) |
| **Версия стора** | v3 (persist `pg-cargo-3d-v3`) |
| **Статус** | Рабочий, noindex, встроен через iframe на `3d-cargo-calculator.html` |

---

## 📁 Архитектура

```
cargo-calculator/
  src/
    types.ts                          — все типы (LoadItem, VehicleSpec, CameraMode и т.д.)
    global.d.ts                       — Window.pgPlaySound, Window.__joystick
    App.tsx                           — основная компоновка: 3 панели + топ-бар
    main.tsx                          — entry point
    index.css                         — Tailwind + @keyframes fadeIn
    store/
      useCalculatorStore.ts           — Zustand store: состояние + все экшны
    utils/
      calculations.ts                 — укладка, инженерия, цены, генерация коробок
      __tests__/
        calculations.test.ts          — 27 тестов (axle, door, overload, packing, fill, overflow)
        criticalPath.test.ts          — 4 e2e теста (preset → store)
    hooks/
      usePalletCollision.ts           — AABB проверки (название не hook-style, чистая функция)
    materials/
      pbrMaterials.ts                 — текстуры и материалы Three.js
    components/
      3d/
        Scene.tsx                     — Canvas + CameraController + ControlsWrapper
        Truck.tsx                     — процедурная Газель с брендингом и лампами
        PalletManager.tsx             — drag-n-drop + коллизии + landing
        Pallet.tsx                    — все 3D-модели мебели + InteractiveGizmo + SelectionBox
        Box3D.tsx                     — коробки на паллетах
        Lighting.tsx                  — день/ночь, лампы в кузове
        EngineeringOverlay.tsx        — COG, оси, рулетка, дверь
        FloorHeatmap.tsx              — тепловая карта пола
        FirstPersonController.tsx     — WASD + джойстик
        SoundManager.tsx              — WebAudio + вибрация
      ui/
        LeftPanel.tsx                 — левая панель (все компоненты)
        RightPanel.tsx                — правая панель (загрузка + цена)
        PalletBuilder.tsx             — пресеты + каталог + список предметов + кнопка "Заполнить коробками"
        OverflowWarning.tsx           — компонент предупреждения о перегрузе
        PriceDisplay.tsx              — цена + дисклеймер + PDF
        CapacityIndicators.tsx        — индикаторы загрузки
        CameraSwitcher.tsx            — 5 камер + день/ночь
        MiniMap.tsx                   — мини-карта
        MobileJoystick.tsx            — джойстик для мобильных
        CargoParameters.tsx           — выбор машины
        MoveTypeSelector.tsx          — тип переезда
        RouteInputs.tsx               — маршрут
        AdditionalServices.tsx        — доп. услуги
        AppErrorBoundary.tsx          — error boundary
```

---

## 🚀 Что сделано за эту сессию (ветка arena/019f7312)

### Последние изменения (5 коммитов):

1. **fix: вес на всех предметах + вид "От ворот"**
   - Камера "Кабина" переделана в "От ворот" — позиция у заднего борта, смотрит внутрь
   - Вес показывается на ВСЕХ предметах в 3D (не только на выбранном)
   - Вес добавлен в каталог предметов и в список предметов

2. **feat: гравитационное приземление**
   - `landItem()`/`commitLanding()` — при отпускании предмет плавно падает вниз
   - Физика в useFrame — ускорение по разнице высот, снап при < 0.5 см
   - Звук/вибрация при приземлении

3. **feat: overflow detection**
   - `packItemsInVehicle` возвращает `{ placed, overflow }` — больше не впихивает всё в 1 машину
   - Добавлены поля: `overflowCount`, `overflowItems`, `overflowWeight`, `overflowVolume`, `estimatedTrips`
   - Новый `OverflowWarning.tsx` — детальный блок с рекомендациями
   - Профессиональный дисклеймер во всех блоках цены

4. **feat: автозаполнение коробками**
   - `generateFillBoxes()` — заполняет пустоты коробками S/M/L до 92% вместимости
   - Пресеты квартир теперь АВТОМАТИЧЕСКИ дозаполняются коробками
   - Кнопка «📦 Заполнить коробками» в PalletBuilder — для ручного режима

5. **fix: полный аудит и исправление всех проблем (этот коммит)**
   - **31 тест** (было 18) — добавлены тесты укладки, штабелирования, fillBoxes, overflow
   - Типизация: `controls as any` → `OrbitControlsImpl`, `(window as any).pgPlaySound` → `window.pgPlaySound` + `global.d.ts`
   - Debug кнопки убраны в `⚙️ Для экспертов` (Heatmap, Physics, Perf, Рулетка)
   - Overflow убран из 3 блоков: LeftPanel (полный) / RightPanel (компактный) / PriceDisplay (inline)
   - `@keyframes fadeIn` — анимация OverflowWarning
   - Y-snap 5 см в `getStackHeightAt` и `packItemsInVehicle`
   - Поворот на бок при укладке — если не влезает, пробуется `canLaySide` + повторный поиск

### Полная хронология коммитов:
```
f649828 fix: полный аудит — типизация, тесты, debug меню, Y-snap, overflow, поворот
a9a851b feat: автозаполнение пустот коробками
d6966fd feat: overflow detection с профессиональными дисклеймерами
2ea78ee feat: гравитационное приземление при отпускании
be76809 fix: вес на всех предметах, вид "От ворот"
```

---

## 🔬 Технический долг (осталось на следующий раз)

### P0 — Критично
- [ ] **Интеграция с формой заявки на сайте** (Приоритет 6 из изначального ТЗ) — передавать расчёт в форму/CRM. Сейчас только postMessage + localStorage

### P1 — Важно
- [ ] `usePalletCollision.ts` переименовать в `palletCollision.ts` — не React-хук, а чистые функции
- [ ] Разбить `calculations.ts` (710 строк) на `packing.ts`, `engineering.ts`, `fill.ts`
- [ ] `buildPreset` в сторе делает двойную работу — генерирует предметы через `gridPosition`, а потом `packItemsInVehicle` перекладывает заново. Стоит сразу генерировать через упаковщик
- [ ] HTML-рендер заявки (альтернатива PDF)

### P2 — Улучшения
- [ ] `cannon-es` физика (есть в package.json) — rigid body для настоящего падения/столкновений
- [ ] Реальные GLB модели (Газель, предметы) вместо процедурных
- [ ] `linewidth: 2` в SelectionBox не работает в Chrome/WebGL — заменить на альтернативу (mesh-based outline)
- [ ] PWA + Service Worker для офлайн-доступа к калькулятору
- [ ] Проверка origin в `postMessage`

### P3 — Низкий
- [ ] SEO: убрать noindex, добавить OG image, sitemap
- [ ] CSS-переменные для брендинга (сейчас все цвета hardcoded Tailwind)
- [ ] Звуки: вынести в хук `useSound()` вместо `window.pgPlaySound`

---

## ⚙️ Команды

```bash
# Разработка
cd cargo-calculator
npm install
npm run dev

# Сборка и деплой на сайт
npm run build
rm -rf ../cargo-3d-calculator && cp -R dist ../cargo-3d-calculator

# Тесты
npx vitest run --reporter=verbose

# Архив
cd ..
zip -r cargo-calculator-react-3d.zip cargo-calculator -x "cargo-calculator/node_modules/*"
```

---

## 🧪 Чеклист проверки перед передачей

- [ ] `npm run build` — без ошибок
- [ ] `vitest run` — **31 тест зелёный**
- [ ] Пустой кузов на старте (нет "нельзя поставить")
- [ ] Пресеты 1/2/3 к.к. → авто-машина + дозаполнение коробками
- [ ] Drag предмета — камера не едет
- [ ] "От ворот" — камера у заднего борта, можно двигать
- [ ] WASD внутри кузова — коллизия со стенами
- [ ] Кнопка "Заполнить коробками" работает
- [ ] OverflowWarning показывается, когда не влезает
- [ ] Гравитация — при отпускании предмет плавно падает вниз

---

## 💡 Ключевые инженерные решения

1. **Процедурные 3D-модели** — без GLB-зависимостей, всё через RoundedBox и примитивы Three.js
2. **Кастомный gizmo** — заменяет TransformControls (которые крашились с R3F + StrictMode)
3. **Greedy placement** — не оптимальный, но рабочий алгоритм укладки (первое подходящее место)
4. **Zustand persist** — localStorage v3, `partialize` для выборочного сохранения
5. **Code splitting** — three.js (1 MB) в отдельном чанке, jsPDF ленивый импорт

---

---

## 🚨 Инцидент 2026-07-18 — «пропала загрузка сцены» (исправлено)

**Симптом:** страница `3d-cargo-calculator.html` / `cargo-3d-calculator/` — белый экран, приложение не стартует вообще.

**Причина:** `cargo-3d-calculator/assets/index-DJ-x8o40.js` был **пропатчен вручную после билда** (в минифицированном файле встречаются вставки с реальными переносами строк: гейт-экран `pg_scene_loaded`, туториал `pg_tutorial_seen`, промокоды `PROMO_CODES`/`pg_promo`, `trackEvent`, `generateLeadMessage`, `floorSurcharge`, дебаунс `calculatePrice`). В правках было 5 ошибок:

1. `totalPrice:Math.round((f+v+j+y+(():{...})())...)` — опечатка `(():` вместо `(()=>` → **SyntaxError, весь бандл не парсился** (это и был «белый экран»).
2. `applyApartmentPreset:(p)=>{trackEvent(...);a=>{...}` — внутренняя стрелка не вызывалась и внешний блок не закрыт → SyntaxError.
3. `calculatePrice` обёрнут в `setTimeout` без закрывающих `,200)}` → SyntaxError.
4. `clearCalculator(){...},500)` — хвост недописанного setTimeout → SyntaxError.
5. В гейт-экране у трёх `c.jsx` не закрыт объект пропсов (`children:"в библиотеке")` вместо `"})`) → SyntaxError.

После починки синтаксиса вскрылись ещё два нарушения **Rules of Hooks** (React #310): ранние `return` туториала и гейта стояли между хуками (перенесены после всех хуков перед основным рендером), а в `RightPanel` (`Nt`) бейдж переполнения вызывал `Pe(e=>e.overflowCount)` трижды прямо в JSX условно — хук поднят наверх компонента (`ovf`).

**Проверка:** все 8 js-чанков парсятся acorn'ом; jsdom smoke-тест проходит весь флоу: туториал → гейт «Начать расчёт» → пресеты 1кк/3кк (включая бейдж «не влезло») → каталог → удаление → шаринг → камеры; цены считаются.

**Заодно исправлено:** пути текстур `/textures/...` → `textures/...` (бандл + `cargo-calculator/src/materials/pbrMaterials.ts`) — на проде приложение живёт в `/cargo-3d-calculator/`, корневые пути давали 404.

### ⚠️ Важно для следующих агентов

- **Бандл в `cargo-3d-calculator/` ≠ билд из `cargo-calculator/src`.** В бандле есть фичи, которых нет в исходниках (гейт, туториал, промокоды, этаж/лифт, лид-кнопки WhatsApp/Telegram, спецификация, анти-overflow бейдж). **Пересборка из src эти фичи сотрёт** — либо сначала портируй их в src, либо правь и src, и бандл одинаково.
- Никогда не правь минифицированный бандл руками без проверки синтаксиса (`node --check` / acorn) и прогона рендера.
- `<Environment preset="warehouse"/"apartment">` тянет HDR с внешнего CDN `raw.githack.com` — если CDN недоступен у пользователя, `Suspense fallback={null}` = пустая сцена без ошибки. **Сделана страховка (2026-07-18, решение: фолбэк без вендоринга):** Environment обёрнут в собственный `Suspense` + error-boundary `EnvGuard` (бандл) / `SafeEnvironment` (`src/components/3d/Scene.tsx`) — при недоступности HDR сцена рендерится без отражений, а не висит пустой. Полное устранение зависимости = завендорить HDR локально и уйти с `preset` на `files`.
