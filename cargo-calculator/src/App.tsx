import { Scene } from './components/3d/Scene';
import { LeftPanel } from './components/ui/LeftPanel';
import { CapacityIndicators } from './components/ui/CapacityIndicators';
import { PriceDisplay } from './components/ui/PriceDisplay';

function App() {
  return (
    <div className="min-h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-200 text-gray-950">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(37,99,235,0.16),transparent_34%),radial-gradient(circle_at_84%_18%,rgba(16,185,129,0.12),transparent_34%)]" />
      <div className="relative flex h-screen flex-col gap-4 p-4 md:flex-row md:p-6">
        <LeftPanel />
        <main className="relative min-h-[52vh] flex-1 overflow-hidden rounded-[32px] border border-white/50 bg-white/35 shadow-glass backdrop-blur-glass md:h-full">
          <Scene />
          <CapacityIndicators />
          <PriceDisplay />
          <div className="pointer-events-none absolute right-6 top-6 rounded-full bg-slate-900/75 px-4 py-2 text-xs font-black text-white backdrop-blur-md">
            ЛКМ — вращение · колесо — zoom · Drag — паллеты
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
