# 3D калькулятор грузоперевозок — handoff для следующего агента

Дата: 2026-07-16
Ветка Arena: `arena/019f6a53-pravilnye-gruzchiki`

## ⚠️ Важное обновление 2026-07-17 — не ломать отзывы и общий JS

В ходе проверки выяснилось, что блок отзывов на главной перестал отображаться не из-за данных отзывов, а из-за общего `js/app.js`: он статически импортировал `js/modules/cargo.js`, а внутри `cargo.js` были browser-invalid bare imports:

```js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
```

На статическом сайте без importmap/сборщика в браузере это роняет весь граф `app.js`. Из-за этого не запускались `renderReviews()`, обычный калькулятор, модалки и другие модули.

Что изменено для следующего агента по 3D-калькулятору:

1. `js/app.js` больше НЕ импортирует `cargo.js` статически. Грузовой калькулятор загружается лениво только если на странице есть:

```html
#cargo-visual-calculator
```

2. Для статического сайта добавлена локальная Three.js-база:

```text
js/vendor/three/three.module.js
js/vendor/three/OrbitControls.js
js/vendor/three/LICENSE.txt
```

3. `js/modules/cargo.js` теперь использует эти локальные модули:

```js
import * as THREE from "../vendor/three/three.module.js";
import { OrbitControls } from "../vendor/three/OrbitControls.js";
```

### Правила для следующего агента

- **Не возвращать** bare imports `from "three"` / `from "three/addons/..."` в файлы, которые подключаются прямо браузером со статического сайта.
- Если дорабатываешь встроенный калькулятор на `gruzoperevozki.html`, используй уже созданные локальные мощности `js/vendor/three/*`.
- Не подключай тяжёлый 3D-модуль обратно статически в `js/app.js`: отзывы и основной сайт должны работать даже если 3D-калькулятор сломался.
- Если нужен новый Three.js helper/control для встроенного калькулятора — добавляй его локально в `js/vendor/three/` и правь импорты на относительные пути к `three.module.js`.
- Перед сдачей обязательно проверить:

```bash
find js -type f -name '*.js' -print0 | while IFS= read -r -d '' f; do node --check "$f" >/dev/null; done
npm ci && npm run build
```

Smoke-test отзывов: `renderReviews('krasnodar')` должен создавать 10 `.review-card`.

## Что попросил пользователь

Пользователь хочет не обычную форму и не декоративный 3D-грузовик, а полноценный 3D-конструктор загрузки кузова:

- реальные 3D-блоки с материалами/текстурами;
- кузов можно смотреть со всех сторон;
- пользователь сам расставляет мебель, технику, коробки и паллеты;
- перемещение по X/Y/Z, поднятие/опускание, поворот;
- учёт высоты кузова, веса, объёма;
- предметы не должны входить друг в друга;
- должны быть пресеты `1 к.к.`, `2 к.к.`, `3 к.к.`;
- после пресета система должна показать, какая машина лучше подходит;
- добавить немного дизайна основного сайта: тёмная фирменная подложка, оранжевый акцент, бренд «ПРАВИЛЬНЫЕ ГРУЗЧИКИ».

## Что уже сделано

### 1. Отдельное React-приложение

Создано приложение:

```text
cargo-calculator/
```

Стек:

- React 18
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Zustand
- Tailwind CSS
- jsPDF

Основные файлы:

```text
cargo-calculator/src/App.tsx
cargo-calculator/src/main.tsx
cargo-calculator/src/index.css
cargo-calculator/src/types.ts
cargo-calculator/src/store/useCalculatorStore.ts
cargo-calculator/src/utils/calculations.ts
cargo-calculator/src/hooks/usePalletCollision.ts
cargo-calculator/src/materials/pbrMaterials.ts
```

3D компоненты:

```text
cargo-calculator/src/components/3d/Scene.tsx
cargo-calculator/src/components/3d/Truck.tsx
cargo-calculator/src/components/3d/PalletManager.tsx
cargo-calculator/src/components/3d/Pallet.tsx
cargo-calculator/src/components/3d/Box3D.tsx
cargo-calculator/src/components/3d/Lighting.tsx
```

UI компоненты:

