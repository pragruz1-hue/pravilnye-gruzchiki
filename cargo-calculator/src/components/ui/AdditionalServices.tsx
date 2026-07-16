import { useCalculatorStore } from '../../store/useCalculatorStore';
import { ServicesState } from '../../types';

const booleanServices: Array<{ key: keyof Omit<ServicesState, 'loaders'>; label: string; hint: string }> = [
  { key: 'packing', label: 'Упаковка вещей', hint: 'коробки, плёнка, скотч' },
  { key: 'disassembly', label: 'Разборка мебели', hint: '+1500 ₽ за блок' },
  { key: 'assembly', label: 'Сборка мебели', hint: '+2000 ₽ за блок' },
  { key: 'insurance', label: 'Страхование', hint: '+5% от стоимости' },
  { key: 'nightMove', label: 'Ночной переезд', hint: '+30%' },
  { key: 'documentsPacking', label: 'Упаковка документов', hint: 'для офиса' },
  { key: 'itSupport', label: 'IT-сопровождение', hint: 'серверы и рабочие места' }
];

export function AdditionalServices() {
  const services = useCalculatorStore((state) => state.services);
  const setService = useCalculatorStore((state) => state.setService);

  return (
    <section className="mb-6 rounded-3xl bg-white/55 p-4 ring-1 ring-black/5">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">✅ Дополнительные услуги</h2>
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
        {booleanServices.map((service) => (
          <label key={service.key} className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white/70 p-3 transition hover:bg-white">
            <input
              type="checkbox"
              checked={Boolean(services[service.key])}
              onChange={(event) => setService(service.key, event.target.checked)}
              className="mt-1 h-4 w-4 accent-blue-600"
            />
            <span>
              <span className="block text-sm font-bold text-gray-800">{service.label}</span>
              <span className="block text-xs text-gray-500">{service.hint}</span>
            </span>
          </label>
        ))}
      </div>
      <label className="mt-3 block rounded-2xl bg-white/70 p-3 text-sm font-semibold text-gray-700">
        Грузчики: <span className="font-black text-blue-700">{services.loaders} чел.</span>
        <input
          type="range"
          min="0"
          max="6"
          value={services.loaders}
          onChange={(event) => setService('loaders', Number(event.target.value))}
          className="mt-3 w-full accent-blue-600"
        />
      </label>
    </section>
  );
}
