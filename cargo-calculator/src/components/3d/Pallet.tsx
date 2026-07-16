import React, { useMemo, useRef } from 'react';
import { Html, TransformControls, useGLTF } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CargoBox, Pallet as PalletType } from '../../types';
import { boxDimensions } from '../../utils/calculations';
import { createPlasticMaterial, createStretchWrapMaterial, createWoodMaterial } from '../../materials/pbrMaterials';
import { Box3D } from './Box3D';

interface PalletProps extends PalletType {
  isSelected: boolean;
  hasCollision: boolean;
  onPointerDown: (id: string, event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: () => void;
  onSelect: (id: string) => void;
  onRotateCommit: (id: string, rotation: [number, number, number]) => void;
}

export const Pallet = React.memo(function Pallet({
  id,
  type,
  position,
  rotation,
  boxes,
  dimensions,
  material,
  wrapped,
  isSelected,
  hasCollision,
  onPointerDown,
  onPointerUp,
  onSelect,
  onRotateCommit
}: PalletProps) {
  const { scene } = useGLTF('/models/pallet.glb');
  const palletRef = useRef<THREE.Group>(null);
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    const mat = material === 'wood'
      ? createWoodMaterial()
      : material === 'plasticBlue'
        ? createPlasticMaterial('#2563eb')
        : material === 'plasticGreen'
          ? createPlasticMaterial('#10b981')
          : new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.8, roughness: 0.18 });
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = mat;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const scaleZ = type === 'FIN' ? 1.25 : type === 'STANDARD' ? 1.5 : 1;
    clone.scale.set(1, 1, scaleZ);
    return clone;
  }, [material, scene, type]);
  const wrapMaterial = useMemo(() => createStretchWrapMaterial(), []);

  useFrame((state) => {
    if (palletRef.current && isSelected) {
      palletRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.018;
    }
  });

  const boxPositions = useMemo(() => layoutBoxes(boxes, dimensions), [boxes, dimensions]);
  const cargoHeight = useMemo(() => Math.max(0.42, ...boxPositions.map((item) => item.position[1] + boxDimensions(item.box.size).height / 2)), [boxPositions]);

  return (
    <group
      ref={palletRef}
      position={position}
      rotation={rotation}
      onPointerDown={(event) => onPointerDown(id, event)}
      onPointerUp={onPointerUp}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
    >
      <primitive object={clonedScene} />
      {boxPositions.map(({ box, position: boxPosition }) => (
        <Box3D key={box.id} size={box.size} type={box.type} color={box.color} position={boxPosition} />
      ))}
      {wrapped && (
        <mesh position={[0, 0.144 + cargoHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[dimensions.length + 0.04, cargoHeight + 0.05, dimensions.width + 0.04]} />
          <primitive object={wrapMaterial} attach="material" />
        </mesh>
      )}
      {isSelected && (
        <lineSegments position={[0, 0.144 + cargoHeight / 2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(dimensions.length + 0.08, cargoHeight + 0.1, dimensions.width + 0.08)]} />
          <lineBasicMaterial color={hasCollision ? '#ef4444' : '#2563eb'} linewidth={2} />
        </lineSegments>
      )}
      {hasCollision && (
        <Html position={[0, cargoHeight + 0.45, 0]} center distanceFactor={8}>
          <div className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white shadow-lg">Столкновение</div>
        </Html>
      )}
      {isSelected && (
        <TransformControls
          object={palletRef as unknown as React.MutableRefObject<THREE.Object3D>}
          mode="rotate"
          showX={false}
          showY={true}
          showZ={false}
          size={0.65}
          onMouseUp={() => {
            if (!palletRef.current) return;
            onRotateCommit(id, [palletRef.current.rotation.x, palletRef.current.rotation.y, palletRef.current.rotation.z]);
          }}
        />
      )}
    </group>
  );
});

function layoutBoxes(boxes: CargoBox[], dimensions: PalletType['dimensions']): Array<{ box: CargoBox; position: [number, number, number] }> {
  const sorted = [...boxes].sort((a, b) => boxDimensions(b.size).length - boxDimensions(a.size).length);
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

useGLTF.preload('/models/pallet.glb');
