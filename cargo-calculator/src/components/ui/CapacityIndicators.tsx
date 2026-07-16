import { useCalculatorStore } from '../../store/useCalculatorStore';
import { getCapacity, VEHICLES } from '../../utils/calculations';

export function CapacityIndicators() {
  const pallets = useCalculatorStore((state) => state.pallets);
  const vehicleType = useCalculatorStore((state) => state.vehicleType);
  const selectedPalletId = useCalculatorStore((state) => state.selectedPalletId);
  const selectedIndex = pallets.findIndex((pallet) => pallet.id === selectedPalletId);
  const capacity = getCapacity({ pallets, vehicleType });
  const vehicle = VEHICLES[vehicleType];

  return (
    <div className="pointer-events-none absolute left-6 top-6 z-10 w-[min(440px,calc(100%-48px))] rounded-3xl border border-white/50 bg-white/80 p-4 shadow-glass backdrop-blur-glass">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black text-gray-900">Загрузка кузова</div>
          <div className="text-xs font-semibold text-gray-500">{vehicle.label} · выбрано: {selectedIndex >= 0 ? `P${selectedIndex + 1}` : 'нет'}</div>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white">R — поворот</div>
      </div>
      <Meter label="Объём" value={capacity.volumePercent} />
      <Meter label="Вес" value={capacity.weightPercent} />
      <Meter label="Паллеты" value={capacity.palletPercent} text={`${pallets.length}/${vehicle.palletCapacity}`} />
    </div>
  );
}

function Meter({ label, value, text }: { label: string; value: number; text?: string }) {
  const safe = Math.min(100, Math.max(0, value));
  const color = value > 100 ? 'bg-red-500' : value > 82 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500';
  return (
    <div className="mb-2 last:mb-0">
      <div className="mb-1 flex justify-between text-xs font-bold text-gray-600">
        <span>{label}</span>
        <span>{text ?? `${value}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}
