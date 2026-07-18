import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES } from '../../utils/calculations';
import { createChromeMaterial, createGlassMaterial, createTireMaterial, createTruckPaintMaterial } from '../../materials/pbrMaterials';

interface TruckProps { position: [number, number, number]; }

export function Truck({ position }: TruckProps) {
  const vehicleType = useCalculatorStore((state) => state.vehicleType);
  const vehicle = VEHICLES[vehicleType];
  const L = vehicle.cargoLength;
  const W = vehicle.cargoWidth;
  const H = vehicle.cargoHeight;
  const materials = useMemo(() => ({
    paint: createTruckPaintMaterial(),
    brandOrange: new THREE.MeshPhysicalMaterial({ color: '#ff6b00', metalness: 0.35, roughness: 0.24, clearcoat: 0.8 }),
    dark: new THREE.MeshPhysicalMaterial({ color: '#10131b', metalness: 0.35, roughness: 0.28, clearcoat: 0.5 }),
    floor: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.58, metalness: 0.12 }),
    wall: new THREE.MeshPhysicalMaterial({ color: '#dbeafe', transparent: true, opacity: 0.28, roughness: 0.08, transmission: 0.3, side: THREE.DoubleSide }),
    glass: createGlassMaterial(),
    tire: createTireMaterial(),
    chrome: createChromeMaterial(),
    light: new THREE.MeshStandardMaterial({ color: '#fff7cc', emissive: '#ffd166', emissiveIntensity: 0.75, roughness: 0.2 })
  }), []);
  const cabinX = -L / 2 - 0.92;
  const wheelXs = [-L / 2 - 1.08, -L / 2 + Math.min(0.8, L * 0.22), L / 2 - 0.62];

  return (
    <group position={position} name="procedural-truck-dynamic">
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow><boxGeometry args={[L, 0.16, W]} /><primitive object={materials.floor} attach="material" /></mesh>
      <mesh position={[-L / 2 - 0.02, H / 2 + 0.12, 0]} castShadow receiveShadow><boxGeometry args={[0.12, H, W]} /><primitive object={materials.paint} attach="material" /></mesh>
      <mesh position={[0, H / 2 + 0.12, -W / 2 - 0.02]} castShadow receiveShadow><boxGeometry args={[L, H, 0.08]} /><primitive object={materials.wall} attach="material" /></mesh>
      <mesh position={[0, H / 2 + 0.12, W / 2 + 0.02]} castShadow receiveShadow><boxGeometry args={[L, H, 0.08]} /><primitive object={materials.wall} attach="material" /></mesh>
      
      {/* Branded Decals on side walls */}
      <Html
        transform
        occlude
        position={[0, H / 2 + 0.12, W / 2 + 0.07]}
        rotation={[0, 0, 0]}
        scale={0.08}
        className="pointer-events-none"
      >
        <div style={{
          background: '#10131b',
          color: '#ff6b00',
          padding: '8px 18px',
          borderRadius: '12px',
          border: '2.5px solid #ff6b00',
          fontWeight: 950,
          fontSize: '22px',
          whiteSpace: 'nowrap',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
          letterSpacing: '0.12em'
        }}>
          ПРАВИЛЬНЫЕ ГРУЗЧИКИ
        </div>
      </Html>

      <Html
        transform
        occlude
        position={[0, H / 2 + 0.12, -W / 2 - 0.07]}
        rotation={[0, Math.PI, 0]}
        scale={0.08}
        className="pointer-events-none"
      >
        <div style={{
          background: '#10131b',
          color: '#ff6b00',
          padding: '8px 18px',
          borderRadius: '12px',
          border: '2.5px solid #ff6b00',
          fontWeight: 950,
          fontSize: '22px',
          whiteSpace: 'nowrap',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
          letterSpacing: '0.12em'
        }}>
          ПРАВИЛЬНЫЕ ГРУЗЧИКИ
        </div>
      </Html>
      <mesh position={[0, H + 0.18, -W / 2]} castShadow receiveShadow><boxGeometry args={[L, 0.1, 0.12]} /><primitive object={materials.chrome} attach="material" /></mesh>
      <mesh position={[0, H + 0.18, W / 2]} castShadow receiveShadow><boxGeometry args={[L, 0.1, 0.12]} /><primitive object={materials.chrome} attach="material" /></mesh>

      <group position={[L / 2 + 0.06, H / 2 + 0.1, -W * 0.28]} rotation={[0, -0.78, 0]}><mesh castShadow receiveShadow><boxGeometry args={[0.08, Math.max(1.8, H - 0.18), W * 0.48]} /><primitive object={materials.paint} attach="material" /></mesh></group>
      <group position={[L / 2 + 0.06, H / 2 + 0.1, W * 0.28]} rotation={[0, 0.78, 0]}><mesh castShadow receiveShadow><boxGeometry args={[0.08, Math.max(1.8, H - 0.18), W * 0.48]} /><primitive object={materials.paint} attach="material" /></mesh></group>

      <lineSegments position={[0, H / 2 + 0.12, 0]}><edgesGeometry args={[new THREE.BoxGeometry(L + 0.05, H + 0.02, W + 0.05)]} /><lineBasicMaterial color="#ff6b00" transparent opacity={0.85} /></lineSegments>
      <gridHelper args={[Math.max(L, W), Math.round(Math.max(L, W) * 10), '#2563eb', '#93c5fd']} position={[0, 0.172, 0]} scale={[L / Math.max(L, W), 1, W / Math.max(L, W)]} />

      <mesh position={[cabinX, 0.98, 0]} castShadow receiveShadow><boxGeometry args={[1.65, 1.86, Math.min(2.22, W + 0.2)]} /><primitive object={materials.brandOrange} attach="material" /></mesh>
      <mesh position={[cabinX - 0.37, 2.02, 0]} castShadow receiveShadow><boxGeometry args={[1.12, 0.32, Math.min(2.04, W)]} /><primitive object={materials.dark} attach="material" /></mesh>
      <mesh position={[cabinX - 0.82, 1.36, 0]} castShadow receiveShadow><boxGeometry args={[0.08, 0.72, Math.min(1.45, W * 0.72)]} /><primitive object={materials.glass} attach="material" /></mesh>
      <mesh position={[cabinX - 0.88, 0.62, -0.62]} castShadow receiveShadow><boxGeometry args={[0.08, 0.22, 0.38]} /><primitive object={materials.light} attach="material" /></mesh>
      <mesh position={[cabinX - 0.88, 0.62, 0.62]} castShadow receiveShadow><boxGeometry args={[0.08, 0.22, 0.38]} /><primitive object={materials.light} attach="material" /></mesh>
      {wheelXs.map((x) => <group key={x}><Wheel x={x} z={-W / 2 - 0.15} tire={materials.tire} chrome={materials.chrome} /><Wheel x={x} z={W / 2 + 0.15} tire={materials.tire} chrome={materials.chrome} /></group>)}

      <Html position={[0, H + 0.52, 0]} center distanceFactor={7} className="pointer-events-none">
        <div className="rounded-full bg-[#10131b]/90 px-4 py-2 text-xs font-black text-white shadow-xl backdrop-blur-md ring-2 ring-[#ff6b00]/50">
          {vehicle.label} · кузов {L}×{W}×{H} м
        </div>
      </Html>
    </group>
  );
}

function Wheel({ x, z, tire, chrome }: { x: number; z: number; tire: THREE.Material; chrome: THREE.Material }) {
  return <group position={[x, 0.12, z]} rotation={[Math.PI / 2, 0, 0]}><mesh castShadow receiveShadow><cylinderGeometry args={[0.39, 0.39, 0.28, 48]} /><primitive object={tire} attach="material" /></mesh><mesh castShadow receiveShadow position={[0, 0, 0.01]}><cylinderGeometry args={[0.17, 0.17, 0.3, 36]} /><primitive object={chrome} attach="material" /></mesh></group>;
}
