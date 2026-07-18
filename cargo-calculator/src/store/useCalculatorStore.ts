import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApartmentPreset, BoxSize, BoxType, CameraMode, CargoBox, CatalogItem, LoadItem, LoadItemKind, MoveType, OfficePreset, PalletType, ServicesState, StandardPreset, TripRange, TruckPreset, VehicleType } from '../types';
import { APARTMENT_STANDARDS, calculateDistance, calculatePrice, calculateTotals, fillCargoWithBoxes, generateSharePayload, getStackHeightAt, OFFICE_STANDARDS, orientedHeight, packItemsInVehicle, recommendVehicle, STANDARDS, VEHICLES } from '../utils/calculations';

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
  tripRange: TripRange;
  workHours: number;
  activePreset: StandardPreset | null;
  cameraMode: CameraMode;
  isNightMode: boolean;
  history: LoadItem[][];
  future: LoadItem[][];
  isFirstPerson: boolean;
  showMinimap: boolean;
  showMeasurements: boolean;
  isSoundEnabled: boolean;
  isPerformanceMode: boolean;
  renderQuality: import('../types').RenderQuality;
  isPhysicsEnabled: boolean;
  isHeatmapEnabled: boolean;
  overflowCount: number;
  overflowItems: LoadItem[];
  overflowWeight: number;
  overflowVolume: number;
  estimatedTrips: number;
  fallingTargets: Record<string, number>;
  landItem: (id: string) => void;
  commitLanding: (id: string) => void;
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
  applyOfficePreset: (preset: OfficePreset) => void;
  applyTruckPreset: (preset: TruckPreset) => void;
  removePallet: (id: string) => void;
  updatePalletPosition: (id: string, position: [number, number, number]) => void;
  updatePalletRotation: (id: string, rotation: [number, number, number]) => void;
  liftSelected: (delta: number) => void;
  rotateSelectedY: () => void;
  selectPallet: (id: string | null) => void;
  updatePalletBoxes: (id: string, boxes: CargoBox[]) => void;
  calculatePrice: () => void;
  resetCalculator: () => void;
  clearCalculator: () => void;
  setCameraMode: (mode: CameraMode) => void;
  toggleNightMode: () => void;
  setNightMode: (isNight: boolean) => void;
  undo: () => void;
  redo: () => void;
  setFirstPerson: (v: boolean) => void;
  toggleMinimap: () => void;
  toggleMeasurements: () => void;
  toggleSound: () => void;
  togglePerformance: () => void;
  setRenderQuality: (quality: import('../types').RenderQuality) => void;
  togglePhysics: () => void;
  toggleHeatmap: () => void;
  loadFromShare: (pallets: LoadItem[], vehicle: VehicleType) => void;
  fillEmptySpace: () => void;
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

function gridPosition(index: number, vehicle: VehicleType = 'gazelle12'): [number, number, number] {
  const cols = vehicle === 'gazelle7' ? 2 : 3;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return [-1.45 + col * 1.05, 0.04, -0.55 + row * 0.78];
}

function buildPreset(preset: ApartmentPreset): LoadItem[] {
  const base: LoadItemKind[] = ['sofa', 'bed', 'wardrobe', 'fridge', 'washer', 'table', 'chairs', 'tv'];
  const extra2: LoadItemKind[] = ['wardrobe', 'bed', 'box', 'box', 'box', 'plant'];
  const extra3: LoadItemKind[] = ['sofa', 'wardrobe', 'wardrobe', 'bed', 'table', 'chairs', 'box', 'box', 'box', 'box', 'piano'];
  const boxesCount = preset === 'oneRoom' ? 6 : preset === 'twoRoom' ? 12 : 20;
  const kinds = preset === 'oneRoom' ? base : preset === 'twoRoom' ? [...base, ...extra2] : [...base, ...extra2, ...extra3];
  const items = kinds.map((kind, index) => ({ ...createLoadItem(kind, gridPosition(index, APARTMENT_STANDARDS[preset].recommendedVehicle)), id: createId(kind) }));
  for (let i = 0; i < boxesCount; i += 1) {
    const pos = gridPosition(kinds.length + i, APARTMENT_STANDARDS[preset].recommendedVehicle);
    pos[1] = 0.04 + Math.floor(i / 8) * 0.42;
    items.push({ ...createLoadItem('box', pos), id: createId('box') });
  }
  return items;
}

