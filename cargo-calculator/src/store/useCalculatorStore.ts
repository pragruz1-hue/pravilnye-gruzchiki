import { create } from 'zustand';
import { BoxSize, BoxType, CargoBox, MoveType, Pallet, PalletType, ServicesState, VehicleType } from '../types';
import { calculateDistance, calculatePrice, calculateTotals } from '../utils/calculations';

interface CalculatorState {
  from: string;
  to: string;
  distance: number;
  moveType: MoveType;
  totalWeight: number;
  totalVolume: number;
  pallets: Pallet[];
  selectedPalletId: string | null;
  vehicleType: VehicleType;
  vehicleCount: number;
  urgency: 1 | 2 | 3;
  services: ServicesState;
  basePrice: number;
  additionalPrice: number;
  fuelPrice: number;
  insurancePrice: number;
  totalPrice: number;
  deliveryTime: string;
  setRoute: (from: string, to: string) => void;
  setMoveType: (moveType: MoveType) => void;
  setVehicleType: (vehicleType: VehicleType) => void;
  setVehicleCount: (vehicleCount: number) => void;
  setUrgency: (urgency: 1 | 2 | 3) => void;
  setService: <K extends keyof ServicesState>(key: K, value: ServicesState[K]) => void;
  addPallet: (pallet: Omit<Pallet, 'id'>) => void;
  removePallet: (id: string) => void;
  updatePalletPosition: (id: string, position: [number, number, number]) => void;
  updatePalletRotation: (id: string, rotation: [number, number, number]) => void;
  selectPallet: (id: string | null) => void;
  updatePalletBoxes: (id: string, boxes: CargoBox[]) => void;
  calculatePrice: () => void;
  resetCalculator: () => void;
}

