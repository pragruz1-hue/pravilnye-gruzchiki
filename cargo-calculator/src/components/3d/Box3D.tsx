import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { BoxSize, BoxType } from '../../types';
import { boxDimensions } from '../../utils/calculations';
import { createCardboardMaterial, createColdCargoMaterial, createHeavyCargoMaterial, createTapeMaterial } from '../../materials/pbrMaterials';

interface Box3DProps {
  size: BoxSize;
  type: BoxType;
  color: string;
  position: [number, number, number];
}

export function Box3D({ size, type, color, position }: Box3DProps) {
  const dims = boxDimensions(size);
  const material = useMemo(() => {
    if (type === 'heavy') return createHeavyCargoMaterial();
    if (type === 'cold') return createColdCargoMaterial();
    if (type === 'danger') return new THREE.MeshStandardMaterial({ color: '#f97316', roughness: 0.5 });
    if (type === 'fragile') return new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.58 });
    return createCardboardMaterial(color);
  }, [color, type]);
  const tapeMaterial = useMemo(() => createTapeMaterial(), []);

  return (
    <group position={position}>
      <RoundedBox args={[dims.length, dims.height, dims.width]} radius={0.025} smoothness={3} castShadow receiveShadow>
        <primitive object={material} attach="material" />
      </RoundedBox>
      <mesh position={[0, dims.height / 2 + 0.006, 0]} castShadow receiveShadow>
        <boxGeometry args={[dims.length + 0.01, 0.012, 0.055]} />
        <primitive object={tapeMaterial} attach="material" />
      </mesh>
      <mesh position={[0, dims.height / 2 + 0.008, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.055, 0.012, dims.width + 0.01]} />
        <primitive object={tapeMaterial} attach="material" />
      </mesh>
      {type === 'fragile' && (
        <mesh position={[0, dims.height / 2 + 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[dims.length * 0.65, dims.width * 0.34]} />
          <meshBasicMaterial color="#111827" transparent opacity={0.75} />
        </mesh>
      )}
    </group>
  );
}
