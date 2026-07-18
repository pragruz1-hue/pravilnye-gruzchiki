import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES } from '../../utils/calculations';
import { createChromeMaterial, createGlassMaterial, createTireMaterial, createTruckPaintMaterial } from '../../materials/pbrMaterials';

interface TruckProps { position: [number, number, number]; }

export function Truck({ position }: TruckProps) {
  const vehicleType = useCalculatorStore((state) => state.vehicleType);
  const cameraMode = useCalculatorStore((state) => state.cameraMode);
  const isNightMode = useCalculatorStore((state) => state.isNightMode);
  const vehicle = VEHICLES[vehicleType];
  const L = vehicle.cargoLength;
  const W = vehicle.cargoWidth;
  const H = vehicle.cargoHeight;
  const isInside = cameraMode === 'inside' || cameraMode === 'cabin';
  const materials = useMemo(() => ({
    paint: createTruckPaintMaterial(),
    brandOrange: new THREE.MeshPhysicalMaterial({ color: '#ff6b00', metalness: 0.35, roughness: 0.24, clearcoat: 0.8 }),
    dark: new THREE.MeshPhysicalMaterial({ color: '#10131b', metalness: 0.35, roughness: 0.28, clearcoat: 0.5 }),
    floor: new THREE.MeshStandardMaterial({ color: isInside ? '#e2e8f0' : '#cbd5e1', roughness: 0.58, metalness: 0.12 }),
    wall: new THREE.MeshPhysicalMaterial({ 
      color: isInside ? '#f1f5f9' : '#dbeafe', 
      transparent: true, 
      opacity: isInside ? 0.92 : isNightMode ? 0.42 : 0.28, 
      roughness: isInside ? 0.35 : 0.08, 
      metalness: isInside ? 0.05 : 0.02,
      transmission: isInside ? 0.0 : 0.3, 
      side: THREE.DoubleSide 
    }),
    wallInside: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.6, metalness: 0.02, side: THREE.DoubleSide }),
    glass: createGlassMaterial(),
    tire: createTireMaterial(),
    chrome: createChromeMaterial(),
    light: new THREE.MeshStandardMaterial({ color: '#fff7cc', emissive: '#ffd166', emissiveIntensity: isNightMode ? 2.5 : 0.75, roughness: 0.2 }),
    lampOn: new THREE.MeshStandardMaterial({ color: '#ffedd5', emissive: '#ff6b00', emissiveIntensity: isNightMode ? 3.0 : 1.2, roughness: 0.2 }),
    lampOff: new THREE.MeshStandardMaterial({ color: '#94a3b8', emissive: '#000000', emissiveIntensity: 0, roughness: 0.4 })
  }), [isInside, isNightMode]);
  const cabinX = -L / 2 - 0.92;
  const wheelXs = [-L / 2 - 1.08, -L / 2 + Math.min(0.8, L * 0.22), L / 2 - 0.62];

  return (
    <group position={position} name="procedural-truck-dynamic">
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow><boxGeometry args={[L, 0.16, W]} /><primitive object={materials.floor} attach="material" /></mesh>
      <mesh position={[-L / 2 - 0.02, H / 2 + 0.12, 0]} castShadow receiveShadow><boxGeometry args={[0.12, H, W]} /><primitive object={materials.paint} attach="material" /></mesh>
      <mesh position={[0, H / 2 + 0.12, -W / 2 - 0.02]} castShadow receiveShadow><boxGeometry args={[L, H, 0.08]} /><primitive object={materials.wall} attach="material" /></mesh>
      <mesh position={[0, H / 2 + 0.12, W / 2 + 0.02]} castShadow receiveShadow><boxGeometry args={[L, H, 0.08]} /><primitive object={materials.wall} attach="material" /></mesh>
      
      {isInside && (
        <>
          <mesh position={[0, H / 2 + 0.12, -W / 2 + 0.02]}><boxGeometry args={[L - 0.05, H - 0.05, 0.02]} /><primitive object={materials.wallInside} attach="material" /></mesh>
          <mesh position={[0, H / 2 + 0.12, W / 2 - 0.02]}><boxGeometry args={[L - 0.05, H - 0.05, 0.02]} /><primitive object={materials.wallInside} attach="material" /></mesh>
          <mesh position={[-L / 2 + 0.04, H / 2 + 0.12, 0]}><boxGeometry args={[0.02, H - 0.05, W - 0.05]} /><primitive object={materials.wallInside} attach="material" /></mesh>
        </>
      )}

      {!isInside && (
        <>
          <Html transform occlude position={[0, H / 2 + 0.12, W / 2 + 0.07]} rotation={[0, 0, 0]} scale={0.08} className="pointer-events-none">
            <div style={{ background: '#10131b', color: '#ff6b00', padding: '8px 18px', borderRadius: '12px', border: '2.5px solid #ff6b00', fontWeight: 950, fontSize: '22px', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', letterSpacing: '0.12em' }}>ПРАВИЛЬНЫЕ ГРУЗЧИКИ</div>
          </Html>
          <Html transform occlude position={[0, H / 2 + 0.12, -W / 2 - 0.07]} rotation={[0, Math.PI, 0]} scale={0.08} className="pointer-events-none">
            <div style={{ background: '#10131b', color: '#ff6b00', padding: '8px 18px', borderRadius: '12px', border: '2.5px solid #ff6b00', fontWeight: 950, fontSize: '22px', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', letterSpacing: '0.12em' }}>ПРАВИЛЬНЫЕ ГРУЗЧИКИ</div>
          </Html>
        </>
      )}

      <mesh position={[0, H + 0.18, -W / 2]} castShadow receiveShadow><boxGeometry args={[L, 0.1, 0.12]} /><primitive object={materials.chrome} attach="material" /></mesh>
      <mesh position={[0, H + 0.18, W / 2]} castShadow receiveShadow><boxGeometry args={[L, 0.1, 0.12]} /><primitive object={materials.chrome} attach="material" /></mesh>

      <group position={[L / 2 + 0.06, H / 2 + 0.1, -W * 0.28]} rotation={[0, -0.78, 0]}><mesh castShadow receiveShadow><boxGeometry args={[0.08, Math.max(1.8, H - 0.18), W * 0.48]} /><primitive object={materials.paint} attach="material" /></mesh></group>
      <group position={[L / 2 + 0.06, H / 2 + 0.1, W * 0.28]} rotation={[0, 0.78, 0]}><mesh castShadow receiveShadow><boxGeometry args={[0.08, Math.max(1.8, H - 0.18), W * 0.48]} /><primitive object={materials.paint} attach="material" /></mesh></group>

      <lineSegments position={[0, H / 2 + 0.12, 0]}><edgesGeometry args={[new THREE.BoxGeometry(L + 0.05, H + 0.02, W + 0.05)]} /><lineBasicMaterial color="#ff6b00" transparent opacity={isInside ? 0.35 : 0.85} /></lineSegments>
      <gridHelper args={[Math.max(L, W), Math.round(Math.max(L, W) * 10), '#2563eb', '#93c5fd']} position={[0, 0.172, 0]} scale={[L / Math.max(L, W), 1, W / Math.max(L, W)]} />

      {Array.from({ length: Math.max(2, Math.floor(L / 1.6)) }).map((_, i) => {
        const count = Math.max(2, Math.floor(L / 1.6));
        const x = count === 1 ? 0 : -L / 2 + 0.5 + i * (L - 1.0) / (count - 1);
        const isOn = isNightMode || isInside;
        return (
          <group key={`lamp-${i}`} position={[x, H - 0.08, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.07, 16, 16]} />
              <primitive object={isOn ? materials.lampOn : materials.lampOff} attach="material" />
            </mesh>
            <mesh position={[0, -0.04, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
              <primitive object={materials.chrome} attach="material" />
            </mesh>
            {isOn && <pointLight intensity={isNightMode ? 0.9 : 0.4} distance={3.5} color={isNightMode ? '#ff9a3d' : '#ffe8c0'} decay={2} />}
          </group>
        );
      })}

      {isInside && (
        <>
          <mesh position={[0, 0.3, -W / 2 + 0.03]}><boxGeometry args={[L - 0.1, 0.06, 0.01]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isNightMode ? 0.8 : 0.15} /></mesh>
          <mesh position={[0, 0.3, W / 2 - 0.03]}><boxGeometry args={[L - 0.1, 0.06, 0.01]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isNightMode ? 0.8 : 0.15} /></mesh>
        </>
      )}

      <mesh position={[cabinX, 0.98, 0]} castShadow receiveShadow><boxGeometry args={[1.65, 1.86, Math.min(2.22, W + 0.2)]} /><primitive object={materials.brandOrange} attach="material" /></mesh>
      <mesh position={[cabinX - 0.37, 2.02, 0]} castShadow receiveShadow><boxGeometry args={[1.12, 0.32, Math.min(2.04, W)]} /><primitive object={materials.dark} attach="material" /></mesh>
      <mesh position={[cabinX - 0.82, 1.36, 0]} castShadow receiveShadow><boxGeometry args={[0.08, 0.72, Math.min(1.45, W * 0.72)]} /><primitive object={materials.glass} attach="material" /></mesh>
      <mesh position={[cabinX - 0.88, 0.62, -0.62]} castShadow receiveShadow><boxGeometry args={[0.08, 0.22, 0.38]} /><primitive object={materials.light} attach="material" /></mesh>
      <mesh position={[cabinX - 0.88, 0.62, 0.62]} castShadow receiveShadow><boxGeometry args={[0.08, 0.22, 0.38]} /><primitive object={materials.light} attach="material" /></mesh>
      {wheelXs.map((x) => <group key={x}><Wheel x={x} z={-W / 2 - 0.15} tire={materials.tire} chrome={materials.chrome} /><Wheel x={x} z={W / 2 + 0.15} tire={materials.tire} chrome={materials.chrome} /></group>)}

      {!isInside && (
        <Html position={[0, H + 0.52, 0]} center distanceFactor={7} className="pointer-events-none">
          <div className="rounded-full bg-[#10131b]/90 px-4 py-2 text-xs font-black text-white shadow-xl backdrop-blur-md ring-2 ring-[#ff6b00]/50">
            {vehicle.label} · кузов {L}×{W}×{H} м · {vehicle.capacityM3} м³
          </div>
        </Html>
      )}
      {isInside && (
        <Html position={[0, H - 0.25, 0]} center distanceFactor={5} className="pointer-events-none">
          <div className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-black text-orange-300 ring-1 ring-orange-400/40 backdrop-blur">
            {isNightMode ? '🌙 НОЧЬ · освещение вкл' : '☀️ ДЕНЬ · вид изнутри'} · {vehicle.capacityM3} м³
          </div>
        </Html>
      )}
    </group>
  );
}

function Wheel({ x, z, tire, chrome }: { x: number; z: number; tire: THREE.Material; chrome: THREE.Material }) {
  return <group position={[x, 0.12, z]} rotation={[Math.PI / 2, 0, 0]}><mesh castShadow receiveShadow><cylinderGeometry args={[0.39, 0.39, 0.28, 48]} /><primitive object={tire} attach="material" /></mesh><mesh castShadow receiveShadow position={[0, 0, 0.01]}><cylinderGeometry args={[0.17, 0.17, 0.3, 36]} /><primitive object={chrome} attach="material" /></mesh></group>;
}
