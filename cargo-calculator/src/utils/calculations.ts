import { Pallet, ServicesState, VehicleSpec, VehicleType } from '../types';

export const VEHICLES: Record<VehicleType, VehicleSpec> = {
  gazelle: {
    id: 'gazelle',
    label: 'Фургон 1.5т / Газель',
    capacityKg: 1500,
    capacityM3: 18,
    palletCapacity: 6,
    baseHourlyRate: 900,
    minHours: 3,
    kmRate: 38
  },
  medium: {
    id: 'medium',
    label: 'Среднетоннажный 5т',
    capacityKg: 5000,
    capacityM3: 42,
    palletCapacity: 15,
    baseHourlyRate: 1400,
    minHours: 3,
    kmRate: 62
  },
  truck: {
    id: 'truck',
    label: 'Фура 20т',
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

export function calculatePalletVolume(pallet: Pallet): number {
  const boxVolume = pallet.boxes.reduce((sum, box) => {
    const dims = boxDimensions(box.size);
    return sum + dims.length * dims.width * dims.height;
  }, 0);
  const palletBase = pallet.dimensions.length * pallet.dimensions.width * pallet.dimensions.height;
  return palletBase + boxVolume;
}

export function calculatePalletWeight(pallet: Pallet): number {
  return pallet.weight + pallet.boxes.reduce((sum, box) => sum + box.weight, 0);
}

export function calculateTotals(pallets: Pallet[]): { weight: number; volume: number } {
  return pallets.reduce(
    (totals, pallet) => ({
      weight: totals.weight + calculatePalletWeight(pallet),
      volume: totals.volume + calculatePalletVolume(pallet)
    }),
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
  pallets: Pallet[];
  services: ServicesState;
  urgency: number;
}): { basePrice: number; additionalPrice: number; fuelPrice: number; insurancePrice: number; totalPrice: number; deliveryTime: string } {
  const vehicle = VEHICLES[params.vehicleType];
  const totals = calculateTotals(params.pallets);
  const urgencyCoef = params.urgency === 1 ? 0.9 : params.urgency === 3 ? 1.35 : 1;
  const baseByTime = vehicle.baseHourlyRate * vehicle.minHours * params.vehicleCount;
  const distancePrice = Math.max(0, params.distance * vehicle.kmRate * params.vehicleCount);
  const volumeHandling = Math.ceil(totals.volume) * 120;
  const basePrice = Math.round((baseByTime + distancePrice + volumeHandling) * urgencyCoef);
  const fuelPrice = Math.round(Math.max(700, params.distance * (vehicle.kmRate * 0.22) * params.vehicleCount));

  let additionalPrice = 0;
  if (params.services.packing) additionalPrice += 2000 + params.pallets.length * 450;
  if (params.services.disassembly) additionalPrice += 1500 * Math.max(1, Math.ceil(params.pallets.length / 2));
  if (params.services.assembly) additionalPrice += 2000 * Math.max(1, Math.ceil(params.pallets.length / 2));
  if (params.services.loaders > 0) additionalPrice += params.services.loaders * 500 * vehicle.minHours;
  if (params.services.documentsPacking) additionalPrice += 1200;
  if (params.services.itSupport) additionalPrice += 3500;
  if (params.services.nightMove) additionalPrice = Math.round((additionalPrice + basePrice) * 0.3 + additionalPrice);

  const insurancePrice = params.services.insurance ? Math.round((basePrice + fuelPrice + additionalPrice) * 0.05) : 0;
  const totalPrice = basePrice + fuelPrice + additionalPrice + insurancePrice;
  return {
    basePrice,
    additionalPrice,
    fuelPrice,
    insurancePrice,
    totalPrice,
    deliveryTime: calculateDeliveryTime(params.distance)
  };
}

export function getCapacity(params: { pallets: Pallet[]; vehicleType: VehicleType }): { volumePercent: number; weightPercent: number; palletPercent: number } {
  const vehicle = VEHICLES[params.vehicleType];
  const totals = calculateTotals(params.pallets);
  return {
    volumePercent: Math.round((totals.volume / vehicle.capacityM3) * 100),
    weightPercent: Math.round((totals.weight / vehicle.capacityKg) * 100),
    palletPercent: Math.round((params.pallets.length / vehicle.palletCapacity) * 100)
  };
}
