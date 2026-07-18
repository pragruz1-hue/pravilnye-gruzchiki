import { useState, useEffect } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { TRIP_RANGE_INFO } from '../../utils/calculations';

export function RouteInputs() {
  const from = useCalculatorStore((state) => state.from);
  const to = useCalculatorStore((state) => state.to);
  const distance = useCalculatorStore((state) => state.distance);
  const tripRange = useCalculatorStore((state) => state.tripRange);
  const setRoute = useCalculatorStore((state) => state.setRoute);

  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);

  // Sync state with store updates (like resets)
  useEffect(() => {
    setLocalFrom(from);
    setLocalTo(to);
  }, [from, to]);

  const isCityMove = from.trim().toLowerCase() === to.trim().toLowerCase();

  function applyRoute(nextFrom = localFrom, nextTo = localTo) {
    setLocalFrom(nextFrom);
    setLocalTo(nextTo);
    setRoute(nextFrom, nextTo);
  }

  function handleSelectCityMove() {
    const city = localFrom || 'Краснодар';
    setLocalFrom(city);
    setLocalTo(city);
    setRoute(city, city);
  }

  function handleSelectIntercityMove() {
    const cityFrom = localFrom || 'Краснодар';
    const cityTo = localTo === localFrom ? 'Сочи' : localTo || 'Сочи';
    setLocalFrom(cityFrom);
    setLocalTo(cityTo);
    setRoute(cityFrom, cityTo);
  }

  const rangeInfo = TRIP_RANGE_INFO[tripRange];

  return (
    <section className="mb-6 rounded-3xl bg-white/55 p-4 ring-1 ring-black/5">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">📍 Настройка маршрута</h2>
      
      {/* City vs Intercity toggle */}
      <div className="mb-4 flex rounded-2xl bg-slate-100 p-1 ring-1 ring-black/5">
        <button
          type="button"
          onClick={handleSelectCityMove}
          className={`flex-1 rounded-xl py-2 text-center text-xs font-black transition-all ${
            isCityMove
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          🏙️ Внутри города
        </button>
        <button
          type="button"
          onClick={handleSelectIntercityMove}
          className={`flex-1 rounded-xl py-2 text-center text-xs font-black transition-all ${
            !isCityMove
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          🛣️ Межгород
        </button>
      </div>

      {isCityMove ? (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Город переезда
            <input
              className="input-field mt-2"
              value={localFrom}
              onChange={(event) => {
                const val = event.target.value;
                setLocalFrom(val);
                setLocalTo(val);
              }}
              onBlur={() => {
                const val = localFrom || 'Краснодар';
                setLocalFrom(val);
                setLocalTo(val);
                setRoute(val, val);
              }}
              placeholder="Введите город (например, Краснодар)"
            />
          </label>
          <div className="mt-2 text-xs font-bold leading-relaxed text-blue-700">
            ✅ Тариф внутри города: почасовая оплата работы грузчиков и машины. Минималка включена, без наценки за километраж.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_48px_1fr] gap-3">
          <label className="block text-sm font-semibold text-gray-700">
            Откуда
            <input
              className="input-field mt-2"
              value={localFrom}
              onChange={(event) => setLocalFrom(event.target.value)}
              onBlur={() => applyRoute()}
              placeholder="Город отправления"
            />
          </label>
          <button
            type="button"
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
              placeholder="Город назначения"
            />
          </label>
        </div>
      )}

      {!isCityMove && (
        <div className="mt-3 rounded-2xl bg-slate-900/90 px-4 py-3 text-sm font-bold text-white flex justify-between items-center">
          <span>Расстояние:</span>
          <span className="text-blue-200 font-black">{distance.toLocaleString('ru-RU')} км</span>
        </div>
      )}

      <div className="mt-2 rounded-2xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-800 ring-1 ring-blue-100" title={rangeInfo.description}>
        {rangeInfo.icon} {rangeInfo.label} переезд · {rangeInfo.tariffLabel}
      </div>
    </section>
  );
}
