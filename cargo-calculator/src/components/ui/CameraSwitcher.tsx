import { CameraMode } from '../../types';
import { useCalculatorStore } from '../../store/useCalculatorStore';

const modes: { id: CameraMode; label: string; icon: string; hint: string }[] = [
  { id: 'overview', label: 'Обзор', icon: '🎮', hint: 'вид снаружи' },
  { id: 'inside', label: 'В кузове', icon: '📦', hint: 'изнутри кузова' },
  { id: 'cabin', label: 'От ворот', icon: '🚪', hint: 'от задних ворот — вид на загрузку' },
  { id: 'side', label: 'Сбоку', icon: '👁', hint: 'боковой вид' },
  { id: 'top', label: 'Сверху', icon: '🗺', hint: 'вид сверху' }
];

export function CameraSwitcher() {
  const cameraMode = useCalculatorStore((s) => s.cameraMode);
  const setCameraMode = useCalculatorStore((s) => s.setCameraMode);
  const isNightMode = useCalculatorStore((s) => s.isNightMode);
  const toggleNightMode = useCalculatorStore((s) => s.toggleNightMode);

  return (
    <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-6">
      <div className="flex items-center gap-1 rounded-full border border-white/20 bg-[#10131b]/85 p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setCameraMode(m.id)}
            className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black transition-all ${
              cameraMode === m.id
                ? 'bg-[#ff6b00] text-white shadow-lg scale-[1.05]'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
            title={m.hint}
          >
            <span>{m.icon}</span>
            <span className="hidden sm:inline">{m.label}</span>
            {cameraMode === m.id && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />}
          </button>
        ))}
        <div className="mx-1 h-6 w-px bg-white/15" />
        <button
          onClick={toggleNightMode}
          className={`rounded-full px-3 py-2 text-xs font-black transition ${
            isNightMode ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-900 hover:bg-gray-100'
          }`}
          title="День / Ночь"
        >
          {isNightMode ? '🌙 Ночь' : '☀️ День'}
        </button>
      </div>
      <div className="hidden rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold text-white/70 backdrop-blur md:block">
        ЛКМ — выбрать · Drag — переместить · колесо — zoom · XYZ gizmo — точное перемещение · От ворот — LMB drag для осмотра
      </div>
    </div>
  );
}

export function DayNightBadge() {
  const isNightMode = useCalculatorStore((s) => s.isNightMode);
  const vehicleType = useCalculatorStore((s) => s.vehicleType);
  const pallets = useCalculatorStore((s) => s.pallets);
  if (pallets.length === 0) return null;
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-col gap-2 md:hidden">
      <div className="rounded-full bg-[#10131b]/80 px-3 py-1.5 text-[11px] font-black text-orange-200 ring-1 ring-orange-500/30 backdrop-blur">
        {isNightMode ? '🌙 Освещение в кузове ВКЛ' : '💡 Лампы горят'} · {vehicleType}
      </div>
    </div>
  );
}
