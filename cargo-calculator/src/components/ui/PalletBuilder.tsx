import { useMemo, useState } from 'react';
import { ApartmentPreset, BoxSize, BoxType, LoadItem, PalletType } from '../../types';
import { CATALOG, makePallet, useCalculatorStore } from '../../store/useCalculatorStore';
import { APARTMENT_STANDARDS } from '../../utils/calculations';

const presets: Array<{ id: ApartmentPreset; label: string; hint: string; volume: string }> = [
  { id: 'oneRoom', label: '1 к.к.', hint: 'эконом', volume: '7 м³ · 1500 кг' },
  { id: 'twoRoom', label: '2 к.к.', hint: 'стандарт', volume: '12 м³ · 1500 кг' },
  { id: 'threeRoom', label: '3 к.к.', hint: 'максимум', volume: '18 м³ · 1500 кг' }
];

export function PalletBuilder() {
  const addPallet = useCalculatorStore((state) => state.addPallet);
  const addCatalogItem = useCalculatorStore((state) => state.addCatalogItem);
  const applyApartmentPreset = useCalculatorStore((state) => state.applyApartmentPreset);
  const activePreset = useCalculatorStore((state) => state.activePreset);
  const removePallet = useCalculatorStore((state) => state.removePallet);
  const selectPallet = useCalculatorStore((state) => state.selectPallet);
  const selectedPalletId = useCalculatorStore((state) => state.selectedPalletId);
  const pallets = useCalculatorStore((state) => state.pallets);
  const liftSelected = useCalculatorStore((state) => state.liftSelected);
  const rotateSelectedY = useCalculatorStore((state) => state.rotateSelectedY);
  const clearCalculator = useCalculatorStore((state) => state.clearCalculator);
  const [palletType, setPalletType] = useState<PalletType>('EUR');
  const [boxCount, setBoxCount] = useState(8);
  const [boxSize, setBoxSize] = useState<BoxSize>('M');
  const [boxType, setBoxType] = useState<BoxType>('standard');
  const [material, setMaterial] = useState<LoadItem['material']>('wood');
  const [wrapped, setWrapped] = useState(true);
  const previewBoxes = useMemo(() => Array.from({ length: Math.min(boxCount, 12) }), [boxCount]);
  const selected = pallets.find((item) => item.id === selectedPalletId);

  function addConfiguredPallet() {
    const row = Math.floor(pallets.length / 4);
    const col = pallets.length % 4;
    addPallet(makePallet({ type: palletType, boxCount, boxSize, boxType, material, wrapped, position: [-1.5 + col * 1.25, 0.072, -0.55 + row * 0.92] }));
  }

  return (
    <section className="mb-6 rounded-3xl bg-white/60 p-4 ring-1 ring-black/5 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-800">🏠 Предметы и пресеты</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#d35400]">{pallets.length} объектов</span>
          {pallets.length > 0 && <button onClick={clearCalculator} className="rounded-full bg-slate-900 px-2 py-1 text-xs font-bold text-white">Очистить</button>}
        </div>
      </div>

      <div className="mb-2 text-[11px] font-black uppercase tracking-wide text-gray-500">Стандартные объемы для квартирных переездов (все газели до 1500 кг)</div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {presets.map((preset) => {
          const standard = APARTMENT_STANDARDS[preset.id];
          return (
            <button
              key={preset.id}
              onClick={() => applyApartmentPreset(preset.id)}
              className={`rounded-2xl border p-3 text-left transition ${activePreset === preset.id ? 'border-[#ff6b00] bg-orange-50 shadow-md ring-2 ring-orange-200' : 'border-gray-200 bg-white/70 hover:border-orange-200'}`}
            >
              <span className="block text-lg font-black text-gray-950">{preset.label}</span>
              <span className="block text-xs font-bold text-gray-600">{standard.description}</span>
              <span className="mt-1 block text-[11px] font-black text-[#d35400]">{preset.volume}</span>
              <span className="mt-1 block text-[10px] text-gray-400">Авто: {standard.recommendedVehicle}</span>
            </button>
          );
        })}
      </div>

      {pallets.length === 0 ? (
        <div className="mb-4 rounded-2xl bg-[#10131b] p-4 text-white">
          <div className="text-sm font-black">Кузов пустой — выбери квартиру</div>
          <div className="mt-1 text-xs leading-5 text-slate-300">
            Раньше калькулятор грузился заполненным и предметы были с меткой “нельзя поставить”. Теперь старт пустой. Выбери 1/2/3 к.к. — подставится правильная Газель: 7 м³ (3.0×1.8×1.3), 12 м³ (3.2×1.9×2.0), 18 м³ (4.2×2.0×2.15) — размеры из открытых источников (kuzovspec.ru, FB.ru, pereezdporossii.ru). Все газели до 1500 кг.
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
          <div className="text-xs font-black text-emerald-800">✅ Автозаполнение машины</div>
          <div className="mt-1 text-xs text-emerald-700">При выборе квартиры машина подбирается автоматически под стандартный объем. Вес до 1500 кг на любую газель. Предметы теперь не перекрываются и не дают “нельзя поставить” при пустом старте — упаковка пересчитана.</div>
        </div>
      )}

      <div className="mb-4 rounded-2xl bg-slate-950 p-3 text-white">
        <div className="mb-2 text-xs font-black uppercase tracking-wide text-orange-300">Библиотека квартирного переезда</div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
          {CATALOG.map((item) => (
            <button key={item.kind} onClick={() => addCatalogItem(item.kind)} className="rounded-xl bg-white/10 p-2 text-left transition hover:bg-white/20">
              <span className="block text-base font-black">{item.emoji} {item.name}</span>
              <span className="block text-[11px] font-semibold text-slate-300">{item.description}</span>
              <span className="mt-0.5 inline-block rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-black text-orange-300">{item.weight} кг</span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="mb-4 rounded-2xl bg-orange-50 p-3 ring-1 ring-orange-200">
          <div className="mb-2 text-sm font-black text-gray-950">Выбран: {selected.name}</div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => liftSelected(0.1)} className="rounded-xl bg-white px-2 py-2 text-xs font-black text-emerald-700 shadow-sm">↑ поднять</button>
            <button onClick={() => liftSelected(-0.1)} className="rounded-xl bg-white px-2 py-2 text-xs font-black text-red-700 shadow-sm">↓ опустить</button>
            <button onClick={rotateSelectedY} className="rounded-xl bg-white px-2 py-2 text-xs font-black text-blue-700 shadow-sm">R 90°</button>
          </div>
          <div className="mt-2 text-xs font-semibold text-gray-600">Drag в 3D — перемещение (камера больше не едет), gizmo — вращение/XYZ, высота и коллизии проверяются.</div>
        </div>
      )}

      <details className="rounded-2xl bg-white/70 p-3" open={false}>
        <summary className="cursor-pointer text-sm font-black text-gray-800">📊 Добавить паллету вручную</summary>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-gray-700">Тип<select className="input-field mt-2" value={palletType} onChange={(event) => setPalletType(event.target.value as PalletType)}><option value="EUR">EUR 120×80</option><option value="FIN">FIN 120×100</option><option value="STANDARD">STANDARD 120×120</option></select></label>
          <label className="text-sm font-semibold text-gray-700">Материал<select className="input-field mt-2" value={material} onChange={(event) => setMaterial(event.target.value as LoadItem['material'])}><option value="wood">Дерево</option><option value="plasticBlue">Пластик синий</option><option value="plasticGreen">Пластик зелёный</option><option value="metal">Металл</option></select></label>
          <label className="text-sm font-semibold text-gray-700">Размер коробок<select className="input-field mt-2" value={boxSize} onChange={(event) => setBoxSize(event.target.value as BoxSize)}><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option></select></label>
          <label className="text-sm font-semibold text-gray-700">Тип груза<select className="input-field mt-2" value={boxType} onChange={(event) => setBoxType(event.target.value as BoxType)}><option value="standard">Стандартный</option><option value="fragile">Хрупкий</option><option value="heavy">Тяжёлый</option><option value="cold">Рефрижератор</option><option value="danger">Опасный</option></select></label>
        </div>
        <label className="mt-4 block text-sm font-semibold text-gray-700">Количество коробок: <span className="font-black text-[#d35400]">{boxCount}</span><input className="mt-3 w-full accent-[#ff6b00]" type="range" min="1" max="20" value={boxCount} onChange={(event) => setBoxCount(Number(event.target.value))} /></label>
        <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={wrapped} onChange={(event) => setWrapped(event.target.checked)} className="h-4 w-4 accent-[#ff6b00]" />Стретч-плёнка</label>
        <div className="mt-4 rounded-2xl bg-gray-50 p-3"><div className="mx-auto grid h-20 w-36 grid-cols-4 gap-1 rounded-xl border-2 border-amber-400 bg-amber-200 p-2 shadow-inner">{previewBoxes.map((_, index) => <div key={index} className={`rounded border ${boxType === 'fragile' ? 'border-yellow-900 bg-yellow-400' : boxType === 'heavy' ? 'border-red-700 bg-red-400' : 'border-blue-600 bg-blue-400'}`} />)}</div></div>
        <button onClick={addConfiguredPallet} className="button-primary mt-4 w-full">+ Добавить поддон</button>
      </details>

      <div className="mt-4 max-h-44 space-y-2 overflow-auto pr-1">
        {pallets.map((item, index) => (
          <div key={item.id} className={`flex items-center justify-between gap-2 rounded-2xl p-3 text-sm ${selectedPalletId === item.id ? 'bg-orange-50 ring-2 ring-[#ff6b00]' : 'bg-white/70'}`}>
            <button className="text-left" onClick={() => selectPallet(item.id)}>
              <span className="block font-black text-gray-900">#{index + 1} {item.name}</span>
              <span className="text-xs text-gray-500">{item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height} м</span>
              <span className="text-xs font-black text-[#d35400]">⚖ {item.weight} кг</span>
            </button>
            <button className="rounded-xl bg-red-50 px-3 py-2 font-bold text-red-600 hover:bg-red-100" onClick={() => removePallet(item.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </section>
  );
}
