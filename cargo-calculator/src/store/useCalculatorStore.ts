import { create } from 'zustand';
import { ApartmentPreset, BoxSize, BoxType, CargoBox, CatalogItem, LoadItem, LoadItemKind, MoveType, PalletType, ServicesState, VehicleType } from '../types';
import { calculateDistance, calculatePrice, calculateTotals, recommendVehicle } from '../utils/calculations';

interface CalculatorState {
  from: string;
  to: string;
  distance: number;
  moveType: MoveType;
  totalWeight: number;
  totalVolume: number;
  pallets: LoadItem[];
  selectedPalletId: string | null;
  vehicleType: VehicleType;
  recommendedVehicleType: VehicleType;
  vehicleCount: number;
  urgency: 1 | 2 | 3;
  services: ServicesState;
  basePrice: number;
  additionalPrice: number;
  fuelPrice: number;
  insurancePrice: number;
  totalPrice: number;
  deliveryTime: string;
  activePreset: ApartmentPreset | null;
  setRoute: (from: string, to: string) => void;
  setMoveType: (moveType: MoveType) => void;
  setVehicleType: (vehicleType: VehicleType) => void;
  useRecommendedVehicle: () => void;
  setVehicleCount: (vehicleCount: number) => void;
  setUrgency: (urgency: 1 | 2 | 3) => void;
  setService: <K extends keyof ServicesState>(key: K, value: ServicesState[K]) => void;
  addPallet: (pallet: Omit<LoadItem, 'id'>) => void;
  addCatalogItem: (kind: LoadItemKind) => void;
  applyApartmentPreset: (preset: ApartmentPreset) => void;
  removePallet: (id: string) => void;
  updatePalletPosition: (id: string, position: [number, number, number]) => void;
  updatePalletRotation: (id: string, rotation: [number, number, number]) => void;
  liftSelected: (delta: number) => void;
  rotateSelectedY: () => void;
  selectPallet: (id: string | null) => void;
  updatePalletBoxes: (id: string, boxes: CargoBox[]) => void;
  calculatePrice: () => void;
  resetCalculator: () => void;
}

export const CATALOG: CatalogItem[] = [
  { kind: 'sofa', name: 'Диван прямой', emoji: '🛋', dimensions: { length: 2.1, width: 0.9, height: 0.85 }, weight: 85, material: 'fabric', stackable: false, maxStackWeight: 0, canLaySide: true, fragile: false, description: 'ткань, можно поставить на бок' },
  { kind: 'wardrobe', name: 'Шкаф', emoji: '🚪', dimensions: { length: 1.2, width: 0.6, height: 2.1 }, weight: 90, material: 'wood', stackable: false, maxStackWeight: 0, canLaySide: true, fragile: false, description: 'высокий, проверка потолка' },
  { kind: 'fridge', name: 'Холодильник', emoji: '🧊', dimensions: { length: 0.7, width: 0.7, height: 1.9 }, weight: 80, material: 'whiteGoods', stackable: false, maxStackWeight: 0, canLaySide: false, fragile: true, description: 'нельзя класть боком' },
  { kind: 'washer', name: 'Стиральная машина', emoji: '🧺', dimensions: { length: 0.6, width: 0.6, height: 0.85 }, weight: 65, material: 'whiteGoods', stackable: true, maxStackWeight: 15, canLaySide: false, fragile: true, description: 'тяжёлая техника' },
  { kind: 'bed', name: 'Кровать разобранная', emoji: '🛏', dimensions: { length: 2.05, width: 0.25, height: 0.75 }, weight: 70, material: 'wood', stackable: true, maxStackWeight: 80, canLaySide: true, fragile: false, description: 'плоский груз' },
  { kind: 'table', name: 'Стол', emoji: '🪑', dimensions: { length: 1.3, width: 0.8, height: 0.75 }, weight: 38, material: 'wood', stackable: false, maxStackWeight: 0, canLaySide: true, fragile: false, description: 'можно перевернуть' },
  { kind: 'chairs', name: '4 стула', emoji: '🪑', dimensions: { length: 0.8, width: 0.8, height: 0.95 }, weight: 28, material: 'wood', stackable: true, maxStackWeight: 20, canLaySide: true, fragile: false, description: 'стопка стульев' },
  { kind: 'tv', name: 'Телевизор', emoji: '📺', dimensions: { length: 1.2, width: 0.16, height: 0.75 }, weight: 18, material: 'glass', stackable: false, maxStackWeight: 0, canLaySide: false, fragile: true, description: 'хрупкий экран' },
  { kind: 'piano', name: 'Пианино', emoji: '🎹', dimensions: { length: 1.45, width: 0.62, height: 1.15 }, weight: 210, material: 'dark', stackable: false, maxStackWeight: 0, canLaySide: false, fragile: true, description: 'особый тяжёлый груз' },
  { kind: 'safe', name: 'Сейф', emoji: '🔒', dimensions: { length: 0.6, width: 0.55, height: 0.8 }, weight: 180, material: 'metal', stackable: false, maxStackWeight: 0, canLaySide: false, fragile: false, description: 'только низ кузова' },
  { kind: 'plant', name: 'Растение', emoji: '🪴', dimensions: { length: 0.45, width: 0.45, height: 1.2 }, weight: 18, material: 'plant', stackable: false, maxStackWeight: 0, canLaySide: false, fragile: true, description: 'не штабелировать' },
  { kind: 'bike', name: 'Велосипед', emoji: '🚲', dimensions: { length: 1.75, width: 0.28, height: 1.05 }, weight: 16, material: 'metal', stackable: false, maxStackWeight: 0, canLaySide: true, fragile: false, description: 'узкий длинный груз' },
  { kind: 'box', name: 'Коробка M', emoji: '📦', dimensions: { length: 0.6, width: 0.4, height: 0.4 }, weight: 14, material: 'cardboard', stackable: true, maxStackWeight: 45, canLaySide: true, fragile: false, description: 'можно ставить друг на друга' }
];

