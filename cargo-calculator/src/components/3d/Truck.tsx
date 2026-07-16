import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';
import { createChromeMaterial, createGlassMaterial, createTireMaterial, createTruckPaintMaterial } from '../../materials/pbrMaterials';

interface TruckProps {
  position: [number, number, number];
}

export function Truck({ position }: TruckProps) {
  const materials = useMemo(() => ({
    paint: createTruckPaintMaterial(),
    blue: new THREE.MeshPhysicalMaterial({ color: '#2563eb', metalness: 0.45, roughness: 0.22, clearcoat: 0.8, clearcoatRoughness: 0.12 }),
    floor: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.58, metalness: 0.12 }),
    wall: new THREE.MeshPhysicalMaterial({ color: '#dbeafe', transparent: true, opacity: 0.32, roughness: 0.08, transmission: 0.3, side: THREE.DoubleSide }),
    glass: createGlassMaterial(),
    tire: createTireMaterial(),
    chrome: createChromeMaterial(),
    light: new THREE.MeshStandardMaterial({ color: '#fff7cc', emissive: '#ffd166', emissiveIntensity: 0.75, roughness: 0.2 }),
    grid: new THREE.LineBasicMaterial({ color: '#2563eb', transparent: true, opacity: 0.38 })
  }), []);

  return (
    <group position={position} name="visible-procedural-truck">
      {/* Кузов: 6м × 2.4м × 2.7м, специально сделан контрастным и видимым */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.16, 2.4]} />
        <primitive object={materials.floor} attach="material" />
      </mesh>
      <mesh position={[-3.02, 1.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 2.6, 2.4]} />
        <primitive object={materials.paint} attach="material" />
      </mesh>
      <mesh position={[0, 1.38, -1.22]} castShadow receiveShadow>
        <boxGeometry args={[6, 2.6, 0.08]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>
      <mesh position={[0, 1.38, 1.22]} castShadow receiveShadow>
        <boxGeometry args={[6, 2.6, 0.08]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>
      <mesh position={[0, 2.72, -1.22]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.1, 0.12]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>
      <mesh position={[0, 2.72, 1.22]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.1, 0.12]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>

      {/* Задние открытые двери */}
      <group position={[3.06, 1.38, -0.72]} rotation={[0, -0.78, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.08, 2.35, 1.18]} />
          <primitive object={materials.paint} attach="material" />
        </mesh>
      </group>
      <group position={[3.06, 1.38, 0.72]} rotation={[0, 0.78, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.08, 2.35, 1.18]} />
          <primitive object={materials.paint} attach="material" />
        </mesh>
      </group>

      {/* Контур кузова, чтобы 3D был виден даже на светлом фоне */}
      <lineSegments position={[0, 1.38, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(6.05, 2.62, 2.45)]} />
        <lineBasicMaterial color="#2563eb" transparent opacity={0.7} />
      </lineSegments>

      {/* Сетка пола 10 см в стилизованном виде */}
      <gridHelper args={[6, 60, '#2563eb', '#93c5fd']} position={[0, 0.171, 0]} />
      <gridHelper args={[2.4, 24, '#2563eb', '#bfdbfe']} position={[0, 0.173, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Кабина */}
      <mesh position={[-3.95, 0.98, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.65, 1.86, 2.22]} />
        <primitive object={materials.blue} attach="material" />
      </mesh>
      <mesh position={[-4.32, 2.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.12, 0.32, 2.04]} />
        <primitive object={materials.blue} attach="material" />
      </mesh>
      <mesh position={[-4.78, 1.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.72, 1.45]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>
      <mesh position={[-4.02, 1.38, -1.15]} castShadow receiveShadow>
        <boxGeometry args={[0.58, 0.55, 0.08]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>
      <mesh position={[-4.02, 1.38, 1.15]} castShadow receiveShadow>
        <boxGeometry args={[0.58, 0.55, 0.08]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>
      <mesh position={[-4.84, 0.62, -0.62]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.22, 0.38]} />
        <primitive object={materials.light} attach="material" />
      </mesh>
      <mesh position={[-4.84, 0.62, 0.62]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.22, 0.38]} />
        <primitive object={materials.light} attach="material" />
      </mesh>
      <mesh position={[-4.62, 1.42, -1.42]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.08, 0.36]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>
      <mesh position={[-4.62, 1.42, 1.42]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.08, 0.36]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>

      {/* Колёса */}
      {[-4.15, -2.1, 2.35].map((x) => (
        <group key={x}>
          <Wheel x={x} z={-1.38} tire={materials.tire} chrome={materials.chrome} />
          <Wheel x={x} z={1.38} tire={materials.tire} chrome={materials.chrome} />
        </group>
      ))}

      <mesh position={[0, 1.35, 0]} visible={false} name="cargo-collision-volume">
        <boxGeometry args={[6, 2.5, 2.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <Html position={[0, 3.0, 0]} center distanceFactor={7} className="pointer-events-none">
        <div className="rounded-full bg-slate-900/85 px-4 py-2 text-xs font-black text-white shadow-xl backdrop-blur-md">
          Кузов 6×2.4×2.7 м · 3D модель процедурная + PBR
        </div>
      </Html>
    </group>
  );
}

function Wheel({ x, z, tire, chrome }: { x: number; z: number; tire: THREE.Material; chrome: THREE.Material }) {
  return (
    <group position={[x, 0.12, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.39, 0.39, 0.28, 48]} />
        <primitive object={tire} attach="material" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0.01]}>
        <cylinderGeometry args={[0.17, 0.17, 0.3, 36]} />
        <primitive object={chrome} attach="material" />
      </mesh>
    </group>
  );
}
