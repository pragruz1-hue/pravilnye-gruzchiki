import { LoadItem, MoveType, TripRange, VehicleSpec, VehicleType } from '../types';
import { ApartmentStandard } from '../types';

export const TRIP_RANGE_LIMITS = { cityMaxKm: 60, regionalMaxKm: 300 } as const;

export function getTripRange(distance: number): TripRange {
  if (distance <= TRIP_RANGE_LIMITS.cityMaxKm) return 'city';
  if (distance <= TRIP_RANGE_LIMITS.regionalMaxKm) return 'regional';
  return 'intercity';
}

export const TRIP_RANGE_INFO: Record<TripRange, { label: string; icon: string; tariffLabel: string; description: string }> = {
  city: {
    label: 'Городской',
    icon: '🏙️',
    tariffLabel: 'почасовой тариф',
    description: 'внутри города и агломерации: минимальный заказ по часам, километры включены'
  },
  regional: {
    label: 'Региональный',
    icon: '🛣️',
    tariffLabel: 'минималка + км',
    description: 'по краю/области: часы работы + трасса со скидкой 15%'
  },
  intercity: {
    label: 'Междугородний',
    icon: '🚛',
    tariffLabel: 'за километр',
    description: 'дальний рейс: км со скидкой 10% + обратная подача порожняком ×30%'
  }
};

export const APARTMENT_STANDARDS: Record<string, ApartmentStandard> = {
  oneRoom: {
    id: 'oneRoom',
    label: '1 к.к.',
    hint: '7 м³ · до 1500 кг',
    volumeM3: 7,
    weightKg: 900,
    recommendedVehicle: 'gazelle7',
    description: 'эконом — коробки, мелкая мебель'
  },
  twoRoom: {
    id: 'twoRoom',
    label: '2 к.к.',
    hint: '12 м³ · до 1500 кг',
    volumeM3: 12,
    weightKg: 1200,
    recommendedVehicle: 'gazelle12',
    description: 'стандарт — шкафы, техника, коробки'
  },
  threeRoom: {
    id: 'threeRoom',
    label: '3 к.к.',
    hint: '18 м³ · до 1500 кг',
    volumeM3: 18,
    weightKg: 1500,
    recommendedVehicle: 'gazelle18',
    description: 'максимум — пианино, много мебели'
  }
};

export const OFFICE_STANDARDS: Record<string, ApartmentStandard> = {
  officeS: {
    id: 'officeS',
    label: 'Кабинет 10 м²',
    hint: '5 м³ · до 900 кг',
    volumeM3: 5,
    weightKg: 900,
    recommendedVehicle: 'gazelle7',
    description: '2 рабочих места, шкаф, документы'
  },
  officeM: {
    id: 'officeM',
    label: 'Офис 25 м²',
    hint: '11 м³ · до 1200 кг',
    volumeM3: 11,
    weightKg: 1200,
    recommendedVehicle: 'gazelle12',
    description: '5–6 рабочих мест, техника, сейф'
  },
  officeL: {
    id: 'officeL',
    label: 'Офис 50 м²',
    hint: '16 м³ · до 1500 кг',
    volumeM3: 16,
    weightKg: 1500,
    recommendedVehicle: 'gazelle18',
    description: 'open-space: столы, стеллажи, зона ожидания'
  }
};

export const STANDARDS: Record<string, ApartmentStandard> = { ...APARTMENT_STANDARDS, ...OFFICE_STANDARDS };

export const VEHICLES: Record<VehicleType, VehicleSpec> = {
  gazelle7: {
    id: 'gazelle7',
    label: 'Газель 7 м³ (3м эконом)',
    shortLabel: '7 м³',
    cargoLength: 3.0,
    cargoWidth: 1.8,
    cargoHeight: 1.3,
    capacityKg: 1500,
    capacityM3: 7,
    palletCapacity: 2,
    baseHourlyRate: 800,
    minHours: 2,
    kmRate: 30
  },
  gazelle12: {
    id: 'gazelle12',
    label: 'Газель 12 м³ (4м стандарт)',
    shortLabel: '12 м³',
    cargoLength: 3.2,
    cargoWidth: 1.9,
    cargoHeight: 2.0,
    capacityKg: 1500,
    capacityM3: 12,
    palletCapacity: 4,
    baseHourlyRate: 950,
    minHours: 3,
    kmRate: 36
  },
  gazelle18: {
    id: 'gazelle18',
    label: 'Газель 18 м³ (4.2м макс)',
    shortLabel: '18 м³',
    cargoLength: 4.2,
    cargoWidth: 2.0,
    cargoHeight: 2.15,
    capacityKg: 1500,
    capacityM3: 18,
    palletCapacity: 6,
    baseHourlyRate: 1100,
    minHours: 3,
    kmRate: 42
  },
  gazelle3: {
    id: 'gazelle3',
    label: 'Газель 3 м (7 м³)',
    shortLabel: '3 м',
    cargoLength: 3.0,
    cargoWidth: 1.8,
    cargoHeight: 1.3,
    capacityKg: 1500,
    capacityM3: 7,
    palletCapacity: 2,
    baseHourlyRate: 800,
    minHours: 2,
    kmRate: 30
  },
  gazelle42: {
    id: 'gazelle42',
    label: 'Газель 4.2 м (18 м³)',
    shortLabel: '4.2 м',
    cargoLength: 4.2,
    cargoWidth: 2.0,
    cargoHeight: 2.15,
    capacityKg: 1500,
    capacityM3: 18,
    palletCapacity: 6,
    baseHourlyRate: 1100,
    minHours: 3,
    kmRate: 42
  },
  van5: {
    id: 'van5',
    label: 'Фургон 5 м (22 м³)',
    shortLabel: '5 м',
    cargoLength: 5.0,
    cargoWidth: 2.1,
    cargoHeight: 2.1,
    capacityKg: 2500,
    capacityM3: 22.1,
    palletCapacity: 10,
    baseHourlyRate: 1300,
    minHours: 3,
    kmRate: 54
  },
  van6: {
    id: 'van6',
    label: 'Фургон 6 м (29 м³)',
    shortLabel: '6 м',
    cargoLength: 6.0,
    cargoWidth: 2.2,
    cargoHeight: 2.2,
    capacityKg: 3000,
    capacityM3: 29.0,
    palletCapacity: 12,
    baseHourlyRate: 1500,
    minHours: 3,
    kmRate: 62
  },
  truck: {
    id: 'truck',
    label: 'Фура 20т',
    shortLabel: '20т',
    cargoLength: 13.6,
    cargoWidth: 2.45,
    cargoHeight: 2.65,
    capacityKg: 20000,
    capacityM3: 86,
    palletCapacity: 33,
    baseHourlyRate: 2800,
    minHours: 4,
    kmRate: 98
  },
  refrigerator: {
    id: 'refrigerator',
    label: 'Рефрижератор',
    shortLabel: 'реф',
    cargoLength: 12.4,
    cargoWidth: 2.45,
    cargoHeight: 2.55,
    capacityKg: 18000,
    capacityM3: 76,
    palletCapacity: 30,
    baseHourlyRate: 3300,
    minHours: 4,
    kmRate: 118
  }
};

