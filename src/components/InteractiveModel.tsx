import { useGLTF, useTexture } from "@react-three/drei";

import { useInteractiveObject } from "@/hooks/useInteractiveObject";
import { useSceneSetup } from "@/hooks/useSceneSetup";

import type { InteractiveModel_T } from "@/types";

export function InteractiveModel({ url, onMesh, register, shadow, ...handlers }: InteractiveModel_T) {
  const { scene } = useGLTF(url);

  const shadowMap = useTexture(shadow);

  const { groupRef, center, opacityProgress } = useInteractiveObject(scene, register);
  useSceneSetup(scene, opacityProgress, onMesh, shadowMap);

  return (
    <group ref={groupRef} position={center}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={scene} {...handlers} />
      </group>
    </group>
  );
}
