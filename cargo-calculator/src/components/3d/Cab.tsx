import * as THREE from 'three';
import { useMemo } from 'react';

type Vec3 = [number, number, number];
export type CabStyle = 'gazelle' | 'van' | 'truck';

export interface CabBodyMats {
  paint: THREE.Material;
  glass: THREE.Material;
  chrome: THREE.Material;
  dark: THREE.Material;
  light: THREE.Material;
}

interface TruckCabProps {
  style: CabStyle;
  frontWallX: number;   // x передней стенки кузова (-L/2)
  cargoW: number;       // ширина кузова
  cargoTopY: number;    // верх кузова по Y (с учётом рейлингов)
  isNightMode: boolean;
  body: CabBodyMats;
}

function B({ p, s, m, rz = 0, cast = true }: { p: Vec3; s: Vec3; m: THREE.Material; rz?: number; cast?: boolean }) {
  return (
    <mesh position={p} rotation={[0, 0, rz]} castShadow={cast} receiveShadow>
      <boxGeometry args={s} />
      <primitive object={m} attach="material" />
    </mesh>
  );
}

function Cyl({ p, r1, r2, h, m, rz = 0 }: { p: Vec3; r1: number; r2: number; h: number; m: THREE.Material; rz?: number }) {
  return (
    <mesh position={p} rotation={[0, 0, rz]} castShadow receiveShadow>
      <cylinderGeometry args={[r1, r2, h, 24]} />
      <primitive object={m} attach="material" />
    </mesh>
  );
}

function Sph({ p, r, m }: { p: Vec3; r: number; m: THREE.Material }) {
  return (
    <mesh position={p} castShadow>
      <sphereGeometry args={[r, 14, 14]} />
      <primitive object={m} attach="material" />
    </mesh>
  );
}

/**
 * Детализированная процедурная кабина.
 * style 'gazelle' — капотный силуэт ГАЗели (COE, наклонное лобовое, высокие фары),
 * style 'van'     — средний бескапотный фургон (Isuzu/Hino),
 * style 'truck'   — высокая COE-кабина тягача (фура): визор, габариты на крыше,
 *                   ступеньки, выхлопная труба за кабиной.
 */
