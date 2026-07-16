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
      <div className="mb-6">
        <div className="mb-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700">3D configurator</div>
        <h1 className="text-3xl font-black tracking-tight text-gray-950">Калькулятор грузоперевозок</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">Соберите поддоны, перемещайте их в кузове и получайте расчёт в реальном времени.</p>
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