const initialServices: ServicesState = {
  packing: true,
  disassembly: false,
  assembly: false,
  loaders: 2,
  insurance: true,
  nightMove: false,
  documentsPacking: false,
  itSupport: false
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildBoxes(count: number, size: BoxSize, type: BoxType): CargoBox[] {
  const color = type === 'fragile' ? '#f59e0b' : type === 'heavy' ? '#ef4444' : type === 'cold' ? '#06b6d4' : type === 'danger' ? '#f97316' : '#3b82f6';
  const weightMap: Record<BoxSize, number> = { S: 8, M: 14, L: 24, XL: 38 };
  return Array.from({ length: count }, (_, index) => ({
    id: createId(`box-${index}`),
    size,
    weight: type === 'heavy' ? weightMap[size] * 2.2 : weightMap[size],
    type,
    color
  }));
}

export function makePallet(params: {
  type: PalletType;
  boxCount: number;
  boxSize: BoxSize;
  boxType: BoxType;
  material: Pallet['material'];
  wrapped: boolean;
  position?: [number, number, number];
}): Omit<Pallet, 'id'> {
  const dimensions = params.type === 'EUR'
    ? { length: 1.2, width: 0.8, height: 0.144 }
    : params.type === 'FIN'
      ? { length: 1.2, width: 1.0, height: 0.144 }
      : { length: 1.2, width: 1.2, height: 0.144 };
  const materialWeight = params.material === 'metal' ? 38 : params.material === 'wood' ? 25 : 18;
  return {
    type: params.type,
    position: params.position ?? [0, 0.072, 0],
    rotation: [0, 0, 0],
    weight: materialWeight,
    boxes: buildBoxes(params.boxCount, params.boxSize, params.boxType),
    dimensions,
    material: params.material,
    wrapped: params.wrapped
  };
}

function recalculate(set: (partial: Partial<CalculatorState>) => void, state: CalculatorState): void {
  const totals = calculateTotals(state.pallets);
  const price = calculatePrice({
    vehicleType: state.vehicleType,
    vehicleCount: state.vehicleCount,
    distance: state.distance,
    pallets: state.pallets,
    services: state.services,
    urgency: state.urgency
  });
  set({
    totalWeight: totals.weight,
    totalVolume: totals.volume,
    ...price
  });
}

const initialPallets: Pallet[] = [
  { ...makePallet({ type: 'EUR', boxCount: 8, boxSize: 'M', boxType: 'standard', material: 'wood', wrapped: true, position: [-1.15, 0.072, -0.35] }), id: createId('pallet') },
  { ...makePallet({ type: 'EUR', boxCount: 6, boxSize: 'M', boxType: 'fragile', material: 'wood', wrapped: true, position: [0.25, 0.072, -0.35] }), id: createId('pallet') }
];

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  from: 'Краснодар',
  to: 'Сочи',
  distance: 286,
  moveType: 'apartment',
  totalWeight: calculateTotals(initialPallets).weight,
  totalVolume: calculateTotals(initialPallets).volume,
  pallets: initialPallets,
  selectedPalletId: initialPallets[0]?.id ?? null,
  vehicleType: 'gazelle',
  vehicleCount: 1,
  urgency: 2,
  services: initialServices,
  basePrice: 0,
  additionalPrice: 0,
  fuelPrice: 0,
  insurancePrice: 0,
  totalPrice: 0,
  deliveryTime: '1-3 дня',

  setRoute: (from, to) => {
    set({ from, to, distance: calculateDistance(from, to) });
    get().calculatePrice();
  },

  setMoveType: (moveType) => {
    set({ moveType });
    get().calculatePrice();
  },

  setVehicleType: (vehicleType) => {
    set({ vehicleType });
    get().calculatePrice();
  },

  setVehicleCount: (vehicleCount) => {
    set({ vehicleCount: Math.max(1, Math.min(10, vehicleCount)) });
    get().calculatePrice();
  },

  setUrgency: (urgency) => {
    set({ urgency });
    get().calculatePrice();
  },

  setService: (key, value) => {
    set((state) => ({ services: { ...state.services, [key]: value } }));
    get().calculatePrice();
  },

  addPallet: (palletData) => {
    const id = createId('pallet');
    set((state) => ({
      pallets: [...state.pallets, { ...palletData, id }],
      selectedPalletId: id
    }));
    get().calculatePrice();
  },

  removePallet: (id) => {
    set((state) => ({
      pallets: state.pallets.filter((pallet) => pallet.id !== id),
      selectedPalletId: state.selectedPalletId === id ? null : state.selectedPalletId
    }));
    get().calculatePrice();
  },

  updatePalletPosition: (id, position) => {
    set((state) => ({
      pallets: state.pallets.map((pallet) => pallet.id === id ? { ...pallet, position } : pallet)
    }));
  },

  updatePalletRotation: (id, rotation) => {
    set((state) => ({
      pallets: state.pallets.map((pallet) => pallet.id === id ? { ...pallet, rotation } : pallet)
    }));
  },

  selectPallet: (id) => {
    set({ selectedPalletId: id });
  },

  updatePalletBoxes: (id, boxes) => {
    set((state) => ({
      pallets: state.pallets.map((pallet) => pallet.id === id ? { ...pallet, boxes } : pallet)
    }));
    get().calculatePrice();
  },

  calculatePrice: () => {
    recalculate(set, get());
  },

  resetCalculator: () => {
    const pallets = [
      { ...makePallet({ type: 'EUR', boxCount: 8, boxSize: 'M', boxType: 'standard', material: 'wood', wrapped: true, position: [-1.15, 0.072, -0.35] }), id: createId('pallet') },
      { ...makePallet({ type: 'EUR', boxCount: 6, boxSize: 'M', boxType: 'fragile', material: 'wood', wrapped: true, position: [0.25, 0.072, -0.35] }), id: createId('pallet') }
    ];
    set({
      from: 'Краснодар',
      to: 'Сочи',
      distance: 286,
      moveType: 'apartment',
      pallets,
      selectedPalletId: pallets[0]?.id ?? null,
      vehicleType: 'gazelle',
      vehicleCount: 1,
      urgency: 2,
      services: initialServices
    });
    get().calculatePrice();
  }
}));

useCalculatorStore.getState().calculatePrice();
