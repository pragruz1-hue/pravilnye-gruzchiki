import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES, orientedFootprint } from '../../utils/calculations';
import { useRef } from 'react';

export function MiniMap() {
  const pallets = useCalculatorStore((s) => s.pallets);
  const vehicleType = useCalculatorStore((s) => s.vehicleType);
  const selectedId = useCalculatorStore((s) => s.selectedPalletId);
  const selectPallet = useCalculatorStore((s) => s.selectPallet);
  const showMinimap = useCalculatorStore((s) => s.showMinimap);
  const toggleMinimap = useCalculatorStore((s) => s.toggleMinimap);

  const vehicle = VEHICLES[vehicleType];
  const L = vehicle.cargoLength;
  const W = vehicle.cargoWidth;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!showMinimap) {
    return (
      <button onClick={toggleMinimap} className="absolute left-4 top-[88px] z-20 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-gray-700 shadow backdrop-blur">🗺 Карта</button>
    );
  }

  const scale = 120 / Math.max(L, W); // 120px max

  return (
    <div className="absolute left-4 top-[88px] z-20 w-[160px] rounded-2xl border border-white/30 bg-white/90 p-2 shadow-xl backdrop-blur">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-black text-gray-700">🗺 Топ-вид {L}×{W}м</span>
        <button onClick={toggleMinimap} className="text-[11px] font-bold text-gray-400">✕</button>
      </div>
      <div className="relative mx-auto overflow-hidden rounded-lg border border-gray-300 bg-slate-100" style={{ width: L * scale + 20, height: W * scale + 20 }}>
        {/* Кузов */}
        <div className="absolute left-[10px] top-[10px] border-2 border-orange-400 bg-white" style={{ width: L * scale, height: W * scale }} />
        {/* Предметы */}
        {pallets.map((item) => {
          const fp = orientedFootprint(item as any);
          const x = ((item.position[0] + L / 2 - fp.length / 2) / L) * (L * scale);
          const z = ((item.position[2] + W / 2 - fp.width / 2) / W) * (W * scale);
          const w = (fp.length / L) * (L * scale);
          const h = (fp.width / W) * (W * scale);
          const isSel = item.id === selectedId;
          return (
            <div
              key={item.id}
              onClick={() => selectPallet(item.id)}
              className={`absolute cursor-pointer rounded-[2px] border text-[8px] font-black leading-none ${isSel ? 'bg-orange-500 border-orange-700 text-white z-10' : 'bg-blue-400 border-blue-600 text-white'}`}
              style={{ left: 10 + x, top: 10 + z, width: Math.max(6, w), height: Math.max(6, h) }}
              title={`${item.name} ${item.weight}кг`}
            />
          );
        })}
        {/* Центр тяжести */}
        {/* Можно добавить COG точкой */}
      </div>
      <div className="mt-1 text-[9px] leading-3 text-gray-500">Клик — выбрать. Магнит к стенам 6см. Перегруз по осям показывается красным в 3D.</div>
    </div>
  );
}
