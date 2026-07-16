import { Pallet } from '../types';

export function hasPalletCollision(candidate: Pallet, pallets: Pallet[]): boolean {
  const a = bounds(candidate);
  return pallets.some((pallet) => {
    if (pallet.id === candidate.id) return false;
    const b = bounds(pallet);
    return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
  });
}

export function isInsideCargoBay(pallet: Pallet, cargoLength = 6, cargoWidth = 2.4): boolean {
  const b = bounds(pallet);
  return b.minX >= -cargoLength / 2 && b.maxX <= cargoLength / 2 && b.minZ >= -cargoWidth / 2 && b.maxZ <= cargoWidth / 2;
}

function bounds(pallet: Pallet): { minX: number; maxX: number; minZ: number; maxZ: number } {
  const rotated = Math.abs(Math.sin(pallet.rotation[1])) > 0.5;
  const length = rotated ? pallet.dimensions.width : pallet.dimensions.length;
  const width = rotated ? pallet.dimensions.length : pallet.dimensions.width;
  return {
    minX: pallet.position[0] - length / 2,
    maxX: pallet.position[0] + length / 2,
    minZ: pallet.position[2] - width / 2,
    maxZ: pallet.position[2] + width / 2
  };
}