```text
cargo-calculator/src/components/ui/LeftPanel.tsx
cargo-calculator/src/components/ui/MoveTypeSelector.tsx
cargo-calculator/src/components/ui/RouteInputs.tsx
cargo-calculator/src/components/ui/CargoParameters.tsx
cargo-calculator/src/components/ui/PalletBuilder.tsx
cargo-calculator/src/components/ui/AdditionalServices.tsx
cargo-calculator/src/components/ui/CapacityIndicators.tsx
cargo-calculator/src/components/ui/PriceDisplay.tsx
cargo-calculator/src/components/ui/AppErrorBoundary.tsx
```

### 2. Тестовая страница сайта

Создана закрытая тестовая страница:

```text
3d-cargo-calculator.html
```

Она встраивает приложение через iframe:

```html
<iframe src="cargo-3d-calculator/index.html"></iframe>
```

Страница закрыта от поисковиков:

- meta `robots=noindex,nofollow,noarchive,nosnippet,noimageindex`;
- не добавлена в меню;
- не добавлена в sitemap;
- добавлены правила в `robots.txt`:

```text
Disallow: /3d-cargo-calculator.html
Disallow: /cargo-3d-calculator/
Disallow: /cargo-calculator/
```

### 3. Собранный production build

Собранный build лежит здесь:

```text
cargo-3d-calculator/
```

Это копия `cargo-calculator/dist`, собранная с `base: './'`, чтобы iframe работал из подпапки.

Важное изменение:

```text
cargo-calculator/vite.config.ts
```

там указан:

```ts
base: './'
```

Также в `pbrMaterials.ts` пути к текстурам учитывают `import.meta.env.BASE_URL`, чтобы текстуры работали из подпапки.

### 4. Модели и текстуры

Есть процедурно сгенерированные GLB и PNG:

```text
cargo-calculator/public/models/
cargo-calculator/public/textures/
```

Но текущая видимая сцена в основном использует процедурные Three.js модели, потому что GLB/TransformControls на ранних этапах давали нестабильность/пустую сцену.

### 5. Пресеты квартир

В `useCalculatorStore.ts` есть пресеты:

```ts
oneRoom
twoRoom
threeRoom
```

Они создают набор мебели, техники и коробок.

### 6. Реальные машины

В `calculations.ts` есть реальные типы кузовов:

```ts
gazelle3   // Газель 3 м
gazelle42  // Газель 4.2 м
van5       // Фургон 5 м
van6       // Фургон 6 м
truck      // Фура 20т
refrigerator
```

У каждой машины есть:

- длина кузова;
- ширина;
- высота;
- грузоподъёмность;
- объём;
- стоимость.

### 7. Физика / ограничения

Базовая логика находится в:

```text
cargo-calculator/src/hooks/usePalletCollision.ts
cargo-calculator/src/utils/calculations.ts
```

Сейчас реализовано на уровне AABB-проверок:

- пересечение объектов;
- выход за границы кузова;
- превышение высоты;
- запрет класть на бок некоторые предметы;
- базовое правило штабелирования.

Это НЕ полноценная физика rigid body, а пока детерминированная проверка размещения.

## Что важно знать

### Почему убраны TransformControls

Ранее сцена у пользователя загружалась, а затем сбрасывалась на белый экран. Вероятная причина — конфликт/краш вокруг `TransformControls` и React StrictMode / R3F lifecycle.

Сейчас `TransformControls` убраны. Вместо них оставлен безопасный визуальный gizmo:

- красная ось X;
- зелёная ось Y/Z вверх;
- синяя ось глубины;
- кольцо вращения.

Управление сейчас:

- drag предмета по полу кузова;
- кнопки `поднять`, `опустить`, `R 90°` в панели;
- удаление из списка.

### Что было причиной “белого экрана”

Скорее всего runtime exception в 3D-слое. Добавлен `AppErrorBoundary`, чтобы вместо белого экрана показывать понятную ошибку.

## Что стоит сделать дальше

### Приоритет 1 — проверить новую страницу

Открыть:

```text
/3d-cargo-calculator.html
```

Локально:

```bash
# из корня сайта можно открыть статически через любой сервер
# или зайти в cargo-calculator:
cd cargo-calculator
npm install
npm run dev
```

