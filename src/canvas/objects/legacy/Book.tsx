import { useEffect } from "react";

import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three/webgpu";
import { mrt } from "three/tsl";

import type { Props } from "@/types";
import { useInteractiveObject } from "@/canvas/objects/useInteractiveObject";
import ObjectLabel from "@/components/ObjectLabel";

import Model from "../Model";
import createShadowMaterial from "../materials/shadowMat";
import {
  disposeReplacedMaterials,
  trackReplacedMaterials,
} from "../materialUtils";

export default function Book({ register, ...handlers }: Props) {
  const aoMap = useTexture("/images/ao_book.webp");
  const shadowMap = useTexture("/images/shadow_book.webp");
  const { scene } = useGLTF("/models/books2.glb");
  const { groupRef, center, opacityProgress, selectionProgress } =
    useInteractiveObject(scene, register);

  useEffect(() => {
    aoMap.flipY = false;
    aoMap.needsUpdate = true;

    const replaced = new Set<THREE.Material>();

    scene.traverse((v) => {
      if (!(v instanceof THREE.Mesh)) return;
      trackReplacedMaterials(replaced, v.material);

      if (v.name === "shadow") {
        v.raycast = () => {};
        v.material = createShadowMaterial(
          opacityProgress as THREE.UniformNode<"float", number>,
          shadowMap,
        );
        return;
      }

      const old = v.material as THREE.MeshStandardMaterial;
      const nodeMat = new THREE.MeshStandardNodeMaterial({ transparent: true });
      nodeMat.color.copy(old.color);
      nodeMat.roughness = old.roughness;
      nodeMat.metalness = old.metalness;
      nodeMat.aoMap = aoMap;
      nodeMat.aoMapIntensity = 0.6;
      nodeMat.opacityNode = opacityProgress;
      nodeMat.mrtNode = mrt({
        screenIntensity: selectionProgress.add(0.4).clamp(),
      });
      v.material = nodeMat;
    });

    disposeReplacedMaterials(replaced);
  }, []);

  return (
    <group ref={groupRef} position={center}>
      <group position={[-center.x, -center.y, -center.z]}>
        <Model
          selectionProgress={selectionProgress}
          position={[3.5, 0, 3.5]}
          rotation-z={-Math.PI * 0.15}
          scale={2}
          {...handlers}
        />
        {/* <primitive object={scene}  /> */}
      </group>
      <ObjectLabel name="aboutme" label="about me" />
    </group>
  );
}
