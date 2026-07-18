import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  useEffect(() => {
    if (isFirstPerson) {
      cancelCameraTransition();
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

function AdaptiveQuality({ onSlowFrames }: { onSlowFrames: () => void }) {
  const slowSince = useRef<number | null>(null);
  const reported = useRef(false);
  useFrame((state, delta) => {
    if (reported.current) return;
    if (delta > 1 / 30) {
      slowSince.current ??= state.clock.elapsedTime;
      if (state.clock.elapsedTime - slowSince.current > 2) {
        reported.current = true;
        onSlowFrames();
      }
    } else {
      slowSince.current = null;
    }
  });
  return null;
}

/**
 * HDR-окружение (Environment preset) грузится с внешнего CDN. Если CDN
 * недоступен или файл завис/упал, сцена всё равно рендерится — просто без
 * environment-map (отражений). Свой Suspense нужен, чтобы остальное
 * содержимое сцены не ждало загрузку HDR.
 */
class EnvGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function SafeEnvironment({ preset }: { preset: 'apartment' | 'warehouse' }) {
  return (
    <Suspense fallback={null}>
      <EnvGuard>
        <Environment preset={preset} />
      </EnvGuard>
    </Suspense>
  );
}

function SceneFallback({ reason }: { reason: string }) {
  const pallets = useCalculatorStore((s) => s.pallets);
  const vehicleType = useCalculatorStore((s) => s.vehicleType);
  const vehicle = VEHICLES[vehicleType];
  const visible = pallets.slice(0, 80);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-950 p-5 text-white">
      <div className="max-w-md text-center">
        <div className="text-3xl">📦</div>
        <h2 className="mt-2 text-lg font-black">Включён безопасный 2D-план кузова</h2>
        <p className="mt-1 text-xs leading-5 text-slate-300">{reason} Расчёт, список вещей и отправка заявки продолжают работать. Обновите страницу, чтобы попробовать вернуть 3D.</p>
      </div>
      <div className="relative max-h-[60%] w-full max-w-xl overflow-hidden rounded-xl border-4 border-orange-400 bg-slate-100" style={{ aspectRatio: `${vehicle.cargoLength}/${vehicle.cargoWidth}` }}>
        {visible.map((item) => {
          const left = ((item.position[0] + vehicle.cargoLength / 2) / vehicle.cargoLength) * 100;
          const top = ((item.position[2] + vehicle.cargoWidth / 2) / vehicle.cargoWidth) * 100;
          return <span key={item.id} title={`${item.name}, ${item.weight} кг`} className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-blue-600 ring-1 ring-white" style={{ left: `${left}%`, top: `${top}%` }} />;
        })}
      </div>
      <div className="text-xs font-bold text-orange-200">{vehicle.label} · {pallets.length} позиций{pallets.length > visible.length ? ` · на плане первые ${visible.length}` : ''}</div>
      <button onClick={() => window.location.reload()} className="rounded-full bg-[#ff6b00] px-4 py-2 text-xs font-black text-white">Обновить 3D</button>
    </div>
  );
}

export function Scene() {
  const cameraMode = useCalculatorStore((s) => s.cameraMode);
  const isFirstPerson = useCalculatorStore((s) => s.isFirstPerson);
  const isPerformanceMode = useCalculatorStore((s) => s.isPerformanceMode);
  const renderQuality = useCalculatorStore((s) => s.renderQuality);
  const isHeatmapEnabled = useCalculatorStore((s) => s.isHeatmapEnabled);
  const [webglLost, setWebglLost] = useState(false);
  const [autoDegraded, setAutoDegraded] = useState(false);
  const isInside = cameraMode === 'inside' || cameraMode === 'cabin' || isFirstPerson;
  const isLowPowerDevice = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return window.matchMedia('(pointer: coarse)').matches || (memory !== undefined && memory <= 4) || navigator.hardwareConcurrency <= 4;
  }, []);
  const renderLite = isPerformanceMode || renderQuality === 'lite' || (renderQuality === 'auto' && (isLowPowerDevice || autoDegraded));

  if (webglLost) return <SceneFallback reason="Браузер освободил WebGL-память для стабильной работы." />;

  return (
    <Canvas
      shadows={!renderLite}
      dpr={renderLite ? [1, 1] : [1, 1.8]}
      gl={{ antialias: !renderLite, alpha: true, preserveDrawingBuffer: false }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          setWebglLost(true);
        }, { once: true });
      }}
      fallback={<SceneFallback reason="WebGL не поддерживается этим браузером." />}
      className="h-full w-full touch-none"
    >
      <PerspectiveCamera makeDefault position={[6.8, 4.3, 6.2]} fov={48} />
      <Suspense fallback={null}>
        <Lighting />
        {!renderLite && <SafeEnvironment preset={isInside ? 'apartment' : 'warehouse'} />}
        <Truck position={[0, 0, 0]} />
        {isHeatmapEnabled && !renderLite && <FloorHeatmap />}
        <PalletManager />
        <EngineeringOverlay />
        {!renderLite && <ContactShadows position={[0, -0.02, 0]} opacity={isInside ? 0.22 : 0.42} scale={12} blur={2.5} far={5} />}
        <CameraController />
        <FirstPersonController />
        <SoundManager />
        {renderQuality === 'auto' && !renderLite && <AdaptiveQuality onSlowFrames={() => setAutoDegraded(true)} />}
      </Suspense>
      <ControlsWrapper />
    </Canvas>
  );
}
