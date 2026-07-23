import type * as THREE from "three/webgpu";

export function trackReplacedMaterials(materials: Set<THREE.Material>, material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => materials.add(item));
    return;
  }

  materials.add(material);
}

export function disposeReplacedMaterials(materials: Set<THREE.Material>) {
  materials.forEach((material) => material.dispose());
}
