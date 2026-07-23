import { useEffect, useMemo, useRef } from "react";
import { uniform } from "three/tsl";
import * as THREE from "three/webgpu";

import type { InteractiveRegistration, UniformLike } from "@/types";

interface InteractiveObjectOptions {
  scaleAmount?: number;
  selectionProgress?: UniformLike;
}

export function useInteractiveObject(scene: THREE.Object3D, register?: (registration: InteractiveRegistration) => void, opts?: InteractiveObjectOptions) {
  const { scaleAmount = 0.1, selectionProgress } = opts ?? {};
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
    register?.({
      groupRef,
      scaleProgress: progress,
      opacityProgress: progress2,
      scaleAmount,
      selectionProgress
    });
  }, [progress, progress2, register, scaleAmount, selectionProgress]);

  return { groupRef, scaleProgress: progress, opacityProgress: progress2, center };
}
