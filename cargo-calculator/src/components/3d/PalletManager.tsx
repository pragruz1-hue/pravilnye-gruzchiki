import { useMemo, useRef, useState } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { hasPalletCollision, isInsideCargoBay } from '../../hooks/usePalletCollision';
import { orientedFootprint, VEHICLES } from '../../utils/calculations';
import { Pallet } from './Pallet';

const GRID_SIZE = 0.1;

export function PalletManager() {
  const pallets = useCalculatorStore((state) => state.pallets);
  const vehicleType = useCalculatorStore((state) => state.vehicleType);
  const selectedPalletId = useCalculatorStore((state) => state.selectedPalletId);
  const updatePalletPosition = useCalculatorStore((state) => state.updatePalletPosition);
  const updatePalletRotation = useCalculatorStore((state) => state.updatePalletRotation);
  const selectPallet = useCalculatorStore((state) => state.selectPallet);
  const vehicle = VEHICLES[vehicleType];
  const { camera, raycaster, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.04));
  const dragOffset = useRef(new THREE.Vector3());
  const intersection = useRef(new THREE.Vector3());

  const collisionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    pallets.forEach((pallet) => map.set(pallet.id, hasPalletCollision(pallet, pallets) || !isInsideCargoBay(pallet, vehicleType)));
    return map;
  }, [pallets, vehicleType]);

  useFrame((state) => {
    if (!isDragging || !selectedPalletId) return;
    const item = pallets.find((entry) => entry.id === selectedPalletId);
    if (!item) return;
    raycaster.setFromCamera(state.pointer, camera);
    const hit = raycaster.ray.intersectPlane(dragPlaneRef.current, intersection.current);
    if (!hit) return;
    const fp = orientedFootprint(item);
    const snapped = snapToGrid(intersection.current.sub(dragOffset.current), GRID_SIZE);
    updatePalletPosition(selectedPalletId, [
      THREE.MathUtils.clamp(snapped.x, -vehicle.cargoLength / 2 + fp.length / 2, vehicle.cargoLength / 2 - fp.length / 2),
      Math.max(0.04, item.position[1]),
      THREE.MathUtils.clamp(snapped.z, -vehicle.cargoWidth / 2 + fp.width / 2, vehicle.cargoWidth / 2 - fp.width / 2)
    ]);
  });

  function handlePalletPointerDown(id: string, event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    const item = pallets.find((entry) => entry.id === id);
    if (!item) return;
    selectPallet(id);
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    dragPlaneRef.current.constant = -Math.max(0.04, item.position[1]);
    dragOffset.current.set(event.point.x - item.position[0], 0, event.point.z - item.position[2]);
  }

  function stopDragging() {
    setIsDragging(false);
    gl.domElement.style.cursor = 'grab';
  }

  return (
    <group onPointerMissed={() => selectPallet(null)}>
      {pallets.map((pallet) => (
        <Pallet key={pallet.id} {...pallet} isSelected={pallet.id === selectedPalletId} hasCollision={collisionMap.get(pallet.id) ?? false} onPointerDown={handlePalletPointerDown} onPointerUp={stopDragging} onSelect={selectPallet} onRotateCommit={updatePalletRotation} />
      ))}
      <mesh position={[0, 0.071, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false} onPointerUp={stopDragging}>
        <planeGeometry args={[vehicle.cargoLength, vehicle.cargoWidth]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function snapToGrid(position: THREE.Vector3, gridSize: number): THREE.Vector3 {
  return new THREE.Vector3(Math.round(position.x / gridSize) * gridSize, position.y, Math.round(position.z / gridSize) * gridSize);
}
