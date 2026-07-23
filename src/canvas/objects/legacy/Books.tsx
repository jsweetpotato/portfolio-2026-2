// Books.tsx

import { useGLTF } from "@react-three/drei";
import { useInteractiveObject } from "@/hooks/useInteractiveObject";
import { useSceneSetup } from "@/hooks/useSceneSetup";

import type { Props } from "@/types";

export default function Books({ register, ...handlers }: Props) {
  const { scene } = useGLTF("/models/books2.glb", "/draco/");
  const { groupRef, center } = useInteractiveObject(scene, register);

  useSceneSetup(scene);

  return (
    <group ref={groupRef} position={center} {...handlers}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

useGLTF.preload("/models/books2.glb");