export function TruckCab({ style, frontWallX, cargoW, cargoTopY, isNightMode, body }: TruckCabProps) {
  const mats = useMemo(() => ({
    grille: new THREE.MeshPhysicalMaterial({ color: '#0b0f16', metalness: 0.45, roughness: 0.38, clearcoat: 0.5 }),
    bumper: new THREE.MeshStandardMaterial({ color: '#26313f', roughness: 0.62, metalness: 0.25 }),
    indicator: new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: isNightMode ? 2.0 : 0.45, roughness: 0.3 }),
    marker: new THREE.MeshStandardMaterial({ color: '#fb923c', emissive: '#fb923c', emissiveIntensity: isNightMode ? 2.4 : 0.7, roughness: 0.3 }),
    drl: new THREE.MeshStandardMaterial({ color: '#eff6ff', emissive: '#dbeafe', emissiveIntensity: isNightMode ? 2.6 : 1.5, roughness: 0.2 }),
    plate: new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4, metalness: 0.05 }),
    brand: new THREE.MeshPhysicalMaterial({ color: '#ff6b00', metalness: 0.35, roughness: 0.24, clearcoat: 0.8 })
  }), [isNightMode]);

  // --- пропорции по типу кабины (фронт смотрит в -X) ---
  const D = style === 'gazelle'
    ? { len: 1.72, w: Math.min(2.02, cargoW + 0.10), doorBottom: 0.42, belt: 1.30, wsBot: 1.34, wsTop: 1.96, roofY: 2.06, rake: 0.42, bumperY: 0.46, gzB: 0.78, slats: 2, markers: 0, visor: false, steps: 0, stack: false, glassDrop: 0.42 }
    : style === 'van'
      ? { len: 1.90, w: Math.min(2.24, cargoW + 0.10), doorBottom: 0.46, belt: 1.36, wsBot: 1.42, wsTop: 2.08, roofY: 2.20, rake: 0.36, bumperY: 0.50, gzB: 0.84, slats: 2, markers: 0, visor: false, steps: 1, stack: false, glassDrop: 0.42 }
      : { len: 2.15, w: Math.min(2.50, cargoW + 0.12), doorBottom: 0.62, belt: 1.76, wsBot: 1.80, wsTop: 2.68, roofY: 2.86, rake: 0.30, bumperY: 0.74, gzB: 1.02, slats: 3, markers: 5, visor: true, steps: 2, stack: true, glassDrop: 0.34 };

  const backX = frontWallX - 0.08;
  const frontX = backX - D.len;
  const frontFaceX = frontX + 0.02;
  const wsH = D.wsTop - D.wsBot;
  const dx = wsH * Math.tan(D.rake);
  const slopeLen = wsH / Math.cos(D.rake);
  const wsBottomX = frontX + 0.06;
  const wsTopX = wsBottomX + dx;
  const wsCX = (wsBottomX + wsTopX) / 2;
  const wsCY = (D.wsBot + D.wsTop) / 2;
  const rz = -D.rake;
  const w = D.w;
  const glassW = w - D.glassDrop;

  const gzB = D.gzB;
  const gzT = D.wsBot - 0.05;

  const doorFront = wsTopX + 0.05;
  const doorBack = backX - 0.08;
  const doorMid = (doorFront + doorBack) / 2;
  const doorLen = Math.max(0.3, doorBack - doorFront);
  const doorGlassLen = Math.max(0.2, doorLen - 0.22);

  const wheelX = frontWallX - 1.08; // передняя ось (см. Truck)
  const wheelZ = cargoW / 2 + 0.15;

  const showDeflector = cargoTopY > D.roofY + 0.05;
  const defX0 = wsTopX + 0.06;
  const defY0 = D.roofY + 0.06;
  const defX1 = backX + 0.10;
  const defY1 = cargoTopY + 0.05;
  const defDx = defX1 - defX0;
  const defDy = defY1 - defY0;
  const defLen = Math.hypot(defDx, defDy);
  const defRz = -Math.atan2(defDy, defDx);

  const { paint, glass, chrome, dark, light } = body;
  const brand = mats.brand;

  return (
    <group name="truck-cab">
      {/* ===== базовая кассета кабины ===== */}
      <B p={[frontX + 0.02 + (backX - frontX - 0.02) / 2, (D.doorBottom + D.wsBot) / 2, 0]} s={[backX - frontX - 0.02, D.wsBot - D.doorBottom, w]} m={paint} />
      <B p={[wsTopX + 0.04 + (backX - wsTopX - 0.04) / 2, (D.wsBot + D.roofY) / 2, 0]} s={[backX - wsTopX - 0.04, D.roofY - D.wsBot, w]} m={paint} />
      <B p={[(wsTopX + backX + 0.01) / 2 + 0.01, D.roofY + 0.025, 0]} s={[backX - wsTopX + 0.09, 0.05, w - 0.02]} m={paint} />

      {/* ===== лобовое стекло и рамка ===== */}
      <B p={[wsCX, wsCY, 0]} s={[0.024, slopeLen, glassW]} m={glass} rz={rz} />
      <B p={[wsCX, wsCY, glassW / 2 + 0.045]} s={[0.05, slopeLen + 0.04, 0.07]} m={dark} rz={rz} />
      <B p={[wsCX, wsCY, -glassW / 2 - 0.045]} s={[0.05, slopeLen + 0.04, 0.07]} m={dark} rz={rz} />
      <B p={[wsTopX + 0.03, D.wsTop + 0.045, 0]} s={[0.09, 0.09, glassW + 0.12]} m={paint} rz={rz} />
      <B p={[wsBottomX + 0.02, D.wsBot - 0.025, 0]} s={[0.12, 0.05, glassW + 0.10]} m={dark} />
      {/* дворники */}
      <B p={[wsBottomX + dx * 0.42 - 0.015, D.wsBot + wsH * 0.38, glassW * 0.26]} s={[0.02, slopeLen * 0.62, 0.025]} m={dark} rz={rz - 0.55} />
      <B p={[wsBottomX + dx * 0.42 - 0.015, D.wsBot + wsH * 0.38, -glassW * 0.26]} s={[0.02, slopeLen * 0.62, 0.025]} m={dark} rz={rz - 0.55} />

      {/* ===== решётка радиатора ===== */}
      <B p={[frontFaceX - 0.025, (gzB + gzT) / 2, 0]} s={[0.05, gzT - gzB, w - 0.50]} m={mats.grille} />
      {Array.from({ length: D.slats }).map((_, i) => {
        const y = gzB + (gzT - gzB) * ((i + 1) / (D.slats + 1));
        return <B key={`slat-${i}`} p={[frontFaceX - 0.055, y, 0]} s={[0.02, 0.03, w - 0.58]} m={chrome} />;
      })}
      <Cyl p={[frontFaceX - 0.055, (gzB + gzT) / 2, 0]} r1={style === 'truck' ? 0.065 : 0.055} r2={style === 'truck' ? 0.065 : 0.055} h={0.03} m={brand} rz={Math.PI / 2} />

      {/* ===== фары + ДХО ===== */}
      {[1, -1].map((s) => (
        <group key={`hl-${s}`}>
          <B p={[frontFaceX - 0.005, (D.bumperY + 0.15 + gzT + 0.02) / 2, s * (w / 2 - 0.16)]} s={[0.07, gzT - D.bumperY - 0.11, 0.26]} m={dark} />
          <B p={[frontFaceX - 0.045, (D.bumperY + 0.15 + gzT + 0.02) / 2, s * (w / 2 - 0.16)]} s={[0.02, gzT - D.bumperY - 0.17, 0.22]} m={light} />
          <B p={[frontFaceX - 0.048, (D.bumperY + 0.25 + gzT) / 2, s * (w / 2 - 0.055)]} s={[0.016, gzT - D.bumperY - 0.27, 0.035]} m={mats.drl} />
        </group>
      ))}

      {/* ===== бампер ===== */}
      <B p={[frontFaceX - 0.04, D.bumperY, 0]} s={[0.12, 0.24, w - 0.02]} m={mats.bumper} />
      <B p={[frontFaceX - 0.105, D.bumperY, 0]} s={[0.02, 0.10, 0.90]} m={mats.bumper} />
      <B p={[frontFaceX - 0.11, D.bumperY + 0.02, 0]} s={[0.018, 0.13, 0.36]} m={mats.plate} />
      <B p={[frontFaceX - 0.10, D.bumperY - 0.02, w / 2 - 0.28]} s={[0.03, 0.09, 0.14]} m={light} />
      <B p={[frontFaceX - 0.10, D.bumperY - 0.02, -(w / 2 - 0.28)]} s={[0.03, 0.09, 0.14]} m={light} />
      <B p={[frontFaceX - 0.10, D.bumperY - 0.02, w / 2 - 0.55]} s={[0.025, 0.05, 0.22]} m={mats.indicator} />
      <B p={[frontFaceX - 0.10, D.bumperY - 0.02, -(w / 2 - 0.55)]} s={[0.025, 0.05, 0.22]} m={mats.indicator} />

      {/* ===== борта: двери, стёкла, ручки, ступеньки ===== */}
      {[1, -1].map((s) => (
        <group key={`side-${s}`}>
          {/* контур двери */}
          <B p={[doorMid, D.wsBot + 0.02, s * (w / 2 + 0.004)]} s={[doorLen, 0.014, 0.012]} m={dark} cast={false} />
          <B p={[doorMid, D.doorBottom + 0.02, s * (w / 2 + 0.004)]} s={[doorLen, 0.014, 0.012]} m={dark} cast={false} />
          <B p={[doorFront, (D.doorBottom + D.wsBot) / 2, s * (w / 2 + 0.004)]} s={[0.014, D.wsBot - D.doorBottom - 0.02, 0.012]} m={dark} cast={false} />
          <B p={[doorBack - 0.007, (D.doorBottom + D.wsBot) / 2, s * (w / 2 + 0.004)]} s={[0.014, D.wsBot - D.doorBottom - 0.02, 0.012]} m={dark} cast={false} />
          {/* боковое стекло с передней форточкой-переборкой */}
          <B p={[doorMid, (D.wsBot + 0.07 + D.wsTop - 0.07) / 2, s * (w / 2 + 0.002)]} s={[doorGlassLen, wsH - 0.14, 0.016]} m={glass} />
          <B p={[doorMid - doorGlassLen / 2 + 0.015, (D.wsBot + 0.07 + D.wsTop - 0.07) / 2, s * (w / 2 + 0.006)]} s={[0.03, wsH - 0.14, 0.014]} m={dark} cast={false} />
          <B p={[doorMid, D.wsTop - 0.05, s * (w / 2 + 0.006)]} s={[doorGlassLen, 0.03, 0.014]} m={dark} cast={false} />
          {/* ручка и повторитель поворота */}
          <B p={[doorBack - 0.22, D.wsBot - 0.08, s * (w / 2 + 0.012)]} s={[0.03, 0.05, 0.14]} m={dark} />
          <B p={[doorFront + 0.05, D.wsBot - 0.12, s * (w / 2 + 0.012)]} s={[0.02, 0.05, 0.10]} m={mats.indicator} />
          {/* фирменная полоса и бейдж */}
          <B p={[doorMid, D.belt - 0.28, s * (w / 2 + 0.006)]} s={[doorLen - 0.10, 0.05, 0.012]} m={brand} cast={false} />
          <B p={[doorFront + 0.22, D.belt - 0.28, s * (w / 2 + 0.010)]} s={[0.15, 0.15, 0.012]} m={brand} />
          {/* порог */}
          <B p={[doorMid, D.doorBottom - 0.13, s * (w / 2 - 0.01)]} s={[doorLen - 0.06, 0.18, 0.03]} m={dark} />
          {/* ступеньки */}
          {Array.from({ length: D.steps }).map((_, i) => (
            <B key={`step-${i}`} p={[doorMid, 0.30 + i * 0.15, s * (w / 2 + 0.01 - i * 0.05)]} s={[0.44, 0.05, 0.52]} m={mats.bumper} />
          ))}
          {/* зеркала */}
          <B p={[doorFront + 0.02, D.wsTop - 0.06, s * (w / 2 + 0.10)]} s={[0.025, 0.025, 0.17]} m={dark} />
          <B p={[doorFront + 0.02, D.wsTop - 0.13, s * (w / 2 + 0.185)]} s={[0.02, 0.14, 0.02]} m={dark} />
          {style === 'truck' ? (
            <>
              <B p={[doorFront + 0.02, D.wsTop - 0.40, s * (w / 2 + 0.21)]} s={[0.07, 0.42, 0.19]} m={dark} />
              <B p={[doorFront + 0.02 + 0.045, D.wsTop - 0.40, s * (w / 2 + 0.21)]} s={[0.02, 0.36, 0.15]} m={chrome} />
              <B p={[doorFront + 0.02, D.wsTop - 0.74, s * (w / 2 + 0.20)]} s={[0.06, 0.16, 0.16]} m={dark} />
              <B p={[doorFront + 0.02 + 0.040, D.wsTop - 0.74, s * (w / 2 + 0.20)]} s={[0.02, 0.12, 0.12]} m={chrome} />
            </>
          ) : (
            <>
              <B p={[doorFront + 0.02, D.wsTop - 0.32, s * (w / 2 + 0.20)]} s={[0.05, 0.28, 0.14]} m={dark} />
              <B p={[doorFront + 0.02 + 0.035, D.wsTop - 0.32, s * (w / 2 + 0.20)]} s={[0.02, 0.24, 0.10]} m={chrome} />
            </>
          )}
          {/* арка переднего колеса + брызговик */}
          <mesh position={[wheelX, 0.12, s * wheelZ]} castShadow>
            <torusGeometry args={[0.45, 0.045, 10, 24, Math.PI]} />
            <primitive object={dark} attach="material" />
          </mesh>
          <B p={[wheelX + 0.46, 0.24, s * wheelZ]} s={[0.035, 0.42, 0.34]} m={dark} />
        </group>
      ))}

      {/* ===== фирменные элементы тягача ===== */}
      {D.visor && <B p={[wsTopX + 0.10, D.wsTop + 0.10, 0]} s={[0.32, 0.05, w - 0.18]} m={dark} rz={-0.35} />}
      {D.markers > 0 && Array.from({ length: D.markers }).map((_, i) => {
        const z = (i - (D.markers - 1) / 2) * 0.25;
        return <Sph key={`mk-${i}`} p={[wsTopX + 0.09, D.roofY + 0.085, z]} r={0.032} m={mats.marker} />;
      })}
      {style === 'truck' && (
        <>
          <Cyl p={[wsTopX + 0.48, D.roofY + 0.09, 0.30]} r1={0.035} r2={0.035} h={0.16} m={chrome} rz={-1.05} />
          <Cyl p={[wsTopX + 0.48, D.roofY + 0.09, -0.30]} r1={0.035} r2={0.035} h={0.16} m={chrome} rz={-1.05} />
        </>
      )}
      {D.stack && (
        <>
          <Cyl p={[backX - 0.12, 1.46, -(w / 2 + 0.02)]} r1={0.055} r2={0.055} h={1.58} m={chrome} />
          <Cyl p={[backX - 0.12, 2.27, -(w / 2 + 0.02)]} r1={0.06} r2={0.06} h={0.05} m={dark} />
        </>
      )}

      {/* ===== обтекатель на крыше (когда кузов выше кабины) ===== */}
      {showDeflector && (
        <B p={[(defX0 + defX1) / 2, (defY0 + defY1) / 2, 0]} s={[defLen, 0.03, w - 0.06]} m={paint} rz={defRz} />
      )}
    </group>
  );
}

export default TruckCab;
