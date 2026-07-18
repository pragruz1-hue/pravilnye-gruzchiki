import { Suspense, useEffect } from 'react';
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
import { cameraTransition, cancelCameraTransition, startCameraTransition } from './cameraTransition';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES } from '../../utils/calculations';

// Максимальная длительность анимации перехода между режимами (страховка,
// чтобы контроллер не держал камеру вечно и не блокировал свободный осмотр).
const TRANSITION_TIMEOUT_MS = 2500;
const SETTLE_EPSILON = 0.03;

function CameraController() {
  const cameraMode = useCalculatorStore((s) => s.cameraMode);
  const isFirstPerson = useCalculatorStore((s) => s.isFirstPerson);
  const vehicleType = useCalculatorStore((s) => s.vehicleType);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const vehicle = VEHICLES[vehicleType];
  const L = vehicle.cargoLength;
  const W = vehicle.cargoWidth;
  const H = vehicle.cargoHeight;
  const getDesired = () => {
    if (isFirstPerson) return null;
    switch (cameraMode) {
      case 'inside': return { pos: new THREE.Vector3(-L / 2 + 0.6, H * 0.55 + 0.3, 0.15), target: new THREE.Vector3(L / 2 - 0.4, H * 0.35, 0), fov: 68 };
      case 'cabin': return { pos: new THREE.Vector3(L / 2 + 0.8, 1.15, 0), target: new THREE.Vector3(-L * 0.15, 0.6, 0), fov: 62 };
      case 'top': return { pos: new THREE.Vector3(0, Math.max(6, H + 5.5), 0.3), target: new THREE.Vector3(0, 0.5, 0), fov: 52 };
      case 'side': return { pos: new THREE.Vector3(0.6, H * 0.75 + 0.8, W + 3.8), target: new THREE.Vector3(0, H * 0.5, 0), fov: 48 };
      default: return { pos: new THREE.Vector3(L * 0.85 + 2.5, H + 2.8, W + 2.8), target: new THREE.Vector3(0, H * 0.45, 0), fov: 48 };
    }
  };
  // Переход к пресету режима запускается ТОЛЬКО при смене режима/машины.
  // После завершения перехода камера полностью свободна: ей управляют
  // OrbitControls (drag/колесо) и FirstPersonController (WASD/джойстик).
  useEffect(() => {
    if (isFirstPerson) {
      cancelCameraTransition();
      // Цель орбиты кладём прямо перед камерой, чтобы вращение мышью
      // работало как осмотр с места в режиме первого лица.
      if (controls) {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        controls.target.copy(camera.position).addScaledVector(dir, 1.2);
        controls.update();
      }
      return;
    }
    startCameraTransition();
  }, [cameraMode, vehicleType, isFirstPerson, controls, camera]);
  useFrame(() => {
    if (isFirstPerson || !cameraTransition.active || !controls) return;
    const desired = getDesired();
    if (!desired) return;
    const { pos, target, fov } = desired;

    camera.position.lerp(pos, 0.12);
    let settled = camera.position.distanceTo(pos) < SETTLE_EPSILON;

    controls.target.lerp(target, 0.12);
    controls.update();
    if (controls.target.distanceTo(target) >= SETTLE_EPSILON) settled = false;

    const cam = camera as THREE.PerspectiveCamera;
    if (cam.isPerspectiveCamera) {
      cam.fov = THREE.MathUtils.lerp(cam.fov, fov, 0.12);
      cam.updateProjectionMatrix();
      if (Math.abs(cam.fov - fov) >= 0.1) settled = false;
    }

    // Переход закончился — отдаём управление пользователю
    if (settled || performance.now() - cameraTransition.startedAt > TRANSITION_TIMEOUT_MS) {
      cameraTransition.active = false;
    }
  });
  return null;
}

function ControlsWrapper() {
  const cameraMode = useCalculatorStore((s) => s.cameraMode);
  const isFirstPerson = useCalculatorStore((s) => s.isFirstPerson);
  const isRestricted = cameraMode === 'inside' || isFirstPerson;
  const isCabin = cameraMode === 'cabin';
  return (
    <OrbitControls
      makeDefault
      enablePan={!isRestricted}
      enableZoom
      enableRotate
      onStart={cancelCameraTransition}
      minDistance={isRestricted ? 0.3 : isCabin ? 0.5 : 1.2}
      maxDistance={isRestricted ? 6 : isCabin ? 12 : 20}
      maxPolarAngle={isRestricted ? Math.PI / 1.6 : isCabin ? Math.PI / 1.8 : Math.PI / 2.02}
      minPolarAngle={isRestricted ? 0.1 : 0.05}
      target={[0, 1.0, 0]}
      enableDamping
      dampingFactor={0.12}
    />
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
