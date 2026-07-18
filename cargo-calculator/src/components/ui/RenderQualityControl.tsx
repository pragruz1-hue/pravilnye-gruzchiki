import { useCalculatorStore } from '../../store/useCalculatorStore';
import { RenderQuality } from '../../types';

const options: Array<{ value: RenderQuality; label: string; icon: string; hint: string }> = [
  { value: 'auto', label: 'Авто', icon: '✨', hint: 'подстраивается под устройство и FPS' },
  { value: 'lite', label: 'Эконом', icon: '⚡', hint: 'без тяжёлых эффектов — для телефона и большого груза' },
  { value: 'detailed', label: 'Детально', icon: '🖥️', hint: 'тени и HDR — для мощного компьютера' }
];

export function RenderQualityControl() {
  const quality = useCalculatorStore((s) => s.renderQuality);
  const setQuality = useCalculatorStore((s) => s.setRenderQuality);
  const active = options.find((option) => option.value === quality) ?? options[0];

  return (
    <div className="absolute right-3 top-3 z-20 group md:right-4 md:top-4">
      <button className="rounded-full bg-[#10131b]/85 px-3 py-2 text-[11px] font-black text-white shadow-xl ring-1 ring-white/20 backdrop-blur" title={`Качество: ${active.hint}`}>
        {active.icon} <span className="hidden sm:inline">{active.label}</span>
      </button>
      <div className="invisible absolute right-0 top-full mt-1 flex w-48 flex-col gap-1 rounded-2xl bg-[#10131b]/95 p-2 opacity-0 shadow-2xl backdrop-blur-xl transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-orange-300">Качество 3D</span>
        {options.map((option) => (
          <button key={option.value} onClick={() => setQuality(option.value)} className={`rounded-xl px-3 py-2 text-left text-[11px] font-black ${quality === option.value ? 'bg-[#ff6b00] text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
            {option.icon} {option.label}<span className="mt-0.5 block text-[9px] font-medium opacity-70">{option.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
