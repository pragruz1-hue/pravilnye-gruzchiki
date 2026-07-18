import { LoadItem, VehicleSpec, VehicleType } from '../types';

export const VEHICLES: Record<VehicleType, VehicleSpec> = {
  gazelle3: {
    id: 'gazelle3',
    label: 'Газель 3 м',
    shortLabel: '3 м',
    cargoLength: 3.0,
    cargoWidth: 1.9,
    cargoHeight: 1.8,
    capacityKg: 1500,
    capacityM3: 10.3,
    palletCapacity: 4,
    baseHourlyRate: 900,
    minHours: 3,
    kmRate: 36
  },
  gazelle42: {
    id: 'gazelle42',
    label: 'Газель 4.2 м',
    shortLabel: '4.2 м',
    cargoLength: 4.2,
    cargoWidth: 2.0,
    cargoHeight: 2.1,
    capacityKg: 2000,
    capacityM3: 17.6,
    palletCapacity: 6,
    baseHourlyRate: 1100,
    minHours: 3,
    kmRate: 42
  },
  van5: {
    id: 'van5',
    label: 'Фургон 5 м',
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
    label: 'Фургон 6 м',
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
  const key = `${from.trim().toLowerCase()}-${to.trim().toLowerCase()}`;
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

export function calculatePalletVolume(item: LoadItem): number {
  return itemVolume(item);
}

export function calculatePalletWeight(item: LoadItem): number {
  return itemWeight(item);
}

export function calculateTotals(items: LoadItem[]): { weight: number; volume: number } {
  return items.reduce(
    (totals, item) => ({ weight: totals.weight + itemWeight(item), volume: totals.volume + itemVolume(item) }),
    { weight: 0, volume: 0 }
  );
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
  if (distance <= 80) return 'сегодня';
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
}): { basePrice: number; additionalPrice: number; fuelPrice: number; insurancePrice: number; totalPrice: number; deliveryTime: string } {
  const vehicle = VEHICLES[params.vehicleType];
  const totals = calculateTotals(params.pallets);
  const urgencyCoef = params.urgency === 1 ? 0.9 : params.urgency === 3 ? 1.35 : 1;
  const baseByTime = vehicle.baseHourlyRate * vehicle.minHours * params.vehicleCount;
  const distancePrice = Math.max(0, params.distance * vehicle.kmRate * params.vehicleCount);
  const volumeHandling = Math.ceil(totals.volume) * 120;
  const heavyHandling = totals.weight > 900 ? Math.ceil((totals.weight - 900) / 100) * 180 : 0;
  const basePrice = Math.round((baseByTime + distancePrice + volumeHandling + heavyHandling) * urgencyCoef);
  const fuelPrice = Math.round(Math.max(700, params.distance * (vehicle.kmRate * 0.22) * params.vehicleCount));

  let additionalPrice = 0;
  if (params.services.packing) additionalPrice += 2000 + params.pallets.length * 220;
  if (params.services.disassembly) additionalPrice += 1500 * Math.max(1, Math.ceil(params.pallets.length / 5));
  if (params.services.assembly) additionalPrice += 2000 * Math.max(1, Math.ceil(params.pallets.length / 5));
  if (params.services.loaders > 0) additionalPrice += params.services.loaders * 500 * vehicle.minHours;
  if (params.services.documentsPacking) additionalPrice += 1200;
  if (params.services.itSupport) additionalPrice += 3500;
  if (params.services.nightMove) additionalPrice = Math.round((additionalPrice + basePrice) * 0.3 + additionalPrice);

  const insurancePrice = params.services.insurance ? Math.round((basePrice + fuelPrice + additionalPrice) * 0.05) : 0;
  return { basePrice, additionalPrice, fuelPrice, insurancePrice, totalPrice: basePrice + fuelPrice + additionalPrice + insurancePrice, deliveryTime: calculateDeliveryTime(params.distance) };
}

export function getCapacity(params: { pallets: LoadItem[]; vehicleType: VehicleType }): { volumePercent: number; weightPercent: number; palletPercent: number; heightPercent: number } {
  const vehicle = VEHICLES[params.vehicleType];
  const totals = calculateTotals(params.pallets);
  const maxTop = params.pallets.reduce((max, item) => Math.max(max, item.position[1] + orientedHeight(item)), 0);
  return {
    volumePercent: Math.round((totals.volume / vehicle.capacityM3) * 100),
    weightPercent: Math.round((totals.weight / vehicle.capacityKg) * 100),
    palletPercent: Math.round((params.pallets.filter((item) => item.kind === 'pallet').length / Math.max(1, vehicle.palletCapacity)) * 100),
    heightPercent: Math.round((maxTop / vehicle.cargoHeight) * 100)
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
  const order: VehicleType[] = ['gazelle3', 'gazelle42', 'van5', 'van6', 'truck'];
  const totals = calculateTotals(items);
  const maxTop = items.reduce((max, item) => Math.max(max, item.position[1] + orientedHeight(item)), 0);
  const maxX = items.reduce((max, item) => Math.max(max, Math.abs(item.position[0]) + orientedFootprint(item).length / 2), 0);
  const maxZ = items.reduce((max, item) => Math.max(max, Math.abs(item.position[2]) + orientedFootprint(item).width / 2), 0);
  return order.find((key) => {
    const v = VEHICLES[key];
    return totals.volume <= v.capacityM3 * 0.94 && totals.weight <= v.capacityKg * 0.94 && maxTop <= v.cargoHeight && maxX <= v.cargoLength / 2 && maxZ <= v.cargoWidth / 2;
  }) || 'truck';
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
      if (otherTopY > maxTopY) {
        maxTopY = otherTopY;
      }
    }
  });
  
  return maxTopY;
}

