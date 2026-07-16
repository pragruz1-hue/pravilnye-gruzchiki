import { useMemo } from 'react';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface TruckProps {
  position: [number, number, number];
}

export function Truck({ position }: TruckProps) {
  const { scene } = useGLTF('/models/truck.glb');
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const name = child.name.toLowerCase();
        if (name.includes('cargo_left_wall') || name.includes('cargo_right_wall') || name.includes('cargo_front_wall')) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: '#ffffff',
            transparent: true,
            opacity: 0.28,
            roughness: 0.12,
            transmission: 0.35,
            side: THREE.DoubleSide
          });
        }
        if (name.includes('cargo_floor')) {
          child.material = new THREE.MeshStandardMaterial({ color: '#d1d5db', roughness: 0.62, metalness: 0.12 });
        }
      }
    });
    return clone;
  }, [scene]);

  return (
    <group position={position}>
      <primitive object={clonedScene} />
      <mesh position={[0, 1.35, 0]} visible={false} name="cargo-collision-volume">
        <boxGeometry args={[6, 2.5, 2.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <gridHelper args={[6, 60, '#2563eb', '#93c5fd']} position={[0, 0.235, 0]} />
      <Html position={[0, 2.75, 0]} center distanceFactor={8} className="pointer-events-none">
        <div className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
          Кузов 6×2.4×2.7 м · сетка 10 см
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload('/models/truck.glb');
