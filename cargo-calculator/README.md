# 3D калькулятор грузоперевозок

Полностью рабочее React + TypeScript приложение с интерактивной 3D сценой, визуальным конструктором поддонов, drag & drop в кузове и расчётом стоимости в реальном времени.

## Стек

- React 18 + TypeScript
- Vite
- Three.js
- React Three Fiber
- React Three Drei
- Zustand
- Tailwind CSS
- cannon-es в зависимостях для дальнейшего расширения физики
- jsPDF для экспорта PDF

## Быстрый запуск

```bash
npm install
npm run generate:assets
npm run dev
```

Откройте адрес, который покажет Vite, обычно:

```text
http://localhost:5173
```

## Сборка

```bash
npm run build
npm run preview
```

## Управление

- Левая кнопка мыши по сцене — вращение камеры
- Колесо мыши — приближение / отдаление
- Перетащить паллету — перемещение по полу кузова
- Выбор паллеты — клик по паллете
- TransformControls на выбранной паллете — вращение по оси Y
- Кнопка `Удалить` в списке — удаление паллеты
- `Скачать PDF` — экспорт расчёта

## Структура

```text
cargo-calculator/
├── public/
│   ├── models/
│   │   ├── truck.glb
│   │   ├── pallet.glb
│   │   ├── box_s.glb
│   │   ├── box_m.glb
│   │   ├── box_l.glb
│   │   └── box_xl.glb
│   └── textures/
│       ├── wood_grain_normal.png
│       ├── tire_tread_normal.png
│       ├── cardboard_wave.png
│       ├── cardboard_wave_normal.png
│       ├── metallic_flake_normal.png
│       ├── brushed_metal_normal.png
│       └── wood_planks_disp.png
├── scripts/
│   ├── generate-assets.mjs
│   └── generate-textures.py
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   └── ui/
│   ├── hooks/
│   ├── materials/
│   ├── store/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Что реализовано

- Glassmorphism UI 40/60: формы слева, 3D сцена справа
- Типы перевозок: квартирный, офисный, коммерческий
- Поддоны EUR / FIN / STANDARD
- Коробки S / M / L / XL
- Материалы: дерево, пластик, металл, картон, стекло, резина, хром, stretch-wrap
- PBR normal maps и procedural GLB модели
- Drag & drop паллет в кузове
- Collision warning при пересечении / выходе из кузова
- OrbitControls
- Real-time расчёт цены
- Индикаторы объёма, веса и паллетомест
- PDF экспорт
- Мобильная адаптация
