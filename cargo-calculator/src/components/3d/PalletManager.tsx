import { useMemo, useRef, useState } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { hasPalletCollision, isInsideCargoBay } from '../../hooks/usePalletCollision';
import { orientedFootprint, VEHICLES, getStackHeightAt } from '../../utils/calculations';
import { Pallet } from './Pallet';
import { InstancedCargoBoxes } from './InstancedCargoBoxes';

const GRID_SIZE = 0.1;
const DETAILED_BOX_LIMIT = 48;

export function PalletManager() {
  const pallets = useCalculatorStore((state) => state.pallets);
  const vehicleType = useCalculatorStore((state) => state.vehicleType);
  const selectedPalletId = useCalculatorStore((state) => state.selectedPalletId);
  const updatePalletPosition = useCalculatorStore((state) => state.updatePalletPosition);
  const updatePalletRotation = useCalculatorStore((state) => state.updatePalletRotation);
  const selectPallet = useCalculatorStore((state) => state.selectPallet);
  const landItem = useCalculatorStore((state) => state.landItem);
  const vehicle = vehicleType ? VEHICLES[vehicleType] : null;
  const { camera, raycaster, gl } = useThree();
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;
  const [isDragging, setIsDragging] = useState(false);
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.04));
  const dragOffset = useRef(new THREE.Vector3());
  const intersection = useRef(new THREE.Vector3());

  const collisionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    pallets.forEach((pallet) => map.set(pallet.id, hasPalletCollision(pallet, pallets) || !isInsideCargoBay(pallet, vehicleType)));
    return map;
  }, [pallets, vehicleType]);

  if (!vehicle) return <group />;

  // Keep furniture and the selected box fully interactive. Excess auto-filled
  // boxes stay in the calculation, but are rendered with InstancedMesh.
  const { detailedItems, instancedBoxes } = useMemo(() => {
    const boxes = pallets.filter((item) => item.kind === 'box');
    const detailedBoxIds = new Set(boxes.slice(0, DETAILED_BOX_LIMIT).map((item) => item.id));
    if (selectedPalletId && boxes.some((item) => item.id === selectedPalletId)) detailedBoxIds.add(selectedPalletId);
    return {
      detailedItems: pallets.filter((item) => item.kind !== 'box' || detailedBoxIds.has(item.id)),
      instancedBoxes: boxes.filter((item) => !detailedBoxIds.has(item.id))
    };
  }, [pallets, selectedPalletId]);

  useFrame((state) => {
    if (!isDragging || !selectedPalletId) return;
    const item = pallets.find((entry) => entry.id === selectedPalletId);
    if (!item) return;
    raycaster.setFromCamera(state.pointer, camera);
    const hit = raycaster.ray.intersectPlane(dragPlaneRef.current, intersection.current);
    if (!hit) return;
    const fp = orientedFootprint(item);
    const snapped = snapToGrid(intersection.current.sub(dragOffset.current), GRID_SIZE);

    const targetX = THREE.MathUtils.clamp(snapped.x, -vehicle.cargoLength / 2 + fp.length / 2, vehicle.cargoLength / 2 - fp.length / 2);
    const targetZ = THREE.MathUtils.clamp(snapped.z, -vehicle.cargoWidth / 2 + fp.width / 2, vehicle.cargoWidth / 2 - fp.width / 2);
    const targetY = getStackHeightAt(selectedPalletId, targetX, targetZ, pallets);

    updatePalletPosition(selectedPalletId, [targetX, targetY, targetZ]);
  });

  function disableControls() {
    if (controls) controls.enabled = false;
  }
  function enableControls() {
    if (controls) controls.enabled = true;
  }

  function handlePalletPointerDown(id: string, event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    if ((event as any).nativeEvent) {
      (event as any).nativeEvent.preventDefault?.();
    }
    const item = pallets.find((entry) => entry.id === id);
    if (!item) return;
    selectPallet(id);
    setIsDragging(true);
    disableControls();
    gl.domElement.style.cursor = 'grabbing';
    try {
      (event.target as HTMLElement).setPointerCapture((event as any).pointerId);
    } catch {}
    dragPlaneRef.current.constant = -Math.max(0.04, item.position[1]);
    dragOffset.current.set(event.point.x - item.position[0], 0, event.point.z - item.position[2]);
  }

  function stopDragging(event?: any) {
    setIsDragging(false);
    enableControls();
    gl.domElement.style.cursor = 'grab';
    if (event) {
      try {
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      } catch {}
    }
    const draggedId = selectedPalletId || useCalculatorStore.getState().selectedPalletId;
    if (draggedId) {
      landItem(draggedId);
    }
  }

  return (
    <group onPointerMissed={() => selectPallet(null)}>
      {detailedItems.map((pallet) => (
        <Pallet key={pallet.id} {...pallet} isSelected={pallet.id === selectedPalletId} hasCollision={collisionMap.get(pallet.id) ?? false} onPointerDown={handlePalletPointerDown} onPointerUp={stopDragging} onSelect={selectPallet} onRotateCommit={updatePalletRotation} />
      ))}
      {instancedBoxes.length > 0 && <InstancedCargoBoxes items={instancedBoxes} onSelect={selectPallet} />}
      <mesh position={[0, 0.071, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false} onPointerUp={stopDragging} onClick={(e) => { e.stopPropagation(); selectPallet(null); }}>
        <planeGeometry args={[vehicle.cargoLength, vehicle.cargoWidth]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function snapToGrid(position: THREE.Vector3, gridSize: number): THREE.Vector3 {
  return new THREE.Vector3(Math.round(position.x / gridSize) * gridSize, position.y, Math.round(position.z / gridSize) * gridSize);
}