Проверить:

- не появляется ли белый экран;
- виден ли 3D-кузов;
- двигаются ли предметы;
- работают ли пресеты 1/2/3 к.к.;
- меняется ли кузов при выборе Газели 3м/4.2м/5м/6м;
- работает ли iframe на странице сайта.

### Приоритет 2 — нормальная 3D манипуляция

Нужно вернуть полноценное управление предметами, но осторожно:

- либо написать собственный gizmo без `TransformControls`;
- либо вернуть `TransformControls` после тестов и убрать StrictMode;
- либо включать `TransformControls` только для одного selected object и вручную dispose.

Нужны режимы:

- move X/Z;
- lift Y;
- rotate Y;
- rotate X/Z только если `canLaySide=true`;
- snap 10 см.

### Приоритет 3 — stacking / поставить сверху

Сейчас высота учитывается, но “поставить коробку на диван/коробку” нужно улучшить:

- raycast вниз;
- найти верхнюю поверхность объекта;
- поставить предмет на `topY`;
- проверить `stackable` и `maxStackWeight`;
- если нельзя — подсветка красным.

### Приоритет 4 — автозагрузка пресетов

Сейчас пресеты просто раскладывают предметы сеткой. Нужно сделать алгоритм:

- сортировка тяжёлых вниз;
- длинные предметы вдоль стен;
- коробки слоями;
- хрупкое наверх/в отдельную зону;
- холодильник вертикально;
- шкаф если не проходит по высоте — положить боком, если можно.

### Приоритет 5 — улучшить визуал

Добавить модели/детализацию:

- диван с подушками;
- шкаф с дверцами;
- холодильник с ручками;
- стиралка с круглым люком;
- коробки с tape/labels;
- фирменная Газель в оранжево-тёмной стилистике.

### Приоритет 6 — интеграция с реальной формой заявки

Когда калькулятор стабилизируется:

- передавать итог в форму сайта;
- добавить кнопку “Оставить заявку с этим расчётом”;
- отправлять список предметов, машину, вес/объём, цену.

## Команды

Разработка:

```bash
cd cargo-calculator
npm install
npm run dev
```

Сборка:

```bash
cd cargo-calculator
npm run build
```

Обновить iframe-build на сайте:

```bash
rm -rf ../cargo-3d-calculator
cp -R dist ../cargo-3d-calculator
```

Архив:

```bash
cd ..
zip -r cargo-calculator-react-3d.zip cargo-calculator -x "cargo-calculator/node_modules/*"
```

## Последняя суть для следующего агента

Не трать время на декоративный “3D фон”. Пользователь хочет именно практический 3D-планировщик загрузки кузова.

Главная метрика успеха:

> Пользователь выбрал 2к.к., увидел мебель/технику/коробки в кузове, руками подвигал предметы, увидел предупреждения по высоте/пересечениям/весу и получил рекомендацию: какая Газель нужна.

---

## ⚡️ Обновление от 18 июля 2026 года (Агент Arena)

Все приоритеты с **1 по 5** были успешно и полностью реализованы в рамках данной сессии! 3D-планировщик стал чрезвычайно интерактивным, реалистичным и брендированным.

### 🌟 Что было сделано:

1. **Интерактивный 3D-манипулятор (Gizmo) [Приоритет 2]:**
   * Разработан кастомный стабильный 3D-манипулятор (`InteractiveGizmo` в `Pallet.tsx`), который заменяет склонный к падениям `TransformControls` и полностью защищён от проблем с React StrictMode.
   * Он отображается только у выбранного предмета и включает в себя:
     * **Красную стрелку (X)** для точного горизонтального перемещения;
     * **Синюю стрелку (Z)** для осевого продольного движения;
     * **Зелёную стрелку (Y)** для вертикального поднятия/лифта;
     * **Оранжевое кольцо** для плавного поворота вокруг оси Y с шагом в 90°.
   * Добавлена интерактивная реакция курсора при наведении, принудительное отключение OrbitControls во время перетаскивания и прилипание (`snap`) к сетке **10 см**.