const CITY_DISTANCES: Record<string, number> = {
  'краснодар-сочи': 286,
  'сочи-краснодар': 286,
  'краснодар-москва': 1340,
  'москва-краснодар': 1340,
  'краснодар-анапа': 170,
  'анапа-краснодар': 170,
  'краснодар-новороссийск': 150,
  'новороссийск-краснодар': 150,
  'краснодар-геленджик': 190,
  'геленджик-краснодар': 190,
  'москва-санкт-петербург': 710,
  'санкт-петербург-москва': 710
};

export function calculateDistance(from: string, to: string): number {
  const f = from.trim().toLowerCase();
  const t = to.trim().toLowerCase();
  if (f === t && f !== '') return 15;
  const key = `${f}-${t}`;
  if (CITY_DISTANCES[key]) return CITY_DISTANCES[key];
  if (!from.trim() || !to.trim()) return 0;
  const seed = Array.from(key).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 120 + (seed % 1280);
}

export function itemVolume(item: LoadItem): number {
  if (item.kind === 'pallet') {
    const boxVolume = item.boxes.reduce((sum, box) => sum + boxDimensions(box.size).length * boxDimensions(box.size).width * boxDimensions(box.size).height, 0);
    return item.dimensions.length * item.dimensions.width * item.dimensions.height + boxVolume;
  }
  return item.dimensions.length * item.dimensions.width * item.dimensions.height;
}

export function itemWeight(item: LoadItem): number {
  return item.weight + item.boxes.reduce((sum, box) => sum + box.weight, 0);
}

export function calculatePalletVolume(item: LoadItem): number { return itemVolume(item); }
export function calculatePalletWeight(item: LoadItem): number { return itemWeight(item); }

export function calculateTotals(items: LoadItem[]): { weight: number; volume: number } {
  return items.reduce((totals, item) => ({ weight: totals.weight + itemWeight(item), volume: totals.volume + itemVolume(item) }), { weight: 0, volume: 0 });
}

export function calculateTotalsWithPacking(items: LoadItem[], packing: boolean): { weight: number; volume: number; packingExtra: number } {
  const base = calculateTotals(items);
  const packingExtra = packing ? base.volume * 0.15 : 0;
  return { weight: base.weight, volume: base.volume + packingExtra, packingExtra };
}

export function boxDimensions(size: 'S' | 'M' | 'L' | 'XL'): { length: number; width: number; height: number } {
  switch (size) {
    case 'S': return { length: 0.4, width: 0.3, height: 0.3 };
    case 'M': return { length: 0.6, width: 0.4, height: 0.4 };
    case 'L': return { length: 0.8, width: 0.6, height: 0.6 };
    case 'XL': return { length: 1.0, width: 0.8, height: 0.8 };
  }
}

export function calculateDeliveryTime(distance: number): string {
  if (distance <= 0) return 'уточняется';
  const range = getTripRange(distance);
  if (range === 'city') return 'сегодня';
  if (range === 'regional') return 'сегодня / завтра';
  const days = Math.max(1, Math.ceil(distance / 400));
  return `${days}-${days + 2} дней`;
}

export function calculatePrice(params: {
  vehicleType: VehicleType;
  vehicleCount: number;
  distance: number;
  pallets: LoadItem[];
  services: import('../types').ServicesState;
  urgency: number;
  moveType?: MoveType;
}): { basePrice: number; additionalPrice: number; fuelPrice: number; insurancePrice: number; totalPrice: number; deliveryTime: string; fuelLiters: number; packingVolume: number; tripRange: TripRange; workHours: number } {
  const vehicle = VEHICLES[params.vehicleType];
  const totals = calculateTotals(params.pallets);
  const totalsWithPacking = calculateTotalsWithPacking(params.pallets, params.services.packing);
  const urgencyCoef = params.urgency === 1 ? 0.9 : params.urgency === 3 ? 1.35 : 1;
  const tripRange = getTripRange(params.distance);
  const count = params.vehicleCount;
  const distance = Math.max(0, params.distance);

  const moveCoef = params.moveType === 'office' ? 1.15 : params.moveType === 'commercial' ? 0.85 : 1;
  const volumeHandling = Math.round(Math.ceil(totalsWithPacking.volume) * 120 * moveCoef);
  const heavyHandling = totals.weight > 900 ? Math.ceil((totals.weight - 900) / 100) * 180 : 0;

  const driveHours = distance / 25;
  const loadingHours = totalsWithPacking.volume / 10;

  let laborCost: number;
  let mileageCost: number;
  let workHours: number;
  let fuelMinPrice: number;
  let emptyReturnKm = 0;

  if (tripRange === 'city') {
    workHours = Math.max(vehicle.minHours, Math.ceil(vehicle.minHours + driveHours + loadingHours));
    laborCost = vehicle.baseHourlyRate * workHours * count;
    mileageCost = 0;
    fuelMinPrice = 250;
  } else if (tripRange === 'regional') {
    workHours = vehicle.minHours;
    laborCost = vehicle.baseHourlyRate * vehicle.minHours * count;
    mileageCost = distance * vehicle.kmRate * 0.85 * count;
    fuelMinPrice = 350;
  } else {
    workHours = Math.ceil(vehicle.minHours / 2);
    laborCost = vehicle.baseHourlyRate * workHours * 0.5 * count;
    mileageCost = distance * vehicle.kmRate * 0.9 * count;
    mileageCost += distance * vehicle.kmRate * 0.3 * count;
    emptyReturnKm = distance;
    fuelMinPrice = 700;
  }

  const basePrice = Math.round((laborCost + mileageCost + volumeHandling + heavyHandling) * urgencyCoef);

  const baseConsumption = 12;
  const weightFactor = (totals.weight / 100) * 0.3;
  const fuelLiters = ((baseConsumption + weightFactor) * distance + baseConsumption * emptyReturnKm) / 100 * count;
  const fuelPricePerLiter = 62;
  const fuelPrice = Math.round(Math.max(fuelMinPrice, fuelLiters * fuelPricePerLiter));

  let additionalPrice = 0;
  if (params.services.packing) additionalPrice += 2000 + params.pallets.length * 220 + Math.round(totalsWithPacking.packingExtra * 180);
  if (params.services.disassembly) additionalPrice += 1500 * Math.max(1, Math.ceil(params.pallets.length / 5));
  if (params.services.assembly) additionalPrice += 2000 * Math.max(1, Math.ceil(params.pallets.length / 5));
  if (params.services.loaders > 0) additionalPrice += params.services.loaders * 500 * vehicle.minHours;
  if (params.services.documentsPacking) additionalPrice += 1200;
  if (params.services.itSupport) additionalPrice += 3500;
  if (params.services.nightMove) additionalPrice = Math.round((additionalPrice + basePrice) * 0.3 + additionalPrice);

  const insurancePrice = params.services.insurance ? Math.round((basePrice + fuelPrice + additionalPrice) * 0.05) : 0;
  return { basePrice, additionalPrice, fuelPrice, insurancePrice, totalPrice: basePrice + fuelPrice + additionalPrice + insurancePrice, deliveryTime: calculateDeliveryTime(params.distance), fuelLiters: Math.round(fuelLiters * 10) / 10, packingVolume: Math.round(totalsWithPacking.packingExtra * 100) / 100, tripRange, workHours };
}

