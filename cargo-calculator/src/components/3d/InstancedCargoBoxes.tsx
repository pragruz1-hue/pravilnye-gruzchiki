import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { LoadItem } from '../../types';

interface InstancedCargoBoxesProps {
  items: LoadItem[];
  onSelect: (id: string) => void;
}

/**
 * The calculation retains every box, but distant/autofilled boxes are drawn in
 * batches. One InstancedMesh is one draw call instead of one React tree and
 * several materials for every box.
 */
export function InstancedCargoBoxes({ items, onSelect }: InstancedCargoBoxesProps) {
  const batches = useMemo(() => {
    const grouped = new Map<string, LoadItem[]>();
    items.forEach((item) => {
      const d = item.dimensions;
      const key = `${d.length}|${d.width}|${d.height}|${item.material}`;
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    });
    return [...grouped.values()];
  }, [items]);

  return <>{batches.map((batch) => <BoxBatch key={batch.map((i) => i.id).join('-')} items={batch} onSelect={onSelect} />)}</>;
}

function BoxBatch({ items, onSelect }: { items: LoadItem[]; onSelect: (id: string) => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { length, width, height } = items[0].dimensions;
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b8956b', roughness: 0.86 }), []);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);
  const scale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    items.forEach((item, index) => {
      position.set(item.position[0], item.position[1] + height / 2, item.position[2]);
      quaternion.setFromEuler(new THREE.Euler(item.rotation[0], item.rotation[1], item.rotation[2]));
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(index, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    return () => material.dispose();
  }, [height, items, material, matrix, position, quaternion, scale]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.instanceId !== undefined) onSelect(items[event.instanceId].id);
  };

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, items.length]} onClick={handleClick} frustumCulled>
      <boxGeometry args={[length, height, width]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
}