function buildOfficePreset(preset: OfficePreset): LoadItem[] {
  const desk = 'Стол рабочий';
  const shelf = 'Шкаф для документов';
  const docs = 'Коробка с документами';
  const seats = 'Офисные кресла (4 шт)';
  const screens = 'Мониторы и техника';
  const layouts: Record<OfficePreset, Array<[LoadItemKind, string]>> = {
    officeS: [
      ['table', desk], ['table', desk], ['chairs', seats], ['wardrobe', shelf],
      ['tv', screens], ['plant', 'Растение в кабинет'],
      ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs]
    ],
    officeM: [
      ['table', desk], ['table', desk], ['table', desk], ['table', desk], ['table', desk],
      ['chairs', seats], ['chairs', seats],
      ['wardrobe', shelf], ['wardrobe', shelf], ['tv', screens], ['tv', screens],
      ['safe', 'Сейф офисный'], ['plant', 'Растение в офис'],
      ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs],
      ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs]
    ],
    officeL: [
      ['table', desk], ['table', desk], ['table', desk], ['table', desk], ['table', desk], ['table', desk], ['table', desk], ['table', desk],
      ['chairs', seats], ['chairs', seats], ['chairs', seats],
      ['wardrobe', shelf], ['wardrobe', shelf], ['wardrobe', shelf],
      ['tv', screens], ['tv', screens], ['safe', 'Сейф офисный'],
      ['sofa', 'Диван зоны ожидания'], ['plant', 'Растение в зоне ожидания'],
      ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs],
      ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs],
      ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs], ['box', docs]
    ]
  };
  const vehicle = OFFICE_STANDARDS[preset].recommendedVehicle;
  return layouts[preset].map(([kind, name], index) => ({ ...createLoadItem(kind, gridPosition(index, vehicle)), name, id: createId(kind) }));
}

function buildPalletLoad(vehicleType: VehicleType): LoadItem[] {
  const vehicle = VEHICLES[vehicleType];
  const items: LoadItem[] = [];
  for (let i = 0; i < vehicle.palletCapacity; i += 1) {
    items.push({
      ...makePallet({ type: 'EUR', boxCount: 16, boxSize: 'M', boxType: 'standard', material: 'wood', wrapped: true, position: gridPosition(i, vehicleType) }),
      id: createId('pallet')
    });
  }
  return items;
}

function buildTruckLoad(preset: TruckPreset, vehicleType: VehicleType): LoadItem[] {
  if (preset === 'pallets') return buildPalletLoad(vehicleType);
  return [];
}

let lastPostTime = 0;
let postDebounceTimer: any = null;
let lastHistoryPush = 0;

function computeOverflowInfo(overflow: LoadItem[], vehicleType: VehicleType): { overflowCount: number; overflowWeight: number; overflowVolume: number; estimatedTrips: number } {
  const vehicle = VEHICLES[vehicleType];
  const totals = calculateTotals(overflow);
  const capM3 = vehicle.capacityM3 || 1;
  const capKg = vehicle.capacityKg || 1;
  const tripsByVol = Math.ceil(totals.volume / capM3);
  const tripsByWeight = Math.ceil(totals.weight / capKg);
  return {
    overflowCount: overflow.length,
    overflowWeight: Math.round(totals.weight),
    overflowVolume: Math.round(totals.volume * 100) / 100,
    estimatedTrips: Math.max(1, Math.min(10, Math.max(tripsByVol, tripsByWeight)))
  };
}