export function getCapacity(params: { pallets: LoadItem[]; vehicleType: VehicleType; packing?: boolean }): { volumePercent: number; weightPercent: number; palletPercent: number; heightPercent: number; packingPercent: number } {
  const vehicle = VEHICLES[params.vehicleType];
  const totals = params.packing ? calculateTotalsWithPacking(params.pallets, true) : calculateTotals(params.pallets);
  const maxTop = params.pallets.reduce((max, item) => Math.max(max, item.position[1] + orientedHeight(item)), 0);
  return {
    volumePercent: Math.round((totals.volume / vehicle.capacityM3) * 100),
    weightPercent: Math.round((totals.weight / vehicle.capacityKg) * 100),
    palletPercent: Math.round((params.pallets.filter((item) => item.kind === 'pallet').length / Math.max(1, vehicle.palletCapacity)) * 100),
    heightPercent: Math.round((maxTop / vehicle.cargoHeight) * 100),
    packingPercent: params.packing ? Math.round((calculateTotalsWithPacking(params.pallets, true).packingExtra / vehicle.capacityM3) * 100) : 0
  };
}

export function orientedFootprint(item: LoadItem): { length: number; width: number } {
  const y = Math.abs(Math.sin(item.rotation[1])) > 0.5;
  return y ? { length: item.dimensions.width, width: item.dimensions.length } : { length: item.dimensions.length, width: item.dimensions.width };
}

export function orientedHeight(item: LoadItem): number {
  const laid = Math.abs(Math.sin(item.rotation[0])) > 0.5 || Math.abs(Math.sin(item.rotation[2])) > 0.5;
  if (!laid) return item.dimensions.height;
  return item.canLaySide ? Math.min(item.dimensions.length, item.dimensions.width) : item.dimensions.height;
}

export function recommendVehicle(items: LoadItem[]): VehicleType {
  const gazelleOrder: VehicleType[] = ['gazelle7', 'gazelle12', 'gazelle18'];
  const fullOrder: VehicleType[] = ['gazelle7', 'gazelle12', 'gazelle18', 'van5', 'van6', 'truck'];
  const totals = calculateTotals(items);
  if (items.length === 0) return 'gazelle7';
  const volumeOrder = gazelleOrder.find((key) => {
    const v = VEHICLES[key];
    return totals.volume <= v.capacityM3 * 0.98 && totals.weight <= v.capacityKg * 0.98;
  });
  if (volumeOrder) {
    const maxItemHeight = items.reduce((max, item) => Math.max(max, orientedHeight(item)), 0);
    const fitsHeight = VEHICLES[volumeOrder].cargoHeight >= maxItemHeight;
    if (fitsHeight) return volumeOrder;
  }
  const maxTop = items.reduce((max, item) => Math.max(max, item.position[1] + orientedHeight(item)), 0);
  const maxX = items.reduce((max, item) => Math.max(max, Math.abs(item.position[0]) + orientedFootprint(item).length / 2), 0);
  const maxZ = items.reduce((max, item) => Math.max(max, Math.abs(item.position[2]) + orientedFootprint(item).width / 2), 0);
  return (fullOrder.find((key) => {
    const v = VEHICLES[key];
    return totals.volume <= v.capacityM3 * 0.94 && totals.weight <= v.capacityKg * 0.94 && maxTop <= v.cargoHeight && maxX <= v.cargoLength / 2 && maxZ <= v.cargoWidth / 2;
  }) || 'gazelle18');
}

export function recommendVehicleForVolume(volumeM3: number): VehicleType {
  if (volumeM3 <= 7) return 'gazelle7';
  if (volumeM3 <= 12) return 'gazelle12';
  return 'gazelle18';
}

export function getStackHeightAt(palletId: string, x: number, z: number, pallets: LoadItem[]): number {
  const item = pallets.find((p) => p.id === palletId);
  if (!item) return 0.04;
  const fp = orientedFootprint(item);
  const halfL = fp.length / 2;
  const halfW = fp.width / 2;
  const minX = x - halfL;
  const maxX = x + halfL;
  const minZ = z - halfW;
  const maxZ = z + halfW;
  let maxTopY = item.kind === 'pallet' ? 0.072 : 0.04;
  pallets.forEach((other) => {
    if (other.id === palletId) return;
    const otherFp = orientedFootprint(other);
    const otherMinX = other.position[0] - otherFp.length / 2;
    const otherMaxX = other.position[0] + otherFp.length / 2;
    const otherMinZ = other.position[2] - otherFp.width / 2;
    const otherMaxZ = other.position[2] + otherFp.width / 2;
    const overlap = minX < otherMaxX && maxX > otherMinX && minZ < otherMaxZ && maxZ > otherMinZ;
    if (overlap) {
      const otherHeight = other.kind === 'pallet' ? Math.max(0.42, 0.144 + Math.ceil(other.boxes.length / 4) * 0.28) : orientedHeight(other);
      const otherTopY = other.position[1] + otherHeight;
      if (otherTopY > maxTopY) maxTopY = otherTopY;
    }
  });
  return Math.round(maxTopY / 0.05) * 0.05;
}

