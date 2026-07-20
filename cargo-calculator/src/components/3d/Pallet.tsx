import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Html, RoundedBox } from '@react-three/drei';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CargoBox, LoadItem } from '../../types';
import { boxDimensions, orientedHeight, orientedFootprint, VEHICLES, getStackHeightAt } from '../../utils/calculations';
import { createCardboardMaterial, createChromeMaterial, createGlassMaterial, createPlasticMaterial, createStretchWrapMaterial, createWoodMaterial } from '../../materials/pbrMaterials';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { Box3D } from './Box3D';
import { TransformOperator, SelectionHighlight } from './TransformOperator';

interface PalletProps extends LoadItem {
  isSelected: boolean;
  hasCollision: boolean;
  onPointerDown: (id: string, event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: () => void;
  onSelect: (id: string) => void;
  onRotateCommit: (id: string, rotation: [number, number, number]) => void;
}

export const Pallet = React.memo(function Pallet(props: PalletProps) {
  const { id, kind, name, position, rotation, boxes, dimensions, material, wrapped, isSelected, hasCollision, onPointerDown, onPointerUp, onSelect } = props;
  const itemRef = useRef<THREE.Group>(null);
  const baseMaterial = useMemo(() => makeMaterial(material, kind), [kind, material]);
  const itemMaterial = useMemo(() => {
    if (!hasCollision) return baseMaterial;
    const mat = baseMaterial.clone();
    if ('color' in mat) {
      (mat as THREE.MeshStandardMaterial).color.set('#ef4444');
      if ('emissive' in mat && (mat as any).emissive) {
        (mat as any).emissive.set('#991b1b');
        (mat as any).emissiveIntensity = 0.4;
      }
    }
    return mat;
  }, [baseMaterial, hasCollision]);
  const wrapMaterial = useMemo(() => createStretchWrapMaterial(), []);
  const cargoHeight = kind === 'pallet' ? Math.max(0.42, 0.144 + Math.ceil(boxes.length / 4) * 0.28) : orientedHeight(props);
  const fallingTargets = useCalculatorStore((s) => s.fallingTargets);
  const commitLanding = useCalculatorStore((s) => s.commitLanding);

  useFrame((state, delta) => {
    if (!itemRef.current) return;

    const targetY = fallingTargets[id];
    if (targetY !== undefined) {
      const currentVisualY = itemRef.current.position.y;
      const diff = currentVisualY - targetY;
      if (Math.abs(diff) > 0.005) {
        const speed = Math.min(1, (Math.abs(diff) + 0.3) * delta * 5.0);
        itemRef.current.position.y = currentVisualY - Math.sign(diff) * Math.min(Math.abs(diff), Math.abs(diff) * speed + 0.02);
      } else {
        itemRef.current.position.y = targetY;
        commitLanding(id);
      }
      return;
    }

    if (isSelected) {
      itemRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.015;
    }
  });

  return (
    <group
      ref={itemRef}
      position={position}
      rotation={rotation}
      onPointerDown={(event) => onPointerDown(id, event)}
      onPointerUp={onPointerUp}
      onClick={(event) => { event.stopPropagation(); onSelect(id); }}
    >
      {kind === 'pallet' ? (
        <PalletLoad item={props} itemMaterial={itemMaterial} wrapMaterial={wrapMaterial} />
      ) : (
        <FurnitureLoad item={props} itemMaterial={itemMaterial} />
      )}
      {wrapped && kind !== 'pallet' && (
        <mesh position={[0, dimensions.height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[dimensions.length + 0.04, dimensions.height + 0.04, dimensions.width + 0.04]} />
          <primitive object={wrapMaterial} attach="material" />
        </mesh>
      )}
      {isSelected && <SelectionHighlight dimensions={dimensions} height={cargoHeight} hasCollision={hasCollision} position={position} />}
      {isSelected && <TransformOperator />}
    </group>
  );
});

function makeMaterial(material: LoadItem['material'], kind: LoadItem['kind']): THREE.Material {
  if (material === 'wood') return createWoodMaterial();
  if (material === 'plasticBlue') return createPlasticMaterial('#2563eb');
  if (material === 'plasticGreen') return createPlasticMaterial('#10b981');
  if (material === 'metal') return createChromeMaterial();
  if (material === 'whiteGoods') return new THREE.MeshPhysicalMaterial({ color: '#f8fafc', roughness: 0.18, metalness: 0.05, clearcoat: 0.85 });
  if (material === 'fabric') return new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.92 });
  if (material === 'glass') return createGlassMaterial();
  if (material === 'plant') return new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.8 });
  if (kind === 'box' || material === 'cardboard') return createCardboardMaterial();
  if (material === 'dark') return new THREE.MeshPhysicalMaterial({ color: '#111827', roughness: 0.2, clearcoat: 0.65 });
  return new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.55 });
}

