import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Truck } from './Truck';
import { PalletManager } from './PalletManager';
import { Lighting } from './Lighting';

export function Scene() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} className="h-full w-full touch-none">
      <PerspectiveCamera makeDefault position={[6.8, 4.3, 6.2]} fov={48} />
      <Suspense fallback={null}>
        <Lighting />
        <Environment preset="warehouse" />
        <Truck position={[0, 0, 0]} />
        <PalletManager />
        <ContactShadows position={[0, -0.02, 0]} opacity={0.42} scale={12} blur={2.5} far={5} />
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={2.4}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.02}
        target={[0, 1.0, 0]}
        makeDefault
      />
    </Canvas>
  );
}
