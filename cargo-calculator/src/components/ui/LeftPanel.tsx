import { MoveTypeSelector } from './MoveTypeSelector';
import { RouteInputs } from './RouteInputs';
import { CargoParameters } from './CargoParameters';
import { PalletBuilder } from './PalletBuilder';
import { AdditionalServices } from './AdditionalServices';
import { useCalculatorStore } from '../../store/useCalculatorStore';

export function LeftPanel() {
  const calculatePrice = useCalculatorStore((state) => state.calculatePrice);

  return (
    <aside className="glass-panel h-full w-full overflow-y-auto p-5 md:w-[40%] xl:p-6">
      <div className="mb-6 rounded-[28px] bg-[#10131b] p-5 text-white shadow-xl ring-1 ring-white/10">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff6b00] text-2xl font-black shadow-lg">ПГ</div>
          <div>
            <div className="text-sm font-black tracking-[0.18em] text-orange-300">ПРАВИЛЬНЫЕ</div>
            <div className="text-xl font-black tracking-wide">ГРУЗЧИКИ</div>
          </div>
        </div>
        <div className="mb-2 inline-flex rounded-full bg-[#ff6b00]/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-200 ring-1 ring-[#ff6b00]/30">3D configurator</div>
        <h1 className="text-3xl font-black tracking-tight">Калькулятор загрузки кузова</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">Выберите пресет квартиры, двигайте мебель и коробки в настоящем 3D-кузове, а система подберёт подходящую Газель.</p>
      </div>
      <MoveTypeSelector />
      <RouteInputs />
      <CargoParameters />
      <PalletBuilder />
      <AdditionalServices />
      <button className="button-primary mb-8 w-full" onClick={calculatePrice}>Рассчитать точную стоимость</button>
    </aside>
  );
}
