import { MoveTypeSelector } from './MoveTypeSelector';
import { RouteInputs } from './RouteInputs';
import { CargoParameters } from './CargoParameters';
import { PalletBuilder } from './PalletBuilder';
import { AdditionalServices } from './AdditionalServices';
import { OverflowWarning } from './OverflowWarning';
import { useCalculatorStore } from '../../store/useCalculatorStore';

export function LeftPanel() {
  const calculatePrice = useCalculatorStore((state) => state.calculatePrice);
  const isNightMode = useCalculatorStore((state) => state.isNightMode);

  return (
    <div className={`h-full w-full overflow-y-auto p-4 md:p-5 ${isNightMode ? 'bg-[#0f121a]/90 text-white' : ''}`}>
      <div className="mb-6 rounded-[24px] bg-[#10131b] p-5 text-white shadow-xl ring-1 ring-white/10">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff6b00] text-2xl font-black shadow-lg">ПГ</div>
          <div>
            <div className="text-sm font-black tracking-[0.18em] text-orange-300">ПРАВИЛЬНЫЕ</div>
            <div className="text-xl font-black tracking-wide">ГРУЗЧИКИ</div>
          </div>
        </div>
        <div className="mb-2 inline-flex rounded-full bg-[#ff6b00]/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-200 ring-1 ring-[#ff6b00]/30">3D configurator · game mode</div>
        <h1 className="text-2xl font-black tracking-tight">Калькулятор загрузки кузова</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">Пустой кузов на старте. Выбери квартиру — машина подставится автоматически (7/12/18 м³, до 1500 кг). Внутри кузова видны борта и лампы, есть день/ночь и камеры как в игре.</p>
      </div>
      <MoveTypeSelector />
      <RouteInputs />
      <CargoParameters />
      <OverflowWarning />
      <PalletBuilder />
      <AdditionalServices />
      <button className="button-primary mb-8 w-full" onClick={calculatePrice}>Рассчитать точную стоимость</button>
      <div className="mb-4 rounded-2xl bg-slate-900 p-3 text-xs leading-5 text-slate-300">
        <div className="font-black text-orange-300">Исправлено по ТЗ:</div>
        <ul className="mt-1 list-disc pl-4">
          <li>1) Пустой кузов на старте, нет “нельзя поставить”</li>
          <li>2) При выборе квартиры подгружается рекомендуемая машина</li>
          <li>3) Авто-заполнение объема (7/12/18 м³)</li>
          <li>4) Убран оверлап цены — теперь 3 панели, ничего не перекрывает обзор</li>
          <li>5) При drag камера не едет</li>
          <li>Мобилка как игра: кнопки камер, вид из кузова, лампы, день/ночь</li>
        </ul>
      </div>
    </div>
  );
}
