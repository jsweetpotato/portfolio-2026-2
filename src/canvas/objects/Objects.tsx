import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

import Coffee from "./Coffee";
import Computer from "./Computer";

import * as THREE from "three/webgpu";
import Floor from "./Floor";
import { useInteractionStore } from "@/store/useInteractionStore";
import { useCallback, useRef } from "react";
import { MathUtils } from "three/webgpu";
import type { InteractiveRegistration } from "@/types";

import Duck from "./Duck";
import Book from "./Book";

// 선택 시 정면으로 와야 하는 목표 각도(라디안). 0 = 카메라가 원래 바라보던 정면 기준
// 오브젝트가 그룹 내에서 실제 배치된 위치의 각도(atan2(x, z))와 맞춰서 값을 조정하세요.
const FRONT_ANGLE: Record<string, number> = {
  playground: 0,
  aboutme: Math.PI / 2,
  project: 0,
  contact: Math.PI / 3
};

// 최단 경로로 회전하도록 각도 차이를 -PI ~ PI 범위로 정규화
function shortestAngleDiff(from: number, to: number) {
  let diff = (to - from) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export default function Objects() {
  const objRef = useRef<THREE.Group | null>(null);

  const setHovered = useInteractionStore((s) => s.setHovered);
  const select = useInteractionStore((s) => s.select);

  const registrations = useRef<Record<string, InteractiveRegistration>>({});
  const register = useCallback((name: string, registration: InteractiveRegistration) => {
    registrations.current[name] = registration;
  }, []);

  useFrame((_, dt) => {
    const hovered = useInteractionStore.getState().hovered;
    const selected = useInteractionStore.getState().selected;

    for (const [name, registration] of Object.entries(registrations.current)) {
      const target = hovered === name && !selected ? 1 : 0;
      registration.scaleProgress.value = MathUtils.damp(registration.scaleProgress.value, target, 8, dt);

      const isDimmed = selected && selected !== name;
      const opacityTarget = isDimmed ? 0 : 1;
      registration.opacityProgress.value = MathUtils.damp(registration.opacityProgress.value, opacityTarget, 8, dt);

      registration.groupRef.current?.scale.setScalar(registration.scaleProgress.value * registration.scaleAmount + 1);

      if (registration.selectionProgress) {
        const selectionTarget = selected === name ? 1 : 0;
        registration.selectionProgress.value = MathUtils.damp(registration.selectionProgress.value, selectionTarget, 8, dt);
      }
    }

    if (!objRef.current) return;

    // if (selected && FRONT_ANGLE[selected] !== undefined) {
    //   // 선택됨: 회전 멈추고 목표 각도로 스냅(보간)
    //   const current = objRef.current.rotation.y;
    //   const targetAngle = current + shortestAngleDiff(current, FRONT_ANGLE[selected]);
    //   objRef.current.rotation.y = MathUtils.damp(current, targetAngle, 6, dt);
    // } else {
    //   // 선택 안 됨: 자유 회전
    //   objRef.current.rotation.y += dt * 0.06;
    // }
  });

  const over = useCallback(
    (name: string) => (e: ThreeEvent<PointerEvent>) => {
      const selected = useInteractionStore.getState().selected;
      if (selected && selected !== name) {
        document.body.style.cursor = "auto"; // 커서 강제 복구
        return;
      }
      e.stopPropagation();
      setHovered(name);
      document.body.style.cursor = "pointer";
    },
    []
  );

  const out = useCallback(() => {
    setHovered(null);
    document.body.style.cursor = "auto";
  }, []);

  const click = useCallback(
    (name: string) => (e: ThreeEvent<MouseEvent>) => {
      // 이 오브젝트가 현재 흐려진(사실상 안 보이는) 상태인지 확인
      const u = registrations.current[name];
      const isDimmed = u && u.opacityProgress.value < 0.15; // 임계값

      if (isDimmed) {
        // 사용자 입장에선 빈 공간 클릭 → 선택 해제
        select(null);
        return; // stopPropagation 안 함 → 이 오브젝트로 전환 안 됨
      }

      e.stopPropagation();
      select(name);
    },
    [select]
  );

  const bind = (name: string) => ({
    onPointerOver: over(name),
    onPointerOut: out,
    onClick: click(name),
    register: (registration: InteractiveRegistration) => register(name, registration)
  });

  return (
    <group ref={objRef}>
      <Book {...bind("aboutme")} />
      <Duck {...bind("playground")} />
      <Computer {...bind("project")} />
      <Coffee {...bind("contact")} />
      <Floor />
    </group>
  );
}

useGLTF.preload("/models/books2.glb");
useGLTF.preload("/models/coffee2.glb");
useGLTF.preload("/models/computer2.glb");
