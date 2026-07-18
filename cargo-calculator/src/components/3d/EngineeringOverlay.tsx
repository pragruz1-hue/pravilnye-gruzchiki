import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES, computeCenterOfGravity, computeAxleLoads, getDistanceToWalls, canFitThroughDoor } from '../../utils/calculations';
import { useFrame } from '@react-three/fiber';

export function EngineeringOverlay() {
  const pallets = useCalculatorStore((s) => s.pallets);
  const selectedId = useCalculatorStore((s) => s.selectedPalletId);
  const vehicleType = useCalculatorStore((s) => s.vehicleType);
  const showMeasurements = useCalculatorStore((s) => s.showMeasurements);
  const vehicle = VEHICLES[vehicleType];

  const cog = useMemo(() => computeCenterOfGravity(pallets), [pallets]);
  const axle = useMemo(() => computeAxleLoads(pallets, vehicleType), [pallets, vehicleType]);
  const selected = pallets.find((p) => p.id === selectedId);

  if (pallets.length === 0) return null;

  return (
    <group>
      {/* Центр тяжести */}
      <group position={[cog.x, cog.y, cog.z]}>
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#ff0033" emissive="#ff0033" emissiveIntensity={1.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.14, 24]} />
          <meshBasicMaterial color="#ff0033" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        <Html center distanceFactor={6} className="pointer-events-none">
          <div className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white shadow">COG {cog.weight.toFixed(0)}кг</div>
        </Html>
        {/* Линия от COG до пола */}
        <Line points={[[0, 0, 0], [0, -cog.y + 0.08, 0]]} color="#ff0033" lineWidth={1} transparent opacity={0.5} dashed dashScale={4} />
      </group>

      {/* Нагрузка на оси */}
      <group position={[0, 0.05, 0]}>
        {/* Передняя ось */}
        <Html position={[-vehicle.cargoLength / 2 - 0.9, 0.5, 0]} center distanceFactor={7}>
          <div className={`rounded-full px-2 py-1 text-[10px] font-black shadow ${axle.isOverloadedFront ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-white'}`}>Перед {axle.frontKg}кг</div>
        </Html>
        <Html position={[-vehicle.cargoLength / 2 + vehicle.cargoLength * 0.32, 0.5, 0]} center distanceFactor={7}>
          <div className={`rounded-full px-2 py-1 text-[10px] font-black shadow ${axle.isOverloadedRear ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-700 text-white/80'}`}>Зад {axle.rearKg}кг {axle.imbalancePercent > 30 ? `⚠️ ${axle.imbalancePercent}%` : ''}</div>
        </Html>
      </group>

      {/* Рулетка для выбранного предмета */}
      {selected && showMeasurements && (
        <MeasurementForItem item={selected as any} vehicleType={vehicleType} />
      )}

      {/* Проверка двери для каждого предмета */}
      {pallets.map((item) => {
        const check = canFitThroughDoor(item as any, vehicleType);
        if (check.fits) return null;
        return (
          <Html key={`door-${item.id}`} position={[item.position[0], item.position[1] + 0.8, item.position[2]]} center distanceFactor={7}>
            <div className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black text-black">🚪 {check.reason}</div>
          </Html>
        );
      })}
    </group>
  );
}

function MeasurementForItem({ item, vehicleType }: { item: any; vehicleType: any }) {
  const dist = getDistanceToWalls(item, vehicleType);

  return (
    <group>
      {/* Линии до стен */}
      <Line points={[[item.position[0], item.position[1] + 0.02, item.position[2]], [item.position[0], item.position[1] + 0.02, -vehicleType.cargoWidth / 2]]} color="#10b981" lineWidth={1} />
      <Line points={[[item.position[0], item.position[1] + 0.02, item.position[2]], [item.position[0], item.position[1] + 0.02, vehicleType.cargoWidth / 2]]} color="#10b981" lineWidth={1} />
      <Html position={[item.position[0], 0.15, item.position[2] - 0.4]} center distanceFactor={8}>
        <div className="flex gap-1">
          <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white">L {dist.left.toFixed(2)}м</span>
          <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white">R {dist.right.toFixed(2)}м</span>
        </div>
      </Html>
      <Html position={[item.position[0], 0.15, item.position[2]]} center distanceFactor={8}>
        <div className="flex gap-1">
          <span className="rounded bg-blue-500 px-1.5 py-0.5 text-[9px] font-black text-white">F {dist.front.toFixed(2)}м</span>
          <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-black text-white">B {dist.back.toFixed(2)}м</span>
          <span className="rounded bg-purple-500 px-1.5 py-0.5 text-[9px] font-black text-white">↑ {dist.top.toFixed(2)}м</span>
        </div>
      </Html>
    </group>
  );
}
