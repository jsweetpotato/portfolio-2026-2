import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { uniform } from "three/tsl";
import * as THREE from "three/webgpu";

import type { UniformLike } from "@/types";

export function useInteractiveObject(scene: THREE.Object3D, register?: (u: UniformLike, u2: UniformLike) => void, opts?: { scaleAmount?: number }) {
  const { scaleAmount = 0.1 } = opts ?? {};
  const groupRef = useRef<THREE.Group>(null);
  const progress = useMemo(() => uniform(0), []);
  const progress2 = useMemo(() => uniform(1), []);

  // 중심 계산 (centered 옵션일 때만)
  const center = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    center.setY(0);
    return center;
  }, [scene]);

  useEffect(() => {
    register?.(progress, progress2);
  }, [progress, progress2, register]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.scale.setScalar(progress.value * scaleAmount + 1);
  });

  return { groupRef, scaleProgress: progress, opacityProgress: progress2, center };
}