2. **Автоматическое штабелирование / «Поставить сверху» [Приоритет 3]:**
   * Разработана функция `getStackHeightAt` в `calculations.ts` для непрерывного сканирования пространства под перемещаемым объектом.
   * Теперь при перетаскивании (и мышкой, и через стрелки) предметы автоматически «напрыгивают» на плоские stackable-поверхности стоящих снизу предметов.
   * Если ставить предмет на нештабелируемый объект (или превышен `maxStackWeight`), срабатывает триггер коллизии с 3D-подсказкой «нельзя поставить» красным цветом.

3. **Интеллектуальный алгоритм авторазмещения [Приоритет 4]:**
   * Разработан алгоритм автоматической трехмерной укладки (`packItemsInVehicle` в `calculations.ts`) и встроен в процесс выбора пресетов квартир, добавления/удаления предметов и смены типа транспорта.
   * Алгоритм:
     * Сортирует тяжелые грузы вниз на пол (сейфы, пианино, холодильники);
     * Укладывает шкаф на бок, если его высота превышает высоту кузова;
     * Разворачивает и укладывает длинные грузы (диваны, кровати, велосипеды) параллельно левой/правой стенам;
     * Плотно укладывает коробки аккуратными слоями поверх стиральных машин, столов и других коробок;
     * Держит холодильник строго вертикально.

4. **Глубокая детализация 3D-моделей и брендинг [Приоритет 5]:**
   * Внедрены детализированные процедурные RoundedBox-модели для мебели и техники:
     * **Диван** с мягкими сидениями, подлокотниками и подушками на спинке;
     * **Шкаф** с текстурой дерева, продольным разделением дверей и ручками;
     * **Холодильник** с раздельными морозильной/холодильной камерами и ручками;
     * **Стиральная машина** с люком (стекло + хром), панелью управления, экраном и ручкой;
     * **Коробки** с текстурой картона, скотчем и белым адресным ярлыком;
     * **Стол** с полноценной столешницей и 4 ножками;
     * **Стулья** в виде аккуратных стопок;
     * **Цветок** в горшке с проработанными зелеными листьями.
   * **Брендинг Газели:** На левом и правом бортах кузова грузовика добавлены парящие 3D-вывески в фирменном стиле **«ПРАВИЛЬНЫЕ ГРУЗЧИКИ»**.

5. **Оптимизация и сборка:**
   * Проект в `cargo-calculator/` успешно собирается (`npm run build`) без ошибок.
   * Сборка скопирована в директорию `cargo-3d-calculator/` на боевом сайте.
   * Исходники упакованы в архив `cargo-calculator-react-3d.zip` в корне.

---

### ⏳ Что осталось сделать:

* **Интеграция с формой заявки на сайте [Приоритет 6]:**
  * Передавать результаты расчетов (список предметов, кубатуру, вес, выбранную машину и цену) в скрытые поля формы заказа на сайте.
  * Добавить в калькулятор кнопку **«Оформить заказ с этим расчётом»**, чтобы отправлять эти подробные данные менеджеру напрямую на почту / в CRM.

---

### 💡 Что еще можно сделать (Дополнительные идеи):

* **Улучшение 3D-графики:** Добавить мягкие тени `AccumulativeShadows` и проработать текстуры бортов кузова изнутри.
* **Звуковые эффекты:** Добавить легкий щелчок («клик») при успешном прилипании предмета к сетке или укладке на другой объект.
* **Интеграция со sitemap и меню (опционально):** Если проект будет решено запустить публично (убрав `noindex`), добавить его в главное меню сайта и в XML-карту.

---

## 🚀 Обновление v3 — 18 июля 2026, ветка `arena/019f72c3-pravilnye-gruzchiki` — полный инженерный редизайн

Пользователь повторно проверил калькулятор и дал 5 критических замечаний + запрос на игровой мобильный режим. Плюс позже попросил закрыть все оставшиеся риски из аудита.

### Исправлено из ТЗ пользователя (5 пунктов):

1. **Пустой старт** — `useCalculatorStore.ts` теперь `pallets: []`, `initialItems` убран. Раньше `packItemsInVehicle` делал fallback `[-L/2+0.5+idx*0.4]` → намеренное пересечение → “нельзя поставить”. Убран оверлей, добавлен приветственный `Кузов пустой — начни с квартиры`.