export function packItemsInVehicle(items: LoadItem[], vehicleType: VehicleType): LoadItem[] {
  const vehicle = VEHICLES[vehicleType];
  const L = vehicle.cargoLength;
  const W = vehicle.cargoWidth;
  const H = vehicle.cargoHeight;

  const rawItems = items.map(item => ({
    ...item,
    position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number]
  }));

  const getPriority = (kind: string) => {
    if (kind === 'fridge') return 1;
    if (kind === 'safe' || kind === 'piano') return 2;
    if (kind === 'wardrobe' || kind === 'sofa' || kind === 'bed' || kind === 'table') return 3;
    if (kind === 'washer' || kind === 'chairs' || kind === 'tv' || kind === 'bike') return 4;
    if (kind === 'pallet') return 5;
    return 6;
  };

  const sorted = [...rawItems].sort((a, b) => {
    const pA = getPriority(a.kind);
    const pB = getPriority(b.kind);
    if (pA !== pB) return pA - pB;
    return itemVolume(b) - itemVolume(a);
  });

  const placed: LoadItem[] = [];

  sorted.forEach((item) => {
    if (item.dimensions.height > H && item.canLaySide) {
      item.rotation = [0, 0, Math.PI / 2];
    }

    const isLong = item.kind === 'sofa' || item.kind === 'bed' || item.kind === 'bike' || item.kind === 'table';
    if (isLong) {
      item.rotation = [item.rotation[0], Math.PI / 2, item.rotation[2]];
    }

    const fp = orientedFootprint(item);
    const itemHeight = item.kind === 'pallet' ? Math.max(0.42, 0.144 + Math.ceil(item.boxes.length / 4) * 0.28) : orientedHeight(item);

    let bestX = 0;
    let bestY = item.kind === 'pallet' ? 0.072 : 0.04;
    let bestZ = 0;
    let found = false;

    const candidateZs: number[] = [];
    if (isLong) {
      candidateZs.push(-W / 2 + fp.width / 2);
      candidateZs.push(W / 2 - fp.width / 2);
      for (let z = -W / 2 + fp.width / 2 + 0.1; z <= W / 2 - fp.width / 2; z += 0.2) {
        candidateZs.push(z);
      }
    } else {
      for (let z = -W / 2 + fp.width / 2; z <= W / 2 - fp.width / 2; z += 0.15) {
        candidateZs.push(z);
      }
    }

    for (let x = -L / 2 + fp.length / 2; x <= L / 2 - fp.length / 2; x += 0.1) {
      if (found) break;
      for (const z of candidateZs) {
        let maxTopY = item.kind === 'pallet' ? 0.072 : 0.04;
        let canStackOnTop = true;

        for (const other of placed) {
          const otherFp = orientedFootprint(other);
          const otherMinX = other.position[0] - otherFp.length / 2;
          const otherMaxX = other.position[0] + otherFp.length / 2;
          const otherMinZ = other.position[2] - otherFp.width / 2;
          const otherMaxZ = other.position[2] + otherFp.width / 2;

          const overlap = (x - fp.length / 2) < otherMaxX && (x + fp.length / 2) > otherMinX &&
                          (z - fp.width / 2) < otherMaxZ && (z + fp.width / 2) > otherMinZ;

          if (overlap) {
            const otherHeight = other.kind === 'pallet' ? Math.max(0.42, 0.144 + Math.ceil(other.boxes.length / 4) * 0.28) : orientedHeight(other);
            const otherTopY = other.position[1] + otherHeight;
            if (otherTopY > maxTopY) {
              maxTopY = otherTopY;
              if (!other.stackable || item.weight > other.maxStackWeight) {
                canStackOnTop = false;
              }
            }
          }
        }

        if (canStackOnTop && (maxTopY + itemHeight) <= H) {
          let has3DCollision = false;
          const aMinY = maxTopY;
          const aMaxY = maxTopY + itemHeight;

          for (const other of placed) {
            const otherFp = orientedFootprint(other);
            const otherHeight = other.kind === 'pallet' ? Math.max(0.42, 0.144 + Math.ceil(other.boxes.length / 4) * 0.28) : orientedHeight(other);
            const otherMinX = other.position[0] - otherFp.length / 2;
            const otherMaxX = other.position[0] + otherFp.length / 2;
            const otherMinZ = other.position[2] - otherFp.width / 2;
            const otherMaxZ = other.position[2] + otherFp.width / 2;
            const otherMinY = other.position[1];
            const otherMaxY = other.position[1] + otherHeight;

            const overlapXZ = (x - fp.length / 2) < otherMaxX && (x + fp.length / 2) > otherMinX &&
                              (z - fp.width / 2) < otherMaxZ && (z + fp.width / 2) > otherMinZ;
            const overlapY = aMinY < otherMaxY && aMaxY > otherMinY;

            if (overlapXZ && overlapY) {
              has3DCollision = true;
              break;
            }
          }

          if (!has3DCollision) {
            bestX = x;
            bestY = maxTopY;
            bestZ = z;
            found = true;
            break;
          }
        }
      }
    }

    if (found) {
      item.position = [bestX, bestY, bestZ];
    } else {
      const idx = placed.length;
      item.position = [-L / 2 + 0.5 + idx * 0.4, 0.04, 0];
    }
    placed.push(item);
  });

  return placed;
}
