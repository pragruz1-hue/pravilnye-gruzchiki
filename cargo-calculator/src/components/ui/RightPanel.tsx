import { useCalculatorStore } from '../../store/useCalculatorStore';
import { CapacityIndicators } from './CapacityIndicators';
import { PriceDisplay } from './PriceDisplay';
import { VEHICLES, computeCenterOfGravity, computeAxleLoads, generateSharePayload } from '../../utils/calculations';
import { useState } from 'react';

export function RightPanel() {
  const pallets = useCalculatorStore((s) => s.pallets);
  const vehicleType = useCalculatorStore((s) => s.vehicleType);
  const vehicle = VEHICLES[vehicleType];
  const isNightMode = useCalculatorStore((s) => s.isNightMode);
  const totalWeight = useCalculatorStore((s) => s.totalWeight);
  const totalVolume = useCalculatorStore((s) => s.totalVolume);
  const selectPallet = useCalculatorStore((s) => s.selectPallet);
  const removePallet = useCalculatorStore((s) => s.removePallet);
  const selectedPalletId = useCalculatorStore((s) => s.selectedPalletId);
  const [copied, setCopied] = useState(false);

  const cog = computeCenterOfGravity(pallets);
  const axle = computeAxleLoads(pallets, vehicleType);

  function handleShare() {
    const payload = generateSharePayload(pallets, vehicleType);
    const url = `${window.location.origin}${window.location.pathname}?share=${payload}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    try { window.pgPlaySound?.('click'); if (navigator.vibrate) navigator.vibrate(40); } catch {}
  }

  function handleScreenshot() {
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `cargo-${vehicleType}-${pallets.length}items.png`;
      a.click();
      window.pgPlaySound?.('snap');
    } catch {}
  }

  function handleSendToSite() {
    try {
      const message = {
        type: 'cargo-calculation-final',
        vehicle: vehicle.label,
        volume: totalVolume,
        weight: totalWeight,
        count: pallets.length,
        pallets: pallets.map(p => ({ name: p.name, weight: p.weight, size: `${p.dimensions.length}x${p.dimensions.width}x${p.dimensions.height}` })),
        share: generateSharePayload(pallets, vehicleType)
      };
      window.parent?.postMessage(message, '*');
      localStorage.setItem('pg_cargo_final_payload', JSON.stringify(message));
      alert('Расчёт отправлен. Менеджер увидит данные при оформлении заявки.');
    } catch {}
  }

  return (
    <aside className={`flex h-full w-full flex-col gap-3 overflow-y-auto p-3 ${isNightMode ? 'bg-[#0f121a]/90' : 'bg-white/70'} backdrop-blur-xl`}>
      <div className={`rounded-[20px] p-4 ${isNightMode ? 'bg-white/5 ring-1 ring-white/10' : 'bg-white/90 shadow-sm ring-1 ring-black/5'}`}>
        <div className="mb-2 flex items-center justify-between">
          <div className={`text-sm font-black ${isNightMode ? 'text-white' : 'text-gray-900'}`}>{isNightMode ? '🌙 Ночь' : '☀️ День'} · {vehicle.label}</div>
          <div className="text-[11px] font-bold text-gray-500">{vehicle.cargoLength}×{vehicle.cargoWidth}×{vehicle.cargoHeight} м · {vehicle.capacityM3} м³</div>
        </div>
        <CapacityIndicators embedded />
        {pallets.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-xl bg-slate-900 p-2 text-white">
              <div className="font-black text-orange-300">🔴 Центр тяжести</div>
              <div className="mt-1 leading-4">X {cog.x.toFixed(2)}м<br/>Y {cog.y.toFixed(2)}м<br/>Z {cog.z.toFixed(2)}м<br/>{cog.weight.toFixed(0)}кг</div>
            </div>
            <div className={`rounded-xl p-2 ${axle.isOverloadedFront || axle.isOverloadedRear ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}>
              <div className="font-black">⚖️ Оси</div>
              <div className="mt-1 leading-4">Перед {axle.frontKg}кг<br/>Зад {axle.rearKg}кг<br/>{axle.imbalancePercent}% дисбаланс<br/>{axle.isOverloadedFront || axle.isOverloadedRear ? '⚠️ Перегруз!' : '✅ Ок'}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1">
        <PriceDisplay embedded />
      </div>

      {/* === ПРЕМИУМ БЛОК ДЕЙСТВИЙ === */}
      <div className={`rounded-3xl p-4 ${isNightMode ? 'bg-white/5 ring-1 ring-white/10' : 'bg-white/95 shadow-sm ring-1 ring-black/5'}`}>
        <div className="mb-3 text-[10px] font-black uppercase tracking-[1px] text-orange-500/80">
          Действия с расчётом
        </div>

        <div className="space-y-2.5">
          {/* Кнопка "Скопировать ссылку" — полная ширина */}
          <button
            onClick={handleShare}
            className={`group flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-black transition-all active:scale-[0.985] ${
              copied 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : isNightMode 
                  ? 'bg-[#10131b] text-white hover:bg-black ring-1 ring-white/10' 
                  : 'bg-slate-900 text-white hover:bg-black shadow-md'
            }`}
          >
            <span className="text-lg transition-transform group-active:scale-110">
              {copied ? '✅' : '🔗'}
            </span>
            <span>
              {copied ? 'Ссылка скопирована!' : 'Скопировать ссылку на расстановку'}
            </span>
          </button>

          {/* Две премиальные кнопки рядом */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Скриншот */}
            <button
              onClick={handleScreenshot}
              className={`group flex flex-col items-center justify-center gap-1.5 rounded-2xl px-4 py-3.5 text-xs font-black transition-all active:scale-[0.985] ${
                isNightMode 
                  ? 'bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10' 
                  : 'bg-white text-gray-900 ring-1 ring-black/10 shadow-sm hover:bg-gray-50'
              }`}
            >
              <span className="text-xl transition-transform group-active:scale-110">📸</span>
              <span>Скриншот 3D</span>
            </button>

            {/* Отправить менеджеру */}
            <button
              onClick={handleSendToSite}
              className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-br from-[#ff6b00] via-[#ff6b00] to-[#d35400] px-4 py-3.5 text-xs font-black text-white shadow-lg transition-all active:scale-[0.985] hover:brightness-110"
            >
              <span className="text-xl transition-transform group-active:scale-110">📨</span>
              <span>Отправить менеджеру</span>
            </button>
          </div>
        </div>
      </div>

      {pallets.length > 0 && (
        <details className={`rounded-[20px] p-3 text-xs ${isNightMode ? 'bg-white/5 text-white ring-1 ring-white/10' : 'bg-white/90 shadow-sm ring-1 ring-black/5'}`}>
          <summary className="cursor-pointer text-sm font-black flex items-center justify-between">
            <span>📋 Спецификация предметов ({pallets.length})</span>
            <span className="text-[11px] font-bold text-orange-400">{Math.round(totalWeight)} кг · {Math.round(totalVolume * 100) / 100} м³</span>
          </summary>
          <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
            {pallets.map((item, index) => {
              const vol = Math.round(item.dimensions.length * item.dimensions.width * item.dimensions.height * 100) / 100;
              return (
                <div key={item.id} className={`flex items-center justify-between gap-2 rounded-xl p-2.5 ${selectedPalletId === item.id ? 'bg-orange-500/20 ring-1 ring-orange-500' : isNightMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <button className="text-left flex-1" onClick={() => selectPallet(item.id)}>
                    <div className="font-black">#{index + 1} {item.name}</div>
                    <div className="text-[10px] opacity-75">{item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height} м · {vol} м³ · {Math.round(item.weight)} кг</div>
                  </button>
                  <button className="rounded-lg bg-red-500/20 px-2.5 py-1 font-bold text-red-400 hover:bg-red-500/30" onClick={() => removePallet(item.id)}>✕</button>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {useCalculatorStore((s) => s.overflowCount) > 0 && (
        <div className="rounded-full border border-orange-400 bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700 shadow-sm">
          ⚠️ {useCalculatorStore((s) => s.overflowCount)} не влез{useCalculatorStore((s) => s.overflowCount) === 1 ? 'ло' : 'ли'} · подробнее в левой панели
        </div>
      )}

      {pallets.length > 0 && (
        <div className={`rounded-[20px] p-3 text-xs ${isNightMode ? 'bg-orange-500/10 text-orange-200 ring-1 ring-orange-500/20' : 'bg-orange-50 text-orange-900 ring-1 ring-orange-200'}`}>
          <div className="font-black">💡 Подсказки:</div>
          <ul className="mt-1 list-disc pl-4 font-semibold leading-5">
            <li>Красный шарик — центр тяжести, следите за нагрузкой на оси</li>
            <li>Если предмет не проходит в дверь — появится предупреждение</li>
            <li>Перетаскивайте предметы мышью, кнопки ↩️ ↪️ отменяют действия</li>
            <li>Кнопка «Автозаполнить» над 3D-видом дозаполнит пустоты коробками</li>
          </ul>
        </div>
      )}

      {pallets.length === 0 && (
        <div className={`rounded-[20px] p-4 text-center ${isNightMode ? 'bg-white/5 text-white/70' : 'bg-slate-50 text-slate-600'}`}>
          <div className="text-3xl">📦</div>
          <div className="mt-2 text-sm font-black">Кузов пустой</div>
          <div className="mt-1 text-xs leading-5">Выбери пресет квартиры или офиса слева, либо добавь вещи вручную. Машина подберется автоматически. Все газели до 1500 кг.</div>
        </div>
      )}
    </aside>
  );
}