function recalculate(set: (partial: Partial<CalculatorState>) => void, state: CalculatorState): void {
  const totals = calculateTotals(state.pallets);
  const recommendedVehicleType = state.activePreset && STANDARDS[state.activePreset] ? STANDARDS[state.activePreset].recommendedVehicle : recommendVehicle(state.pallets);
  const price = calculatePrice({ vehicleType: state.vehicleType, vehicleCount: state.vehicleCount, distance: state.distance, pallets: state.pallets, services: state.services, urgency: state.urgency, moveType: state.moveType });
  set({ totalWeight: totals.weight, totalVolume: totals.volume, recommendedVehicleType, ...price });

  const now = Date.now();
  const shouldSend = now - lastPostTime > 350;
  const send = () => {
    try {
      const payload = generateSharePayload(state.pallets, state.vehicleType);
      const message = {
        type: 'cargo-calculation-update',
        pallets: state.pallets.length,
        volume: totals.volume,
        weight: totals.weight,
        vehicle: state.vehicleType,
        recommended: recommendedVehicleType,
        price: price.totalPrice,
        fuelLiters: (price as any).fuelLiters,
        tripRange: price.tripRange,
        share: payload,
        from: state.from,
        to: state.to
      };
      window.parent?.postMessage(message, '*');
      window.postMessage(message, '*');
      localStorage.setItem('pg_last_calculation', JSON.stringify(message));
      lastPostTime = Date.now();
    } catch {}
  };
  if (shouldSend) send();
  else {
    if (postDebounceTimer) clearTimeout(postDebounceTimer);
    postDebounceTimer = setTimeout(send, 350);
  }
}

function pushHistory(state: CalculatorState): { history: LoadItem[][]; future: LoadItem[][] } {
  const newHistory = [...state.history, state.pallets.map(p => ({ ...p, position: [...p.position] as any, rotation: [...p.rotation] as any, boxes: [...p.boxes] }))];
  if (newHistory.length > 30) newHistory.shift();
  return { history: newHistory, future: [] };
}

