import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES } from '../../utils/calculations';

export function AutoFillButton() {
  const pallets = useCalculatorStore((s) => s.pallets);
  const vehicleType = useCalculatorStore((s) => s.vehicleType);
  const totalVolume = useCalculatorStore((s) => s.totalVolume);
  const totalWeight = useCalculatorStore((s) => s.totalWeight);
  const fillEmptySpace = useCalculatorStore((s) => s.fillEmptySpace);

  const vehicle = VEHICLES[vehicleType];
  const freeVolumePercent = Math.max(0, Math.round(100 - (totalVolume / vehicle.capacityM3) * 100));
  const freeWeightPercent = Math.max(0, Math.round(100 - (totalWeight / vehicle.capacityKg) * 100));
  const freePercent = Math.min(freeVolumePercent, freeWeightPercent);
  const disabled = pallets.length === 0 || freePercent < 3;

  const label = pallets.length === 0
    ? 'Добавьте предметы — затем заполните пустоты'
    : freePercent < 3
      ? 'Кузов заполнен'
      : `Автозаполнить пустоты · свободно ~${freePercent}%`;

  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 flex-col items-center md:top-4">
      <button
        onClick={fillEmptySpace}
        disabled={disabled}
        title={label}
        className={`pointer-events-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black shadow-xl ring-1 transition-all ${
          disabled
            ? 'cursor-not-allowed bg-[#10131b]/70 text-white/50 ring-white/10'
            : 'bg-gradient-to-r from-[#ff6b00] to-[#ff8c3a] text-white ring-orange-300/50 hover:scale-105 hover:shadow-orange-500/40 active:scale-95'
        }`}
      >
        <span className="text-base">📦</span>
        <span>Автозаполнить</span>
        {!disabled && <span className="rounded-full bg-white/25 px-2 py-0.5 text-[11px]">{freePercent}%</span>}
      </button>
      {!disabled && (
        <span className="mt-1 hidden rounded-full bg-black/55 px-3 py-0.5 text-[10px] font-bold text-white/75 backdrop-blur md:block">
          дозаполнит кузов коробками до предела
        </span>
      )}
    </div>
  );
}
