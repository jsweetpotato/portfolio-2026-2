import { useGLTF, useTexture } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";

import * as THREE from "three/webgpu";
import { createFloorMat } from "./materials/floorMat";
import { useSceneStore } from "@/store/useSceneStore";

export default function Floor(props: ThreeElements["mesh"]) {
  const pointLight = useSceneStore((s) => s.pointLight);
  const tex = useTexture("/images/PerlinNoise.png");

  useEffect(() => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
  });

  const mat = useMemo(() => {
    return createFloorMat(pointLight, tex);
  }, []);

  return (
    <mesh name="floor" rotation-x={-Math.PI / 2}>
      <planeGeometry args={[64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

useGLTF.preload("/models/coffee.glb");
