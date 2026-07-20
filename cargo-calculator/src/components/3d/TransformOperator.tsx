import { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { orientedFootprint, orientedHeight, VEHICLES, getStackHeightAt } from '../../utils/calculations';
import { Html } from '@react-three/drei';

type TransformMode = 'idle' | 'translate' | 'rotate';
type Axis = 'X' | 'Y' | 'Z' | 'XYZ' | 'XY' | 'XZ' | 'YZ';

interface TransformState {
  mode: TransformMode;
  axis: Axis;
  itemId: string | null;
  initialPosition: [number, number, number] | null;
  initialRotation: [number, number, number] | null;
  initialMouse: THREE.Vector2 | null;
  initialWorldPoint: THREE.Vector3 | null;
  plane: THREE.Plane | null;
  snapStep: number;
  angleSnapStep: number;
}

/** Глобальный модальный оператор трансформации (Blender-style) */
export function TransformOperator() {
  const { camera, raycaster, gl, scene, pointer } = useThree();
  const controls = useThree((state) => state.controls) as OrbitControls | null;
  
  const pallets = useCalculatorStore((state) => state.pallets);
  const selectedPalletId = useCalculatorStore((state) => state.selectedPalletId);
  const vehicleType = useCalculatorStore((state) => state.vehicleType);
  const updatePalletPosition = useCalculatorStore((state) => state.updatePalletPosition);
  const updatePalletRotation = useCalculatorStore((state) => state.updatePalletRotation);
  const landItem = useCalculatorStore((state) => state.landItem);

  const [transformState, setTransformState] = useState<TransformState>({
    mode: 'idle',
    axis: 'XYZ',
    itemId: null,
    initialPosition: null,
    initialRotation: null,
    initialMouse: null,
    initialWorldPoint: null,
    plane: null,
    snapStep: 0.05,
    angleSnapStep: Math.PI / 2,
  });

  const stateRef = useRef(transformState);
  stateRef.current = transformState;

  const item = pallets.find(p => p.id === selectedPalletId);
  const vehicle = vehicleType ? VEHICLES[vehicleType] : null;

  // Отключение OrbitControls во время трансформации
  const disableControls = () => { if (controls) controls.enabled = false; };
  const enableControls = () => { if (controls) controls.enabled = true; };

  // Завершение трансформации
  const finishTransform = (cancelled = false) => {
    const state = stateRef.current;
    if (cancelled && state.itemId && state.initialPosition) {
      updatePalletPosition(state.itemId, state.initialPosition);
      if (state.initialRotation) {
        updatePalletRotation(state.itemId, state.initialRotation);
      }
    }
    if (!cancelled && state.itemId) {
      landItem(state.itemId);
    }
    enableControls();
    gl.domElement.style.cursor = 'auto';
    setTransformState({
      mode: 'idle',
      axis: 'XYZ',
      itemId: null,
      initialPosition: null,
      initialRotation: null,
      initialMouse: null,
      initialWorldPoint: null,
      plane: null,
      snapStep: 0.05,
      angleSnapStep: Math.PI / 2,
    });
  };

  // Начало перемещения (G)
  const startTranslate = (axis: Axis = 'XYZ') => {
    if (!item || !vehicle) return;
    disableControls();
    gl.domElement.style.cursor = 'move';

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -item.position[1]);
    const worldPoint = new THREE.Vector3();
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, worldPoint);

    setTransformState({
      mode: 'translate',
      axis,
      itemId: item.id,
      initialPosition: [...item.position],
      initialRotation: [...item.rotation],
      initialMouse: pointer.clone(),
      initialWorldPoint: worldPoint.clone(),
      plane,
      snapStep: 0.05,
      angleSnapStep: Math.PI / 2,
    });
  };

  // Начало вращения (R)
  const startRotate = (axis: Axis = 'Y') => {
    if (!item || !vehicle) return;
    disableControls();
    gl.domElement.style.cursor = 'crosshair';

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -item.position[1]);
    const worldPoint = new THREE.Vector3();
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, worldPoint);

    setTransformState({
      mode: 'rotate',
      axis,
      itemId: item.id,
      initialPosition: [...item.position],
      initialRotation: [...item.rotation],
      initialMouse: pointer.clone(),
      initialWorldPoint: worldPoint.clone(),
      plane,
      snapStep: 0.05,
      angleSnapStep: Math.PI / 2,
    });
  };

  // Клавиатурные сокращения
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем если фокус в input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const isSelected = !!selectedPalletId;
      if (!isSelected) return;

      // G - Grab/Move
      if ((e.key === 'g' || e.key === 'G') && transformState.mode === 'idle') {
        e.preventDefault();
        let axis: Axis = 'XYZ';
        if (e.shiftKey) axis = 'Y';
        else if (e.altKey) axis = 'Z';
        startTranslate(axis);
        return;
      }

      // R - Rotate
      if ((e.key === 'r' || e.key === 'R') && transformState.mode === 'idle') {
        e.preventDefault();
        let axis: Axis = 'Y';
        if (e.shiftKey) axis = 'X';
        else if (e.altKey) axis = 'Z';
        else if (e.ctrlKey || e.metaKey) axis = 'XYZ';
        startRotate(axis);
        return;
      }

      // Оси после G/R (X, Y, Z)
      if (transformState.mode !== 'idle') {
        if (e.key === 'x' || e.key === 'X') {
          e.preventDefault();
          setTransformState(s => ({ ...s, axis: 'X' }));
          return;
        }
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          setTransformState(s => ({ ...s, axis: 'Y' }));
          return;
        }
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          setTransformState(s => ({ ...s, axis: 'Z' }));
          return;
        }
        // Shift = исключить ось (Shift+X = перемещать по YZ)
        if (e.key === 'Shift') {
          setTransformState(s => {
            if (s.axis === 'X') return { ...s, axis: 'YZ' };
            if (s.axis === 'Y') return { ...s, axis: 'XZ' };
            if (s.axis === 'Z') return { ...s, axis: 'XY' };
            return s;
          });
          return;
        }
      }

      // Enter / Пробел - подтвердить
      if ((e.key === 'Enter' || e.key === ' ') && transformState.mode !== 'idle') {
        e.preventDefault();
        finishTransform(false);
        return;
      }

      // Escape - отмена
      if (e.key === 'Escape' && transformState.mode !== 'idle') {
        e.preventDefault();
        finishTransform(true);
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && transformState.mode !== 'idle') {
        const currentAxis = transformState.axis;
        if (currentAxis === 'YZ') setTransformState(s => ({ ...s, axis: 'X' }));
        else if (currentAxis === 'XZ') setTransformState(s => ({ ...s, axis: 'Y' }));
        else if (currentAxis === 'XY') setTransformState(s => ({ ...s, axis: 'Z' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedPalletId, transformState.mode, transformState.axis]);

  // Обработка мыши для трансформации
  useFrame(() => {
    const state = stateRef.current;
    if (state.mode === 'idle' || !state.itemId || !state.initialPosition || !item || !vehicle) return;

    const currentItem = pallets.find(p => p.id === state.itemId);
    if (!currentItem) { finishTransform(true); return; }

    raycaster.setFromCamera(pointer, camera);
    const hitPoint = new THREE.Vector3();
    if (!state.plane || !raycaster.ray.intersectPlane(state.plane, hitPoint)) return;

    if (state.mode === 'translate') {
      const delta = hitPoint.clone().sub(state.initialWorldPoint!);
      const fp = orientedFootprint(currentItem);
      const maxL = vehicle.cargoLength / 2 - fp.length / 2;
      const maxW = vehicle.cargoWidth / 2 - fp.width / 2;

      let newX = state.initialPosition![0];
      let newZ = state.initialPosition![2];
      let newY = state.initialPosition![1];

      const applyAxis = (axis: 'X' | 'Y' | 'Z') => {
        if (axis === 'X') {
          newX = Math.round((state.initialPosition![0] + delta.x) / state.snapStep) * state.snapStep;
          newX = THREE.MathUtils.clamp(newX, -maxL, maxL);
        } else if (axis === 'Z') {
          newZ = Math.round((state.initialPosition![2] + delta.z) / state.snapStep) * state.snapStep;
          newZ = THREE.MathUtils.clamp(newZ, -maxW, maxW);
        } else if (axis === 'Y') {
          newY = Math.round((state.initialPosition![1] + delta.y) / state.snapStep) * state.snapStep;
          const itemH = currentItem.kind === 'pallet' 
            ? Math.max(0.42, 0.144 + Math.ceil(currentItem.boxes.length / 4) * 0.28) 
            : orientedHeight(currentItem);
          newY = THREE.MathUtils.clamp(newY, 0.04, vehicle.cargoHeight - itemH);
        }
      };

      if (state.axis === 'XYZ') {
        applyAxis('X');
        applyAxis('Z');
      } else if (state.axis === 'X' || state.axis === 'Y' || state.axis === 'Z') {
        applyAxis(state.axis);
      } else if (state.axis === 'YZ') {
        applyAxis('Z');
      } else if (state.axis === 'XZ') {
        applyAxis('X');
        applyAxis('Z');
      } else if (state.axis === 'XY') {
        applyAxis('X');
      }

      const finalY = (state.axis === 'X' || state.axis === 'Z' || state.axis === 'XZ' || state.axis === 'XYZ') 
        ? getStackHeightAt(state.itemId, newX, newZ, pallets) 
        : newY;

      updatePalletPosition(state.itemId, [newX, finalY, newZ]);

    } else if (state.mode === 'rotate') {
      const center = new THREE.Vector3(currentItem.position[0], 0, currentItem.position[2]);
      
      const initDir = state.initialWorldPoint!.clone().sub(center);
      initDir.y = 0;
      const initAngle = Math.atan2(initDir.z, initDir.x);

      const currentDir = hitPoint.clone().sub(center);
      currentDir.y = 0;
      const currentAngle = Math.atan2(currentDir.z, currentDir.x);

      const deltaAngle = currentAngle - initAngle;
      
      let newRotX = state.initialRotation ? state.initialRotation[0] : 0;
      let newRotY = state.initialRotation ? state.initialRotation[1] : 0;
      let newRotZ = state.initialRotation ? state.initialRotation[2] : 0;

      const applyRotation = (axis: 'X' | 'Y' | 'Z', angle: number) => {
        if (!state.initialRotation) return;
        let newAngle = state.initialRotation[axis === 'X' ? 0 : axis === 'Y' ? 1 : 2] + (axis === 'Y' ? -angle : angle);
        newAngle = Math.round(newAngle / state.angleSnapStep) * state.angleSnapStep;
        if (axis === 'X') newRotX = newAngle;
        else if (axis === 'Y') newRotY = newAngle;
        else if (axis === 'Z') newRotZ = newAngle;
      };

      if (state.axis === 'XYZ') {
        applyRotation('Y', deltaAngle);
      } else if (state.axis === 'X' || state.axis === 'Y' || state.axis === 'Z') {
        applyRotation(state.axis, deltaAngle);
      } else if (state.axis === 'XY') {
        applyRotation('X', deltaAngle);
      } else if (state.axis === 'XZ') {
        applyRotation('Z', deltaAngle);
      } else if (state.axis === 'YZ') {
        applyRotation('Y', deltaAngle);
      }

      updatePalletRotation(state.itemId, [newRotX, newRotY, newRotZ]);
      
      // Авто-опускание после вращения
      const targetY = getStackHeightAt(state.itemId, currentItem.position[0], currentItem.position[2], pallets);
      const itemH = currentItem.kind === 'pallet' 
        ? Math.max(0.42, 0.144 + Math.ceil(currentItem.boxes.length / 4) * 0.28) 
        : orientedHeight(currentItem);
      const clampedY = Math.round(Math.min(targetY, vehicle.cargoHeight - itemH) / 0.05) * 0.05;
      updatePalletPosition(state.itemId, [currentItem.position[0], clampedY, currentItem.position[2]]);
    }
  });

  // ПКМ - отмена
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (transformState.mode !== 'idle') {
        e.preventDefault();
        finishTransform(true);
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [transformState.mode]);

  // Визуальная подсказка текущего режима
  if (transformState.mode !== 'idle' && item) {
    return (
      <Html 
        position={[item.position[0], item.position[1] + orientedHeight(item) + 0.5, item.position[2]]}
        style={{ pointerEvents: 'none', zIndex: 1000, transform: 'translate(-50%, -50%)' }}
      >
        <div style={{
          background: 'rgba(16,19,27,0.95)', 
          color: '#fff', 
          padding: '8px 14px',
          borderRadius: '10px', 
          fontSize: '12px', 
          fontWeight: 600,
          border: `2px solid ${transformState.mode === 'translate' ? '#ef4444' : '#f59e0b'}`,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)'
        }}>
          {transformState.mode === 'translate' ? (
            <>
              <span style={{color: '#ef4444'}}>● G — Перемещение</span>{' '}
              <span style={{color: '#888', fontSize: '11px'}}>
                [Ось: {transformState.axis === 'XYZ' ? 'XYZ (свободно)' : transformState.axis}]
                {' | '}ЛКМ/Enter — OK{' | '}ПКМ/Esc — Отмена
              </span>
            </>
          ) : (
            <>
              <span style={{color: '#f59e0b'}}>● R — Вращение</span>{' '}
              <span style={{color: '#888', fontSize: '11px'}}>
                [Ось: {transformState.axis === 'XYZ' ? 'Трекбол' : transformState.axis}]
                {' | '}ЛКМ/Enter — OK{' | '}ПКМ/Esc — Отмена
              </span>
            </>
          )}
        </div>
      </Html>
    );
  }

  return null;
}

/** Вспомогательный компонент для показа выделения предмета */
export function SelectionHighlight({ 
  position, 
  dimensions, 
  height, 
  hasCollision 
}: { 
  position: [number, number, number]; 
  dimensions: { length: number; width: number; height: number }; 
  height: number; 
  hasCollision: boolean; 
}) {
  return (
    <lineSegments position={[0, height / 2, 0]}>
      <edgesGeometry args={[new THREE.BoxGeometry(dimensions.length + 0.1, height + 0.1, dimensions.width + 0.1)]} />
      <lineBasicMaterial color={hasCollision ? '#ef4444' : '#ff6b00'} linewidth={3} />
    </lineSegments>
  );
}