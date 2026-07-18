import { MoveType } from '../../types';
import { useCalculatorStore } from '../../store/useCalculatorStore';

const moveTypes: Array<{ id: MoveType; label: string; icon: string; description: string }> = [
  { id: 'apartment', label: 'Квартирный', icon: '🏠', description: 'мебель и личные вещи · обработка без наценки' },
  { id: 'office', label: 'Офисный', icon: '🏢', description: 'рабочие места и IT · +15% за аккуратную обработку' },
  { id: 'commercial', label: 'Коммерческий', icon: '📦', description: 'товар, склад, паллеты · −15% за механизацию' }
];

export function MoveTypeSelector() {
  const moveType = useCalculatorStore((state) => state.moveType);
  const setMoveType = useCalculatorStore((state) => state.setMoveType);

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">Тип переезда</h2>
      <div className="grid grid-cols-3 gap-3">
        {moveTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setMoveType(type.id)}
            className={`rounded-2xl border-2 px-3 py-3 text-left transition-all duration-300 ${
              moveType === type.id
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                : 'border-gray-200 bg-white/50 text-gray-600 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white/80'
            }`}
          >
          <span className="mb-1 block text-2xl">{type.icon}</span>
          <span className="block text-sm font-bold">{type.label}</span>
          <span className="mt-1 hidden text-xs text-gray-500 xl:block">{type.description}</span>
        </button>
      ))}
    </div>
    <p className="mt-2 text-[11px] leading-snug text-gray-400">
      Тип переезда влияет на стоимость обработки груза. Класс перевозки (городской / региональный / междугородний)
      и режим тарификации определяются автоматически по расстоянию маршрута.
    </p>
  </section>
);
}