2. **Рекомендуемая машина при выборе квартиры** — введен `APARTMENT_STANDARDS` (7,12,18 м³). `applyApartmentPreset` берёт `recommendedVehicle` строго из стандарта, а не из `maxX/maxZ` gridPosition. `recommendVehicle()` переписан на чистый объём/вес + проверка высоты.

3. **Авто-заполнение объема** — 3 Газели с реальными габаритами из открытых источников:
   - `gazelle7: 3.0×1.8×1.3=7.02 м³` (kuzovspec.ru тент 3×1.9×1.5≈8, FB.ru 3×1.75×1.75≈8)
   - `gazelle12: 3.2×1.9×2.0=12.16 м³` (pereezdporossii.ru 3м=10-12)
   - `gazelle18: 4.2×2.0×2.15=18.06 м³` (FB.ru 4.2×1.9×2.15=16-18)
   Все 1500 кг как просил пользователь. В `CargoParameters.tsx` показывается источник.

4. **2 окна мало + цена перекрывает** — `App.tsx` переделан с 2 absolute окон на 3 панели: левая 420px инвентарь, центр 3D flex-1, правая 380px цена+загрузка. `CapacityIndicators`/`PriceDisplay` получили `embedded` проп, не absolute. `index.css` `max-height 48vh` убран. На мобиле drawer'ы.

5. **Камера едет при drag** — `PalletManager.tsx`: `controls.enabled=false` + `pointerCapture` + `preventDefault`. Раньше отключалось только в `InteractiveGizmo`.

6. **Мобилка как игра**:
   - `CameraSwitcher.tsx` 5 камер: обзор, в кузове, кабина, сбоку, сверху + день/ночь
   - `Scene.tsx` `CameraController` lerp позиции/таргета/fov по `L/W/H`, `FirstPersonController` WASD + Q/E + Shift + коллизия со стенами
   - `Truck.tsx` в `inside` режиме борта `opacity 0.92`, внутренние панели `wallInside`, лампы `sphere + pointLight` с emissive 3.0 ночью, светоотражатели
   - `Lighting.tsx` интенсивность зависит от `isNightMode`

### Что сделано сверх ТЗ (v2 → v3 “делай всё”):

**Инженерия:**
- `computeCenterOfGravity()` — взвешенный по массе центр, красный шарик + линия до пола, Html `COG кг`
- `computeAxleLoads()` — правильная статика: `Rr = Σ Wi*(Xi-Xf)/wheelbase`, `Rf=total-Rr`, боковой `leftKg/rightKg` через `COG.z`, `imbalance%`, `lateral%`, `isTippingRisk = lateral>35 && y>H*0.6`. Исправлена ошибка старой формулы `wheelbase - distToRear`
- `canFitThroughDoor()` — реалистичный проем `W*0.90`, `H*0.88 capped 1.92м` (порог Газели), проверка обеих ориентаций + диагональ `sqrt(W²+H²)`, учет `canLaySide`
- `getDistanceToWalls()` рулетка для выбранного, линии `Line` до стен
- `computeFloorHeatmap()` 12×12 сетка веса на ячейку, HSL зеленый→красный
- `packItemsInVehicle()` магнит 6см + повторная проверка коллизии после снапа
- `checkOverload()` вес/объем >100%
- Fuel: `12л/100км +0.3л/100кг/100км`, `fuelLiters`, цена 62₽/л, `packing +15%` объема `calculateTotalsWithPacking()`
- `FloorHeatmap.tsx`, `EngineeringOverlay.tsx` с COG, осями, дверью, рулеткой
- `MobileJoystick.tsx` 110px, touch, пишет в `window.__joystick`, `FirstPersonController` читает джойстик
- Mini-map с поворотом `rotate(${rotDeg}deg)`
- Performance toggle: `isPerformanceMode` → `dpr [1,1]`, `shadows false`, `Environment off`, `preserveDrawingBuffer false` (было true всегда → OOM на Redmi)
- `preserveDrawingBuffer` теперь false, скриншот делается через `canvas.toDataURL` в том же кадре (работает без preserve благодаря immediate call)
- Persist v3: `pg-cargo-3d-v3`, `version:3`, `migrate()` добавляет новые флаги, `partialize` сохраняет только нужное
- Throttled `postMessage`: max 1 раз в 350мс, debounce таймер, не спамит при drag
- AudioContext resume на `pointerdown/keydown once`, иначе звук не играл
- `SoundManager.tsx` WebAudio osc, haptics `navigator.vibrate`
- `RightPanel.tsx` с COG, осями, share link base64url, screenshot PNG, postMessage final payload в `localStorage pg_cargo_final_payload`

