import { useState } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';

export function RouteInputs() {
  const from = useCalculatorStore((state) => state.from);
  const to = useCalculatorStore((state) => state.to);
  const distance = useCalculatorStore((state) => state.distance);
  const setRoute = useCalculatorStore((state) => state.setRoute);
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);

  function applyRoute(nextFrom = localFrom, nextTo = localTo) {
    setLocalFrom(nextFrom);
    setLocalTo(nextTo);
    setRoute(nextFrom, nextTo);
  }

  return (
    <section className="mb-6 rounded-3xl bg-white/55 p-4 ring-1 ring-black/5">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">📍 Маршрут</h2>
      <div className="grid grid-cols-[1fr_48px_1fr] gap-3">
        <label className="block text-sm font-semibold text-gray-700">
          Откуда
          <input
            className="input-field mt-2"
            value={localFrom}
            onChange={(event) => setLocalFrom(event.target.value)}
            onBlur={() => applyRoute()}
            placeholder="Введите город отправления"
          />
        </label>
        <button
          className="mt-7 h-12 rounded-2xl bg-blue-100 text-xl font-black text-blue-600 transition hover:bg-blue-200"
          onClick={() => applyRoute(localTo, localFrom)}
          aria-label="Поменять местами"
        >
          ⇄
        </button>
        <label className="block text-sm font-semibold text-gray-700">
          Куда
          <input
            className="input-field mt-2"
            value={localTo}
            onChange={(event) => setLocalTo(event.target.value)}
            onBlur={() => applyRoute()}
            placeholder="Введите город назначения"
          />
        </label>
      </div>
      <div className="mt-3 rounded-2xl bg-slate-900/90 px-4 py-3 text-sm font-bold text-white">
        Расстояние: <span className="text-blue-200">{distance.toLocaleString('ru-RU')} км</span>
      </div>
    </section>
  );
}
