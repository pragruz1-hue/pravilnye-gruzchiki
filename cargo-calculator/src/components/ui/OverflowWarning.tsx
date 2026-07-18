import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES } from '../../utils/calculations';

export function OverflowWarning() {
  const overflowCount = useCalculatorStore((s) => s.overflowCount);
  const overflowItems = useCalculatorStore((s) => s.overflowItems);
  const overflowWeight = useCalculatorStore((s) => s.overflowWeight);
  const overflowVolume = useCalculatorStore((s) => s.overflowVolume);
  const estimatedTrips = useCalculatorStore((s) => s.estimatedTrips);
  const vehicleType = useCalculatorStore((s) => s.vehicleType);
  const pallets = useCalculatorStore((s) => s.pallets);

  const show = overflowCount > 0 || (pallets.length > 0 && overflowCount === 0);
  if (!show) return null;

  const vehicle = VEHICLES[vehicleType];

  if (overflowCount > 0) {
    return (
      <section className="mb-4 animate-[fadeIn_0.25s_ease-out] rounded-3xl border-2 border-orange-400 bg-orange-50 p-4 shadow-xl">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm font-black text-white">⚠</span>
          <span className="text-sm font-black text-orange-900">Не все предметы поместились</span>
        </div>

        <div className="mb-3 rounded-2xl bg-white p-3 text-sm leading-relaxed text-gray-800 shadow-inner">
          <p className="mb-2 font-semibold">
            <span className="font-black text-orange-600">{overflowCount}</span> предмет{overflowCount === 1 ? '' : overflowCount < 5 ? 'а' : 'ов'} не помещают{overflowCount === 1 ? 'ется' : 'ся'} в выбранную машину <strong>{vehicle.label}</strong>.
            Для этого груза дополнительно потребуется ориентировочно <span className="font-black text-orange-600">{estimatedTrips} рейс{estimatedTrips === 1 ? '' : 'ов'}</span>.
          </p>
          <ul className="ml-4 list-disc space-y-1 text-xs text-gray-600">
            {overflowItems.slice(0, 8).map((item) => (
              <li key={item.id}>
                {item.name} — {Math.round(item.weight)} кг, {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height} м
              </li>
            ))}
            {overflowItems.length > 8 && (
              <li className="font-semibold text-orange-700">...и ещё {overflowItems.length - 8} предмет(ов)</li>
            )}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-orange-100 p-2 text-center">
              <span className="font-black text-orange-800">{overflowWeight} кг</span>
              <span className="block text-orange-600">вес не поместился</span>
            </div>
            <div className="rounded-xl bg-orange-100 p-2 text-center">
              <span className="font-black text-orange-800">{overflowVolume.toFixed(1)} м³</span>
              <span className="block text-orange-600">объём не поместился</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#10131b] p-3 text-xs leading-5 text-slate-300">
          <p className="font-black text-orange-300">💡 Что делать?</p>
          <ul className="mt-1 ml-4 list-disc space-y-1">
            <li>Выбрать машину побольше (18 м³, фургон 5-6 м или фуру 20 т)</li>
            <li>Разделить груз на несколько рейсов</li>
            <li>Оставить заявку — диспетчер подберёт оптимальный транспорт</li>
          </ul>
        </div>

        <div className="mt-3 rounded-2xl bg-blue-50 p-3 text-xs leading-5 text-blue-900 ring-1 ring-blue-200">
          <p className="font-black text-blue-800">📋 Предварительный расчёт</p>
          <p className="mt-1">
            Данный калькулятор является <strong>предварительным инструментом оценки</strong> загрузки кузова.
            Точное количество машин, их тип и финальную стоимость определяет <strong>диспетчер</strong> после согласования заказа —
            с учётом особенностей груза, маршрута, этажности, загруженности дорог и доступного парка
            автомобилей. Калькулятор помогает визуально спланировать размещение вещей, но не гарантирует
            стопроцентную вместимость.
          </p>
        </div>
      </section>
    );
  }

  // Все предметы поместились — показываем информационный блок
  if (pallets.length > 0 && overflowCount === 0) {
    return (
      <section className="mb-4 animate-[fadeIn_0.25s_ease-out] rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">✓</span>
          <span className="text-sm font-black text-emerald-900">Все предметы поместились в {vehicle.label}</span>
        </div>
        <div className="rounded-2xl bg-blue-50 p-3 text-[11px] leading-5 text-blue-900 ring-1 ring-blue-200">
          <span className="font-black">💡 Обратите внимание:</span> калькулятор показывает <strong>предварительную</strong> укладку.
          Итоговый подбор машины и количество рейсов определяет диспетчер при оформлении заказа.
          Реальная вместимость может отличаться от расчётной.
        </div>
      </section>
    );
  }

  return null;
}
