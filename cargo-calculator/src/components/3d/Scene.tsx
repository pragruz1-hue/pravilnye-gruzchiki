import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { Truck } from './Truck';
import { PalletManager } from './PalletManager';
import { Lighting } from './Lighting';
import { EngineeringOverlay } from './EngineeringOverlay';
import { FirstPersonController } from './FirstPersonController';
import { SoundManager } from './SoundManager';
import { FloorHeatmap } from './FloorHeatmap';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES } from '../../utils/calculations';

function CameraController() {
  const cameraMode = useCalculatorStore((s) => s.cameraMode);
  const isFirstPerson = useCalculatorStore((s) => s.isFirstPerson);
  const vehicleType = useCalculatorStore((s) => s.vehicleType);
  const { camera, controls } = useThree() as any;
  const vehicle = VEHICLES[vehicleType];
  const L = vehicle.cargoLength;
  const W = vehicle.cargoWidth;
  const H = vehicle.cargoHeight;
  const getDesired = () => {
    if (isFirstPerson) return null;
    switch (cameraMode) {
      case 'inside': return { pos: new THREE.Vector3(-L / 2 + 0.6, H * 0.55 + 0.3, 0.15), target: new THREE.Vector3(L / 2 - 0.4, H * 0.35, 0), fov: 68 };
      case 'cabin': return { pos: new THREE.Vector3(-L / 2 - 0.9, 1.45, 0.4), target: new THREE.Vector3(L / 2 * 0.2, 0.8, 0), fov: 62 };
      case 'top': return { pos: new THREE.Vector3(0, Math.max(6, H + 5.5), 0.3), target: new THREE.Vector3(0, 0.5, 0), fov: 52 };
      case 'side': return { pos: new THREE.Vector3(0.6, H * 0.75 + 0.8, W + 3.8), target: new THREE.Vector3(0, H * 0.5, 0), fov: 48 };
      default: return { pos: new THREE.Vector3(L * 0.85 + 2.5, H + 2.8, W + 2.8), target: new THREE.Vector3(0, H * 0.45, 0), fov: 48 };
    }
  };
  useFrame(() => {
    if (isFirstPerson) return;
    const desired = getDesired();
    if (!desired) return;
    const { pos, target, fov } = desired;
    camera.position.lerp(pos, 0.08);
    if (controls) { (controls as OrbitControlsImpl).target.lerp(target, 0.08); (controls as OrbitControlsImpl).update(); }
    if ((camera as THREE.PerspectiveCamera).fov !== undefined) { const cam = camera as THREE.PerspectiveCamera; cam.fov = THREE.MathUtils.lerp(cam.fov, fov, 0.08); cam.updateProjectionMatrix(); }
  });
  return null;
}

function ControlsWrapper() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const cameraMode = useCalculatorStore((s) => s.cameraMode);
  const isFirstPerson = useCalculatorStore((s) => s.isFirstPerson);
  const isInside = cameraMode === 'inside' || cameraMode === 'cabin' || isFirstPerson;
  return (
    <OrbitControls ref={controlsRef} enabled={!isFirstPerson} enablePan={!isInside} enableZoom={!isFirstPerson} enableRotate={!isFirstPerson} minDistance={isInside ? 0.3 : 1.2} maxDistance={isInside ? 6 : 20} maxPolarAngle={isInside ? Math.PI / 1.6 : Math.PI / 2.02} minPolarAngle={isInside ? 0.1 : 0.1} target={[0, 1.0, 0]} makeDefault enableDamping dampingFactor={0.12} />
  );
}

export function Scene() {
  const cameraMode = useCalculatorStore((s) => s.cameraMode);
  const isFirstPerson = useCalculatorStore((s) => s.isFirstPerson);
  const isPerformanceMode = useCalculatorStore((s) => s.isPerformanceMode);
  const isHeatmapEnabled = useCalculatorStore((s) => s.isHeatmapEnabled);
  const isInside = cameraMode === 'inside' || cameraMode === 'cabin' || isFirstPerson;
  return (
    <Canvas shadows={!isPerformanceMode} dpr={isPerformanceMode ? [1, 1] : [1, 1.8]} gl={{ antialias: !isPerformanceMode, alpha: true, preserveDrawingBuffer: false }} className="h-full w-full touch-none">
      <PerspectiveCamera makeDefault position={[6.8, 4.3, 6.2]} fov={48} />
      <Suspense fallback={null}>
        <Lighting />
        {!isPerformanceMode && <Environment preset={isInside ? 'apartment' : 'warehouse'} />}
        <Truck position={[0, 0, 0]} />
        {isHeatmapEnabled && <FloorHeatmap />}
        <PalletManager />
        <EngineeringOverlay />
        {!isPerformanceMode && <ContactShadows position={[0, -0.02, 0]} opacity={isInside ? 0.22 : 0.42} scale={12} blur={2.5} far={5} />}
        <CameraController />
        <FirstPersonController />
        <SoundManager />
      </Suspense>
      <ControlsWrapper />
    </Canvas>
  );
}
