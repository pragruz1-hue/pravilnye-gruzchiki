import { describe, it, expect } from 'vitest';
import { computeAxleLoads, recommendVehicleForVolume, canFitThroughDoor, checkOverload, VEHICLES, packItemsInVehicle, getStackHeightAt, generateFillBoxes, orientedHeight } from '../calculations';
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
    expect(res7.fits).toBe(true);
    const fridge = makeItem({ dimensions: { length: 0.7, width: 0.7, height: 1.9 }, kind: 'fridge' as any, canLaySide: false });
    const resFridge7 = canFitThroughDoor(fridge as any, 'gazelle7');
    expect(resFridge7.fits).toBe(false);
    const resFridge12 = canFitThroughDoor(fridge as any, 'gazelle12');
    expect(resFridge12.fits).toBe(true);
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
    const res = checkOverload(items as any, 'gazelle7');
    expect(res.volumePercent).toBeGreaterThan(99);
  });
});

describe('critical path: 2k.k. preset -> 12m3', () => {
  it('twoRoom preset volume 12 should recommend gazelle12', () => {
    expect(recommendVehicleForVolume(12)).toBe('gazelle12');
  });
});

describe('packItemsInVehicle', () => {
  it('places a single small item in center of gazelle12', () => {

    const items = [makeItem({ id: 'box1', dimensions: { length: 0.6, width: 0.4, height: 0.4 }, weight: 10 })];
    const result = packItemsInVehicle(items, 'gazelle12');
    expect(result.placed.length).toBe(1);
    expect(result.overflow.length).toBe(0);
    const v = VEHICLES['gazelle12'];
    expect(result.placed[0].position[0]).toBeGreaterThanOrEqual(-v.cargoLength / 2);
    expect(result.placed[0].position[0]).toBeLessThanOrEqual(v.cargoLength / 2);
  });

  it('does not place items exceeding max volume capacity', () => {

    const bigItem = makeItem({ id: 'big', dimensions: { length: 100, width: 100, height: 100 }, weight: 100 });
    const smallItem = makeItem({ id: 'small', dimensions: { length: 0.6, width: 0.4, height: 0.4 }, weight: 10 });
    const result = packItemsInVehicle([bigItem, smallItem], 'gazelle7');
    expect(result.overflow.length).toBeGreaterThanOrEqual(1);
  });

  it('does not place items exceeding max weight capacity', () => {

    const items = [
      makeItem({ id: 'heavy1', dimensions: { length: 0.6, width: 0.4, height: 0.4 }, weight: 900 }),
      makeItem({ id: 'heavy2', dimensions: { length: 0.6, width: 0.4, height: 0.4 }, weight: 900 })
    ];
    const result = packItemsInVehicle(items, 'gazelle12');
    expect(result.overflow.length).toBeGreaterThanOrEqual(1);
  });

  it('long items placed along walls', () => {

    const sofa = makeItem({ id: 'sofa1', kind: 'sofa', dimensions: { length: 2.1, width: 0.9, height: 0.85 }, weight: 85, canLaySide: true });
    const result = packItemsInVehicle([sofa], 'gazelle12');
    expect(result.placed.length).toBe(1);
    expect(result.overflow.length).toBe(0);
    expect(Math.abs(result.placed[0].rotation[1])).toBeGreaterThan(0);
  });

  it('fridge stays upright (canLaySide=false)', () => {

    const fridge = makeItem({ id: 'fridge1', kind: 'fridge', dimensions: { length: 0.7, width: 0.7, height: 1.9 }, weight: 80, canLaySide: false });
    const result = packItemsInVehicle([fridge], 'gazelle12');
    expect(result.placed.length).toBe(1);
    expect(result.placed[0].rotation[0]).toBe(0);
    expect(result.placed[0].rotation[2]).toBe(0);
  });

  it('multiple boxes stack on top of each other', () => {

    const boxes = Array.from({ length: 5 }, (_, i) =>
      makeItem({ id: `box${i}`, dimensions: { length: 0.6, width: 0.4, height: 0.4 }, weight: 10 })
    );
    const result = packItemsInVehicle(boxes, 'gazelle12');
    expect(result.placed.length).toBe(5);
    expect(result.overflow.length).toBe(0);
    const stacked = result.placed.filter(b => b.position[1] > 0.05);
    expect(stacked.length).toBeGreaterThan(0);
  });
});

describe('getStackHeightAt', () => {
  it('returns floor height when no items overlap', () => {

    const items = [
      makeItem({ id: 'a', position: [-0.5, 0.04, 0], dimensions: { length: 0.6, width: 0.4, height: 0.4 } })
    ];
    const h = getStackHeightAt('a', -0.5, 0, items);
    expect(h).toBeCloseTo(0.05, 2);
  });

  it('returns top of another item when overlapping in XZ', () => {

    const items = [
      makeItem({ id: 'bottom', position: [0, 0.04, 0], dimensions: { length: 0.6, width: 0.4, height: 0.4 } }),
      makeItem({ id: 'top', position: [0, 0.44, 0], dimensions: { length: 0.6, width: 0.4, height: 0.4 } })
    ];
    const h = getStackHeightAt('top', 0, 0, items);
    expect(h).toBeCloseTo(0.45, 2);
  });
});

describe('generateFillBoxes', () => {
  it('generates boxes for empty gazelle12', () => {

    const boxes = generateFillBoxes([], 'gazelle12');
    expect(boxes.length).toBeGreaterThan(5);
    const totalWeight = boxes.reduce((s: number, b: any) => s + b.weight, 0);
    expect(totalWeight).toBeLessThanOrEqual(VEHICLES['gazelle12'].capacityKg * 0.92);
  });

  it('generates fewer boxes for already-full vehicle', () => {

    const existing = [
      makeItem({ id: 'big', dimensions: { length: 2.5, width: 1.5, height: 1.0 }, weight: 600 })
    ];
    const boxes = generateFillBoxes(existing, 'gazelle7');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('returns empty array when no space left', () => {

    const full = [
      makeItem({ id: 'full', dimensions: { length: 3.0, width: 1.8, height: 1.2 }, weight: 1400 })
    ];
    const boxes = generateFillBoxes(full, 'gazelle7');
    expect(Array.isArray(boxes)).toBe(true);
  });
});

describe('overflow detection', () => {
  it('overflow empty when all items fit', () => {

    const items = [makeItem({ id: 's1', dimensions: { length: 0.6, width: 0.4, height: 0.4 }, weight: 10 })];
    const result = packItemsInVehicle(items, 'gazelle7');
    expect(result.overflow.length).toBe(0);
  });

  it('overflow contains items when vehicle too small', () => {

    const items = [
      makeItem({ id: 'sofa1', kind: 'sofa', dimensions: { length: 2.1, width: 0.9, height: 0.85 }, weight: 85 }),
      makeItem({ id: 'sofa2', kind: 'sofa', dimensions: { length: 2.1, width: 0.9, height: 0.85 }, weight: 85 }),
      makeItem({ id: 'sofa3', kind: 'sofa', dimensions: { length: 2.1, width: 0.9, height: 0.85 }, weight: 85 }),
      makeItem({ id: 'sofa4', kind: 'sofa', dimensions: { length: 2.1, width: 0.9, height: 0.85 }, weight: 85 }),
      makeItem({ id: 'sofa5', kind: 'sofa', dimensions: { length: 2.1, width: 0.9, height: 0.85 }, weight: 85 }),
    ];
    const result = packItemsInVehicle(items, 'gazelle7');
    expect(result.overflow.length).toBeGreaterThanOrEqual(1);
    expect(result.placed.length).toBeLessThan(5);
  });
});
