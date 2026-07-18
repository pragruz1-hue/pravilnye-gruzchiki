export type MoveType = 'apartment' | 'office' | 'commercial';
export type TripRange = 'city' | 'regional' | 'intercity';
export type VehicleType = 'gazelle7' | 'gazelle12' | 'gazelle18' | 'gazelle3' | 'gazelle42' | 'van5' | 'van6' | 'truck' | 'refrigerator';
export type CameraMode = 'overview' | 'inside' | 'top' | 'side' | 'cabin';

export interface ApartmentStandard {
  id: string;
  label: string;
  hint: string;
  volumeM3: number;
  weightKg: number;
  recommendedVehicle: VehicleType;
  description: string;
}
export type PalletType = 'EUR' | 'FIN' | 'STANDARD';
export type BoxSize = 'S' | 'M' | 'L' | 'XL';
export type BoxType = 'standard' | 'fragile' | 'heavy' | 'cold' | 'danger';
export type LoadItemKind = 'pallet' | 'box' | 'sofa' | 'wardrobe' | 'fridge' | 'washer' | 'bed' | 'table' | 'chairs' | 'tv' | 'piano' | 'safe' | 'plant' | 'bike';
export type ApartmentPreset = 'oneRoom' | 'twoRoom' | 'threeRoom';
export type OfficePreset = 'officeS' | 'officeM' | 'officeL';
export type StandardPreset = ApartmentPreset | OfficePreset;
export type TruckPreset = 'pallets' | 'bulk';

export interface CargoBox {
  id: string;
  size: BoxSize;
  weight: number;
  type: BoxType;
  color: string;
}

export interface LoadItem {
  id: string;
  kind: LoadItemKind;
  name: string;
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
  material: 'wood' | 'plasticBlue' | 'plasticGreen' | 'metal' | 'fabric' | 'whiteGoods' | 'cardboard' | 'dark' | 'glass' | 'plant';
  wrapped: boolean;
  stackable: boolean;
  maxStackWeight: number;
  canLaySide: boolean;
  fragile: boolean;
}

export type Pallet = LoadItem;

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
  shortLabel: string;
  cargoLength: number;
  cargoWidth: number;
  cargoHeight: number;
  capacityKg: number;
  capacityM3: number;
  palletCapacity: number;
  baseHourlyRate: number;
  minHours: number;
  kmRate: number;
}

export interface CatalogItem {
  kind: LoadItemKind;
  name: string;
  emoji: string;
  dimensions: { length: number; width: number; height: number };
  weight: number;
  material: LoadItem['material'];
  stackable: boolean;
  maxStackWeight: number;
  canLaySide: boolean;
  fragile: boolean;
  description: string;
}
