import React, { useMemo, useRef } from 'react';
import { Html, RoundedBox } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CargoBox, LoadItem } from '../../types';
import { boxDimensions, orientedHeight } from '../../utils/calculations';
import { createCardboardMaterial, createChromeMaterial, createGlassMaterial, createPlasticMaterial, createStretchWrapMaterial, createWoodMaterial } from '../../materials/pbrMaterials';
import { Box3D } from './Box3D';

interface PalletProps extends LoadItem {
  isSelected: boolean;
  hasCollision: boolean;
  onPointerDown: (id: string, event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: () => void;
  onSelect: (id: string) => void;
  onRotateCommit: (id: string, rotation: [number, number, number]) => void;
}

export const Pallet = React.memo(function Pallet(props: PalletProps) {
  const { id, kind, name, position, rotation, boxes, dimensions, material, wrapped, isSelected, hasCollision, onPointerDown, onPointerUp, onSelect, onRotateCommit } = props;
  const itemRef = useRef<THREE.Group>(null);
  const itemMaterial = useMemo(() => makeMaterial(material, kind), [kind, material]);
  const wrapMaterial = useMemo(() => createStretchWrapMaterial(), []);
  const cargoHeight = kind === 'pallet' ? Math.max(0.42, 0.144 + Math.ceil(boxes.length / 4) * 0.28) : orientedHeight(props);

  useFrame((state) => {
    if (itemRef.current && isSelected) itemRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.015;
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
      {isSelected && <SelectionBox dimensions={dimensions} height={cargoHeight} hasCollision={hasCollision} />}
      {hasCollision && (
        <Html position={[0, cargoHeight + 0.32, 0]} center distanceFactor={8}>
          <div className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white shadow-lg">нельзя поставить</div>
        </Html>
      )}
      {isSelected && (
        <>
          <GizmoHint height={cargoHeight} />
          <Html position={[0, cargoHeight + 0.08, 0]} center distanceFactor={8} className="pointer-events-none">
            <div className="rounded-2xl bg-slate-900/85 px-3 py-2 text-center text-xs font-black text-white shadow-xl">{name}<br />{Math.round(props.weight)} кг</div>
          </Html>
        </>
      )}
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
    return <group><RoundedBox args={[d.length, d.height * 0.45, d.width]} radius={0.08} smoothness={5} position={[0, d.height * 0.22, 0]} castShadow receiveShadow><primitive object={itemMaterial} attach="material" /></RoundedBox><RoundedBox args={[d.length, d.height * 0.55, 0.18]} radius={0.06} smoothness={5} position={[0, d.height * 0.58, -d.width / 2 + 0.08]} castShadow receiveShadow><primitive object={itemMaterial} attach="material" /></RoundedBox><RoundedBox args={[0.16, d.height * 0.52, d.width]} radius={0.05} smoothness={4} position={[-d.length / 2 + 0.08, d.height * 0.5, 0]} castShadow receiveShadow><primitive object={itemMaterial} attach="material" /></RoundedBox><RoundedBox args={[0.16, d.height * 0.52, d.width]} radius={0.05} smoothness={4} position={[d.length / 2 - 0.08, d.height * 0.5, 0]} castShadow receiveShadow><primitive object={itemMaterial} attach="material" /></RoundedBox></group>;
  }
  if (item.kind === 'fridge' || item.kind === 'washer') {
    return <group><RoundedBox args={[d.length, d.height, d.width]} radius={0.045} smoothness={4} position={[0, d.height / 2, 0]} castShadow receiveShadow><primitive object={itemMaterial} attach="material" /></RoundedBox><mesh position={[0, d.height * 0.54, d.width / 2 + 0.006]}><boxGeometry args={[d.length * 0.82, 0.025, 0.012]} /><meshStandardMaterial color="#94a3b8" /></mesh>{item.kind === 'washer' && <mesh position={[0, d.height * 0.52, d.width / 2 + 0.012]}><cylinderGeometry args={[0.18, 0.18, 0.02, 40]} /><meshPhysicalMaterial color="#dbeafe" transparent opacity={0.7} /></mesh>}</group>;
  }
  if (item.kind === 'tv') {
    return <group><RoundedBox args={[d.length, d.height, d.width]} radius={0.025} smoothness={3} position={[0, d.height / 2, 0]} castShadow receiveShadow><meshPhysicalMaterial color="#111827" roughness={0.15} clearcoat={0.8} /></RoundedBox><mesh position={[0, d.height / 2, d.width / 2 + 0.004]}><planeGeometry args={[d.length * 0.9, d.height * 0.82]} /><meshBasicMaterial color="#1d4ed8" transparent opacity={0.45} /></mesh></group>;
  }
  if (item.kind === 'plant') {
    return <group><mesh position={[0, 0.16, 0]} castShadow receiveShadow><cylinderGeometry args={[0.18, 0.24, 0.32, 24]} /><meshStandardMaterial color="#8B7355" roughness={0.8} /></mesh><mesh position={[0, d.height * 0.62, 0]} castShadow receiveShadow><sphereGeometry args={[Math.min(d.length, d.width) * 0.58, 24, 16]} /><primitive object={itemMaterial} attach="material" /></mesh></group>;
  }
  if (item.kind === 'bike') {
    return <group><mesh position={[0, 0.45, 0]} castShadow receiveShadow><boxGeometry args={[d.length, 0.06, 0.06]} /><primitive object={itemMaterial} attach="material" /></mesh><mesh position={[-d.length * 0.34, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.28, 0.025, 12, 32]} /><primitive object={itemMaterial} attach="material" /></mesh><mesh position={[d.length * 0.34, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.28, 0.025, 12, 32]} /><primitive object={itemMaterial} attach="material" /></mesh></group>;
  }
  return <RoundedBox args={[d.length, d.height, d.width]} radius={item.kind === 'box' ? 0.025 : 0.04} smoothness={3} position={[0, d.height / 2, 0]} castShadow receiveShadow><primitive object={itemMaterial} attach="material" /></RoundedBox>;
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

function SelectionBox({ dimensions, height, hasCollision }: { dimensions: LoadItem['dimensions']; height: number; hasCollision: boolean }) {
  return <lineSegments position={[0, height / 2, 0]}><edgesGeometry args={[new THREE.BoxGeometry(dimensions.length + 0.1, height + 0.1, dimensions.width + 0.1)]} /><lineBasicMaterial color={hasCollision ? '#ef4444' : '#ff6b00'} linewidth={2} /></lineSegments>;
}

function GizmoHint({ height }: { height: number }) {
  return (
    <group position={[0, height + 0.04, 0]}>
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.34, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.68, 12]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.72, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.14, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.68, 12]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <coneGeometry args={[0.06, 0.14, 16]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.34]}>
        <cylinderGeometry args={[0.018, 0.018, 0.68, 12]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>
      <mesh position={[0, 0, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.06, 0.14, 16]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.012, 8, 48]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
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
