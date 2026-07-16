export type MoveType = 'apartment' | 'office' | 'commercial';
export type VehicleType = 'gazelle' | 'medium' | 'truck' | 'refrigerator';
export type PalletType = 'EUR' | 'FIN' | 'STANDARD';
export type BoxSize = 'S' | 'M' | 'L' | 'XL';
export type BoxType = 'standard' | 'fragile' | 'heavy' | 'cold' | 'danger';

export interface CargoBox {
  id: string;
  size: BoxSize;
  weight: number;
  type: BoxType;
  color: string;
}

export interface Pallet {
  id: string;
  type: PalletType;
  position: [number, number, number];
  rotation: [number, number, number];
  weight: number;
  boxes: CargoBox[];
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  material: 'wood' | 'plasticBlue' | 'plasticGreen' | 'metal';
  wrapped: boolean;
}

export interface ServicesState {
  packing: boolean;
  disassembly: boolean;
  assembly: boolean;
  loaders: number;
  insurance: boolean;
  nightMove: boolean;
  documentsPacking: boolean;
  itSupport: boolean;
}

export interface VehicleSpec {
  id: VehicleType;
  label: string;
  capacityKg: number;
  capacityM3: number;
  palletCapacity: number;
  baseHourlyRate: number;
  minHours: number;
  kmRate: number;
}