const initialServices: ServicesState = { packing: true, disassembly: false, assembly: false, loaders: 2, insurance: true, nightMove: false, documentsPacking: false, itSupport: false };

function createId(prefix: string): string { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; }

function buildBoxes(count: number, size: BoxSize, type: BoxType): CargoBox[] {
  const color = type === 'fragile' ? '#f59e0b' : type === 'heavy' ? '#ef4444' : type === 'cold' ? '#06b6d4' : type === 'danger' ? '#f97316' : '#3b82f6';
  const weightMap: Record<BoxSize, number> = { S: 8, M: 14, L: 24, XL: 38 };
  return Array.from({ length: count }, (_, index) => ({ id: createId(`box-${index}`), size, weight: type === 'heavy' ? weightMap[size] * 2.2 : weightMap[size], type, color }));
}

function createLoadItem(kind: LoadItemKind, position: [number, number, number]): Omit<LoadItem, 'id'> {
  const catalog = CATALOG.find((item) => item.kind === kind) || CATALOG[CATALOG.length - 1];
  return {
    kind,
    name: catalog.name,
    type: 'STANDARD',
    position,
    rotation: [0, 0, 0],
    weight: catalog.weight,
    boxes: [],
    dimensions: catalog.dimensions,
    material: catalog.material,
    wrapped: false,
    stackable: catalog.stackable,
    maxStackWeight: catalog.maxStackWeight,
    canLaySide: catalog.canLaySide,
    fragile: catalog.fragile
  };
}

export function makePallet(params: { type: PalletType; boxCount: number; boxSize: BoxSize; boxType: BoxType; material: LoadItem['material']; wrapped: boolean; position?: [number, number, number]; }): Omit<LoadItem, 'id'> {
  const dimensions = params.type === 'EUR' ? { length: 1.2, width: 0.8, height: 0.144 } : params.type === 'FIN' ? { length: 1.2, width: 1.0, height: 0.144 } : { length: 1.2, width: 1.2, height: 0.144 };
  const materialWeight = params.material === 'metal' ? 38 : params.material === 'wood' ? 25 : 18;
  return { kind: 'pallet', name: `${params.type} паллета`, type: params.type, position: params.position ?? [0, 0.072, 0], rotation: [0, 0, 0], weight: materialWeight, boxes: buildBoxes(params.boxCount, params.boxSize, params.boxType), dimensions, material: params.material, wrapped: params.wrapped, stackable: true, maxStackWeight: 1200, canLaySide: false, fragile: params.boxType === 'fragile' };
}

function gridPosition(index: number, vehicle: VehicleType = 'gazelle42'): [number, number, number] {
  const cols = vehicle === 'gazelle3' ? 2 : 3;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return [-1.45 + col * 1.05, 0.04, -0.55 + row * 0.78];
}

function buildPreset(preset: ApartmentPreset): LoadItem[] {
  const base: LoadItemKind[] = ['sofa', 'bed', 'wardrobe', 'fridge', 'washer', 'table', 'chairs', 'tv'];
  const extra2: LoadItemKind[] = ['wardrobe', 'bed', 'box', 'box', 'box', 'plant'];
  const extra3: LoadItemKind[] = ['sofa', 'wardrobe', 'wardrobe', 'bed', 'table', 'chairs', 'box', 'box', 'box', 'box', 'piano'];
  const boxesCount = preset === 'oneRoom' ? 10 : preset === 'twoRoom' ? 18 : 28;
  const kinds = preset === 'oneRoom' ? base : preset === 'twoRoom' ? [...base, ...extra2] : [...base, ...extra2, ...extra3];
  const items = kinds.map((kind, index) => ({ ...createLoadItem(kind, gridPosition(index)), id: createId(kind) }));
  for (let i = 0; i < boxesCount; i += 1) {
    const pos = gridPosition(kinds.length + i);
    pos[1] = 0.04 + Math.floor(i / 8) * 0.42;
    items.push({ ...createLoadItem('box', pos), id: createId('box') });
  }
  return items;
}

