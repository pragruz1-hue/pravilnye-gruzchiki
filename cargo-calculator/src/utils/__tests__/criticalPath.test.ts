import { describe, it, expect, beforeEach } from 'vitest';
import { useCalculatorStore } from '../../store/useCalculatorStore';

describe('critical path e2e: 2k.k. preset', () => {
  beforeEach(() => {
    (globalThis as any).confirm = () => true;
    (globalThis as any).localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} } as any;
    useCalculatorStore.getState().resetCalculator();
  });

  it('applies twoRoom preset -> 12m³ gazelle, no initial collision, empty start was fixed', () => {
    const store = useCalculatorStore.getState();
    expect(store.pallets.length).toBe(0);
    expect(store.vehicleType).toBe('gazelle12');

    store.applyApartmentPreset('twoRoom');
    const after = useCalculatorStore.getState();

    expect(after.activePreset).toBe('twoRoom');
    expect(after.vehicleType).toBe('gazelle12');
    expect(after.recommendedVehicleType).toBe('gazelle12');
    expect(after.pallets.length).toBeGreaterThan(8);
    expect(after.totalVolume).toBeGreaterThan(5);
    expect(after.totalVolume).toBeLessThan(18);
  });

  it('door fitting for fridge in 7m³ fails, in 12m³ passes', async () => {
    const { canFitThroughDoor } = await import('../calculations');
    const fridge = { dimensions: { length: 0.7, width: 0.7, height: 1.9 }, canLaySide: false, rotation: [0,0,0] } as any;
    fridge.position = [0,0,0];
    const { orientedFootprint } = await import('../calculations');
    const res7 = canFitThroughDoor({ ...fridge, position: [0,0,0], rotation: [0,0,0], dimensions: fridge.dimensions, canLaySide: false } as any, 'gazelle7');
    const res12 = canFitThroughDoor({ ...fridge, position: [0,0,0], rotation: [0,0,0], dimensions: fridge.dimensions, canLaySide: false } as any, 'gazelle12');
    expect(res7.fits).toBe(false);
    expect(res12.fits).toBe(true);
  });

  it('fuel calculation includes weight factor', async () => {
    const { calculatePrice } = await import('../calculations');
    const pallets: any[] = [{ weight: 1000, dimensions: { length: 1, width: 1, height: 1 }, boxes: [], position: [0,0,0], rotation: [0,0,0] }];
    const priceLight = calculatePrice({ vehicleType: 'gazelle12', vehicleCount: 1, distance: 100, pallets: [{ ...pallets[0], weight: 100 } as any], services: { packing: false, disassembly: false, assembly: false, loaders: 0, insurance: false, nightMove: false, documentsPacking: false, itSupport: false } as any, urgency: 2 });
    const priceHeavy = calculatePrice({ vehicleType: 'gazelle12', vehicleCount: 1, distance: 100, pallets: [{ ...pallets[0], weight: 1200 } as any], services: { packing: false, disassembly: false, assembly: false, loaders: 0, insurance: false, nightMove: false, documentsPacking: false, itSupport: false } as any, urgency: 2 });
    expect(priceHeavy.fuelPrice).toBeGreaterThan(priceLight.fuelPrice);
    expect(priceHeavy.fuelLiters).toBeGreaterThan(priceLight.fuelLiters);
  });

  it('packing +15% volume', async () => {
    const { calculateTotals, calculateTotalsWithPacking } = await import('../calculations');
    const items: any[] = [{ weight: 100, dimensions: { length: 1, width: 1, height: 1 }, boxes: [] }];
    const base = calculateTotals(items);
    const withPack = calculateTotalsWithPacking(items, true);
    expect(withPack.volume).toBeCloseTo(base.volume * 1.15, 2);
  });
});