export function packItemsInVehicle(items: LoadItem[], vehicleType: VehicleType): { placed: LoadItem[]; overflow: LoadItem[] } {
  const vehicle = VEHICLES[vehicleType];
  const L = vehicle.cargoLength;
  const W = vehicle.cargoWidth;
  const H = vehicle.cargoHeight;

  const rawItems = items.map(item => ({ ...item, position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] }));

  const getPriority = (kind: string): number => {
    if (kind === 'fridge') return 1;
    if (kind === 'safe' || kind === 'piano') return 2;
    if (kind === 'wardrobe' || kind === 'sofa' || kind === 'bed' || kind === 'table') return 3;
    if (kind === 'washer' || kind === 'chairs' || kind === 'tv' || kind === 'bike') return 4;
    if (kind === 'pallet') return 5;
    return 6;
  };

  // === ЧЕЛОВЕЧЕСКАЯ ЛОГИКА: Сначала САМОЕ ТЯЖЁЛОЕ И ГАБАРИТНОЕ ===
  const superHeavy = new Set(['fridge', 'piano', 'safe', 'wardrobe', 'sofa', 'bed', 'washer']);
  
  const superHeavyItems = rawItems.filter(i => superHeavy.has(i.kind));
  const otherHeavy = rawItems.filter(i => !superHeavy.has(i.kind) && getPriority(i.kind) <= 4);
  const lightItems = rawItems.filter(i => getPriority(i.kind) > 4);

  superHeavyItems.sort((a, b) => {
    const pA = getPriority(a.kind);
    const pB = getPriority(b.kind);
    if (pA !== pB) return pA - pB;
    return itemVolume(b) - itemVolume(a);
  });

  otherHeavy.sort((a, b) => {
    const pA = getPriority(a.kind);
    const pB = getPriority(b.kind);
    if (pA !== pB) return pA - pB;
    return itemVolume(b) - itemVolume(a);
  });

  lightItems.sort((a, b) => itemVolume(b) - itemVolume(a));

  const sorted = [...superHeavyItems, ...otherHeavy, ...lightItems];

  const placed: LoadItem[] = [];
  const overflow: LoadItem[] = [];
  const WALL_SNAP = 0.06;

  interface PlacedRect {
    minX: number; maxX: number; minZ: number; maxZ: number;
    minY: number; maxY: number; stackable: boolean; maxStackWeight: number;
    kind: string;
  }
  const placedRects: PlacedRect[] = [];
  let placedVolume = 0;
  let placedWeight = 0;

  const rectOf = (o: LoadItem): PlacedRect => {
    const f = orientedFootprint(o);
    const h = o.kind === 'pallet' ? Math.max(0.42, 0.144 + Math.ceil(o.boxes.length / 4) * 0.28) : orientedHeight(o);
    return {
      minX: o.position[0] - f.length / 2, maxX: o.position[0] + f.length / 2,
      minZ: o.position[2] - f.width / 2, maxZ: o.position[2] + f.width / 2,
      minY: o.position[1], maxY: o.position[1] + h,
      stackable: o.stackable, maxStackWeight: o.maxStackWeight,
      kind: o.kind
    };
  };

  // === УЛУЧШЕННАЯ ФУНКЦИЯ ПОИСКА ЛУЧШЕЙ ПОЗИЦИИ (Best-Fit + Поперёк) ===
  function findBestPosition(item: LoadItem, currentRects: PlacedRect[]) {
    const isSuperHeavy = superHeavy.has(item.kind);
    const isLong = item.kind === 'sofa' || item.kind === 'bed' || item.kind === 'bike' || item.kind === 'table';

    // Для супер-тяжёлых пробуем оба варианта ориентации (вдоль + поперёк)
    const orientationsToTry: [number, number, number][] = [[0, 0, 0]];
    
    if (isSuperHeavy || isLong) {
      orientationsToTry.push([0, Math.PI / 2, 0]); // поперёк
    }

    let bestResult: any = null;
    let bestScore = Infinity;

    for (const rot of orientationsToTry) {
      const testItem = { ...item, rotation: [...rot] as [number, number, number] };

      if (testItem.dimensions.height > H && testItem.canLaySide) {
        testItem.rotation = [0, 0, Math.PI / 2];
      }

      const fp = orientedFootprint(testItem);
      const baseY = testItem.kind === 'pallet' ? 0.072 : 0.04;
      let itemHeight = testItem.kind === 'pallet' 
        ? Math.max(0.42, 0.144 + Math.ceil(testItem.boxes.length / 4) * 0.28) 
        : orientedHeight(testItem);

      const halfL = fp.length / 2;
      const halfW = fp.width / 2;

      const candidateZs: number[] = [];
      for (let z = -W / 2 + fp.width / 2; z <= W / 2 - fp.width / 2; z += 0.11) candidateZs.push(z);
      if (!candidateZs.some(z => Math.abs(z) < 1e-6)) candidateZs.push(0);

      const scanFromFront = !testItem.nearDoor;
      const xStart = scanFromFront ? -L / 2 + halfL : L / 2 - halfL;
      const xEnd = scanFromFront ? L / 2 - halfL : -L / 2 + halfL;
      const xStep = scanFromFront ? 0.085 : -0.085;

      type Candidate = { x: number; y: number; z: number; score: number; flip: boolean; adjHeight: number; rotation: [number,number,number] };

      const candidates: Candidate[] = [];

      for (let x = xStart; scanFromFront ? x <= xEnd + 0.001 : x >= xEnd - 0.001; x += xStep) {
        const minX = x - halfL, maxX = x + halfL;

        for (const z of candidateZs) {
          const minZ = z - halfW, maxZ = z + halfW;
          let maxTopY = baseY;
          let canStack = true;
          let belowKind = '';

          for (const r of currentRects) {
            if (maxX <= r.minX || minX >= r.maxX || maxZ <= r.minZ || minZ >= r.maxZ) continue;
            if (r.maxY > maxTopY) {
              maxTopY = r.maxY;
              belowKind = r.kind;
              if (!r.stackable || testItem.weight > r.maxStackWeight || belowKind === 'plant') canStack = false;
            }
          }

          let adjHeight = itemHeight;
          let doFlip = false;

          if (testItem.kind === 'table' && belowKind === 'table' && canStack && maxTopY > baseY + 0.001) {
            doFlip = true;
            adjHeight = 0.06;
          }

          if (canStack && (maxTopY + adjHeight) <= H) {
            const aMinY = maxTopY;
            const aMaxY = maxTopY + adjHeight;

            let hasCollision = false;
            for (const r of currentRects) {
              if (maxX <= r.minX || minX >= r.maxX || maxZ <= r.minZ || minZ >= r.maxZ) continue;
              if (aMinY < r.maxY && aMaxY > r.minY) { hasCollision = true; break; }
            }

            if (!hasCollision) {
              const gap = maxTopY - baseY;
              const wallBonus = (Math.abs(z) > W / 2 - 0.35 ? 0.9 : 0) + (Math.abs(x) > L / 2 - 0.55 ? 0.5 : 0);
              const score = maxTopY * 10 + gap * 3 - wallBonus * 2;

              candidates.push({
                x, y: maxTopY, z,
                score,
                flip: doFlip,
                adjHeight,
                rotation: testItem.rotation
              });
            }
          }
        }
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.score - b.score);
        const best = candidates[0];
        if (best.score < bestScore) {
          bestScore = best.score;
          bestResult = best;
        }
      }
    }

    if (!bestResult) return null;

    // Применяем лучшую ориентацию
    item.rotation = bestResult.rotation;

    return {
      x: bestResult.x,
      y: bestResult.y,
      z: bestResult.z,
      flip: bestResult.flip,
      itemHeight: bestResult.adjHeight
    };
  }

  // === Основной цикл размещения ===
  sorted.forEach((item) => {
    const itemV = itemVolume(item);
    const itemW = itemWeight(item);

    if (placedVolume + itemV > vehicle.capacityM3 * 1.0 || placedWeight + itemW > vehicle.capacityKg * 1.0) {
      overflow.push(item);
      return;
    }

    const result = findBestPosition(item, placedRects);

    if (result) {
      if (result.flip) {
        item.rotation = [Math.PI, item.rotation[1], item.rotation[2]];
      }

      // Прилипание к стенам
      let snappedX = result.x;
      let snappedZ = result.z;
      const halfL = orientedFootprint(item).length / 2;
      const halfW = orientedFootprint(item).width / 2;

      if (Math.abs(result.z - (-W / 2 + halfW)) < WALL_SNAP) snappedZ = -W / 2 + halfW;
      if (Math.abs(result.z - (W / 2 - halfW)) < WALL_SNAP) snappedZ = W / 2 - halfW;
      if (Math.abs(result.x - (-L / 2 + halfL)) < WALL_SNAP) snappedX = -L / 2 + halfL;
      if (Math.abs(result.x - (L / 2 - halfL)) < WALL_SNAP) snappedX = L / 2 - halfL;

      item.position = [Math.round(snappedX / 0.05) * 0.05, Math.round(result.y / 0.05) * 0.05, snappedZ];
      placed.push(item);
      placedRects.push(rectOf(item));
      placedVolume += itemV;
      placedWeight += itemW;

      // === НОВАЯ ЛОГИКА: Дозаполнение пространства НАД крупным предметом ===
      const itemHeightFinal = result.adjHeight ?? itemHeight;
      const topY = result.y + itemHeightFinal;
      const availableHeight = H - topY;

      if (availableHeight > 0.35 && itemHeightFinal >= 0.75) {
        // Ищем подходящие предметы для размещения сверху
        const remaining = sorted.filter(s => 
          !placed.some(p => p.id === s.id) && 
          !overflow.some(o => o.id === s.id)
        );

        for (let i = 0; i < remaining.length && availableHeight > 0.35; i++) {
          const smallItem = remaining[i];
          const smallV = itemVolume(smallItem);
          const smallW = itemWeight(smallItem);

          if (placedVolume + smallV > vehicle.capacityM3 * 0.98 || placedWeight + smallW > vehicle.capacityKg * 0.98) continue;
          if (smallItem.dimensions.height > availableHeight) continue;
          if (smallItem.kind === 'plant') continue; // не ставим на растение

          const smallFp = orientedFootprint(smallItem);
          const smallHalfL = smallFp.length / 2;
          const smallHalfW = smallFp.width / 2;

          // Проверяем, влезает ли по footprint текущего предмета
          const itemFp = orientedFootprint(item);
          if (smallFp.length > itemFp.length + 0.08 || smallFp.width > itemFp.width + 0.08) continue;

          // Проверяем штабелируемость
          const belowRect = placedRects[placedRects.length - 1];
          if (!belowRect.stackable || smallW > belowRect.maxStackWeight) continue;

          // Размещаем прямо над текущим предметом (с небольшим центрированием)
          const newX = item.position[0] + (Math.random() - 0.5) * 0.15;
          const newZ = item.position[2] + (Math.random() - 0.5) * 0.15;

          smallItem.position = [
            Math.round(newX / 0.05) * 0.05,
            Math.round(topY / 0.05) * 0.05,
            Math.round(newZ / 0.05) * 0.05
          ];
          smallItem.rotation = [0, 0, 0];

          placed.push(smallItem);
          placedRects.push(rectOf(smallItem));
          placedVolume += smallV;
          placedWeight += smallW;

          // Удаляем из sorted, чтобы не обрабатывать повторно
          const idx = sorted.findIndex(s => s.id === smallItem.id);
          if (idx !== -1) sorted.splice(idx, 1);
        }
      }
    } else {
      // Попытка положить на бок
      if (item.canLaySide && Math.abs(item.rotation[2]) < 0.1) {
        const origRot = [...item.rotation];
        item.rotation = [Math.PI / 2, item.rotation[1], 0];
        const altResult = findBestPosition(item, placedRects);
        if (altResult) {
          item.position = [Math.round(altResult.x / 0.05) * 0.05, Math.round(altResult.y / 0.05) * 0.05, altResult.z];
          placed.push(item);
          placedRects.push(rectOf(item));
          placedVolume += itemV;
          placedWeight += itemW;
          return;
        }
        item.rotation = origRot as [number, number, number];
      }
      overflow.push(item);
    }
  });

  return { placed, overflow };
}

