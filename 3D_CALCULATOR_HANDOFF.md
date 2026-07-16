# 3D калькулятор грузоперевозок — handoff для следующего агента

Дата: 2026-07-16
Ветка Arena: `arena/019f6a53-pravilnye-gruzchiki`

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
