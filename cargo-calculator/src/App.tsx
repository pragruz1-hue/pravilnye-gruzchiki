import { useState } from 'react';
import { Scene } from './components/3d/Scene';
import { LeftPanel } from './components/ui/LeftPanel';
import { RightPanel } from './components/ui/RightPanel';
import { CameraSwitcher, DayNightBadge } from './components/ui/CameraSwitcher';
import { MiniMap } from './components/ui/MiniMap';
import { useCalculatorStore } from './store/useCalculatorStore';

function App() {
  const isNightMode = useCalculatorStore((s) => s.isNightMode);
  const pallets = useCalculatorStore((s) => s.pallets);
  const history = useCalculatorStore((s) => s.history);
  const future = useCalculatorStore((s) => s.future);
  const undo = useCalculatorStore((s) => s.undo);
  const redo = useCalculatorStore((s) => s.redo);
  const isFirstPerson = useCalculatorStore((s) => s.isFirstPerson);
  const setFirstPerson = useCalculatorStore((s) => s.setFirstPerson);
  const showMinimap = useCalculatorStore((s) => s.showMinimap);
  const showMeasurements = useCalculatorStore((s) => s.showMeasurements);
  const toggleMinimap = useCalculatorStore((s) => s.toggleMinimap);
  const toggleMeasurements = useCalculatorStore((s) => s.toggleMeasurements);
  const isSoundEnabled = useCalculatorStore((s) => s.isSoundEnabled);
  const toggleSound = useCalculatorStore((s) => s.toggleSound);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  return (
    <div className={`min-h-screen w-screen overflow-hidden text-gray-950 transition-colors duration-700 ${isNightMode ? 'bg-[#070a14]' : 'bg-gradient-to-br from-[#07090e] via-[#111827] to-[#e9ecef]'}`}>
      <div className="fixed inset-0">
        {isNightMode ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,0,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.22),transparent_40%),linear-gradient(180deg,#0b0e1a_0%,#111827_60%,#0f172a_100%)]" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,107,0,0.22),transparent_34%),radial-gradient(circle_at_84%_18%,rgba(37,99,235,0.16),transparent_34%)]" />
        )}
      </div>

      {/* Top toolbar — engineering */}
      <div className="relative z-30 hidden items-center justify-between gap-2 p-3 md:flex">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#ff6b00] text-sm font-black text-white shadow">ПГ</div>
          <div className="leading-none">
            <div className="text-[10px] font-black tracking-widest text-orange-300">ПРАВИЛЬНЫЕ ГРУЗЧИКИ</div>
            <div className="text-sm font-black text-white">3D Калькулятор v2 — инженерный</div>
          </div>
          <div className="ml-4 flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur">
            <button onClick={undo} disabled={history.length===0} className="rounded-full bg-white px-3 py-1 text-xs font-black disabled:opacity-30">↩️ Undo</button>
            <button onClick={redo} disabled={future.length===0} className="rounded-full bg-white px-3 py-1 text-xs font-black disabled:opacity-30">↪️ Redo</button>
            <button onClick={()=>setFirstPerson(!isFirstPerson)} className={`rounded-full px-3 py-1 text-xs font-black ${isFirstPerson ? 'bg-[#ff6b00] text-white' : 'bg-white text-gray-700'}`}>🎮 {isFirstPerson ? 'WASD ВКЛ' : 'WASD'}</button>
            <button onClick={toggleMinimap} className={`rounded-full px-3 py-1 text-xs font-black ${showMinimap ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700'}`}>🗺 Карта</button>
            <button onClick={toggleMeasurements} className={`rounded-full px-3 py-1 text-xs font-black ${showMeasurements ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}>📏 Рулетка</button>
            <button onClick={toggleSound} className={`rounded-full px-3 py-1 text-xs font-black ${isSoundEnabled ? 'bg-white text-gray-700' : 'bg-gray-200 text-gray-500'}`}>{isSoundEnabled ? '🔊 Звук' : '🔇 Тихо'}</button>
          </div>
        </div>
        <div className="text-[11px] font-bold text-white/60">WASD ходьба внутри кузова · 1-5 камеры · Shift быстрее · Q/E вверх/вниз · Магнит к стенам 6см · COG красный · Оси</div>
      </div>

      {/* Mobile top bar */}
      <div className="relative z-30 flex items-center justify-between gap-2 p-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#ff6b00] text-sm font-black text-white shadow">ПГ</div>
          <div className="leading-none">
            <div className="text-[10px] font-black tracking-widest text-orange-300">ПРАВИЛЬНЫЕ</div>
            <div className="text-sm font-black text-white">ГРУЗЧИКИ · 3D</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowLeft(!showLeft)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-gray-900 shadow">
            {showLeft ? '✕' : '☰'} Инвентарь {pallets.length > 0 ? `· ${pallets.length}` : ''}
          </button>
          <button onClick={() => setShowRight(!showRight)} className="rounded-full bg-[#10131b] px-3 py-2 text-xs font-black text-white ring-1 ring-white/20">
            💰 Цена
          </button>
        </div>
      </div>

      <div className="relative flex h-[calc(100vh-56px)] flex-col gap-3 p-3 md:h-[calc(100vh-52px)] md:flex-row md:gap-4 md:p-4">
        <div className={`${showLeft ? 'flex' : 'hidden'} fixed inset-0 z-40 flex-col bg-[#0f121a]/95 p-3 backdrop-blur-xl md:static md:flex md:w-[420px] md:bg-transparent md:p-0`}>
          <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/90 shadow-2xl backdrop-blur-xl md:rounded-[28px]">
            <div className="flex items-center justify-between border-b border-black/5 p-4 md:hidden">
              <span className="font-black">Инвентарь и пресеты</span>
              <button onClick={() => setShowLeft(false)} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold">✕ закрыть</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <LeftPanel />
            </div>
          </div>
        </div>

        <main className="relative flex min-h-[58vh] flex-1 flex-col overflow-hidden rounded-[24px] border border-white/20 bg-white/40 shadow-glass backdrop-blur-glass md:min-h-0 md:rounded-[32px]">
          <Scene />
          <CameraSwitcher />
          <DayNightBadge />
          <MiniMap />
          {isFirstPerson && (
            <div className="pointer-events-none absolute bottom-[88px] left-4 z-20 rounded-full bg-black/70 px-3 py-1 text-[11px] font-black text-white backdrop-blur">🎮 WASD ходьба · Shift бег · Q/E высота · Коллизия со стенами · Клик по предмету всё ещё работает</div>
          )}
          <div className="pointer-events-none absolute right-4 top-4 hidden rounded-full bg-[#10131b]/80 px-4 py-2 text-xs font-black text-white backdrop-blur-md ring-1 ring-white/10 md:block">
            🎮 Drag ≠ камера · 📏 рулетка · 🔴 COG · 🚪 дверь · 🗺 мини-карта · 🔊 звук · history {history.length}
          </div>
          {pallets.length === 0 && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-[92%] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-white/40 bg-white/90 p-5 text-center shadow-2xl backdrop-blur-xl">
              <div className="text-4xl">🚚</div>
              <div className="mt-2 text-lg font-black text-gray-900">Кузов пустой — начни с квартиры</div>
              <div className="mt-2 text-sm leading-6 text-gray-600">
                Выбери <b>1к.к. / 2к.к. / 3к.к.</b> → автоматом <b>7 м³</b> (3.0×1.8×1.3), <b>12 м³</b> (3.2×1.9×2.0), <b>18 м³</b> (4.2×2.0×2.15). Все до 1500 кг. Внутри — лампы, COG, нагрузка на оси, дверь, рулетка, карта, WASD, звук, undo, share.
              </div>
            </div>
          )}
        </main>

        <div className={`${showRight ? 'flex' : 'hidden'} fixed inset-0 z-40 flex-col bg-[#0f121a]/95 p-3 backdrop-blur-xl md:static md:flex md:w-[380px] md:bg-transparent md:p-0`}>
          <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/90 shadow-2xl backdrop-blur-xl md:rounded-[28px]">
            <div className="flex items-center justify-between border-b border-black/5 p-4 md:hidden">
              <span className="font-black">Загрузка и цена</span>
              <button onClick={() => setShowRight(false)} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold">✕ закрыть</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <RightPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
