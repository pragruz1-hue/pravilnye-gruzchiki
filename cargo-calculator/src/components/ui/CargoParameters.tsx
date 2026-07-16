import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES } from '../../utils/calculations';
import { VehicleType } from '../../types';

const vehicles: VehicleType[] = ['gazelle', 'medium', 'truck', 'refrigerator'];

export function CargoParameters() {
  const totalWeight = useCalculatorStore((state) => state.totalWeight);
  const totalVolume = useCalculatorStore((state) => state.totalVolume);
  const vehicleType = useCalculatorStore((state) => state.vehicleType);
  const vehicleCount = useCalculatorStore((state) => state.vehicleCount);
  const urgency = useCalculatorStore((state) => state.urgency);
  const setVehicleType = useCalculatorStore((state) => state.setVehicleType);
  const setVehicleCount = useCalculatorStore((state) => state.setVehicleCount);
  const setUrgency = useCalculatorStore((state) => state.setUrgency);

  return (
    <section className="mb-6 rounded-3xl bg-white/55 p-4 ring-1 ring-black/5">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">🚚 Транспорт и груз</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Вес</div>
          <div className="mt-1 text-2xl font-black text-gray-900">{Math.round(totalWeight)} кг</div>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Объём</div>
          <div className="mt-1 text-2xl font-black text-gray-900">{totalVolume.toFixed(1)} м³</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle}
            onClick={() => setVehicleType(vehicle)}
            className={`rounded-2xl border p-3 text-left transition ${
              vehicleType === vehicle
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                : 'border-gray-200 bg-white/60 text-gray-700 hover:border-blue-200'
            }`}
          >
            <span className="block text-sm font-black">{VEHICLES[vehicle].label}</span>
            <span className="mt-1 block text-xs text-gray-500">{VEHICLES[vehicle].palletCapacity} паллет · {VEHICLES[vehicle].capacityKg} кг</span>
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm font-semibold text-gray-700">
          Количество машин
          <select className="input-field mt-2" value={vehicleCount} onChange={(event) => setVehicleCount(Number(event.target.value))}>
            {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Срочность: {urgency === 1 ? 'Эконом' : urgency === 3 ? 'Экспресс' : 'Стандарт'}
          <input
            className="mt-5 w-full accent-blue-600"
            type="range"
            min="1"
            max="3"
            value={urgency}
            onChange={(event) => setUrgency(Number(event.target.value) as 1 | 2 | 3)}
          />
        </label>
      </div>
    </section>
  );
}
