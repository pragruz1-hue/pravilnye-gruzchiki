import { Scene } from './components/3d/Scene';
import { LeftPanel } from './components/ui/LeftPanel';
import { CapacityIndicators } from './components/ui/CapacityIndicators';
import { PriceDisplay } from './components/ui/PriceDisplay';

function App() {
  return (
    <div className="min-h-screen w-screen overflow-hidden bg-gradient-to-br from-[#07090e] via-[#111827] to-[#e9ecef] text-gray-950">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,107,0,0.22),transparent_34%),radial-gradient(circle_at_84%_18%,rgba(37,99,235,0.16),transparent_34%)]" />
      <div className="relative flex h-screen flex-col gap-4 p-4 md:flex-row md:p-6">
        <LeftPanel />
        <main className="relative min-h-[52vh] flex-1 overflow-hidden rounded-[32px] border border-white/50 bg-white/40 shadow-glass backdrop-blur-glass md:h-full">
          <Scene />
          <CapacityIndicators />
          <PriceDisplay />
          <div className="pointer-events-none absolute right-6 top-6 rounded-full bg-[#10131b]/85 px-4 py-2 text-xs font-black text-white backdrop-blur-md ring-2 ring-[#ff6b00]/60">
            ЛКМ — камера · колесо — zoom · Drag/XYZ — грузить кузов
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
