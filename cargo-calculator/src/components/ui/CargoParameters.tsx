import { useMemo } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { STANDARDS, VEHICLES } from '../../utils/calculations';
import { VehicleType } from '../../types';

export function CargoParameters() {
  const totalWeight = useCalculatorStore((state) => state.totalWeight);
  const totalVolume = useCalculatorStore((state) => state.totalVolume);
  const vehicleType = useCalculatorStore((state) => state.vehicleType);
  const recommendedVehicleType = useCalculatorStore((state) => state.recommendedVehicleType);
  const vehicleCount = useCalculatorStore((state) => state.vehicleCount);
  const urgency = useCalculatorStore((state) => state.urgency);
  const setVehicleType = useCalculatorStore((state) => state.setVehicleType);
  const useRecommendedVehicle = useCalculatorStore((state) => state.useRecommendedVehicle);
  const setVehicleCount = useCalculatorStore((state) => state.setVehicleCount);
  const setUrgency = useCalculatorStore((state) => state.setUrgency);
  const activePreset = useCalculatorStore((state) => state.activePreset);
  const pallets = useCalculatorStore((state) => state.pallets);
  const moveType = useCalculatorStore((state) => state.moveType);

  const recommendedStandard = activePreset ? STANDARDS[activePreset] : null;

  // Filter vehicles per sub-screen
  const displayVehicles = useMemo(() => {
    if (moveType === 'apartment') {
      return ['gazelle7', 'gazelle12', 'gazelle18'] as VehicleType[];
    } else if (moveType === 'office') {
      return ['gazelle7', 'gazelle12', 'gazelle18', 'truck'] as VehicleType[];
    } else { // commercial
      return ['gazelle18', 'van5', 'van6', 'truck', 'refrigerator'] as VehicleType[];
    }
  }, [moveType]);

  const listTitle = useMemo(() => {
    if (moveType === 'apartment') return 'Газели для квартирного переезда (7 / 12 / 18 м³)';
    if (moveType === 'office') return 'Транспорт для офисного переезда (Газели или Фура)';
    return 'Коммерческий транспорт (Газель, Фургоны, Фура, Реф)';
  }, [moveType]);

  return (
    <section className="mb-6 rounded-3xl bg-white/60 p-4 ring-1 ring-black/5 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-800">🚚 Выбор транспорта</h2>
        {pallets.length > 0 && (
          <button onClick={useRecommendedVehicle} className="rounded-full bg-[#ff6b00] px-3 py-1 text-xs font-black text-white shadow ring-1 ring-[#ff6b00]/30 hover:bg-[#d35400]">
            Лучшая: {VEHICLES[recommendedVehicleType].shortLabel}
          </button>
        )}
      </div>

      {pallets.length > 0 && recommendedStandard && (
        <div className="mb-3 rounded-2xl bg-[#10131b] p-3 text-white ring-1 ring-white/10">
          <div className="text-xs font-black uppercase tracking-wide text-orange-300">Рекомендация под {recommendedStandard.label}</div>
          <div className="mt-1 text-sm font-bold">Стандартный объем {recommendedStandard.volumeM3} м³ · вес до {recommendedStandard.weightKg} кг · до 1500 кг на все газели</div>
          <div className="mt-1 text-xs text-slate-300">Автоподбор: {VEHICLES[recommendedStandard.recommendedVehicle].label} — {VEHICLES[recommendedStandard.recommendedVehicle].cargoLength}×{VEHICLES[recommendedStandard.recommendedVehicle].cargoWidth}×{VEHICLES[recommendedStandard.recommendedVehicle].cargoHeight} м</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/90 p-3 shadow-sm"><div className="text-xs font-bold uppercase tracking-wide text-gray-500">Вес сейчас</div><div className="mt-1 text-2xl font-black text-gray-900">{Math.round(totalWeight)} кг</div><div className="text-[11px] text-gray-500">лимит 1500 кг на газель</div></div>
        <div className="rounded-2xl bg-white/90 p-3 shadow-sm"><div className="text-xs font-bold uppercase tracking-wide text-gray-500">Объём сейчас</div><div className="mt-1 text-2xl font-black text-gray-900">{totalVolume.toFixed(1)} м³</div><div className="text-[11px] text-gray-500">{pallets.length} предметов</div></div>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs font-black uppercase tracking-wide text-[#d35400]">{listTitle}</div>
        <div className="grid grid-cols-1 gap-2">
          {displayVehicles.map((vehicle) => {
            const v = VEHICLES[vehicle];
            const isSelected = vehicleType === vehicle;
            const isReco = recommendedVehicleType === vehicle;
            return (
              <button key={vehicle} onClick={() => setVehicleType(vehicle)} className={`relative rounded-2xl border p-3 text-left transition ${isSelected ? 'border-[#ff6b00] bg-orange-50 text-[#9a3412] shadow-md' : 'border-gray-200 bg-white/70 text-gray-700 hover:border-orange-200'}`}>
                {pallets.length > 0 && isReco && <span className="absolute right-2 top-2 rounded-full bg-[#ff6b00] px-2 py-0.5 text-[10px] font-black text-white">★ рекомендуем</span>}
                <span className="block text-sm font-black">{v.label}</span>
                <span className="mt-1 block text-xs text-gray-600">кузов {v.cargoLength}×{v.cargoWidth}×{v.cargoHeight} м · {v.capacityM3} м³ · {v.capacityKg} кг · до {v.palletCapacity} паллет</span>
                <span className="mt-1 block text-[11px] text-gray-500">
                  {vehicle.startsWith('gazelle') 
                    ? `База: ГАЗель ${v.cargoLength}м=${v.capacityM3}м³ (${v.cargoLength}×${v.cargoWidth}×${v.cargoHeight})`
                    : `Фургон/Тяжеловоз: ${v.cargoLength}м=${v.capacityM3}м³ (${v.cargoLength}×${v.cargoWidth}×${v.cargoHeight})`
                  }
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm font-semibold text-gray-700">Машин<select className="input-field mt-2" value={vehicleCount} onChange={(event) => setVehicleCount(Number(event.target.value))}>{Array.from({ length: 10 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
        <label className="text-sm font-semibold text-gray-700">Срочность: {urgency === 1 ? 'Эконом' : urgency === 3 ? 'Экспресс' : 'Стандарт'}<input className="mt-5 w-full accent-[#ff6b00]" type="range" min="1" max="3" value={urgency} onChange={(event) => setUrgency(Number(event.target.value) as 1 | 2 | 3)} /></label>
      </div>
    </section>
  );
}
