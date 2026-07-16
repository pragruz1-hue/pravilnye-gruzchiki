import { useMemo, useRef, useState } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { hasPalletCollision, isInsideCargoBay } from '../../hooks/usePalletCollision';
import { Pallet } from './Pallet';

const CARGO_LENGTH = 6;
const CARGO_WIDTH = 2.4;
const GRID_SIZE = 0.1;

export function PalletManager() {
  const pallets = useCalculatorStore((state) => state.pallets);
  const selectedPalletId = useCalculatorStore((state) => state.selectedPalletId);
  const updatePalletPosition = useCalculatorStore((state) => state.updatePalletPosition);
  const updatePalletRotation = useCalculatorStore((state) => state.updatePalletRotation);
  const selectPallet = useCalculatorStore((state) => state.selectPallet);
  const { camera, raycaster, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.072));
  const dragOffset = useRef(new THREE.Vector3());
  const intersection = useRef(new THREE.Vector3());

  const collisionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    pallets.forEach((pallet) => {
      map.set(pallet.id, hasPalletCollision(pallet, pallets) || !isInsideCargoBay(pallet, CARGO_LENGTH, CARGO_WIDTH));
    });
    return map;
  }, [pallets]);

  useFrame((state) => {
    if (!isDragging || !selectedPalletId) return;
    raycaster.setFromCamera(state.pointer, camera);
    const hit = raycaster.ray.intersectPlane(dragPlaneRef.current, intersection.current);
    if (!hit) return;
    const snapped = snapToGrid(intersection.current.sub(dragOffset.current), GRID_SIZE);
    const clamped: [number, number, number] = [
      THREE.MathUtils.clamp(snapped.x, -CARGO_LENGTH / 2 + 0.38, CARGO_LENGTH / 2 - 0.38),
      0.072,
      THREE.MathUtils.clamp(snapped.z, -CARGO_WIDTH / 2 + 0.28, CARGO_WIDTH / 2 - 0.28)
    ];
    updatePalletPosition(selectedPalletId, clamped);
  });

  function handlePalletPointerDown(id: string, event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    const pallet = pallets.find((item) => item.id === id);
    if (!pallet) return;
    selectPallet(id);
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    dragOffset.current.set(event.point.x - pallet.position[0], 0, event.point.z - pallet.position[2]);
  }

  function stopDragging() {
    setIsDragging(false);
    gl.domElement.style.cursor = 'grab';
  }

  return (
    <group onPointerMissed={() => selectPallet(null)}>
      {pallets.map((pallet) => (
        <Pallet
          key={pallet.id}
          {...pallet}
          isSelected={pallet.id === selectedPalletId}
          hasCollision={collisionMap.get(pallet.id) ?? false}
          onPointerDown={handlePalletPointerDown}
          onPointerUp={stopDragging}
          onSelect={selectPallet}
          onRotateCommit={updatePalletRotation}
        />
      ))}
      <mesh position={[0, 0.071, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false} onPointerUp={stopDragging}>
        <planeGeometry args={[CARGO_LENGTH, CARGO_WIDTH]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function snapToGrid(position: THREE.Vector3, gridSize: number): THREE.Vector3 {
  return new THREE.Vector3(
    Math.round(position.x / gridSize) * gridSize,
    position.y,
    Math.round(position.z / gridSize) * gridSize
  );
}
