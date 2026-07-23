import createShadowMaterial from "@/canvas/objects/materials/shadowMat";
import { useEffect } from "react";
import * as THREE from "three/webgpu";

export function useSceneSetup(
  scene: THREE.Object3D,
  opacityProgress: THREE.UniformNode<"float", number>,
  onMesh?: (mesh: THREE.Mesh, progress: THREE.UniformNode<"float", number>) => void,
  texture?: THREE.Texture
) {
  useEffect(() => {
    scene.traverse((v) => {
      if (v instanceof THREE.Mesh) {
        if (v.name === "shadow") {
          if (!texture) return;
          const mat = createShadowMaterial(opacityProgress as THREE.UniformNode<"float", number>, texture);
          v.raycast = () => {};
          v.material = mat;
        } else {
          v.castShadow = true;
          v.receiveShadow = true;
          const old = v.material as THREE.MeshStandardMaterial;
          const nodeMat = new THREE.MeshStandardNodeMaterial();
          nodeMat.color.copy(old.color);
          nodeMat.map = old.map;
          nodeMat.roughness = old.roughness;
          nodeMat.metalness = old.metalness;
          nodeMat.transparent = true;
          nodeMat.opacityNode = opacityProgress; // 흐림 연결
          v.material = nodeMat;
          onMesh?.(v, opacityProgress); // 오브젝트별 추가 처리 (머티리얼 교체 등)
        }

        // attachFadingShadow(v.material as THREE.NodeMaterial, opacityProgress);
      }
    });
  }, [scene, onMesh]);
}
