import { useState } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { ConfirmModal } from './ConfirmModal';

type MoveType = 'apartment' | 'office' | 'commercial';

interface MoveTypeTabsProps {
  current: MoveType;
  onRequestChange: (type: MoveType) => void;
  disabled?: boolean;
  hasData: boolean;
}

const labels: Record<MoveType, string> = {
  apartment: 'Квартирный',
  office: 'Офисный',
  commercial: 'Коммерческий',
};

const icons: Record<MoveType, string> = {
  apartment: '🏠',
  office: '🏢',
  commercial: '🏭',
};

const descriptions: Record<MoveType, string> = {
  apartment: 'Квартирный переезд',
  office: 'Офисный переезд',
  commercial: 'Коммерческий перевоз',
};

export function MoveTypeTabs({ current, onRequestChange, disabled, hasData }: MoveTypeTabsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingType, setPendingType] = useState<MoveType | null>(null);
  const setMoveType = useCalculatorStore((state) => state.setMoveType);

  const types: MoveType[] = ['apartment', 'office', 'commercial'];

  const handleClick = (type: MoveType) => {
    if (type === current) return;
    if (disabled) return;

    // Если есть данные — показываем подтверждение
    if (hasData) {
      setPendingType(type);
      setShowConfirm(true);
    } else {
      onRequestChange(type);
    }
  };

  const handleConfirm = () => {
    if (pendingType) {
      onRequestChange(pendingType);
      setShowConfirm(false);
      setPendingType(null);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingType(null);
  };

  const types: MoveType[] = ['apartment', 'office', 'commercial'];

  return (
    <>
      <div className="flex bg-gray-100 rounded-xl p-1" role="tablist" aria-label="Тип переезда">
        {types.map((type) => (
          <button
            key={type}
            role="tab"
            aria-selected={current === type}
            aria-label={descriptions[type]}
            onClick={() => handleClick(type)}
            disabled={disabled || current === type}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl font-medium text-sm transition-all ${current === type
                ? 'bg-white shadow-md text-[#ff6b00] border border-[#ff6b00]/20'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <span style={{ fontSize: '1.25rem' }}>{icons[type]}</span>
            <span className="font-semibold">{labels[type]}</span>
            <span className="text-xs text-gray-500 font-normal">{descriptions[type]}</span>
          </button>
        ))}
      </div>

      {hasData && (
        <ConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            if (pendingType) {
              onRequestChange(pendingType);
              setShowConfirm(false);
              setPendingType(null);
            }
          }}
          onCancel={() => {
            setShowConfirm(false);
            setPendingType(null);
          }}
          title="Сменить тип переезда?"
          confirmText="Да, сбросить и переключить"
          cancelText="Отмена"
          showScreenshot
          message={
            <>
              <p className="mb-3">При смене типа переезда сбросятся:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600 mb-4">
                <li>Загруженные предметы и их расстановка</li>
                <li>Выбранная машина и пресет (1кк/2кк/3кк)</li>
                <li>История действий и настройки перевеса</li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-blue-800 mb-1">💾 Сохранятся автоматически:</p>
                <ul className="list-disc pl-5 space-y-0.5 text-sm text-blue-700">
                  <li>Маршрут (откуда/куда) и расстояние</li>
                  <li>Услуги (упаковка, грузчики, страховка...)</li>
                  <li>Количество машин</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                При возврате на этот тип переезда — данные не восстановятся автоматически.
              </p>
            </>
          }
          confirmText="Да, сбросить и переключить"
          cancelText="Отмена"
          showScreenshot
        />
      )}
    </>
  );
}

const labels: Record<MoveType, string> = {
  apartment: 'Квартирный',
  office: 'Офисный',
  commercial: 'Коммерческий',
};

const icons: Record<MoveType, string> = {
  apartment: '🏠',
  office: '🏢',
  commercial: '🏭',
};

const descriptions: Record<MoveType, string> = {
  apartment: 'Квартирный переезд',
  office: 'Офисный переезд',
  commercial: 'Коммерческий перевоз',
};