import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

class NodeFileReader {
  constructor() {
    this.result = null;
    this.onloadend = null;
  }
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    if (typeof this.onloadend === 'function') this.onloadend();
  }
  async readAsDataURL(blob) {
    const buffer = Buffer.from(await blob.arrayBuffer());
    this.result = `data:${blob.type || 'application/octet-stream'};base64,${buffer.toString('base64')}`;
    if (typeof this.onloadend === 'function') this.onloadend();
  }
}

globalThis.FileReader = globalThis.FileReader || NodeFileReader;

const root = path.resolve(new URL('.', import.meta.url).pathname, '..');
const modelsDir = path.join(root, 'public', 'models');
fs.mkdirSync(modelsDir, { recursive: true });

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...options });
}

function box(name, size, mat, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat);
  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(name, radius, depth, mat, position, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 32), mat);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createTruck() {
  const truck = new THREE.Group();
  truck.name = 'truck_6m_open_body';
  const paint = material(0xffffff, { metalness: 0.6, roughness: 0.2 });
  const blue = material(0x2563eb, { metalness: 0.45, roughness: 0.22 });
  const black = material(0x1a1a1a, { roughness: 0.9 });
  const glass = material(0x2a2a3a, { roughness: 0.05, transparent: true, opacity: 0.45 });
  const chrome = material(0xc0c0c0, { metalness: 1.0, roughness: 0.1 });
  const light = material(0xfff7cc, { emissive: 0xffdf88, emissiveIntensity: 0.65, roughness: 0.18 });

  truck.add(box('cab_main', [1.55, 1.85, 2.25], blue, [-3.75, 0.98, 0]));
  truck.add(box('cab_roof', [1.35, 0.32, 2.05], blue, [-3.86, 1.98, 0]));
  truck.add(box('windshield', [0.08, 0.72, 1.42], glass, [-4.55, 1.34, 0]));
  truck.add(box('side_window_left', [0.58, 0.55, 0.07], glass, [-3.76, 1.38, -1.15]));
  truck.add(box('side_window_right', [0.58, 0.55, 0.07], glass, [-3.76, 1.38, 1.15]));
  truck.add(box('left_mirror_arm', [0.08, 0.08, 0.38], chrome, [-4.38, 1.38, -1.38]));
  truck.add(box('right_mirror_arm', [0.08, 0.08, 0.38], chrome, [-4.38, 1.38, 1.38]));
  truck.add(box('headlight_left', [0.08, 0.2, 0.38], light, [-4.55, 0.62, -0.62]));
  truck.add(box('headlight_right', [0.08, 0.2, 0.38], light, [-4.55, 0.62, 0.62]));

  truck.add(box('cargo_floor', [6.0, 0.12, 2.4], paint, [0, 0.16, 0]));
  truck.add(box('cargo_left_wall', [6.0, 2.35, 0.08], paint, [0, 1.34, -1.24]));
  truck.add(box('cargo_right_wall', [6.0, 2.35, 0.08], paint, [0, 1.34, 1.24]));
  truck.add(box('cargo_front_wall', [0.1, 2.35, 2.4], paint, [-3.0, 1.34, 0]));
  truck.add(box('cargo_roof_edge_left', [6.0, 0.12, 0.12], chrome, [0, 2.56, -1.24]));
  truck.add(box('cargo_roof_edge_right', [6.0, 0.12, 0.12], chrome, [0, 2.56, 1.24]));

  const leftDoor = box('rear_door_left_pivot', [0.08, 2.2, 1.12], paint, [3.08, 1.35, -0.58]);
  leftDoor.userData.animation = 'rearDoorLeft';
  const rightDoor = box('rear_door_right_pivot', [0.08, 2.2, 1.12], paint, [3.08, 1.35, 0.58]);
  rightDoor.userData.animation = 'rearDoorRight';
  leftDoor.rotation.y = -0.65;
  rightDoor.rotation.y = 0.65;
  truck.add(leftDoor, rightDoor);

  [-4.05, -2.15, 2.35].forEach((x) => {
    truck.add(cylinder('wheel_left', 0.39, 0.28, black, [x, 0.12, -1.34], [Math.PI / 2, 0, 0]));
    truck.add(cylinder('wheel_right', 0.39, 0.28, black, [x, 0.12, 1.34], [Math.PI / 2, 0, 0]));
    truck.add(cylinder('rim_left', 0.17, 0.3, chrome, [x, 0.12, -1.35], [Math.PI / 2, 0, 0]));
    truck.add(cylinder('rim_right', 0.17, 0.3, chrome, [x, 0.12, 1.35], [Math.PI / 2, 0, 0]));
  });
  return truck;
}

function createPallet() {
  const pallet = new THREE.Group();
  pallet.name = 'eur_pallet_1200x800x144';
  const wood = material(0x8b7355, { roughness: 0.9 });
  for (let i = 0; i < 5; i += 1) {
    const z = -0.36 + i * 0.18;
    pallet.add(box(`top_plank_${i + 1}`, [1.2, 0.035, 0.11], wood, [0, 0.127, z]));
  }
  for (let i = 0; i < 3; i += 1) {
    const z = -0.3 + i * 0.3;
    pallet.add(box(`bottom_plank_${i + 1}`, [1.2, 0.03, 0.09], wood, [0, 0.015, z]));
  }
  [-0.46, 0, 0.46].forEach((x, xi) => {
    [-0.3, 0, 0.3].forEach((z, zi) => {
      pallet.add(box(`block_${xi}_${zi}`, [0.16, 0.085, 0.14], wood, [x, 0.07, z]));
    });
  });
  return pallet;
}

function createBox(name, dimensions) {
  const group = new THREE.Group();
  group.name = name;
  const cardboard = material(0xb8956b, { roughness: 0.85 });
  const tape = material(0xffd700, { roughness: 0.2, metalness: 0.0 });
  group.add(box('cardboard_body', dimensions, cardboard, [0, dimensions[1] / 2, 0]));
  group.add(box('tape_long', [dimensions[0] + 0.01, 0.012, 0.055], tape, [0, dimensions[1] + 0.008, 0]));
  group.add(box('tape_cross', [0.055, 0.013, dimensions[2] + 0.01], tape, [0, dimensions[1] + 0.012, 0]));
  return group;
}

async function exportGlb(object, fileName) {
  const exporter = new GLTFExporter();
  const result = await new Promise((resolve, reject) => {
    exporter.parse(object, resolve, reject, { binary: true, trs: true, onlyVisible: true });
  });
  fs.writeFileSync(path.join(modelsDir, fileName), Buffer.from(result));
  console.log(`Generated ${fileName}`);
}

await exportGlb(createTruck(), 'truck.glb');
await exportGlb(createPallet(), 'pallet.glb');
await exportGlb(createBox('box_s_40x30x30', [0.4, 0.3, 0.3]), 'box_s.glb');
await exportGlb(createBox('box_m_60x40x40', [0.6, 0.4, 0.4]), 'box_m.glb');
await exportGlb(createBox('box_l_80x60x60', [0.8, 0.6, 0.6]), 'box_l.glb');
await exportGlb(createBox('box_xl_100x80x80', [1.0, 0.8, 0.8]), 'box_xl.glb');
