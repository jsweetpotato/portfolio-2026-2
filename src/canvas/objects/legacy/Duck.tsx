// Duck.tsx
import * as THREE from "three/webgpu";

import { useGLTF } from "@react-three/drei";
import { useInteractiveObject } from "@/hooks/useInteractiveObject";
import { useSceneSetup } from "@/hooks/useSceneSetup";

import type { Props } from "@/types";

export default function Duck({ register, ...handlers }: Props) {
  const { scene } = useGLTF("/models/duck2.glb", "/draco/");
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

useGLTF.preload("/models/duck2.glb");
