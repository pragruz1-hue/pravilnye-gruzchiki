import { useCalculatorStore } from '../../store/useCalculatorStore';
import { TRIP_RANGE_INFO, VEHICLES } from '../../utils/calculations';

export function PriceDisplay({ embedded = false }: { embedded?: boolean }) {
  const basePrice = useCalculatorStore((state) => state.basePrice);
  const additionalPrice = useCalculatorStore((state) => state.additionalPrice);
  const fuelPrice = useCalculatorStore((state) => state.fuelPrice);
  const insurancePrice = useCalculatorStore((state) => state.insurancePrice);
  const totalPrice = useCalculatorStore((state) => state.totalPrice);
  const deliveryTime = useCalculatorStore((state) => state.deliveryTime);
  const distance = useCalculatorStore((state) => state.distance);
  const pallets = useCalculatorStore((state) => state.pallets);
  const vehicleType = useCalculatorStore((state) => state.vehicleType);
  const resetCalculator = useCalculatorStore((state) => state.resetCalculator);
  const clearCalculator = useCalculatorStore((state) => state.clearCalculator);
  const isNightMode = useCalculatorStore((state) => state.isNightMode);
  const overflowCount = useCalculatorStore((state) => state.overflowCount);
  const overflowWeight = useCalculatorStore((state) => state.overflowWeight);
  const estimatedTrips = useCalculatorStore((state) => state.estimatedTrips);
  const tripRange = useCalculatorStore((state) => state.tripRange);
  const workHours = useCalculatorStore((state) => state.workHours);
  const rangeInfo = TRIP_RANGE_INFO[tripRange];

  async function exportPdf() {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Cargo calculation - Pravilnye Gruzchiki', 14, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const vehicle = VEHICLES[vehicleType];
    doc.text(`Vehicle: ${vehicle.label} ${vehicle.cargoLength}x${vehicle.cargoWidth}x${vehicle.cargoHeight} m ${vehicle.capacityM3} m3`, 14, 28);
    doc.text(`Distance: ${distance} km (${tripRange})`, 14, 34);
    doc.text(`Items: ${pallets.length} - Weight: ${pallets.reduce((s,p)=>s+p.weight,0)}kg`, 14, 42);
    doc.text(`Base price: ${basePrice} RUB`, 14, 54);
    doc.text(`Fuel: ${fuelPrice} RUB`, 14, 62);
    doc.text(`Additional services: ${additionalPrice} RUB`, 14, 70);
    doc.text(`Insurance: ${insurancePrice} RUB`, 14, 78);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${totalPrice} RUB`, 14, 92);

    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (canvas) {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 14, 100, 180, 100);
        doc.setFontSize(9);
        doc.setFont('helvetica','normal');
        doc.text('Screenshot of the cargo bay loading', 14, 205);
      }
    } catch {}

    doc.setFontSize(10);
    let y = 215;
    pallets.forEach((p, i) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(`${i+1}. ${p.name} ${p.dimensions.length}x${p.dimensions.width}x${p.dimensions.height} m ${p.weight}kg`, 14, y);
      y += 6;
    });

    doc.save(`cargo-${vehicleType}-${Date.now()}.pdf`);
    try { window.pgPlaySound?.('click'); } catch {}
  }

  const wrapperClass = embedded
    ? `w-full rounded-[24px] border p-5 shadow-sm backdrop-blur ${isNightMode ? 'border-white/10 bg-white/5' : 'border-white/50 bg-white/90'}`
    : 'absolute bottom-6 right-6 z-10 w-[min(390px,calc(100%-48px))] rounded-3xl border border-white/50 bg-white/85 p-6 shadow-glass backdrop-blur-glass';

  return (
    <div className={wrapperClass}>
      <div className="mb-4">
        <div className={`mb-1 text-sm font-black ${isNightMode ? 'text-orange-200' : 'text-gray-600'}`}>💰 Стоимость перевозки</div>
        <div className={`text-4xl font-black tracking-tight ${isNightMode ? 'text-white' : 'text-gray-950'}`}>{totalPrice.toLocaleString('ru-RU')} ₽</div>
        <div className="mt-1 text-xs font-semibold text-gray-500">включая НДС 20% · предварительно · {VEHICLES[vehicleType].capacityM3} м³ до 1500 кг</div>

      </div>
      <div className="space-y-2 border-t border-gray-200 pt-4 text-sm">
        <Row label="Базовый тариф" value={basePrice} />
        <Row label="Топливный сбор" value={fuelPrice} />
        <Row label="Доп. услуги" value={additionalPrice} />
        <Row label="Страхование" value={insurancePrice} />
        <div className="flex justify-between border-t border-gray-200 pt-2 font-black text-blue-700">
          <span>Итого</span>
          <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-800">⏱ {deliveryTime} · {distance} км · {pallets.length} предметов · {VEHICLES[vehicleType].label}</div>
      <div className="mt-2 rounded-2xl bg-indigo-50 p-3 text-[11px] font-bold leading-5 text-indigo-800 ring-1 ring-indigo-100" title={rangeInfo.description}>
        {rangeInfo.icon} {rangeInfo.label} перевозка · {rangeInfo.tariffLabel}
        {tripRange === 'city' && workHours > 0 && <span className="block font-semibold text-indigo-600">⏳ ~{workHours} ч работы экипажа (мин. {VEHICLES[vehicleType].minHours} ч), км включены</span>}
        {tripRange === 'regional' && <span className="block font-semibold text-indigo-600">минималка {VEHICLES[vehicleType].minHours} ч + трасса −15% к ставке км</span>}
        {tripRange === 'intercity' && <span className="block font-semibold text-indigo-600">км −10% + обратная подача порожняком ×30%</span>}
      </div>

      <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-[11px] leading-5 text-amber-900 ring-1 ring-amber-200">
        <span className="font-black">⚠️ Предварительный расчёт.</span> Калькулятор помогает визуально
        оценить загрузку кузова. Реальная вместимость, необходимое количество машин, точный тип
        транспорта и итоговая стоимость определяются <strong>диспетчером при оформлении заказа</strong>.
        Данные расчёта носят ознакомительный характер и не являются публичной офертой.
        {overflowCount > 0 && (
          <span className="mt-1 block font-bold text-orange-600">
            {overflowCount} предмет{overflowCount === 1 ? '' : overflowCount < 5 ? 'а' : 'ов'} (≈{Math.round(overflowWeight)} кг) не поместил{overflowCount === 1 ? 'сь' : 'ись'} — потребуется ~{estimatedTrips} рейс{estimatedTrips === 1 ? '' : 'ов'}.
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="button-primary col-span-2" onClick={exportPdf}>Скачать PDF + скриншот 3D</button>
        <button className={`rounded-2xl px-4 py-3 text-sm font-black transition ${isNightMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={clearCalculator}>Очистить кузов</button>
        <button className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100" onClick={resetCalculator}>Сброс</button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-gray-700">
      <span>{label}</span>
      <span className="font-bold text-gray-950">{value.toLocaleString('ru-RU')} ₽</span>
    </div>
  );
}
