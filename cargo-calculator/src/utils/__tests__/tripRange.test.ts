import { describe, it, expect } from 'vitest';
import { calculateDeliveryTime, calculatePrice, getTripRange } from '../calculations';
import { LoadItem } from '../../types';

const noServices = { packing: false, disassembly: false, assembly: false, loaders: 0, insurance: false, nightMove: false, documentsPacking: false, itSupport: false } as any;

const emptyPallets: LoadItem[] = [];

function oneBox(volumeSide: number, weight: number): LoadItem {
  return { weight, dimensions: { length: volumeSide, width: 1, height: 1 }, boxes: [], position: [0, 0, 0], rotation: [0, 0, 0] } as any;
}

describe('trip range classification', () => {
  it('classifies distances into city / regional / intercity', () => {
    expect(getTripRange(0)).toBe('city');
    expect(getTripRange(20)).toBe('city');
    expect(getTripRange(60)).toBe('city');
    expect(getTripRange(61)).toBe('regional');
    expect(getTripRange(286)).toBe('regional');
    expect(getTripRange(300)).toBe('regional');
    expect(getTripRange(301)).toBe('intercity');
    expect(getTripRange(1340)).toBe('intercity');
  });

  it('delivery time follows the trip class', () => {
    expect(calculateDeliveryTime(0)).toBe('уточняется');
    expect(calculateDeliveryTime(25)).toBe('сегодня');
    expect(calculateDeliveryTime(286)).toBe('сегодня / завтра');
    expect(calculateDeliveryTime(1340)).toBe('4-6 дней');
  });
});

describe('city pricing: почасовой тариф без двойного счёта км и топливной заглушки', () => {
  const price = () => calculatePrice({ vehicleType: 'gazelle7', vehicleCount: 1, distance: 10, pallets: emptyPallets, services: noServices, urgency: 2 });

  it('charges only hourly labor: rate × ceil(minHours + drive + loading)', () => {
    // ceil(2 + 10/25 + 0) = 3 часа × 800 ₽
    expect(price().basePrice).toBe(2400);
    expect(price().tripRange).toBe('city');
    expect(price().workHours).toBe(3);
  });

  it('fuel is small actual cost, not the intercity 700₽ floor', () => {
    // 2 пустых? вес 0 → 12л/100км × 10 км = 1.2л × 62 ≈ 74₽ → городская заглушка 250₽
    expect(price().fuelPrice).toBe(250);
    expect(price().fuelPrice).toBeLessThan(700);
  });
});

describe('regional pricing: минималка + трасса −15%', () => {
  it('keeps fuel weight factor and moderate fuel floor', () => {
    const light = calculatePrice({ vehicleType: 'gazelle12', vehicleCount: 1, distance: 100, pallets: [oneBox(1, 100)], services: noServices, urgency: 2 });
    const heavy = calculatePrice({ vehicleType: 'gazelle12', vehicleCount: 1, distance: 100, pallets: [oneBox(1, 1200)], services: noServices, urgency: 2 });
    expect(heavy.fuelPrice).toBeGreaterThan(light.fuelPrice);
    expect(heavy.fuelLiters).toBeGreaterThan(light.fuelLiters);
    expect(light.fuelPrice).toBeGreaterThanOrEqual(350);
  });

  it('applies min hours + km × 0.85', () => {
    // gazelle12: rate 950×3ч = 2850; обработка 1 м³ = 120; км: 100×36×0.85 = 3060
    const p = calculatePrice({ vehicleType: 'gazelle12', vehicleCount: 1, distance: 100, pallets: [oneBox(1, 100)], services: noServices, urgency: 2 });
    expect(p.tripRange).toBe('regional');
    expect(p.basePrice).toBe(2850 + 3060 + 120);
  });
});

describe('intercity pricing: км −10% + обратная подача порожняком', () => {
  it('includes empty return run at 30% of km rate', () => {
    // truck: kmRate 98 → 1000×98×0.9 + 1000×98×0.3 = 88200 + 29400 = 117600
    // labor: 2800 × ceil(4/2) × 0.5 = 2800
    const p = calculatePrice({ vehicleType: 'truck', vehicleCount: 1, distance: 1000, pallets: emptyPallets, services: noServices, urgency: 2 });
    expect(p.tripRange).toBe('intercity');
    expect(p.basePrice).toBe(117600 + 2800);
  });

  it('fuel covers the empty return leg (base rate, no weight factor)', () => {
    // 1000 км под грузом 0 кг: 12л/100км → 120л; + 1000 км порожняком → ещё 120л = 240л
    const p = calculatePrice({ vehicleType: 'truck', vehicleCount: 1, distance: 1000, pallets: emptyPallets, services: noServices, urgency: 2 });
    expect(p.fuelLiters).toBe(240);
  });

  it('long haul costs more than the same truck on a short regional trip', () => {
    const long = calculatePrice({ vehicleType: 'gazelle18', vehicleCount: 1, distance: 1340, pallets: [oneBox(1, 500)], services: noServices, urgency: 2 });
    const short = calculatePrice({ vehicleType: 'gazelle18', vehicleCount: 1, distance: 100, pallets: [oneBox(1, 500)], services: noServices, urgency: 2 });
    expect(long.totalPrice).toBeGreaterThan(short.totalPrice);
    expect(long.deliveryTime).toBe('4-6 дней');
    expect(short.deliveryTime).toBe('сегодня / завтра');
  });
});

describe('move type affects cargo handling cost', () => {
  const regionalParams = (moveType: any) => ({ vehicleType: 'gazelle12', vehicleCount: 1, distance: 100, pallets: [oneBox(2, 100)], services: noServices, urgency: 2, moveType } as any);

  it('office +15%, commercial −15% vs apartment baseline', () => {
    const apt = calculatePrice(regionalParams('apartment'));
    const office = calculatePrice(regionalParams('office'));
    const commercial = calculatePrice(regionalParams('commercial'));
    // обработка 2 м³: 240 / 276 / 204
    expect(office.basePrice - apt.basePrice).toBe(36);
    expect(apt.basePrice - commercial.basePrice).toBe(36);
  });
});