export function computeCenterOfGravity(items: LoadItem[]): { x: number; y: number; z: number; weight: number } {
  if (items.length === 0) return { x: 0, y: 0, z: 0, weight: 0 };
  let sumX = 0, sumY = 0, sumZ = 0, sumW = 0;
  items.forEach((item) => {
    const w = itemWeight(item);
    const h = orientedHeight(item);
    sumX += item.position[0] * w;
    sumY += (item.position[1] + h / 2) * w;
    sumZ += item.position[2] * w;
    sumW += w;
  });
  return { x: sumX / sumW, y: sumY / sumW, z: sumZ / sumW, weight: sumW };
}

export function computeAxleLoads(items: LoadItem[], vehicleType: VehicleType): { frontKg: number; rearKg: number; leftKg: number; rightKg: number; imbalancePercent: number; lateralPercent: number; isOverloadedFront: boolean; isOverloadedRear: boolean; isLateralRisk: boolean; isTippingRisk: boolean } {
  const vehicle = VEHICLES[vehicleType];
  const L = vehicle.cargoLength;
  const W = vehicle.cargoWidth;
  const frontAxleX = -L / 2 - 0.9;
  const rearAxleX = -L / 2 + L * 0.32;
  const wheelbase = Math.abs(rearAxleX - frontAxleX);
  let totalWeight = 0, momentFront = 0;
  items.forEach((item) => {
    const w = itemWeight(item);
    totalWeight += w;
    const distFromFront = item.position[0] - frontAxleX;
    momentFront += w * distFromFront;
  });
  const rearKgRaw = wheelbase > 0 ? momentFront / wheelbase : totalWeight;
  const frontKgRaw = totalWeight - rearKgRaw;
  const cog = computeCenterOfGravity(items);
  const lateralPercent = W > 0 ? Math.abs(cog.z) / (W / 2) * 100 : 0;
  const leftKg = totalWeight * (0.5 - cog.z / W);
  const rightKg = totalWeight * (0.5 + cog.z / W);
  const imbalance = totalWeight === 0 ? 0 : Math.abs(frontKgRaw - rearKgRaw) / Math.max(1, Math.abs(frontKgRaw) + Math.abs(rearKgRaw)) * 100;
  const tippingRisk = lateralPercent > 35 && cog.y > vehicle.cargoHeight * 0.6;
  return {
    frontKg: Math.round(frontKgRaw),
    rearKg: Math.round(rearKgRaw),
    leftKg: Math.round(leftKg),
    rightKg: Math.round(rightKg),
    imbalancePercent: Math.round(imbalance),
    lateralPercent: Math.round(lateralPercent),
    isOverloadedFront: frontKgRaw > totalWeight * 0.65 || frontKgRaw < -totalWeight * 0.1,
    isOverloadedRear: rearKgRaw > totalWeight * 0.85,
    isLateralRisk: lateralPercent > 35,
    isTippingRisk: tippingRisk
  };
}

