import { useState } from 'react';
import { Scene } from './components/3d/Scene';
import { LeftPanel } from './components/ui/LeftPanel';
import { RightPanel } from './components/ui/RightPanel';
import { CameraSwitcher, DayNightBadge } from './components/ui/CameraSwitcher';
import { MiniMap } from './components/ui/MiniMap';
import { MobileJoystick } from './components/ui/MobileJoystick';
import { AutoFillButton } from './components/ui/AutoFillButton';
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
  const isPerformanceMode = useCalculatorStore((s) => s.isPerformanceMode);
  const togglePerformance = useCalculatorStore((s) => s.togglePerformance);
  const isPhysicsEnabled = useCalculatorStore((s) => s.isPhysicsEnabled);
  const togglePhysics = useCalculatorStore((s) => s.togglePhysics);
  const isHeatmapEnabled = useCalculatorStore((s) => s.isHeatmapEnabled);
  const toggleHeatmap = useCalculatorStore((s) => s.toggleHeatmap);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [joystick, setJoystick] = useState({ x: 0, y: 0, up: 0 });

  return (
    <div className={`min-h-screen w-screen overflow-hidden text-gray-950 transition-colors duration-700 ${isNightMode ? 'bg-[#070a14]' : 'bg-gradient-to-br from-[#07090e] via-[#111827] to-[#e9ecef]'}`}>
      <div className="fixed inset-0">
        {isNightMode ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,0,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.22),transparent_40%),linear-gradient(180deg,#0b0e1a_0%,#111827_60%,#0f172a_100%)]" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,107,0,0.22),transparent_34%),radial-gradient(circle_at_84%_18%,rgba(37,99,235,0.16),transparent_34%)]" />
        )}
      </div>

      <div className="relative z-30 hidden flex-wrap items-center justify-between gap-2 p-2 md:flex">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#ff6b00] text-sm font-black text-white shadow">ПГ</div>
          <div className="leading-none">
            <div className="text-[10px] font-black tracking-widest text-orange-300">ПРАВИЛЬНЫЕ ГРУЗЧИКИ</div>
            <div className="text-sm font-black text-white">3D калькулятор загрузки</div>
          </div>
          <div className="ml-3 flex flex-wrap items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur">
            <button onClick={undo} disabled={history.length===0} className="rounded-full bg-white px-2 py-1 text-[11px] font-black disabled:opacity-30">↩️</button>
            <button onClick={redo} disabled={future.length===0} className="rounded-full bg-white px-2 py-1 text-[11px] font-black disabled:opacity-30">↪️</button>
            <button onClick={()=>setFirstPerson(!isFirstPerson)} className={`rounded-full px-2 py-1 text-[11px] font-black ${isFirstPerson ? 'bg-[#ff6b00] text-white' : 'bg-white text-gray-700'}`}>WASD</button>
            <button onClick={toggleMinimap} className={`rounded-full px-2 py-1 text-[11px] font-black ${showMinimap ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700'}`}>🗺</button>
            <button onClick={toggleSound} className={`rounded-full px-2 py-1 text-[11px] font-black ${isSoundEnabled ? 'bg-white text-gray-700' : 'bg-gray-200 text-gray-500'}`}>{isSoundEnabled ? '🔊' : '🔇'}</button>
            <div className="group relative">
              <button className="rounded-full bg-white/50 px-2 py-1 text-[11px] font-black text-white/80 hover:bg-white/80 hover:text-gray-900">⚙️</button>
              <div className="invisible absolute left-0 top-full z-50 mt-1 flex flex-col gap-1 rounded-2xl bg-[#10131b]/95 p-2 opacity-0 shadow-2xl backdrop-blur-xl transition-all group-hover:visible group-hover:opacity-100">
                <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-orange-300">Дополнительно</span>
                <button onClick={toggleMeasurements} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${showMeasurements ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>📏 Рулетка</button>
                <button onClick={togglePerformance} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${isPerformanceMode ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>⚡ Быстрый рендер</button>
                <button onClick={togglePhysics} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${isPhysicsEnabled ? 'bg-red-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>🧪 Физика</button>
                <button onClick={toggleHeatmap} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${isHeatmapEnabled ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>🔥 Нагрузка на пол</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-30 flex items-center justify-between gap-2 p-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#ff6b00] text-sm font-black text-white shadow">ПГ</div>
          <div className="leading-none">
            <div className="text-[10px] font-black tracking-widest text-orange-300">ПРАВИЛЬНЫЕ</div>
            <div className="text-sm font-black text-white">3D калькулятор</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowLeft(!showLeft)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-gray-900 shadow">☰ {pallets.length}</button>
          <button onClick={() => setShowRight(!showRight)} className="rounded-full bg-[#10131b] px-3 py-2 text-xs font-black text-white ring-1 ring-white/20">💰</button>
        </div>
      </div>

      <div className="relative flex h-[calc(100vh-56px)] flex-col gap-3 p-3 md:h-[calc(100vh-52px)] md:flex-row md:gap-4 md:p-4">
        <div className={`${showLeft ? 'flex' : 'hidden'} fixed inset-0 z-40 flex-col bg-[#0f121a]/95 p-3 backdrop-blur-xl md:static md:flex md:w-[420px] md:bg-transparent md:p-0`}>
          <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/90 shadow-2xl backdrop-blur-xl md:rounded-[28px]">
            <div className="flex items-center justify-between border-b border-black/5 p-4 md:hidden">
              <span className="font-black">Инвентарь</span>
              <button onClick={() => setShowLeft(false)} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-hidden"><LeftPanel /></div>
          </div>
        </div>

        <main className="relative flex min-h-[58vh] flex-1 flex-col overflow-hidden rounded-[24px] border border-white/20 bg-white/40 shadow-glass backdrop-blur-glass md:min-h-0 md:rounded-[32px]">
          <Scene />
          <AutoFillButton />
          <CameraSwitcher />
          <DayNightBadge />
          <MiniMap />
          {(isFirstPerson) && (
            <div className="absolute bottom-[88px] left-4 z-20 md:hidden">
              <MobileJoystick onMove={(dx, dy) => setJoystick({ x: dx, y: dy, up: 0 })} onUpDown={(up) => setJoystick((j) => ({ ...j, up }))} />
            </div>
          )}
          {isFirstPerson && (
            <div className="pointer-events-none absolute bottom-[88px] left-4 z-20 hidden rounded-full bg-black/70 px-3 py-1 text-[11px] font-black text-white backdrop-blur md:block">WASD + Shift + Q/E — движение и высота · на телефоне — джойстик</div>
          )}
        </main>

        <div className={`${showRight ? 'flex' : 'hidden'} fixed inset-0 z-40 flex-col bg-[#0f121a]/95 p-3 backdrop-blur-xl md:static md:flex md:w-[380px] md:bg-transparent md:p-0`}>
          <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/90 shadow-2xl backdrop-blur-xl md:rounded-[28px]">
            <div className="flex items-center justify-between border-b border-black/5 p-4 md:hidden">
              <span className="font-black">Загрузка и цена</span>
              <button onClick={() => setShowRight(false)} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-hidden"><RightPanel /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
