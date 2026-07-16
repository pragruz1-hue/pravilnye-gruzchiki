import { LoadItem, VehicleType } from '../types';
import { orientedFootprint, orientedHeight, VEHICLES } from '../utils/calculations';

export function hasPalletCollision(candidate: LoadItem, items: LoadItem[]): boolean {
  const a = bounds(candidate);
  return items.some((item) => {
    if (item.id === candidate.id) return false;
    const b = bounds(item);
    const intersects = a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ && a.minY < b.maxY && a.maxY > b.minY;
    if (!intersects) return false;
    const candidateIsAbove = Math.abs(a.minY - b.maxY) < 0.08;
    const itemIsAbove = Math.abs(b.minY - a.maxY) < 0.08;
    if (candidateIsAbove) return !item.stackable || candidate.weight > item.maxStackWeight;
    if (itemIsAbove) return !candidate.stackable || item.weight > candidate.maxStackWeight;
    return true;
  });
}

export function isInsideCargoBay(item: LoadItem, vehicleType: VehicleType): boolean {
  const vehicle = VEHICLES[vehicleType];
  const b = bounds(item);
  const inBay = b.minX >= -vehicle.cargoLength / 2 && b.maxX <= vehicle.cargoLength / 2 && b.minZ >= -vehicle.cargoWidth / 2 && b.maxZ <= vehicle.cargoWidth / 2 && b.minY >= 0 && b.maxY <= vehicle.cargoHeight;
  const laidIllegally = !item.canLaySide && (Math.abs(Math.sin(item.rotation[0])) > 0.5 || Math.abs(Math.sin(item.rotation[2])) > 0.5);
  return inBay && !laidIllegally;
}

function bounds(item: LoadItem): { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number } {
  const fp = orientedFootprint(item);
  const height = orientedHeight(item);
  return {
    minX: item.position[0] - fp.length / 2,
    maxX: item.position[0] + fp.length / 2,
    minY: item.position[1],
    maxY: item.position[1] + height,
    minZ: item.position[2] - fp.width / 2,
    maxZ: item.position[2] + fp.width / 2
  };
}
