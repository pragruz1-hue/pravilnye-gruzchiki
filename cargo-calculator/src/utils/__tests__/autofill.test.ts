import { describe, it, expect, beforeEach } from 'vitest';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES } from '../calculations';

describe('fillEmptySpace e2e', () => {
  beforeEach(() => {
    (globalThis as any).confirm = () => true;
    useCalculatorStore.setState({
      pallets: [], overflowItems: [], overflowCount: 0, overflowWeight: 0, overflowVolume: 0, estimatedTrips: 0,
      vehicleType: 'gazelle12', activePreset: null, selectedPalletId: null, history: [], future: []
    });
    useCalculatorStore.getState().calculatePrice();
  });

  it('does nothing on empty cargo bay', () => {
    useCalculatorStore.getState().fillEmptySpace();
    expect(useCalculatorStore.getState().pallets.length).toBe(0);
  });

  it('fills around a sofa + fridge without dropping originals to overflow', () => {
    const st = useCalculatorStore.getState();
    st.addCatalogItem('sofa');
    st.addCatalogItem('fridge');
    const before = useCalculatorStore.getState();
    const originals = [...before.pallets.map((p) => p.id)];
    before.fillEmptySpace();
    const after = useCalculatorStore.getState();
    expect(after.pallets.length).toBeGreaterThan(originals.length);
    const placedIds = after.pallets.map((p) => p.id);
    originals.forEach((id) => expect(placedIds).toContain(id));
    const overflowIds = after.overflowItems.map((p) => p.id);
    originals.forEach((id) => expect(overflowIds).not.toContain(id));
    const cap = VEHICLES[after.vehicleType].capacityM3;
    expect(after.totalVolume).toBeGreaterThan(cap * 0.5);
    expect(after.totalVolume).toBeLessThanOrEqual(cap);
    expect(after.totalWeight).toBeLessThanOrEqual(VEHICLES[after.vehicleType].capacityKg);
  });

  it('second fill adds nothing (idempotent)', () => {
    const st = useCalculatorStore.getState();
    st.addCatalogItem('sofa');
    st.fillEmptySpace();
    const once = useCalculatorStore.getState().pallets.length;
    useCalculatorStore.getState().fillEmptySpace();
    const twice = useCalculatorStore.getState().pallets.length;
    expect(twice).toBe(once);
  });

  it('respects weight limit for heavy load', () => {
    const st = useCalculatorStore.getState();
    st.addCatalogItem('safe');
    useCalculatorStore.setState((s) => ({ pallets: s.pallets.map((p) => ({ ...p, weight: 1350 })) }));
    useCalculatorStore.getState().fillEmptySpace();
    const after = useCalculatorStore.getState();
    expect(after.totalWeight).toBeLessThanOrEqual(VEHICLES[after.vehicleType].capacityKg);
  });
});
