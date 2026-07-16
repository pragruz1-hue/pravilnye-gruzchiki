import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

function loadTexture(url: string): THREE.Texture {
  const texture = textureLoader.load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = url.includes('normal') || url.includes('disp') ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  return texture;
}

export function createTruckPaintMaterial(): THREE.MeshPhysicalMaterial {
  const normalMap = loadTexture('/textures/metallic_flake_normal.png');
  normalMap.repeat.set(6, 6);
  return new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0.6,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    normalMap
  });
}

export function createTireMaterial(): THREE.MeshStandardMaterial {
  const normalMap = loadTexture('/textures/tire_tread_normal.png');
  normalMap.repeat.set(3, 3);
  return new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.9,
    normalMap
  });
}

export function createGlassMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: '#2a2a3a',
    transmission: 0.55,
    ior: 1.52,
    roughness: 0.05,
    transparent: true,
    opacity: 0.42,
    thickness: 0.06
  });
}

export function createChromeMaterial(): THREE.MeshStandardMaterial {
  const normalMap = loadTexture('/textures/brushed_metal_normal.png');
  normalMap.repeat.set(5, 5);
  return new THREE.MeshStandardMaterial({
    color: '#c0c0c0',
    metalness: 1.0,
    roughness: 0.1,
    normalMap
  });
}

export function createWoodMaterial(): THREE.MeshStandardMaterial {
  const normalMap = loadTexture('/textures/wood_grain_normal.png');
  normalMap.repeat.set(2, 2);
  return new THREE.MeshStandardMaterial({
    color: '#8B7355',
    roughness: 0.9,
    normalMap
  });
}

export function createCardboardMaterial(color = '#B8956B'): THREE.MeshStandardMaterial {
  const normalMap = loadTexture('/textures/cardboard_wave_normal.png');
  const map = loadTexture('/textures/cardboard_wave.png');
  normalMap.repeat.set(2, 2);
  map.repeat.set(2, 2);
  return new THREE.MeshStandardMaterial({
    color,
    map,
    roughness: 0.85,
    normalMap
  });
}

export function createTapeMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: '#FFD700',
    roughness: 0.2,
    metalness: 0.0
  });
}

export function createStretchWrapMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: '#dbeafe',
    transmission: 0.8,
    opacity: 0.3,
    roughness: 0.1,
    ior: 1.5,
    transparent: true,
    side: THREE.DoubleSide,
    thickness: 0.015
  });
}

export function createPlasticMaterial(color: string): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.0,
    roughness: 0.22,
    clearcoat: 0.35,
    clearcoatRoughness: 0.15
  });
}

export function createHeavyCargoMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: '#ef4444',
    roughness: 0.55,
    metalness: 0.05
  });
}

export function createColdCargoMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: '#06b6d4',
    roughness: 0.45,
    metalness: 0.05
  });
}
