import { useEffect } from "react";

import type { Props } from "@/types";
import * as THREE from "three/webgpu";
import { useGLTF, useTexture } from "@react-three/drei";
import { useInteractiveObject } from "@/canvas/objects/useInteractiveObject";
import createShadowMaterial from "./materials/shadowMat";
import ObjectLabel from "@/components/ObjectLabel";
import {
  disposeReplacedMaterials,
  trackReplacedMaterials,
} from "./materialUtils";

export default function Book({ register, ...handlers }: Props) {
  const aoMap = useTexture("/images/ao_book.webp");
  const shadowMap = useTexture("/images/shadow_book.webp");
  const { scene } = useGLTF("/models/books2.glb");

  useEffect(() => {
    aoMap.flipY = false;
    aoMap.needsUpdate = true;
  }, [aoMap]);
  const { groupRef, center, opacityProgress } = useInteractiveObject(
    scene,
    register,
  );

  useEffect(() => {
    const replacedMaterials = new Set<THREE.Material>();

    scene.traverse((v) => {
      if (v instanceof THREE.Mesh) {
        trackReplacedMaterials(replacedMaterials, v.material);

        if (v.name === "shadow") {
          const mat = createShadowMaterial(
            opacityProgress as THREE.UniformNode<"float", number>,
            shadowMap,
          );
          v.raycast = () => {};
          v.material = mat;
        } else {
          v.castShadow = true;
          v.receiveShadow = true;
          const old = v.material as THREE.MeshStandardMaterial;
          const nodeMat = new THREE.MeshStandardNodeMaterial();
          nodeMat.color.copy(old.color);

          nodeMat.aoMap = aoMap;
          nodeMat.aoMapIntensity = 0.6;
          nodeMat.roughness = old.roughness;
          nodeMat.metalness = old.metalness;
          nodeMat.transparent = true;
          nodeMat.opacityNode = opacityProgress; // 흐림 연결
          v.material = nodeMat;
        }
      }
    });

    disposeReplacedMaterials(replacedMaterials);
  }, []);

  // return <InteractiveModel url={"/models/coffee2.glb"} shadow="/shadow_coffee.png"  register={register} onMesh={onMesh} {...handlers} />;
  return (
    <group ref={groupRef} position={center}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={scene} {...handlers} />
      </group>
      <ObjectLabel name="aboutme" label="about me" />
    </group>
  );
}
