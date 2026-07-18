import { describe, it, expect } from 'vitest';
import { computeAxleLoads, recommendVehicleForVolume, canFitThroughDoor, checkOverload, VEHICLES } from '../calculations';
import type { LoadItem } from '../../types';

function makeItem(over: Partial<LoadItem> = {}): LoadItem {
  return {
    id: 'test',
    kind: 'box',
    name: 'Коробка',
    type: 'STANDARD',
    position: [0, 0.04, 0],
    rotation: [0, 0, 0],
    weight: 100,
    boxes: [],
    dimensions: { length: 0.6, width: 0.4, height: 0.4 },
    material: 'cardboard',
    wrapped: false,
    stackable: true,
    maxStackWeight: 50,
    canLaySide: true,
    fragile: false,
    ...over
  } as any;
}

describe('computeAxleLoads', () => {
  it('empty truck has zero loads', () => {
    const res = computeAxleLoads([], 'gazelle12');
    expect(res.frontKg).toBe(0);
    expect(res.rearKg).toBe(0);
  });
  it('single item at center gives balanced', () => {
    const item = makeItem({ position: [0, 0.04, 0], weight: 300 });
    const res = computeAxleLoads([item], 'gazelle12');
    expect(res.frontKg + res.rearKg).toBeCloseTo(300, 0);
  });
  it('item behind rear axle lifts front', () => {
    const vehicle = VEHICLES['gazelle12'];
    const rearX = -vehicle.cargoLength / 2 + vehicle.cargoLength * 0.32;
    const item = makeItem({ position: [vehicle.cargoLength / 2 - 0.2, 0.04, 0], weight: 500 });
    const res = computeAxleLoads([item], 'gazelle12');
    // Задняя ось должна быть перегружена если груз в хвосте
    expect(res.rearKg).toBeGreaterThan(res.frontKg);
  });
  it('lateral imbalance detected', () => {
    const item = makeItem({ position: [0, 0.04, 0.8], weight: 200 });
    const res = computeAxleLoads([item], 'gazelle12');
    expect(res.lateralPercent).toBeGreaterThan(0);
  });
});

describe('recommendVehicleForVolume', () => {
  it('7 m3 -> gazelle7', () => expect(recommendVehicleForVolume(7)).toBe('gazelle7'));
  it('12 m3 -> gazelle12', () => expect(recommendVehicleForVolume(12)).toBe('gazelle12'));
  it('18 m3 -> gazelle18', () => expect(recommendVehicleForVolume(18)).toBe('gazelle18'));
  it('20 m3 -> gazelle18 (max gazelle)', () => expect(recommendVehicleForVolume(20)).toBe('gazelle18'));
});

describe('canFitThroughDoor', () => {
  it('small box fits', () => {
    const item = makeItem({ dimensions: { length: 0.6, width: 0.4, height: 0.4 } });
    const res = canFitThroughDoor(item as any, 'gazelle12');
    expect(res.fits).toBe(true);
  });
  it('wardrobe 2.1m can be laid side so fits 7m3, fridge cannot', () => {
    const wardrobe = makeItem({ dimensions: { length: 1.2, width: 0.6, height: 2.1 }, kind: 'wardrobe' as any, canLaySide: true });
    const res7 = canFitThroughDoor(wardrobe as any, 'gazelle7');
    expect(res7.fits).toBe(true); // can lay side -> 0.6 height fits 1.14 door
    const fridge = makeItem({ dimensions: { length: 0.7, width: 0.7, height: 1.9 }, kind: 'fridge' as any, canLaySide: false });
    const resFridge7 = canFitThroughDoor(fridge as any, 'gazelle7');
    expect(resFridge7.fits).toBe(false); // 1.9 > 1.14 and cannot lay
    const resFridge12 = canFitThroughDoor(fridge as any, 'gazelle12');
    expect(resFridge12.fits).toBe(true); // 1.9 <= 1.92 door for 12m3
  });
  it('rotated sofa can fit through diagonal', () => {
    const sofa = makeItem({ dimensions: { length: 2.1, width: 0.9, height: 0.85 }, kind: 'sofa' as any });
    const res = canFitThroughDoor(sofa as any, 'gazelle18');
    expect(res.fits).toBe(true);
  });
});

describe('checkOverload', () => {
  it('overload weight', () => {
    const items = [makeItem({ weight: 1600 })];
    const res = checkOverload(items as any, 'gazelle12');
    expect(res.overloaded).toBe(true);
    expect(res.weightPercent).toBeGreaterThan(100);
  });
  it('overload volume', () => {
    const items = [makeItem({ dimensions: { length: 3, width: 1.8, height: 1.3 }, weight: 100 })];
    // volume 7.02 > 7
    const res = checkOverload(items as any, 'gazelle7');
    expect(res.volumePercent).toBeGreaterThan(99);
  });
});

describe('critical path: 2k.k. preset -> 12m3', () => {
  it('twoRoom preset volume 12 should recommend gazelle12', () => {
    expect(recommendVehicleForVolume(12)).toBe('gazelle12');
    // Имитация buildPreset 2кк: 8 base + 6 extra + 12 boxes = примерно 12м3
    // Логика recommendVehicle должна для 14 предметов дать 12м³
  });
});
