import { useCalculatorStore } from '../../store/useCalculatorStore';

export function PriceDisplay() {
  const basePrice = useCalculatorStore((state) => state.basePrice);
  const additionalPrice = useCalculatorStore((state) => state.additionalPrice);
  const fuelPrice = useCalculatorStore((state) => state.fuelPrice);
  const insurancePrice = useCalculatorStore((state) => state.insurancePrice);
  const totalPrice = useCalculatorStore((state) => state.totalPrice);
  const deliveryTime = useCalculatorStore((state) => state.deliveryTime);
  const distance = useCalculatorStore((state) => state.distance);
  const pallets = useCalculatorStore((state) => state.pallets);
  const resetCalculator = useCalculatorStore((state) => state.resetCalculator);

  async function exportPdf() {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Cargo transportation calculation', 14, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Distance: ${distance} km`, 14, 34);
    doc.text(`Pallets: ${pallets.length}`, 14, 42);
    doc.text(`Base price: ${basePrice} RUB`, 14, 54);
    doc.text(`Fuel: ${fuelPrice} RUB`, 14, 62);
    doc.text(`Additional services: ${additionalPrice} RUB`, 14, 70);
    doc.text(`Insurance: ${insurancePrice} RUB`, 14, 78);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${totalPrice} RUB`, 14, 92);
    doc.save('cargo-calculation.pdf');
  }

  return (
    <div className="absolute bottom-6 right-6 z-10 w-[min(390px,calc(100%-48px))] rounded-3xl border border-white/50 bg-white/85 p-6 shadow-glass backdrop-blur-glass">
      <div className="mb-4">
        <div className="mb-1 text-sm font-black text-gray-600">💰 Стоимость перевозки</div>
        <div className="text-5xl font-black tracking-tight text-gray-950">{totalPrice.toLocaleString('ru-RU')} ₽</div>
        <div className="mt-1 text-xs font-semibold text-gray-500">включая НДС 20% · предварительно</div>
        <div className="mt-2 text-[11px] leading-snug text-gray-400">Указанные на сайте цены носят информационный характер и не являются публичной офертой.</div>
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
      <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-800">⏱ Время доставки: {deliveryTime} · {distance} км</div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="button-primary col-span-2" onClick={exportPdf}>Скачать PDF</button>
        <button className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-200" onClick={() => window.print()}>Печать</button>
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
