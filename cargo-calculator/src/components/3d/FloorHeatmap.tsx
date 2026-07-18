import { useMemo } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES, computeFloorHeatmap } from '../../utils/calculations';
import * as THREE from 'three';

export function FloorHeatmap() {
  const pallets = useCalculatorStore((s) => s.pallets);
  const vehicleType = useCalculatorStore((s) => s.vehicleType);
  const showMinimap = useCalculatorStore((s) => s.showMinimap);
  const vehicle = VEHICLES[vehicleType];

  const heatmap = useMemo(() => computeFloorHeatmap(pallets, vehicleType, 12), [pallets, vehicleType]);

  if (pallets.length === 0) return null;

  const maxWeight = Math.max(...heatmap.flat(), 1);
  const grid = heatmap.length;
  const cellL = vehicle.cargoLength / grid;
  const cellW = vehicle.cargoWidth / grid;

  return (
    <group position={[0, 0.095, 0]}>
      {heatmap.map((row, ix) =>
        row.map((w, iz) => {
          if (w <= 0.1) return null;
          const intensity = Math.min(1, w / maxWeight);
          const color = new THREE.Color().setHSL(0.15 - intensity * 0.15, 0.85, 0.55 - intensity * 0.2);
          if (intensity < 0.05) return null;
          const x = -vehicle.cargoLength / 2 + ix * cellL + cellL / 2;
          const z = -vehicle.cargoWidth / 2 + iz * cellW + cellW / 2;
          return (
            <mesh key={`heat-${ix}-${iz}`} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[cellL * 0.92, cellW * 0.92]} />
              <meshBasicMaterial color={color} transparent opacity={0.18 + intensity * 0.35} />
            </mesh>
          );
        })
      )}
    </group>
  );
}
