import { useCalculatorStore } from '../../store/useCalculatorStore';
import { getCapacity, VEHICLES } from '../../utils/calculations';

export function CapacityIndicators({ embedded = false }: { embedded?: boolean }) {
  const pallets = useCalculatorStore((state) => state.pallets);
  const vehicleType = useCalculatorStore((state) => state.vehicleType);
  const selectedPalletId = useCalculatorStore((state) => state.selectedPalletId);
  const selectedIndex = pallets.findIndex((pallet) => pallet.id === selectedPalletId);
  const capacity = getCapacity({ pallets, vehicleType });
  const vehicle = VEHICLES[vehicleType];

  const wrapperClass = embedded
    ? 'w-full rounded-2xl bg-transparent p-0'
    : 'pointer-events-none absolute left-6 top-6 z-10 w-[min(470px,calc(100%-48px))] rounded-3xl border border-white/50 bg-white/80 p-4 shadow-glass backdrop-blur-glass';

  return (
    <div className={wrapperClass}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black text-gray-900">Загрузка кузова</div>
          <div className="text-xs font-semibold text-gray-500">
            {vehicle.label} · выбрано: {selectedIndex >= 0 ? `#${selectedIndex + 1}` : 'нет'} · {pallets.length} объектов
          </div>
        </div>
        {!embedded && <div className="rounded-full bg-[#10131b] px-3 py-1 text-xs font-black text-white ring-2 ring-[#ff6b00]/60">Drag + XYZ</div>}
      </div>
      <Meter label="Объём" value={capacity.volumePercent} />
      <Meter label="Вес" value={capacity.weightPercent} />
      <Meter label="Высота" value={capacity.heightPercent} />
      <Meter label="Паллеты" value={capacity.palletPercent} text={`${pallets.filter((item) => item.kind === 'pallet').length}/${vehicle.palletCapacity}`} />
      {capacity.volumePercent > 100 && (
        <div className="mt-3 rounded-xl bg-red-50 p-2 text-xs font-bold text-red-600 ring-1 ring-red-200">
          ⚠️ Перегруз! Выбери машину больше — 18 м³ или очисти кузов
        </div>
      )}
    </div>
  );
}

function Meter({ label, value, text }: { label: string; value: number; text?: string }) {
  const safe = Math.min(100, Math.max(0, value));
  const color = value > 100 ? 'bg-red-500' : value > 82 ? 'bg-amber-500' : 'bg-gradient-to-r from-[#ff6b00] to-emerald-500';
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