function pushHistoryThrottled(state: CalculatorState): { history: LoadItem[][]; future: LoadItem[][] } | {} {
  const now = Date.now();
  if (now - lastHistoryPush < 500) return {};
  lastHistoryPush = now;
  return pushHistory(state);
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      from: 'Краснодар', to: 'Сочи', distance: 286, moveType: 'apartment', totalWeight: 0, totalVolume: 0,
      pallets: [], selectedPalletId: null, vehicleType: 'gazelle12', recommendedVehicleType: 'gazelle7', vehicleCount: 1, urgency: 2, services: initialServices,
      basePrice: 0, additionalPrice: 0, fuelPrice: 0, insurancePrice: 0, totalPrice: 0, deliveryTime: '1-3 дня', tripRange: 'regional', workHours: 0, activePreset: null,
      cameraMode: 'overview', isNightMode: false, history: [], future: [], isFirstPerson: false, showMinimap: true, showMeasurements: true, isSoundEnabled: true,
      isPerformanceMode: false, renderQuality: 'auto', isPhysicsEnabled: false, isHeatmapEnabled: false, fallingTargets: {},
      overflowCount: 0, overflowItems: [], overflowWeight: 0, overflowVolume: 0, estimatedTrips: 0,

      setRoute: (from, to) => { set({ from, to, distance: calculateDistance(from, to) }); get().calculatePrice(); },
      setMoveType: (moveType) => { set({ moveType }); get().calculatePrice(); },
      setVehicleType: (vehicleType) => {
        const st = get();
        const hist = pushHistory(st);
        set({ vehicleType, ...hist });
        const currentItems = get().pallets;
        if (currentItems.length === 0) { get().calculatePrice(); return; }
        const packed = packItemsInVehicle(currentItems, vehicleType);
        const _oi = packed.overflow.length > 0 ? computeOverflowInfo(packed.overflow, vehicleType) : { overflowCount: 0, overflowWeight: 0, overflowVolume: 0, estimatedTrips: 0 };
        set({ pallets: packed.placed, overflowItems: packed.overflow, selectedPalletId: packed.placed.length > 0 ? packed.placed[0].id : null, ..._oi });
        get().calculatePrice();
      },
      useRecommendedVehicle: () => {
        const recommended = get().recommendedVehicleType;
        const st = get();
        set({ vehicleType: recommended, ...pushHistory(st) });
        const currentItems = get().pallets;
        if (currentItems.length === 0) { get().calculatePrice(); return; }
        const packed = packItemsInVehicle(currentItems, recommended);
        const _oi2 = packed.overflow.length > 0 ? computeOverflowInfo(packed.overflow, recommended) : { overflowCount: 0, overflowWeight: 0, overflowVolume: 0, estimatedTrips: 0 };
        set({ pallets: packed.placed, overflowItems: packed.overflow, selectedPalletId: packed.placed.length > 0 ? packed.placed[0].id : null, ..._oi2 });
        get().calculatePrice();
      },
      setVehicleCount: (vehicleCount) => { set({ vehicleCount: Math.max(1, Math.min(10, vehicleCount)) }); get().calculatePrice(); },
      setUrgency: (urgency) => { set({ urgency }); get().calculatePrice(); },
      setService: (key, value) => { set((state) => ({ services: { ...state.services, [key]: value } })); get().calculatePrice(); },
      addPallet: (palletData) => {
        const id = createId('pallet');
        const st = get();
        set((state) => {
          const items = [...state.pallets, { ...palletData, id }];
          const packed = packItemsInVehicle(items, state.vehicleType);
          const _oi3 = packed.overflow.length > 0 ? computeOverflowInfo(packed.overflow, state.vehicleType) : { overflowCount: 0, overflowWeight: 0, overflowVolume: 0, estimatedTrips: 0 };
          return { pallets: packed.placed, overflowItems: packed.overflow, ..._oi3, selectedPalletId: id, activePreset: null, ...pushHistory(st) };
        });
        get().calculatePrice();
        if (get().isSoundEnabled) { try { window.pgPlaySound?.('add'); } catch {} }
      },
      addCatalogItem: (kind) => {
        const id = createId(kind);
        const st = get();
        set((state) => {
          const dummyPos: [number, number, number] = [0, 0.04, 0];
          const items = [...state.pallets, { ...createLoadItem(kind, dummyPos), id }];
          const packed = packItemsInVehicle(items, state.vehicleType);
          const _oi4 = packed.overflow.length > 0 ? computeOverflowInfo(packed.overflow, state.vehicleType) : { overflowCount: 0, overflowWeight: 0, overflowVolume: 0, estimatedTrips: 0 };
          return { pallets: packed.placed, overflowItems: packed.overflow, ..._oi4, selectedPalletId: id, activePreset: null, ...pushHistory(st) };
        });
        get().calculatePrice();
        if (get().isSoundEnabled) { try { window.pgPlaySound?.('add'); if (navigator.vibrate) navigator.vibrate(30); } catch {} }
      },
      applyApartmentPreset: (preset) => {
        const standard = APARTMENT_STANDARDS[preset];
        const rawItems = buildPreset(preset);
        const recommended = standard.recommendedVehicle;
        const st = get();
        const packed = packItemsInVehicle(rawItems, recommended);
        const result = fillCargoWithBoxes(packed.placed, recommended, () => createId('fill'));
        const placedIds5 = new Set(result.placed.map((p) => p.id));
        const mergedOverflow5 = [...packed.overflow, ...result.overflow]
          .filter((o, i, arr) => arr.findIndex((x) => x.id === o.id) === i)
          .filter((o) => !placedIds5.has(o.id));
        const _oi5 = mergedOverflow5.length > 0 ? computeOverflowInfo(mergedOverflow5, recommended) : { overflowCount: 0, overflowWeight: 0, overflowVolume: 0, estimatedTrips: 0 };
        set({
          moveType: 'apartment',
          pallets: result.placed,
          overflowItems: mergedOverflow5,
          selectedPalletId: result.placed[0]?.id ?? null,
          activePreset: preset,
          recommendedVehicleType: recommended,
          vehicleType: recommended,
          ..._oi5,
          ...pushHistory(st)
        });
        get().calculatePrice();
      },
      applyOfficePreset: (preset) => {
        const standard = OFFICE_STANDARDS[preset];
        const rawItems = buildOfficePreset(preset);
        const recommended = standard.recommendedVehicle;
        const st = get();
        const packed = packItemsInVehicle(rawItems, recommended);
        const result = fillCargoWithBoxes(packed.placed, recommended, () => createId('fill'));
        const placedIds5 = new Set(result.placed.map((p) => p.id));
        const mergedOverflow5 = [...packed.overflow, ...result.overflow]
          .filter((o, i, arr) => arr.findIndex((x) => x.id === o.id) === i)
          .filter((o) => !placedIds5.has(o.id));
        const _oi5 = mergedOverflow5.length > 0 ? computeOverflowInfo(mergedOverflow5, recommended) : { overflowCount: 0, overflowWeight: 0, overflowVolume: 0, estimatedTrips: 0 };
        set({
          moveType: 'office',
          pallets: result.placed,
          overflowItems: mergedOverflow5,
          selectedPalletId: result.placed[0]?.id ?? null,
          activePreset: preset,
          recommendedVehicleType: recommended,
          vehicleType: recommended,
          ..._oi5,
          ...pushHistory(st)
        });
        get().calculatePrice();
      },
      applyTruckPreset: (preset) => {
        const st = get();
        const current = st.vehicleType;
        const recommended = current === 'refrigerator' || current === 'truck' ? current : 'truck';
        const rawItems = buildTruckLoad(preset, recommended);
        const packed = packItemsInVehicle(rawItems, recommended);
        const result = fillCargoWithBoxes(packed.placed, recommended, () => createId('fill'));
        const placedIds = new Set(result.placed.map((p) => p.id));
        const mergedOverflow = [...packed.overflow, ...result.overflow]
          .filter((o, i, arr) => arr.findIndex((x) => x.id === o.id) === i)
          .filter((o) => !placedIds.has(o.id));
        const _oi = mergedOverflow.length > 0 ? computeOverflowInfo(mergedOverflow, recommended) : { overflowCount: 0, overflowWeight: 0, overflowVolume: 0, estimatedTrips: 0 };
        set({
          moveType: 'commercial',
          pallets: result.placed,
          overflowItems: mergedOverflow,
          selectedPalletId: result.placed[0]?.id ?? null,
          activePreset: null,
          recommendedVehicleType: recommended,
          vehicleType: recommended,
          ..._oi,
          ...pushHistory(st)
        });
        get().calculatePrice();
        if (get().isSoundEnabled) { try { window.pgPlaySound?.('add'); if (navigator.vibrate) navigator.vibrate(40); } catch {} }
      },
      removePallet: (id) => {
        const st = get();
        set((state) => {
          const remaining = state.pallets.filter((pallet) => pallet.id !== id);
          if (remaining.length === 0) {
            return { pallets: [], selectedPalletId: null, activePreset: null, ...pushHistory(st) };
          }
          const packed = packItemsInVehicle(remaining, state.vehicleType);
          const _oi6 = packed.overflow.length > 0 ? computeOverflowInfo(packed.overflow, state.vehicleType) : { overflowCount: 0, overflowWeight: 0, overflowVolume: 0, estimatedTrips: 0 };
          return {
            pallets: packed.placed,
            overflowItems: packed.overflow,
            ..._oi6,
            selectedPalletId: state.selectedPalletId === id ? (packed.placed[0]?.id ?? null) : state.selectedPalletId,
            activePreset: null,
            ...pushHistory(st)
          };
        });
        get().calculatePrice();
        if (get().isSoundEnabled) { try { window.pgPlaySound?.('remove'); if (navigator.vibrate) navigator.vibrate([20, 30, 20]); } catch {} }
      },
      updatePalletPosition: (id, position) => {
        const st = get();
        const hist = pushHistoryThrottled(st);
        set((state) => ({ pallets: state.pallets.map((pallet) => pallet.id === id ? { ...pallet, position } : pallet), activePreset: null, ...hist } as any));
        get().calculatePrice();
      },
      updatePalletRotation: (id, rotation) => {
        const st = get();
        set((state) => ({ pallets: state.pallets.map((pallet) => pallet.id === id ? { ...pallet, rotation } : pallet), activePreset: null, ...pushHistory(st) }));
        get().calculatePrice();
      },
      liftSelected: (delta) => {
        const id = get().selectedPalletId; if (!id) return;
        const st = get();
        set((state) => ({ pallets: state.pallets.map((item) => item.id === id ? { ...item, position: [item.position[0], Math.max(0.04, item.position[1] + delta), item.position[2]] } : item), activePreset: null, ...pushHistory(st) }));
        get().calculatePrice();
      },
      rotateSelectedY: () => {
        const id = get().selectedPalletId; if (!id) return;
        const st = get();
        set((state) => ({ pallets: state.pallets.map((item) => item.id === id ? { ...item, rotation: [item.rotation[0], item.rotation[1] + Math.PI / 2, item.rotation[2]] } : item), activePreset: null, ...pushHistory(st) }));
        get().calculatePrice();
      },
      selectPallet: (id) => set({ selectedPalletId: id }),
      updatePalletBoxes: (id, boxes) => { set((state) => ({ pallets: state.pallets.map((pallet) => pallet.id === id ? { ...pallet, boxes } : pallet) })); get().calculatePrice(); },
      calculatePrice: () => recalculate(set as any, get()),
      resetCalculator: () => {
        if (get().pallets.length > 0 && !confirm('Очистить кузов? Все предметы удалятся.')) return;
        set({
          from: 'Краснодар', to: 'Сочи', distance: 286, moveType: 'apartment',
          pallets: [], selectedPalletId: null, vehicleType: 'gazelle12', recommendedVehicleType: 'gazelle7',
          vehicleCount: 1, urgency: 2, services: initialServices, activePreset: null,
          cameraMode: 'overview', isNightMode: false, history: [], future: []
        });
        get().calculatePrice();
      },
      clearCalculator: () => {
        if (get().pallets.length > 0 && !confirm('Очистить кузов?')) return;
        const st = get();
        set({ pallets: [], selectedPalletId: null, activePreset: null, totalWeight: 0, totalVolume: 0, ...pushHistory(st) });
        get().calculatePrice();
      },
      setCameraMode: (mode) => set({ cameraMode: mode }),
      toggleNightMode: () => set((state) => ({ isNightMode: !state.isNightMode })),
      setNightMode: (isNight) => set({ isNightMode: isNight }),
      undo: () => {
        const st = get();
        if (st.history.length === 0) return;
        const prev = st.history[st.history.length - 1];
        const newHist = st.history.slice(0, -1);
        set({ pallets: prev, future: [...st.future, st.pallets], history: newHist, selectedPalletId: prev[0]?.id ?? null });
        get().calculatePrice();
      },
      redo: () => {
        const st = get();
        if (st.future.length === 0) return;
        const next = st.future[st.future.length - 1];
        const newFuture = st.future.slice(0, -1);
        set({ pallets: next, history: [...st.history, st.pallets], future: newFuture, selectedPalletId: next[0]?.id ?? null });
        get().calculatePrice();
      },
      setFirstPerson: (v) => set({ isFirstPerson: v }),
      toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
      toggleMeasurements: () => set((s) => ({ showMeasurements: !s.showMeasurements })),
      toggleSound: () => set((s) => ({ isSoundEnabled: !s.isSoundEnabled })),
      togglePerformance: () => set((s) => ({ isPerformanceMode: !s.isPerformanceMode })),
      setRenderQuality: (renderQuality) => set({ renderQuality }),
      togglePhysics: () => set((s) => ({ isPhysicsEnabled: !s.isPhysicsEnabled })),
      toggleHeatmap: () => set((s) => ({ isHeatmapEnabled: !s.isHeatmapEnabled })),
      loadFromShare: (pallets, vehicle) => {
        set({ pallets, vehicleType: vehicle, selectedPalletId: pallets[0]?.id ?? null });
        get().calculatePrice();
      },
      fillEmptySpace: () => {
        const state = get();
        if (state.pallets.length === 0) return;
        const st = get();
        const packed = fillCargoWithBoxes(state.pallets, state.vehicleType, () => createId('fill'));
        if (packed.placed.length === state.pallets.length) {
          if (get().isSoundEnabled) try { window.pgPlaySound?.('click'); } catch {}
          return;
        }
        const _oi = packed.overflow.length > 0 ? computeOverflowInfo(packed.overflow, state.vehicleType) : { overflowCount: 0, overflowWeight: 0, overflowVolume: 0, estimatedTrips: 0 };
        set({
          pallets: packed.placed,
          overflowItems: packed.overflow,
          selectedPalletId: packed.placed[0]?.id ?? null,
          activePreset: null,
          ..._oi,
          ...pushHistory(st)
        });
        get().calculatePrice();
        if (get().isSoundEnabled) {
          try { window.pgPlaySound?.('add'); if (navigator.vibrate) navigator.vibrate(30); } catch {}
        }
      },
      landItem: (id) => {
        const state = get();
        const item = state.pallets.find(p => p.id === id);
        if (!item) return;
        const targetY = getStackHeightAt(id, item.position[0], item.position[2], state.pallets);
        const vehicle = VEHICLES[state.vehicleType];
        const itemH = item.kind === 'pallet' ? Math.max(0.42, 0.144 + Math.ceil(item.boxes.length / 4) * 0.28) : orientedHeight(item);
        const clampedY = Math.round(Math.min(targetY, vehicle.cargoHeight - itemH) / 0.05) * 0.05;
        set((s) => ({ fallingTargets: { ...s.fallingTargets, [id]: clampedY } }));
      },
      commitLanding: (id) => {
        const state = get();
        const targetY = state.fallingTargets[id];
        if (targetY === undefined) return;
        const newFalling = { ...state.fallingTargets };
        delete newFalling[id];
        set((s) => ({
          fallingTargets: newFalling,
          pallets: s.pallets.map(p => p.id === id ? { ...p, position: [p.position[0], targetY, p.position[2]] } : p)
        }));
        get().calculatePrice();
        if (get().isSoundEnabled) {
          try { window.pgPlaySound?.('click'); if (navigator.vibrate) navigator.vibrate(20); } catch {}
        }
      }
    }),
    {
      name: 'pg-cargo-3d-v3',
      version: 5,
      migrate: (persisted: any, version: number) => {
        if (version < 3) {
          return {
            ...persisted,
            isPerformanceMode: false,
            isPhysicsEnabled: false,
            isHeatmapEnabled: true,
            history: [],
            future: []
          };
        }
        // Floor heatmap creates dozens of extra meshes and used to be enabled in
        // persisted v3 sessions. Start it off after the performance migration.
        if (version < 4) return { ...persisted, isHeatmapEnabled: false };
        if (version < 5) return { ...persisted, renderQuality: 'auto' };
        return persisted;
      },
      partialize: (state) => ({
        pallets: state.pallets,
        vehicleType: state.vehicleType,
        from: state.from,
        to: state.to,
        activePreset: state.activePreset,
        cameraMode: state.cameraMode,
        isNightMode: state.isNightMode,
        showMinimap: state.showMinimap,
        showMeasurements: state.showMeasurements,
        isSoundEnabled: state.isSoundEnabled,
        isPerformanceMode: state.isPerformanceMode,
        renderQuality: state.renderQuality,
        isPhysicsEnabled: state.isPhysicsEnabled,
        isHeatmapEnabled: state.isHeatmapEnabled
      })
    }
  )
);

useCalculatorStore.getState().calculatePrice();

if (typeof window !== 'undefined') {
  try {
    const params = new URLSearchParams(window.location.search);
    const share = params.get('share');
    if (share) {
      import('../utils/calculations').then(({ parseSharePayload }) => {
        const data = parseSharePayload(share);
        if (data) {
          const store = useCalculatorStore.getState();
          const items = data.items.map((i: any, idx: number) => {
            const cat = CATALOG.find(c => c.kind === i.k) || CATALOG[0];
            return { ...cat, id: `shared-${idx}`, kind: cat.kind as any, name: cat.name, position: i.p as any, rotation: i.r as any, type: 'STANDARD' as any, boxes: [], weight: cat.weight, dimensions: cat.dimensions, material: cat.material, wrapped: false, stackable: cat.stackable, maxStackWeight: cat.maxStackWeight, canLaySide: cat.canLaySide, fragile: cat.fragile };
          });
          store.loadFromShare(items as any, data.vehicleType as any);
        }
      });
    }
  } catch {}
}
