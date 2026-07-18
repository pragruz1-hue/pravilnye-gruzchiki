import { describe, it, expect, beforeEach } from 'vitest';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES, calculateTotals } from '../calculations';

describe('truck presets: поддоны и навалом', () => {
  beforeEach(() => {
    (globalThis as any).confirm = () => true;
    useCalculatorStore.getState().resetCalculator();
  });

  it('pallets mode fills a 20t truck with full-floor EUR pallets', () => {
    useCalculatorStore.getState().applyTruckPreset('pallets');
    const st = useCalculatorStore.getState();
    expect(st.vehicleType).toBe('truck');
    expect(st.moveType).toBe('commercial');
    const pallets = st.pallets.filter((p) => p.kind === 'pallet');
    expect(pallets.length).toBe(VEHICLES.truck.palletCapacity);
    expect(st.overflowItems.length).toBe(0);
    const totals = calculateTotals(st.pallets);
    expect(totals.volume).toBeGreaterThan(VEHICLES.truck.capacityM3 * 0.8);
    expect(totals.volume).toBeLessThanOrEqual(VEHICLES.truck.capacityM3);
    expect(totals.weight).toBeLessThanOrEqual(VEHICLES.truck.capacityKg);
    expect(pallets.every((p) => p.boxes.length === 16)).toBe(true);
    expect(pallets.every((p) => p.wrapped)).toBe(true);
  });

  it('bulk mode fills the truck with loose boxes only', () => {
    useCalculatorStore.getState().applyTruckPreset('bulk');
    const st = useCalculatorStore.getState();
    expect(st.vehicleType).toBe('truck');
    expect(st.moveType).toBe('commercial');
    expect(st.pallets.length).toBeGreaterThan(100);
    expect(st.pallets.every((p) => p.kind === 'box')).toBe(true);
    const totals = calculateTotals(st.pallets);
    expect(totals.volume).toBeGreaterThan(VEHICLES.truck.capacityM3 * 0.7);
    expect(totals.volume).toBeLessThanOrEqual(VEHICLES.truck.capacityM3);
    expect(st.overflowItems.length).toBe(0);
  });

  it('respects a pre-selected refrigerator instead of forcing the 20t truck', () => {
    useCalculatorStore.getState().setVehicleType('refrigerator');
    useCalculatorStore.getState().applyTruckPreset('pallets');
    const st = useCalculatorStore.getState();
    expect(st.vehicleType).toBe('refrigerator');
    const pallets = st.pallets.filter((p) => p.kind === 'pallet');
    expect(pallets.length).toBeLessThanOrEqual(VEHICLES.refrigerator.palletCapacity);
    expect(pallets.length).toBeGreaterThan(20);
    expect(calculateTotals(st.pallets).volume).toBeLessThanOrEqual(VEHICLES.refrigerator.capacityM3);
  });

  it('autofill after truck preset is idempotent', () => {
    useCalculatorStore.getState().applyTruckPreset('pallets');
    const once = useCalculatorStore.getState().pallets.length;
    useCalculatorStore.getState().fillEmptySpace();
    const twice = useCalculatorStore.getState().pallets.length;
    expect(twice - once).toBeLessThanOrEqual(1);
  });
});