export function canFitThroughDoor(item: LoadItem, vehicleType: VehicleType): { fits: boolean; reason?: string; fitsRotated?: boolean } {
  const vehicle = VEHICLES[vehicleType];
  const doorWidth = vehicle.cargoWidth * 0.90;
  const rawDoorHeight = vehicle.cargoHeight * 0.88;
  const doorHeight = vehicle.cargoHeight > 1.9 ? Math.min(rawDoorHeight, 1.92) : rawDoorHeight;
  const fp = orientedFootprint(item);
  const h = orientedHeight(item);
  const diagDoor = Math.sqrt(doorWidth * doorWidth + doorHeight * doorHeight);
  const diagItemFace1 = Math.sqrt(fp.length * fp.length + h * h);
  const diagItemFace2 = Math.sqrt(fp.width * fp.width + h * h);
  const diagItemBase = Math.sqrt(fp.length * fp.length + fp.width * fp.width);

  const orientations: Array<{ w: number; h: number }> = [
    { w: fp.length, h: h },
    { w: fp.width, h: h },
  ];
  if (item.canLaySide) {
    orientations.push({ w: fp.length, h: fp.width });
    orientations.push({ w: fp.width, h: fp.length });
    orientations.push({ w: h, h: fp.length });
    orientations.push({ w: h, h: fp.width });
  }

  for (const o of orientations) {
    if (o.w <= doorWidth && o.h <= doorHeight) return { fits: true, fitsRotated: o.w !== fp.length || o.h !== h };
    if (o.w <= doorHeight && o.h <= doorWidth) return { fits: true, fitsRotated: true };
  }

  if (diagItemFace1 <= diagDoor && fp.width <= doorWidth) return { fits: true, fitsRotated: true };
  if (diagItemFace2 <= diagDoor && fp.length <= doorWidth) return { fits: true, fitsRotated: true };
  if (diagItemBase <= doorWidth && h <= doorHeight) return { fits: true, fitsRotated: true };

  if (fp.width > doorWidth && fp.length > doorWidth) {
    return { fits: false, reason: `ширина ${Math.min(fp.width, fp.length).toFixed(2)}м > проем ${doorWidth.toFixed(2)}м` };
  }
  if (h > doorHeight && Math.min(fp.length, fp.width) > doorWidth) {
    return { fits: false, reason: `высота ${h.toFixed(2)}м > проем ${doorHeight.toFixed(2)}м, диагональ ${diagItemFace1.toFixed(2)}м > ${diagDoor.toFixed(2)}м` };
  }
  if (!item.canLaySide && (Math.abs(item.dimensions.length - fp.length) > 0.01 || Math.abs(item.dimensions.width - fp.width) > 0.01)) {
    return { fits: false, reason: 'нельзя класть боком' };
  }
  return { fits: false, reason: `не проходит в проем ${doorWidth.toFixed(2)}×${doorHeight.toFixed(2)}м` };
}

export function getDistanceToWalls(item: LoadItem, vehicleType: VehicleType): { left: number; right: number; front: number; back: number; top: number } {
  const vehicle = VEHICLES[vehicleType];
  const L = vehicle.cargoLength; const W = vehicle.cargoWidth; const H = vehicle.cargoHeight;
  const fp = orientedFootprint(item); const h = orientedHeight(item);
  const minX = item.position[0] - fp.length / 2; const maxX = item.position[0] + fp.length / 2;
  const minZ = item.position[2] - fp.width / 2; const maxZ = item.position[2] + fp.width / 2;
  const maxY = item.position[1] + h;
  return { front: Math.abs(minX - (-L / 2)), back: Math.abs(L / 2 - maxX), left: Math.abs(minZ - (-W / 2)), right: Math.abs(W / 2 - maxZ), top: Math.abs(H - maxY) };
}

