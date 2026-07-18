import React, { useMemo, useRef } from 'react';
import { Html, RoundedBox } from '@react-three/drei';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CargoBox, LoadItem } from '../../types';
import { boxDimensions, orientedHeight, orientedFootprint, VEHICLES, getStackHeightAt } from '../../utils/calculations';
import { createCardboardMaterial, createChromeMaterial, createGlassMaterial, createPlasticMaterial, createStretchWrapMaterial, createWoodMaterial } from '../../materials/pbrMaterials';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useCalculatorStore } from '../../store/useCalculatorStore';
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
      {isSelected && <SelectionBox dimensions={dimensions} height={cargoHeight} hasCollision={hasCollision} />}
      {isSelected ? (
        <InteractiveGizmo id={id} position={position} rotation={rotation} height={cargoHeight} />
      ) : null}
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
    return (
      <group>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[d.length, 0.06, 0.06]} />
          <primitive object={itemMaterial} attach="material" />
        </mesh>
        <mesh position={[-d.length * 0.34, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.025, 12, 32]} />
          <primitive object={itemMaterial} attach="material" />
        </mesh>
        <mesh position={[d.length * 0.34, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.025, 12, 32]} />
          <primitive object={itemMaterial} attach="material" />
        </mesh>
      </group>
    );
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