function FurnitureLoad({ item, itemMaterial }: { item: LoadItem; itemMaterial: THREE.Material }) {
  const d = item.dimensions;

  if (item.kind === 'sofa') {
    return (
      <group>
        <RoundedBox args={[d.length, d.height * 0.45, d.width]} radius={0.08} smoothness={5} position={[0, d.height * 0.22, 0]} castShadow receiveShadow>
          <primitive object={itemMaterial} attach="material" />
        </RoundedBox>
        <RoundedBox args={[d.length, d.height * 0.55, 0.18]} radius={0.06} smoothness={5} position={[0, d.height * 0.58, -d.width / 2 + 0.08]} castShadow receiveShadow>
          <primitive object={itemMaterial} attach="material" />
        </RoundedBox>
        <RoundedBox args={[0.16, d.height * 0.52, d.width]} radius={0.05} smoothness={4} position={[-d.length / 2 + 0.08, d.height * 0.5, 0]} castShadow receiveShadow>
          <primitive object={itemMaterial} attach="material" />
        </RoundedBox>
        <RoundedBox args={[0.16, d.height * 0.52, d.width]} radius={0.05} smoothness={4} position={[d.length / 2 - 0.08, d.height * 0.5, 0]} castShadow receiveShadow>
          <primitive object={itemMaterial} attach="material" />
        </RoundedBox>
        <RoundedBox args={[0.55, 0.35, 0.1]} radius={0.04} smoothness={4} position={[-0.45, d.height * 0.58, -d.width / 2 + 0.16]} castShadow receiveShadow>
          <meshStandardMaterial color="#3b4252" roughness={0.9} />
        </RoundedBox>
        <RoundedBox args={[0.55, 0.35, 0.1]} radius={0.04} smoothness={4} position={[0.45, d.height * 0.58, -d.width / 2 + 0.16]} castShadow receiveShadow>
          <meshStandardMaterial color="#3b4252" roughness={0.9} />
        </RoundedBox>
      </group>
    );
  }

  if (item.kind === 'fridge') {
    return (
      <group>
        <RoundedBox args={[d.length, d.height, d.width]} radius={0.03} smoothness={4} position={[0, d.height / 2, 0]} castShadow receiveShadow>
          <primitive object={itemMaterial} attach="material" />
        </RoundedBox>
        <mesh position={[0, d.height * 0.35, d.width / 2 + 0.005]}>
          <boxGeometry args={[d.length * 0.96, 0.008, 0.005]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[d.length / 2 - 0.06, d.height * 0.65, d.width / 2 + 0.014]} castShadow>
          <boxGeometry args={[0.02, 0.28, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[d.length / 2 - 0.06, d.height * 0.25, d.width / 2 + 0.014]} castShadow>
          <boxGeometry args={[0.02, 0.18, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    );
  }

  if (item.kind === 'washer') {
    return (
      <group>
        <RoundedBox args={[d.length, d.height, d.width]} radius={0.045} smoothness={4} position={[0, d.height / 2, 0]} castShadow receiveShadow>
          <primitive object={itemMaterial} attach="material" />
        </RoundedBox>
        <mesh position={[0, d.height * 0.85, d.width / 2 + 0.006]}>
          <boxGeometry args={[d.length * 0.9, 0.12, 0.008]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        <mesh position={[d.length * 0.22, d.height * 0.85, d.width / 2 + 0.011]}>
          <boxGeometry args={[0.12, 0.05, 0.005]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh position={[-d.length * 0.22, d.height * 0.85, d.width / 2 + 0.013]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.012, 24]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.2} />
        </mesh>
        <group position={[0, d.height * 0.44, d.width / 2 + 0.006]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <torusGeometry args={[0.16, 0.018, 12, 36]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.004, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.008, 24]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.65} roughness={0.02} transmission={0.9} />
          </mesh>
        </group>
      </group>
    );
  }

  if (item.kind === 'wardrobe') {
    return (
      <group>
        <RoundedBox args={[d.length, d.height, d.width]} radius={0.02} smoothness={3} position={[0, d.height / 2, 0]} castShadow receiveShadow>
          <primitive object={itemMaterial} attach="material" />
        </RoundedBox>
        <mesh position={[0, d.height / 2, d.width / 2 + 0.005]}>
          <boxGeometry args={[0.006, d.height * 0.95, 0.006]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
        <mesh position={[-0.04, d.height / 2, d.width / 2 + 0.012]} castShadow>
          <cylinderGeometry args={[0.008, 0.01, 0.14, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.04, d.height / 2, d.width / 2 + 0.012]} castShadow>
          <cylinderGeometry args={[0.008, 0.01, 0.14, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (item.kind === 'tv') {
    return (
      <group>
        <RoundedBox args={[d.length, d.height, d.width]} radius={0.025} smoothness={3} position={[0, d.height / 2, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#111827" roughness={0.15} clearcoat={0.8} />
        </RoundedBox>
        <mesh position={[0, d.height / 2, d.width / 2 + 0.004]}>
          <planeGeometry args={[d.length * 0.9, d.height * 0.82]} />
          <meshBasicMaterial color="#1d4ed8" transparent opacity={0.45} />
        </mesh>
      </group>
    );
  }

  if (item.kind === 'plant') {
    return (
      <group>
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.24, 0.32, 24]} />
          <meshStandardMaterial color="#8B7355" roughness={0.8} />
        </mesh>
        <mesh position={[0, d.height * 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.02, 0.02, d.height * 0.5, 8]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        {Array.from({ length: 5 }).map((_, idx) => {
          const rot = (idx * Math.PI * 2) / 5;
          return (
            <mesh
              key={`leaf-${idx}`}
              position={[Math.sin(rot) * 0.16, d.height * 0.55 + idx * 0.06, Math.cos(rot) * 0.16]}
              rotation={[0.3, rot, 0.2]}
              castShadow
              receiveShadow
            >
              <sphereGeometry args={[0.22, 16, 8]} />
              <primitive object={itemMaterial} attach="material" />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (item.kind === 'bike') {
    return <Bicycle d={d} material={itemMaterial} />;
  }

  if (item.kind === 'box') {
    return (
      <group>
        <RoundedBox args={[d.length, d.height, d.width]} radius={0.025} smoothness={3} position={[0, d.height / 2, 0]} castShadow receiveShadow>
          <primitive object={itemMaterial} attach="material" />
        </RoundedBox>
        <mesh position={[0, d.height + 0.003, 0]}>
          <boxGeometry args={[d.length * 1.01, 0.002, 0.051]} />
          <meshStandardMaterial color="#854d0e" roughness={0.7} />
        </mesh>
        <mesh position={[d.length / 2 + 0.003, d.height / 2, 0]}>
          <boxGeometry args={[0.002, d.height * 0.8, 0.051]} />
          <meshStandardMaterial color="#854d0e" roughness={0.7} />
        </mesh>
        <mesh position={[-d.length / 2 - 0.003, d.height / 2, 0]}>
          <boxGeometry args={[0.002, d.height * 0.8, 0.051]} />
          <meshStandardMaterial color="#854d0e" roughness={0.7} />
        </mesh>
        <mesh position={[0, d.height / 2, d.width / 2 + 0.004]}>
          <planeGeometry args={[0.16, 0.1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }

  if (item.kind === 'table') {
    return (
      <group>
        <RoundedBox args={[d.length, 0.06, d.width]} radius={0.012} smoothness={3} position={[0, d.height - 0.03, 0]} castShadow receiveShadow>
          <primitive object={itemMaterial} attach="material" />
        </RoundedBox>
        {[-d.length / 2 + 0.08, d.length / 2 - 0.08].map((x) =>
          [-d.width / 2 + 0.08, d.width / 2 - 0.08].map((z) => (
            <mesh key={`leg-${x}-${z}`} position={[x, (d.height - 0.06) / 2, z]} castShadow receiveShadow>
              <cylinderGeometry args={[0.03, 0.02, d.height - 0.06, 12]} />
              <primitive object={itemMaterial} attach="material" />
            </mesh>
          ))
        )}
      </group>
    );
  }

  if (item.kind === 'chairs') {
    return (
      <group>
        {Array.from({ length: 4 }).map((_, idx) => {
          const yOffset = idx * 0.12;
          return (
            <group key={`chair-${idx}`} position={[0, yOffset, 0]}>
              <RoundedBox args={[0.42, 0.04, 0.42]} radius={0.01} smoothness={2} position={[0, 0.4, 0]} castShadow receiveShadow>
                <primitive object={itemMaterial} attach="material" />
              </RoundedBox>
              <RoundedBox args={[0.42, 0.38, 0.04]} radius={0.01} smoothness={2} position={[0, 0.6, -0.19]} castShadow receiveShadow>
                <primitive object={itemMaterial} attach="material" />
              </RoundedBox>
              {[-0.18, 0.18].map((x) =>
                [-0.18, 0.18].map((z) => (
                  <mesh key={`leg-${x}-${z}`} position={[x, 0.2, z]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.018, 0.014, 0.4, 8]} />
                    <primitive object={itemMaterial} attach="material" />
                  </mesh>
                ))
              )}
            </group>
          );
        })}
      </group>
    );
  }

  return (
    <RoundedBox args={[d.length, d.height, d.width]} radius={0.04} smoothness={3} position={[0, d.height / 2, 0]} castShadow receiveShadow>
      <primitive object={itemMaterial} attach="material" />
    </RoundedBox>
  );
}

function Bicycle({ d, material }: { d: LoadItem['dimensions']; material: THREE.Material }) {
  const frameColor = '#1a1a2e';
  const metalMaterial = new THREE.MeshPhysicalMaterial({ color: frameColor, roughness: 0.3, metalness: 0.7, clearcoat: 0.5 });
  const tireMaterial = new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.9 });
  const rimMaterial = new THREE.MeshPhysicalMaterial({ color: '#cbd5e1', roughness: 0.2, metalness: 0.8, clearcoat: 0.6 });
  const saddleMaterial = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.8 });
  const gripMaterial = new THREE.MeshStandardMaterial({ color: '#2d1b0e', roughness: 0.9 });

  return (
    <group>
      {/* Frame - main triangle */}
      <group>
        {/* Top tube */}
        <mesh position={[0, 0.78, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.022, 0.022, d.length * 0.55, 16]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        {/* Down tube */}
        <mesh position={[-d.length * 0.2, 0.42, 0]} rotation={[0, 0, Math.atan2(0.4, d.length * 0.35)]} castShadow receiveShadow>
          <cylinderGeometry args={[0.025, 0.025, Math.sqrt(0.4 * 0.4 + (d.length * 0.35) * (d.length * 0.35)), 16]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        {/* Seat tube */}
        <mesh position={[d.length * 0.18, 0.45, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.4, 16]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        {/* Chain stays (rear triangle bottom) */}
        <mesh position={[d.length * 0.28, 0.2, 0.04]} rotation={[0, 0, Math.atan2(0.2, d.length * 0.15)]} castShadow receiveShadow>
          <cylinderGeometry args={[0.014, 0.014, Math.sqrt(0.2 * 0.2 + (d.length * 0.15) * (d.length * 0.15)), 12]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        <mesh position={[d.length * 0.28, 0.2, -0.04]} rotation={[0, 0, Math.atan2(0.2, d.length * 0.15)]} castShadow receiveShadow>
          <cylinderGeometry args={[0.014, 0.014, Math.sqrt(0.2 * 0.2 + (d.length * 0.15) * (d.length * 0.15)), 12]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        {/* Seat stays (rear triangle top) */}
        <mesh position={[d.length * 0.18, 0.6, 0.04]} rotation={[0, 0, -Math.atan2(0.3, d.length * 0.1)]} castShadow receiveShadow>
          <cylinderGeometry args={[0.012, 0.012, Math.sqrt(0.3 * 0.3 + (d.length * 0.1) * (d.length * 0.1)), 12]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        <mesh position={[d.length * 0.18, 0.6, -0.04]} rotation={[0, 0, -Math.atan2(0.3, d.length * 0.1)]} castShadow receiveShadow>
          <cylinderGeometry args={[0.012, 0.012, Math.sqrt(0.3 * 0.3 + (d.length * 0.1) * (d.length * 0.1)), 12]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        {/* Head tube */}
        <mesh position={[-d.length * 0.38, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.028, 0.028, 0.12, 16]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
      </group>

      {/* Front wheel */}
      <group position={[-d.length * 0.38, 0.35, 0]}>
        {/* Tire */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <torusGeometry args={[0.33, 0.028, 12, 32]} />
          <primitive object={tireMaterial} attach="material" />
        </mesh>
        {/* Rim */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <torusGeometry args={[0.29, 0.012, 12, 32]} />
          <primitive object={rimMaterial} attach="material" />
        </mesh>
        {/* Spokes */}
        <group rotation={[0, 0, Math.PI / 2]}>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={`spoke-f-${i}`} rotation={[0, 0, (i * Math.PI) / 6]} castShadow>
              <cylinderGeometry args={[0.0015, 0.0015, 0.3, 6]} />
              <primitive object={rimMaterial} attach="material" />
            </mesh>
          ))}
        </group>
        {/* Hub */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.06, 16]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        {/* Fork */}
        <mesh position={[-0.02, 0, 0.04]} rotation={[0, 0, -0.15]} castShadow receiveShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.35, 12]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        <mesh position={[-0.02, 0, -0.04]} rotation={[0, 0, -0.15]} castShadow receiveShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.35, 12]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
      </group>

      {/* Rear wheel */}
      <group position={[d.length * 0.32, 0.35, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <torusGeometry args={[0.33, 0.028, 12, 32]} />
          <primitive object={tireMaterial} attach="material" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <torusGeometry args={[0.29, 0.012, 12, 32]} />
          <primitive object={rimMaterial} attach="material" />
        </mesh>
        <group rotation={[0, 0, Math.PI / 2]}>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={`spoke-r-${i}`} rotation={[0, 0, (i * Math.PI) / 6]} castShadow>
              <cylinderGeometry args={[0.0015, 0.0015, 0.3, 6]} />
              <primitive object={rimMaterial} attach="material" />
            </mesh>
          ))}
        </group>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.06, 16]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        {/* Rear cassette */}
        <mesh position={[0, 0, -0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.03, 0.015, 0.02, 16]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
      </group>

      {/* Handlebars */}
      <group position={[-d.length * 0.38, 0.95, 0]}>
        {/* Stem */}
        <mesh position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.12, 12]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        {/* Bar */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.55, 12]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        {/* Grips */}
        <mesh position={[-0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 12]} />
          <primitive object={gripMaterial} attach="material" />
        </mesh>
        <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 12]} />
          <primitive object={gripMaterial} attach="material" />
        </mesh>
        {/* Brake levers (simple) */}
        <mesh position={[-0.22, 0.02, 0.02]} rotation={[0, Math.PI / 4, Math.PI / 2]} castShadow>
          <boxGeometry args={[0.04, 0.015, 0.03]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        <mesh position={[0.22, 0.02, 0.02]} rotation={[0, -Math.PI / 4, Math.PI / 2]} castShadow>
          <boxGeometry args={[0.04, 0.015, 0.03]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
      </group>

      {/* Saddle */}
      <group position={[d.length * 0.15, 0.88, 0]}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 12, 0, 0]} castShadow receiveShadow>
          <RoundedBox args={[0.22, 0.03, 0.14]} radius={0.02} smoothness={3} />
          <primitive object={saddleMaterial} attach="material" />
        </mesh>
        {/* Seat post */}
        <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.35, 12]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
      </group>

      {/* Crankset / Pedals */}
      <group position={[d.length * 0.15, 0.35, 0]}>
        {/* Crank arms */}
        <mesh position={[-0.17, 0, 0.04]} rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.17, 8]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        <mesh position={[0.17, 0, -0.04]} rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.17, 8]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        {/* Chainring */}
        <mesh position={[0, 0, 0.04]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.09, 0.01, 8, 24]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        {/* Pedals */}
        <mesh position={[-0.17, -0.02, 0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.01, 0.035]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        <mesh position={[0.17, -0.02, -0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.01, 0.035]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

function PalletLoad({ item, itemMaterial, wrapMaterial }: { item: LoadItem; itemMaterial: THREE.Material; wrapMaterial: THREE.Material }) {
  const boxPositions = layoutBoxes(item.boxes, item.dimensions);
  const cargoHeight = Math.max(0.42, ...boxPositions.map((entry) => entry.position[1] + boxDimensions(entry.box.size).height / 2));
  return <group><ProceduralPallet length={item.dimensions.length} width={item.dimensions.width} material={itemMaterial} />{boxPositions.map(({ box, position }) => <Box3D key={box.id} size={box.size} type={box.type} color={box.color} position={position} />)}{item.wrapped && <mesh position={[0, 0.144 + cargoHeight / 2, 0]} castShadow receiveShadow><boxGeometry args={[item.dimensions.length + 0.05, cargoHeight + 0.08, item.dimensions.width + 0.05]} /><primitive object={wrapMaterial} attach="material" /></mesh>}</group>;
}

function ProceduralPallet({ length, width, material }: { length: number; width: number; material: THREE.Material }) {
  const topPlanks = Array.from({ length: 5 }, (_, index) => -width / 2 + 0.07 + index * ((width - 0.14) / 4));
  const bottomPlanks = [-width / 2 + 0.13, 0, width / 2 - 0.13];
  const blocksX = [-length / 2 + 0.16, 0, length / 2 - 0.16];
  const blocksZ = [-width / 2 + 0.13, 0, width / 2 - 0.13];
  return <group>{topPlanks.map((z, index) => <mesh key={`top-${index}`} position={[0, 0.144, z]} castShadow receiveShadow><boxGeometry args={[length, 0.04, Math.min(0.12, width / 7)]} /><primitive object={material} attach="material" /></mesh>)}{bottomPlanks.map((z, index) => <mesh key={`bottom-${index}`} position={[0, 0.025, z]} castShadow receiveShadow><boxGeometry args={[length, 0.035, Math.min(0.1, width / 8)]} /><primitive object={material} attach="material" /></mesh>)}{blocksX.map((x) => blocksZ.map((z) => <mesh key={`block-${x}-${z}`} position={[x, 0.08, z]} castShadow receiveShadow><boxGeometry args={[0.16, 0.09, 0.14]} /><primitive object={material} attach="material" /></mesh>))}</group>;
}

function layoutBoxes(boxes: CargoBox[], dimensions: LoadItem['dimensions']): Array<{ box: CargoBox; position: [number, number, number] }> {
  const sorted = [...boxes];
  const columns = Math.max(1, Math.floor(dimensions.length / 0.32));
  const depthRows = Math.max(1, Math.floor(dimensions.width / 0.32));
  return sorted.map((box, index) => {
    const dims = boxDimensions(box.size);
    const perLayer = columns * depthRows;
    const layer = Math.floor(index / perLayer);
    const inLayer = index % perLayer;
    const col = inLayer % columns;
    const row = Math.floor(inLayer / columns);
    const x = -dimensions.length / 2 + dims.length / 2 + 0.05 + col * Math.min(0.34, dimensions.length / columns);
    const z = -dimensions.width / 2 + dims.width / 2 + 0.05 + row * Math.min(0.34, dimensions.width / depthRows);
    const y = 0.144 + dims.height / 2 + layer * 0.32;
    return { box, position: [x, y, z] as [number, number, number] };
  });
}