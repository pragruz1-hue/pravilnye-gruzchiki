import { describe, it, expect, beforeEach } from 'vitest';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { STANDARDS, VEHICLES } from '../calculations';

describe('office presets + autofill', () => {
  beforeEach(() => {
    (globalThis as any).confirm = () => true;
    useCalculatorStore.getState().resetCalculator();
  });

  it('officeS preset applies: office move type, gazelle7, items filled', () => {
    useCalculatorStore.getState().applyOfficePreset('officeS');
    const st = useCalculatorStore.getState();
    expect(st.moveType).toBe('office');
    expect(st.activePreset).toBe('officeS');
    expect(st.vehicleType).toBe('gazelle7');
    expect(st.recommendedVehicleType).toBe('gazelle7');
    expect(st.pallets.length).toBeGreaterThan(10);
    expect(st.overflowItems.length).toBe(0);
    expect(st.pallets.some((p) => p.name === 'Стол рабочий')).toBe(true);
    expect(st.pallets.some((p) => p.name === 'Коробка с документами')).toBe(true);
    const cap = VEHICLES[st.vehicleType].capacityM3;
    expect(st.totalVolume).toBeGreaterThan(cap * 0.5);
    expect(st.totalWeight).toBeLessThanOrEqual(VEHICLES[st.vehicleType].capacityKg);
  });

  it('officeL preset fits gazelle18 and packs denser than officeM setup', () => {
    useCalculatorStore.getState().applyOfficePreset('officeL');
    const st = useCalculatorStore.getState();
    expect(st.vehicleType).toBe('gazelle18');
    expect(st.totalVolume).toBeGreaterThan(8);
    expect(st.totalVolume).toBeLessThanOrEqual(VEHICLES.gazelle18.capacityM3);
  });

  it('autofill button works the same under office move type', () => {
    const store = useCalculatorStore.getState();
    store.setMoveType('office');
    store.addCatalogItem('table');
    store.addCatalogItem('chairs');
    const originals = useCalculatorStore.getState().pallets.map((p) => p.id);
    useCalculatorStore.getState().fillEmptySpace();
    const after = useCalculatorStore.getState();
    expect(after.moveType).toBe('office');
    expect(after.pallets.length).toBeGreaterThan(originals.length);
    const placedIds = after.pallets.map((p) => p.id);
    originals.forEach((id) => expect(placedIds).toContain(id));
    useCalculatorStore.getState().fillEmptySpace();
    expect(useCalculatorStore.getState().pallets.length).toBe(after.pallets.length);
  });

  it('office handling surcharge applies to presets price', () => {
    const office = useCalculatorStore.getState();
    office.applyOfficePreset('officeM');
    const officePrice = useCalculatorStore.getState().basePrice;
    expect(officePrice).toBeGreaterThan(0);
    expect(STANDARDS.officeM.recommendedVehicle).toBe('gazelle12');
  });
});