function recalculate(set: (partial: Partial<CalculatorState>) => void, state: CalculatorState): void {
  const totals = calculateTotals(state.pallets);
  const recommendedVehicleType = recommendVehicle(state.pallets);
  const price = calculatePrice({ vehicleType: state.vehicleType, vehicleCount: state.vehicleCount, distance: state.distance, pallets: state.pallets, services: state.services, urgency: state.urgency });
  set({ totalWeight: totals.weight, totalVolume: totals.volume, recommendedVehicleType, ...price });
}

const initialItems = buildPreset('oneRoom');

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  from: 'Краснодар', to: 'Сочи', distance: 286, moveType: 'apartment', totalWeight: calculateTotals(initialItems).weight, totalVolume: calculateTotals(initialItems).volume,
  pallets: initialItems, selectedPalletId: initialItems[0]?.id ?? null, vehicleType: 'gazelle42', recommendedVehicleType: recommendVehicle(initialItems), vehicleCount: 1, urgency: 2, services: initialServices,
  basePrice: 0, additionalPrice: 0, fuelPrice: 0, insurancePrice: 0, totalPrice: 0, deliveryTime: '1-3 дня', activePreset: 'oneRoom',

  setRoute: (from, to) => { set({ from, to, distance: calculateDistance(from, to) }); get().calculatePrice(); },
  setMoveType: (moveType) => { set({ moveType }); get().calculatePrice(); },
  setVehicleType: (vehicleType) => { set({ vehicleType }); get().calculatePrice(); },
  useRecommendedVehicle: () => { set({ vehicleType: get().recommendedVehicleType }); get().calculatePrice(); },
  setVehicleCount: (vehicleCount) => { set({ vehicleCount: Math.max(1, Math.min(10, vehicleCount)) }); get().calculatePrice(); },
  setUrgency: (urgency) => { set({ urgency }); get().calculatePrice(); },
  setService: (key, value) => { set((state) => ({ services: { ...state.services, [key]: value } })); get().calculatePrice(); },
  addPallet: (palletData) => { const id = createId('pallet'); set((state) => ({ pallets: [...state.pallets, { ...palletData, id }], selectedPalletId: id, activePreset: null })); get().calculatePrice(); },
  addCatalogItem: (kind) => { const index = get().pallets.length; const id = createId(kind); set((state) => ({ pallets: [...state.pallets, { ...createLoadItem(kind, gridPosition(index, state.vehicleType)), id }], selectedPalletId: id, activePreset: null })); get().calculatePrice(); },
  applyApartmentPreset: (preset) => { const items = buildPreset(preset); const recommended = recommendVehicle(items); set({ moveType: 'apartment', pallets: items, selectedPalletId: items[0]?.id ?? null, activePreset: preset, recommendedVehicleType: recommended, vehicleType: recommended }); get().calculatePrice(); },
  removePallet: (id) => { set((state) => ({ pallets: state.pallets.filter((pallet) => pallet.id !== id), selectedPalletId: state.selectedPalletId === id ? null : state.selectedPalletId, activePreset: null })); get().calculatePrice(); },
  updatePalletPosition: (id, position) => { set((state) => ({ pallets: state.pallets.map((pallet) => pallet.id === id ? { ...pallet, position } : pallet), activePreset: null })); get().calculatePrice(); },
  updatePalletRotation: (id, rotation) => { set((state) => ({ pallets: state.pallets.map((pallet) => pallet.id === id ? { ...pallet, rotation } : pallet), activePreset: null })); get().calculatePrice(); },
  liftSelected: (delta) => { const id = get().selectedPalletId; if (!id) return; set((state) => ({ pallets: state.pallets.map((item) => item.id === id ? { ...item, position: [item.position[0], Math.max(0.04, item.position[1] + delta), item.position[2]] } : item), activePreset: null })); get().calculatePrice(); },
  rotateSelectedY: () => { const id = get().selectedPalletId; if (!id) return; set((state) => ({ pallets: state.pallets.map((item) => item.id === id ? { ...item, rotation: [item.rotation[0], item.rotation[1] + Math.PI / 2, item.rotation[2]] } : item), activePreset: null })); get().calculatePrice(); },
  selectPallet: (id) => set({ selectedPalletId: id }),
  updatePalletBoxes: (id, boxes) => { set((state) => ({ pallets: state.pallets.map((pallet) => pallet.id === id ? { ...pallet, boxes } : pallet) })); get().calculatePrice(); },
  calculatePrice: () => recalculate(set, get()),
  resetCalculator: () => { const items = buildPreset('oneRoom'); const recommended = recommendVehicle(items); set({ from: 'Краснодар', to: 'Сочи', distance: 286, moveType: 'apartment', pallets: items, selectedPalletId: items[0]?.id ?? null, vehicleType: recommended, recommendedVehicleType: recommended, vehicleCount: 1, urgency: 2, services: initialServices, activePreset: 'oneRoom' }); get().calculatePrice(); }
}));

useCalculatorStore.getState().calculatePrice();
