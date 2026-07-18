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
  const [copied, setCopied] = useState(false);

  const cog = computeCenterOfGravity(pallets);
  const axle = computeAxleLoads(pallets, vehicleType);

  function handleShare() {
    const payload = generateSharePayload(pallets, vehicleType);
    const url = `${window.location.origin}${window.location.pathname}?share=${payload}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Шаринг как игра — звук
    try { (window as any).pgPlaySound?.('click'); if (navigator.vibrate) navigator.vibrate(40); } catch {}
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
      (window as any).pgPlaySound?.('snap');
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
      // Скопируем JSON в консоль сайта
      localStorage.setItem('pg_cargo_final_payload', JSON.stringify(message));
      alert('Расчет отправлен на сайт (postMessage + localStorage). Менеджер увидит данные в pg_cargo_final_payload.');
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

      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleShare} className="rounded-2xl bg-[#10131b] px-3 py-3 text-xs font-black text-white shadow hover:bg-black">
          {copied ? '✅ Скопировано!' : '🔗 Поделиться ссылкой'}
        </button>
        <button onClick={handleScreenshot} className="rounded-2xl bg-white px-3 py-3 text-xs font-black text-gray-800 ring-1 ring-black/10 hover:bg-gray-50">
          📸 Скриншот 3D
        </button>
        <button onClick={handleSendToSite} className="col-span-2 rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#d35400] px-3 py-3 text-sm font-black text-white shadow hover:opacity-90">
          📨 Отправить расчет менеджеру (postMessage)
        </button>
      </div>

      {useCalculatorStore((s) => s.overflowCount) > 0 && (
        <div className="rounded-[20px] border-2 border-orange-400 bg-orange-50 p-3 text-xs leading-5 text-orange-900 shadow-sm">
          <div className="mb-1 font-black">⚠️ Не все предметы поместились</div>
          <p>{useCalculatorStore((s) => s.overflowCount)} предм. ({Math.round(useCalculatorStore((s) => s.overflowWeight))} кг) — не влезли в {vehicle.label}</p>
          <p className="font-bold text-orange-700">~{useCalculatorStore((s) => s.estimatedTrips)} рейс{(useCalculatorStore((s) => s.estimatedTrips)) === 1 ? '' : 'ов'}. Точное количество определит диспетчер.</p>
        </div>
      )}

      {pallets.length > 0 && (
        <div className={`rounded-[20px] p-3 text-xs ${isNightMode ? 'bg-orange-500/10 text-orange-200 ring-1 ring-orange-500/20' : 'bg-orange-50 text-orange-900 ring-1 ring-orange-200'}`}>
          <div className="font-black">💡 Что нового (инженерное):</div>
          <ul className="mt-1 list-disc pl-4 font-semibold leading-5">
            <li>COG красный шарик + линия до пола</li>
            <li>Нагрузка на оси, дисбаланс &gt;30% красный</li>
            <li>Проверка двери: если не лезет — бейдж над предметом</li>
            <li>Рулетка: расстояние до стен для выбранного</li>
            <li>Мини-карта топ-вид, клик выбирает</li>
            <li>WASD + Q/E + Shift ходьба внутри, коллизия со стенами</li>
            <li>Магнит к стенам 6см, snap звук, вибрация</li>
            <li>Undo/Redo, persist в localStorage, share ?share=</li>
            <li>Скриншот сохраняет canvas.toDataURL в PNG и в PDF попадет</li>
          </ul>
        </div>
      )}

      {pallets.length === 0 && (
        <div className={`rounded-[20px] p-4 text-center ${isNightMode ? 'bg-white/5 text-white/70' : 'bg-slate-50 text-slate-600'}`}>
          <div className="text-3xl">📦</div>
          <div className="mt-2 text-sm font-black">Кузов пустой</div>
          <div className="mt-1 text-xs leading-5">Выбери пресет квартиры (7 / 12 / 18 м³) или добавь мебель. Машина подберется автоматически. Все газели до 1500 кг.</div>
        </div>
      )}
    </aside>
  );
}
