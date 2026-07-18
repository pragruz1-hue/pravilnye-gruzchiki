import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { VEHICLES } from '../../utils/calculations';
import { cancelCameraTransition } from './cameraTransition';

export function FirstPersonController() {
  const isFirstPerson = useCalculatorStore((s) => s.isFirstPerson);
  const cameraMode = useCalculatorStore((s) => s.cameraMode);
  const vehicleType = useCalculatorStore((s) => s.vehicleType);
  const setCameraMode = useCalculatorStore((s) => s.setCameraMode);
  const { camera, controls } = useThree() as any;

  const keys = useRef({ w: false, a: false, s: false, d: false, q: false, e: false, shift: false });
  const velocity = useRef(new THREE.Vector3());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w') keys.current.w = true;
      if (k === 'a') keys.current.a = true;
      if (k === 's') keys.current.s = true;
      if (k === 'd') keys.current.d = true;
      if (k === 'q') keys.current.q = true;
      if (k === 'e') keys.current.e = true;
      if (e.shiftKey) keys.current.shift = true;
      if (k === '1') setCameraMode('overview');
      if (k === '2') setCameraMode('inside');
      if (k === '3') setCameraMode('cabin');
      if (k === '4') setCameraMode('side');
      if (k === '5') setCameraMode('top');
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w') keys.current.w = false;
      if (k === 'a') keys.current.a = false;
      if (k === 's') keys.current.s = false;
      if (k === 'd') keys.current.d = false;
      if (k === 'q') keys.current.q = false;
      if (k === 'e') keys.current.e = false;
      keys.current.shift = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [setCameraMode]);

  useFrame((_, delta) => {
    const joystick = window.__joystick as { x: number; y: number } | undefined;
    const hasJoystick = joystick && (Math.abs(joystick.x) > 0.01 || Math.abs(joystick.y) > 0.01);
    if (!isFirstPerson && cameraMode !== 'inside' && cameraMode !== 'cabin' && !hasJoystick) return;
    if (!controls) return;

    const vehicle = VEHICLES[vehicleType];
    const L = vehicle.cargoLength;
    const W = vehicle.cargoWidth;
    const H = vehicle.cargoHeight;

    const speed = keys.current.shift ? 3.5 : 1.6;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).negate();

    velocity.current.set(0, 0, 0);
    if (keys.current.w) velocity.current.add(forward.clone().multiplyScalar(speed * delta));
    if (keys.current.s) velocity.current.add(forward.clone().multiplyScalar(-speed * delta));
    if (keys.current.a) velocity.current.add(right.clone().multiplyScalar(-speed * delta));
    if (keys.current.d) velocity.current.add(right.clone().multiplyScalar(speed * delta));
    if (keys.current.q) velocity.current.y -= speed * delta;
    if (keys.current.e) velocity.current.y += speed * delta;

    if (joystick) {
      velocity.current.add(forward.clone().multiplyScalar(-joystick.y * speed * delta * 1.2));
      velocity.current.add(right.clone().multiplyScalar(joystick.x * speed * delta * 1.2));
    }

    if (velocity.current.length() > 0) {
      cancelCameraTransition();
      const newPos = camera.position.clone().add(velocity.current);
      const minX = -L / 2 + 0.25;
      const maxX = L / 2 - 0.25;
      const minZ = -W / 2 + 0.25;
      const maxZ = W / 2 - 0.25;
      const minY = 0.35;
      const maxY = H - 0.25;

      newPos.x = THREE.MathUtils.clamp(newPos.x, minX, maxX);
      newPos.z = THREE.MathUtils.clamp(newPos.z, minZ, maxZ);
      newPos.y = THREE.MathUtils.clamp(newPos.y, minY, maxY);

      camera.position.copy(newPos);
      if (controls.target) {
        controls.target.add(velocity.current);
        controls.target.x = THREE.MathUtils.clamp(controls.target.x, minX, maxX);
        controls.target.z = THREE.MathUtils.clamp(controls.target.z, minZ, maxZ);
        controls.target.y = THREE.MathUtils.clamp(controls.target.y, 0.2, H - 0.2);
      }
    }
  });

  return null;
}