export function computeFloorHeatmap(items: LoadItem[], vehicleType: VehicleType, grid: number = 10): number[][] {
  const vehicle = VEHICLES[vehicleType];
  const L = vehicle.cargoLength; const W = vehicle.cargoWidth;
  const heat: number[][] = Array.from({ length: grid }, () => Array.from({ length: grid }, () => 0));
  const cellL = L / grid; const cellW = W / grid;
  items.forEach((item) => {
    const w = itemWeight(item);
    const fp = orientedFootprint(item);
    const minX = item.position[0] - fp.length / 2; const maxX = item.position[0] + fp.length / 2;
    const minZ = item.position[2] - fp.width / 2; const maxZ = item.position[2] + fp.width / 2;
    const x0 = Math.max(0, Math.floor((minX + L / 2) / cellL));
    const x1 = Math.min(grid - 1, Math.floor((maxX + L / 2) / cellL));
    const z0 = Math.max(0, Math.floor((minZ + W / 2) / cellW));
    const z1 = Math.min(grid - 1, Math.floor((maxZ + W / 2) / cellW));
    for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) heat[x][z] += w / ((x1 - x0 + 1) * (z1 - z0 + 1));
  });
  return heat;
}

export function generateSharePayload(pallets: LoadItem[], vehicleType: VehicleType): string {
  const minimal = pallets.map((p) => ({ k: p.kind, p: p.position.map((v) => Math.round(v * 100) / 100), r: p.rotation.map((v) => Math.round(v * 100) / 100) }));
  const data = { v: vehicleType, items: minimal, ver: 3 };
  try { return btoa(encodeURIComponent(JSON.stringify(data))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch { return ''; }
}

export function parseSharePayload(payload: string): { vehicleType: VehicleType; items: Array<{ kind: string; position: [number, number, number]; rotation: [number, number, number] }> } | null {
  try {
    let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const json = decodeURIComponent(atob(b64));
    const parsed = JSON.parse(json);
    return parsed;
  } catch { return null; }
}

export function checkOverload(items: LoadItem[], vehicleType: VehicleType): { overloaded: boolean; weightPercent: number; volumePercent: number; message?: string } {
  const vehicle = VEHICLES[vehicleType];
  const totals = calculateTotals(items);
  const weightPercent = (totals.weight / vehicle.capacityKg) * 100;
  const volumePercent = (totals.volume / vehicle.capacityM3) * 100;
  if (weightPercent > 100) return { overloaded: true, weightPercent, volumePercent, message: `Перегруз по весу ${totals.weight}кг > ${vehicle.capacityKg}кг` };
  if (volumePercent > 100) return { overloaded: true, weightPercent, volumePercent, message: `Перегруз по объему ${totals.volume.toFixed(1)}м³ > ${vehicle.capacityM3}м³` };
  return { overloaded: false, weightPercent, volumePercent };
}

interface BoxTemplate {
  size: 'S' | 'M' | 'L';
  dims: { length: number; width: number; height: number };
  weight: number;
  volume: number;
}

const FILL_BOX_TEMPLATES: BoxTemplate[] = [
  { size: 'S', dims: { length: 0.4, width: 0.3, height: 0.3 }, weight: 6, volume: 0.4*0.3*0.3 },
  { size: 'M', dims: { length: 0.6, width: 0.4, height: 0.4 }, weight: 12, volume: 0.6*0.4*0.4 },
  { size: 'L', dims: { length: 0.8, width: 0.6, height: 0.6 }, weight: 22, volume: 0.8*0.6*0.6 }
];

export function fillCargoWithBoxes(items: LoadItem[], vehicleType: VehicleType, makeId: () => string, maxIterations = 8): { placed: LoadItem[]; overflow: LoadItem[] } {
  let placed = [...items];
  let overflow: LoadItem[] = [];
  const fillIds = new Set<string>();
  let consecutiveEmpty = 0;
  for (let i = 0; i < maxIterations; i++) {
    placed.forEach((p) => { if (fillIds.has(p.id)) p.rotation = [0, 0, 0]; });
    const fillBoxes = generateFillBoxes(placed, vehicleType);
    if (fillBoxes.length === 0) break;
    const withIds = fillBoxes.map((b) => ({ ...b, id: makeId() }));
    const withIdSet = new Set(withIds.map((b) => b.id));
    withIds.forEach((b) => fillIds.add(b.id));
    const packed = packItemsInVehicle([...placed, ...withIds], vehicleType);
    overflow = packed.overflow.filter((o) => !withIdSet.has(o.id));
    placed = packed.placed;
    const placedIds = new Set(placed.map((p) => p.id));
    fillIds.forEach((id) => { if (!placedIds.has(id)) fillIds.delete(id); });
    const added = withIds.filter((b) => placedIds.has(b.id)).length;
    consecutiveEmpty = added === 0 ? consecutiveEmpty + 1 : 0;
    if (consecutiveEmpty >= 2) break;
  }
  return { placed, overflow };
}

export function generateFillBoxes(items: LoadItem[], vehicleType: VehicleType): Array<Omit<LoadItem, 'id'>> {
  const vehicle = VEHICLES[vehicleType];
  const MAX_FILL = 0.92;
  const totals = calculateTotals(items);
  const freeVol = vehicle.capacityM3 * MAX_FILL - totals.volume;
  const freeWeight = vehicle.capacityKg * MAX_FILL - totals.weight;

  if (freeVol < 0.05 || freeWeight < 5) return [];

  const boxes: Array<Omit<LoadItem, 'id'>> = [];
  let usedVol = 0;
  let usedWeight = 0;

  const mix: Array<{ template: BoxTemplate; ratio: number }> = [
    { template: FILL_BOX_TEMPLATES[1], ratio: 0.5 },
    { template: FILL_BOX_TEMPLATES[0], ratio: 0.3 },
    { template: FILL_BOX_TEMPLATES[2], ratio: 0.2 },
  ];

  let iterations = 0;
  const MAX_ITER = 200;

  while (usedVol < freeVol - 0.02 && usedWeight < freeWeight - 3 && iterations < MAX_ITER) {
    iterations++;
    let template: BoxTemplate;
    if (freeVol - usedVol < 0.15) {
      template = FILL_BOX_TEMPLATES[0];
    } else if (freeVol - usedVol < 0.35) {
      template = FILL_BOX_TEMPLATES[1];
    } else {
      template = FILL_BOX_TEMPLATES[2];
    }

    const addVol = template.volume;
    const addWeight = template.weight;
    if (usedVol + addVol > freeVol || usedWeight + addWeight > freeWeight) {
      if (template.size === 'L') {
        template = FILL_BOX_TEMPLATES[1];
      } else if (template.size === 'M') {
        template = FILL_BOX_TEMPLATES[0];
      } else {
        break;
      }
      if (usedVol + template.volume > freeVol || usedWeight + template.weight > freeWeight) break;
    }

    usedVol += template.volume;
    usedWeight += template.weight;
    boxes.push({
      kind: 'box',
      name: `Коробка ${template.size}`,
      type: 'STANDARD' as any,
      position: [0, 0.04, 0],
      rotation: [0, 0, 0],
      weight: template.weight,
      boxes: [],
      dimensions: template.dims,
      material: 'cardboard' as any,
      wrapped: false,
      stackable: true,
      maxStackWeight: 60,
      canLaySide: true,
      fragile: false
    });
  }

  return boxes;
}

export function placeNewItem(existingItems: LoadItem[], newItem: LoadItem, vehicleType: VehicleType): { pallets: LoadItem[]; overflow: LoadItem[]; placed: boolean } {
  const vehicle = VEHICLES[vehicleType];
  const L = vehicle.cargoLength;
  const W = vehicle.cargoWidth;
  const H = vehicle.cargoHeight;

  const placedRects = existingItems.map(o => {
    const f = orientedFootprint(o);
    const h = o.kind === 'pallet' ? Math.max(0.42, 0.144 + Math.ceil(o.boxes.length / 4) * 0.28) : orientedHeight(o);
    return {
      minX: o.position[0] - f.length / 2, maxX: o.position[0] + f.length / 2,
      minZ: o.position[2] - f.width / 2, maxZ: o.position[2] + f.width / 2,
      minY: o.position[1], maxY: o.position[1] + h,
      stackable: o.stackable, maxStackWeight: o.maxStackWeight,
      kind: o.kind
    };
  });

  const item = { ...newItem, position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] };
  const itemV = itemVolume(item);
  const itemW = itemWeight(item);
  const totals = calculateTotals(existingItems);
  if (totals.volume + itemV > vehicle.capacityM3 * 1.0 || totals.weight + itemW > vehicle.capacityKg * 1.0) {
    return { pallets: existingItems, overflow: [item], placed: false };
  }

  // Используем ту же улучшенную Best-Fit логику
  const result = (function findBest(item: LoadItem, currentRects: any[]) {
    if (item.dimensions.height > H && item.canLaySide) item.rotation = [0, 0, Math.PI / 2];
    const isLong = item.kind === 'sofa' || item.kind === 'bed' || item.kind === 'bike' || item.kind === 'table';
    if (isLong) item.rotation = [item.rotation[0], Math.PI / 2, item.rotation[2]];

    const fp = orientedFootprint(item);
    const baseY = item.kind === 'pallet' ? 0.072 : 0.04;
    let itemHeight = item.kind === 'pallet' ? Math.max(0.42, 0.144 + Math.ceil(item.boxes.length / 4) * 0.28) : orientedHeight(item);

    const halfL = fp.length / 2;
    const halfW = fp.width / 2;

    const candidateZs: number[] = [];
    if (isLong) {
      candidateZs.push(-W / 2 + fp.width / 2 + 0.06);
      candidateZs.push(W / 2 - fp.width / 2 - 0.06);
      for (let z = -W / 2 + fp.width / 2 + 0.1; z <= W / 2 - fp.width / 2; z += 0.14) candidateZs.push(z);
    } else {
      for (let z = -W / 2 + fp.width / 2; z <= W / 2 - fp.width / 2; z += 0.11) candidateZs.push(z);
      if (!candidateZs.some(z => Math.abs(z) < 1e-6)) candidateZs.push(0);
    }

    const scanFromFront = !item.nearDoor;
    const xStart = scanFromFront ? -L / 2 + halfL : L / 2 - halfL;
    const xEnd = scanFromFront ? L / 2 - halfL : -L / 2 + halfL;
    const xStep = scanFromFront ? 0.085 : -0.085;

    type Cand = { x: number; y: number; z: number; score: number; flip: boolean; h: number };
    const cands: Cand[] = [];

    for (let x = xStart; scanFromFront ? x <= xEnd + 0.001 : x >= xEnd - 0.001; x += xStep) {
      const minX = x - halfL, maxX = x + halfL;
      for (const z of candidateZs) {
        const minZ = z - halfW, maxZ = z + halfW;
        let maxTopY = baseY;
        let canStack = true;
        let belowKind = '';

        for (const r of currentRects) {
          if (maxX <= r.minX || minX >= r.maxX || maxZ <= r.minZ || minZ >= r.maxZ) continue;
          if (r.maxY > maxTopY) {
            maxTopY = r.maxY;
            belowKind = r.kind;
            if (!r.stackable || item.weight > r.maxStackWeight || belowKind === 'plant') canStack = false;
          }
        }

        let adjH = itemHeight;
        let doFlip = false;
        if (item.kind === 'table' && belowKind === 'table' && canStack && maxTopY > baseY + 0.001) {
          doFlip = true; adjH = 0.06;
        }

        if (canStack && maxTopY + adjH <= H) {
          const aMinY = maxTopY, aMaxY = maxTopY + adjH;
          let collision = false;
          for (const r of currentRects) {
            if (maxX <= r.minX || minX >= r.maxX || maxZ <= r.minZ || minZ >= r.maxZ) continue;
            if (aMinY < r.maxY && aMaxY > r.minY) { collision = true; break; }
          }
          if (!collision) {
            const gap = maxTopY - baseY;
            const wallBonus = (Math.abs(z) > W / 2 - 0.35 ? 0.7 : 0) + (Math.abs(x) > L / 2 - 0.55 ? 0.35 : 0);
            const score = maxTopY * 10 + gap * 3 - wallBonus * 2;
            cands.push({ x, y: maxTopY, z, score, flip: doFlip, h: adjH });
          }
        }
      }
    }

    if (cands.length === 0) return null;
    cands.sort((a, b) => a.score - b.score);
    return cands[0];
  })(item, placedRects);

  if (result) {
    if (result.flip) item.rotation = [Math.PI, item.rotation[1], item.rotation[2]];

    let snappedX = result.x;
    let snappedZ = result.z;
    const halfL = orientedFootprint(item).length / 2;
    const halfW = orientedFootprint(item).width / 2;

    if (Math.abs(result.z - (-W / 2 + halfW)) < 0.06) snappedZ = -W / 2 + halfW;
    if (Math.abs(result.z - (W / 2 - halfW)) < 0.06) snappedZ = W / 2 - halfW;
    if (Math.abs(result.x - (-L / 2 + halfL)) < 0.06) snappedX = -L / 2 + halfL;
    if (Math.abs(result.x - (L / 2 - halfL)) < 0.06) snappedX = L / 2 - halfL;

    item.position = [Math.round(snappedX / 0.05) * 0.05, Math.round(result.y / 0.05) * 0.05, snappedZ];
    return { pallets: [...existingItems, item], overflow: [], placed: true };
  }

  return { pallets: [...existingItems, item], overflow: [item], placed: false };
}