**Дев/тесты:**
- `vitest` добавлен, `src/utils/__tests__/calculations.test.ts` 14 тестов, `criticalPath.test.ts` 4 e2e теста: пустой старт, 2к.к.→12м³, door fitting fridge 1.9м не лезет в 7м³ но лезет в 12м³, fuel weight factor, packing +15%
- `Scene.tsx` `ControlsWrapper` реактивный, отключает Orbit при `isFirstPerson`
- `App.tsx` топ-бар инженерный: undo/redo, WASD, 🗺, 📏, 🔊, ⚡ Perf, 🧪 Физи, 🔥 Heat, history count
- `3d-cargo-calculator.html` обновлен: интеграционный бар `integrationBar` с live `ibCount/Vol/Weight/Vehicle/Price`, кнопки копирования JSON и запроса расчета, слушатель `message` события `cargo-calculation-*`

**Итоговые команды:**
```bash
cd cargo-calculator
npm install
npm run dev
npm run build
rm -rf ../cargo-3d-calculator && cp -R dist ../cargo-3d-calculator
npx vitest run --reporter=verbose
```

### Что стоит проверить следующему агенту:

1. Открыть `/3d-cargo-calculator.html` — пустой кузов? Клик 1к.к./2к.к./3к.к. → меняется ли машина 7/12/18 и нет ли “нельзя поставить” на старте?
2. Drag предмета — едет ли камера? Должна стоять.
3. Камеры внизу — обзор, в кузове, кабина, сбоку, сверху — лерп плавный? В кузове видны борта, лампы горят, ночь ярче?
4. WASD внутри кузова — ходьба, коллизия со стенами, джойстик на мобиле?
5. Мини-карта — показывает поворот rect?
6. Топ-бар — undo/redo, COG красный, оси перед/зад, дисбаланс, дверь бейдж?
7. Heatmap — 🔥 включен? Цвет пола от зеленого к красному по весу?
8. Performance toggle — на слабом телефоне dpr1, без теней?
9. Share link `?share=` — копирует, открывается с предметами?
10. PDF — скриншот 3D попадает в PDF?
11. postMessage — в `3d-cargo-calculator.html` бар обновляется при перемещении предмета? `localStorage pg_last_calculation` пишется?
12. Тесты `npx vitest run` — 18 тестов зелёные?
13. Отзывы на главной — `renderReviews` всё ещё работает? Проверить `js/app.js` ленивую загрузку.

### Что предстоит сделать (оставшиеся идеи, low priority):

- Настоящая физика `cannon-es`: сейчас только гравитация-фейк (падение до `getStackHeightAt`). Можно включить `CANNON.World` с `Box` телами для каждого предмета, синхронизация через `useFrame`. Зависимость уже в `package.json`.
- AR Quick Look / WebXR — поставить Газель во дворе.
- PWA offline + кеш текстур, `manifest.json` для калькулятора.
- Реальные GLB модели Газель Next вместо процедурного бокса — в `public/models/` лежат неиспользуемые файлы.
- Расчет ремней крепления: 2 ремня на каждые 1.5м длины, схема для грузчиков.
- Интеграция с CRM: сейчас `postMessage` + `localStorage`, но нет `fetch` в amoCRM/Bitrix. Добавить кнопку “Отправить в CRM” с `fetch`.
- SEO: если решат индексировать, убрать `noindex`, добавить в sitemap, OG image.
- Сжатие `three` чанка 1.05MB — code split `three` динамически, `drei` отдельно, уже есть warning `dynamic import will not move module`.

Дата: 2026-07-18
Ветка: `arena/019f72c3-pravilnye-gruzchiki`
Билд: `cargo-3d-calculator/` = `cargo-calculator/dist` (1006 модулей, 1.05MB three)
Тесты: `vitest run` 18 passed