function InteractiveGizmo({ id, position, rotation, height }: { id: string; position: [number, number, number]; rotation: [number, number, number]; height: number }) {
  const { camera, raycaster, gl } = useThree();
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;
  const vehicleType = useCalculatorStore((state) => state.vehicleType);
  const pallets = useCalculatorStore((state) => state.pallets);
  const updatePalletPosition = useCalculatorStore((state) => state.updatePalletPosition);
  const updatePalletRotation = useCalculatorStore((state) => state.updatePalletRotation);
  const landItem = useCalculatorStore((state) => state.landItem);

  const vehicle = VEHICLES[vehicleType];
  const item = pallets.find((p) => p.id === id);

  const dragRef = useRef<{
    axis: 'X' | 'Y' | 'Z' | 'rotY';
    pointerId: number;
    initialPoint: THREE.Vector3;
    initialItemPos: [number, number, number];
    initialItemRot: [number, number, number];
  } | null>(null);

  const disableControls = () => { if (controls) controls.enabled = false; };
  const enableControls = () => { if (controls) controls.enabled = true; };

  const handlePointerDown = (axis: 'X' | 'Y' | 'Z' | 'rotY', event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    disableControls();

    dragRef.current = {
      axis,
      pointerId: event.pointerId,
      initialPoint: event.point.clone(),
      initialItemPos: [...position],
      initialItemRot: [...rotation]
    };
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!dragRef.current || !item) return;
    event.stopPropagation();

    const drag = dragRef.current;
    raycaster.setFromCamera(event.pointer, camera);

    if (drag.axis === 'X' || drag.axis === 'Z') {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -drag.initialPoint.y);
      const hitPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, hitPoint);

      const delta = hitPoint.sub(drag.initialPoint);
      const fp = orientedFootprint(item);
      const maxL = vehicle.cargoLength / 2 - fp.length / 2;
      const maxW = vehicle.cargoWidth / 2 - fp.width / 2;

      let newX = drag.initialItemPos[0];
      let newZ = drag.initialItemPos[2];

      if (drag.axis === 'X') {
        newX = Math.round((drag.initialItemPos[0] + delta.x) / 0.1) * 0.1;
        newX = THREE.MathUtils.clamp(newX, -maxL, maxL);
      } else {
        newZ = Math.round((drag.initialItemPos[2] + delta.z) / 0.1) * 0.1;
        newZ = THREE.MathUtils.clamp(newZ, -maxW, maxW);
      }

      const newY = getStackHeightAt(id, newX, newZ, pallets);
      updatePalletPosition(id, [newX, newY, newZ]);
    } else if (drag.axis === 'Y') {
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();

      const plane = new THREE.Plane(camDir, -camDir.dot(drag.initialPoint));
      const hitPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, hitPoint);

      const deltaY = hitPoint.y - drag.initialPoint.y;
      let newY = Math.round((drag.initialItemPos[1] + deltaY) / 0.1) * 0.1;
      const itemH = item.kind === 'pallet' ? Math.max(0.42, 0.144 + Math.ceil(item.boxes.length / 4) * 0.28) : orientedHeight(item);
      newY = THREE.MathUtils.clamp(newY, 0.04, vehicle.cargoHeight - itemH);

      updatePalletPosition(id, [position[0], newY, position[2]]);
    } else if (drag.axis === 'rotY') {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -drag.initialPoint.y);
      const hitPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, hitPoint);

      const center = new THREE.Vector3(position[0], 0, position[2]);
      const initDir = drag.initialPoint.clone().sub(center);
      initDir.y = 0;
      const initAngle = Math.atan2(initDir.z, initDir.x);

      const currentDir = hitPoint.clone().sub(center);
      currentDir.y = 0;
      const currentAngle = Math.atan2(currentDir.z, currentDir.x);

      const deltaAngle = currentAngle - initAngle;
      let newRotY = drag.initialItemRot[1] - deltaAngle;

      const step = Math.PI / 2;
      newRotY = Math.round(newRotY / step) * step;

      updatePalletRotation(id, [rotation[0], newRotY, rotation[2]]);
    }
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    enableControls();
    dragRef.current = null;
    landItem(id);
  };

  return (
    <group position={[0, height + 0.04, 0]}>

      <group rotation={[0, 0, -Math.PI / 2]}>
        <mesh
          position={[0.34, 0, 0]}
          onPointerDown={(e) => handlePointerDown('X', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerOver={(e) => { e.stopPropagation(); gl.domElement.style.cursor = 'ew-resize'; }}
          onPointerOut={(e) => { e.stopPropagation(); gl.domElement.style.cursor = 'auto'; }}
        >
          <cylinderGeometry args={[0.035, 0.035, 0.68, 12]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.85} />
        </mesh>
        <mesh
          position={[0.72, 0, 0]}
          onPointerDown={(e) => handlePointerDown('X', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <coneGeometry args={[0.09, 0.2, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      <group>
        <mesh
          position={[0, 0.34, 0]}
          onPointerDown={(e) => handlePointerDown('Y', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerOver={(e) => { e.stopPropagation(); gl.domElement.style.cursor = 'ns-resize'; }}
          onPointerOut={(e) => { e.stopPropagation(); gl.domElement.style.cursor = 'auto'; }}
        >
          <cylinderGeometry args={[0.035, 0.035, 0.68, 12]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.85} />
        </mesh>
        <mesh
          position={[0, 0.72, 0]}
          onPointerDown={(e) => handlePointerDown('Y', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <coneGeometry args={[0.09, 0.2, 16]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>

      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh
          position={[0, 0, 0.34]}
          onPointerDown={(e) => handlePointerDown('Z', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerOver={(e) => { e.stopPropagation(); gl.domElement.style.cursor = 'ns-resize'; }}
          onPointerOut={(e) => { e.stopPropagation(); gl.domElement.style.cursor = 'auto'; }}
        >
          <cylinderGeometry args={[0.035, 0.035, 0.68, 12]} />
          <meshBasicMaterial color="#2563eb" transparent opacity={0.85} />
        </mesh>
        <mesh
          position={[0, 0, 0.72]}
          rotation={[Math.PI / 2, 0, 0]}
          onPointerDown={(e) => handlePointerDown('Z', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <coneGeometry args={[0.09, 0.2, 16]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
      </group>

      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        onPointerDown={(e) => handlePointerDown('rotY', e)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => { e.stopPropagation(); gl.domElement.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); gl.domElement.style.cursor = 'auto'; }}
      >
        <torusGeometry args={[0.54, 0.024, 8, 48]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.9} />
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
