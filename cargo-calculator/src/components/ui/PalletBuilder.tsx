import { useMemo, useState } from 'react';
import { BoxSize, BoxType, Pallet as PalletModel, PalletType } from '../../types';
import { makePallet, useCalculatorStore } from '../../store/useCalculatorStore';

export function PalletBuilder() {
  const addPallet = useCalculatorStore((state) => state.addPallet);
  const removePallet = useCalculatorStore((state) => state.removePallet);
  const selectPallet = useCalculatorStore((state) => state.selectPallet);
  const selectedPalletId = useCalculatorStore((state) => state.selectedPalletId);
  const pallets = useCalculatorStore((state) => state.pallets);
  const [palletType, setPalletType] = useState<PalletType>('EUR');
  const [boxCount, setBoxCount] = useState(8);
  const [boxSize, setBoxSize] = useState<BoxSize>('M');
  const [boxType, setBoxType] = useState<BoxType>('standard');
  const [material, setMaterial] = useState<PalletModel['material']>('wood');
  const [wrapped, setWrapped] = useState(true);

  const previewBoxes = useMemo(() => Array.from({ length: Math.min(boxCount, 12) }), [boxCount]);

  function addConfiguredPallet() {
    const row = Math.floor(pallets.length / 4);
    const col = pallets.length % 4;
    const x = -2.1 + col * 1.35;
    const z = -0.55 + row * 0.92;
    addPallet(makePallet({ type: palletType, boxCount, boxSize, boxType, material, wrapped, position: [x, 0.072, z] }));
  }

  return (
    <section className="mb-6 rounded-3xl bg-white/55 p-4 ring-1 ring-black/5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-800">📊 Конструктор поддонов</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{pallets.length} шт.</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm font-semibold text-gray-700">
          Тип поддона
          <select className="input-field mt-2" value={palletType} onChange={(event) => setPalletType(event.target.value as PalletType)}>
            <option value="EUR">EUR 120×80</option>
            <option value="FIN">FIN 120×100</option>
            <option value="STANDARD">STANDARD 120×120</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Материал
          <select className="input-field mt-2" value={material} onChange={(event) => setMaterial(event.target.value as PalletModel['material'])}>
            <option value="wood">Дерево</option>
            <option value="plasticBlue">Пластик синий</option>
            <option value="plasticGreen">Пластик зелёный</option>
            <option value="metal">Металл</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Размер коробок
          <select className="input-field mt-2" value={boxSize} onChange={(event) => setBoxSize(event.target.value as BoxSize)}>
            <option value="S">S — 40×30×30 см</option>
            <option value="M">M — 60×40×40 см</option>
            <option value="L">L — 80×60×60 см</option>
            <option value="XL">XL — 100×80×80 см</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Тип груза
          <select className="input-field mt-2" value={boxType} onChange={(event) => setBoxType(event.target.value as BoxType)}>
            <option value="standard">Стандартный</option>
            <option value="fragile">Хрупкий</option>
            <option value="heavy">Тяжёлый</option>
            <option value="cold">Рефрижератор</option>
            <option value="danger">Опасный</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block text-sm font-semibold text-gray-700">
        Количество коробок: <span className="font-black text-blue-700">{boxCount}</span>
        <input className="mt-3 w-full accent-blue-600" type="range" min="1" max="20" value={boxCount} onChange={(event) => setBoxCount(Number(event.target.value))} />
      </label>
      <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <input type="checkbox" checked={wrapped} onChange={(event) => setWrapped(event.target.checked)} className="h-4 w-4 accent-blue-600" />
        Стретч-плёнка и маркировка
      </label>
      <div className="mt-4 rounded-2xl bg-gray-50 p-3">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Превью поддона</div>
        <div className="mx-auto grid h-24 w-40 grid-cols-4 gap-1 rounded-xl border-2 border-amber-400 bg-amber-200 p-2 shadow-inner">
          {previewBoxes.map((_, index) => (
            <div key={index} className={`rounded border ${boxType === 'fragile' ? 'border-yellow-900 bg-yellow-400' : boxType === 'heavy' ? 'border-red-700 bg-red-400' : 'border-blue-600 bg-blue-400'}`} />
          ))}
        </div>
      </div>
      <button onClick={addConfiguredPallet} className="button-primary mt-4 w-full">+ Добавить поддон в кузов</button>
      <div className="mt-4 max-h-44 space-y-2 overflow-auto pr-1">
        {pallets.map((pallet, index) => (
          <div key={pallet.id} className={`flex items-center justify-between gap-2 rounded-2xl p-3 text-sm ${selectedPalletId === pallet.id ? 'bg-blue-50 ring-2 ring-blue-400' : 'bg-white/70'}`}>
            <button className="text-left" onClick={() => selectPallet(pallet.id)}>
              <span className="block font-black text-gray-900">#{index + 1} {pallet.type} · {pallet.boxes.length} коробок</span>
              <span className="text-xs text-gray-500">x {pallet.position[0].toFixed(1)} · z {pallet.position[2].toFixed(1)}</span>
            </button>
            <button className="rounded-xl bg-red-50 px-3 py-2 font-bold text-red-600 hover:bg-red-100" onClick={() => removePallet(pallet.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </section>
  );
}
