import { useCallback, useEffect, useRef } from "react";
import type { Props } from "@/types";
import * as THREE from "three/webgpu";
import { useAnimations, useGLTF, useTexture } from "@react-three/drei";
import { useInteractiveObject } from "@/canvas/objects/useInteractiveObject";
import createShadowMaterial from "./materials/shadowMat";
import ObjectLabel from "@/components/ObjectLabel";
import type { ThreeEvent } from "@react-three/fiber";
import { useInteractionStore, usePlaygroundStore } from "@/store/useInteractionStore";
import createHologramMat from "./materials/hologramMat";
import { uniform } from "three/tsl";
import { disposeReplacedMaterials, trackReplacedMaterials } from "./materialUtils";

const FADE = 0.4;

export default function Duck({ register, onClick, ...handlers }: Props) {
  // --- Refs ---
  const idleAnime = useRef<THREE.AnimationAction[]>([]);
  const actionAnime = useRef<THREE.AnimationAction[]>([]);
  const isPlaygroundRef = useRef(false);
  const swipeProgress = useRef(uniform(0));

  // --- Store & Hooks ---
  const isPlayground = useInteractionStore((s) => s.selected === "playground");
  const { scene, animations } = useGLTF("/models/duck_anime.glb");
  const { actions, mixer } = useAnimations(animations, scene);
  const { groupRef, center, opacityProgress } = useInteractiveObject(scene, register, {
    selectionProgress: swipeProgress.current
  });
  const setIdx = usePlaygroundStore((s) => s.setIdx);

  // --- Textures ---
  const [aoMap, shadowMap] = useTexture(["/images/ao_duck2.webp", "/images/shadow_duck2.webp"]);

  // 최신 selected 값 동기화
  useEffect(() => {
    isPlaygroundRef.current = isPlayground;
  }, [isPlayground]);

  // 텍스처 초기 세팅 (로드 완료 시 1회)
  useEffect(() => {
    aoMap.flipY = false;
    aoMap.needsUpdate = true;
  }, [aoMap]);

  // --- Animation Setup ---
  useEffect(() => {
    idleAnime.current = [];
    actionAnime.current = [];

    Object.entries(actions).forEach(([name, action]) => {
      if (!action) return;

      // 'action'이라는 이름이 포함된 경우 1회 재생 설정
      if (name.toLowerCase().includes("action")) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        actionAnime.current.push(action);
      } else {
        // 나머지는 Idle(반복)로 분류
        action.setLoop(THREE.LoopRepeat, Infinity);
        idleAnime.current.push(action);
      }
    });

    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions]);

  // --- Playback Controllers ---
  const playIdle = useCallback(() => {
    // 액션이 재생 중이 아닐 때 중복 실행 방지
    if (idleAnime.current.some((a) => a.isRunning())) return;

    actionAnime.current.forEach((a) => a.fadeOut(FADE));
    idleAnime.current.forEach((a) => {
      a.enabled = true; // Three.js 버그 방지 1
      a.setEffectiveTimeScale(1);
      a.setEffectiveWeight(1); // Three.js 버그 방지 2 (강제 가중치 복구)
      a.reset();
      a.fadeIn(FADE);
      a.play();
    });
  }, []);

  const playAction = useCallback(() => {
    idleAnime.current.forEach((a) => a.fadeOut(FADE));
    actionAnime.current.forEach((a) => {
      a.enabled = true;
      a.reset();
      a.fadeIn(FADE);
      a.play();
    });
  }, []);

  const stopAll = useCallback(() => {
    Object.values(actions).forEach((a) => a?.fadeOut(FADE));
    // isActionPlaying.current = false;
  }, [actions]);

  // --- Event Listeners ---
  useEffect(() => {
    if (!mixer) return;
    const onFinished = (e: { action: THREE.AnimationAction }) => {
      // Action 트랙 중 하나가 끝났을 때만 실행하며,
      // isActionPlaying이 true일 때만 playIdle을 호출하여 다중 콜백 스팸을 방지합니다.
      if (actionAnime.current.includes(e.action) && isPlaygroundRef.current) {
        playIdle();
      }
    };
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
  }, [mixer, playIdle]);

  // 선택 상태 변경에 따른 애니메이션 제어
  useEffect(() => {
    if (isPlayground) {
      playIdle();
    } else {
      stopAll();
    }
  }, [isPlayground]);

  // --- Material Assignment ---
  useEffect(() => {
    const replacedMaterials = new Set<THREE.Material>();

    scene.traverse((v) => {
      if (!(v instanceof THREE.Mesh)) return;
      trackReplacedMaterials(replacedMaterials, v.material);

      if (v.name === "shadow") {
        const mat = createShadowMaterial(opacityProgress as THREE.UniformNode<"float", number>, shadowMap);
        v.raycast = () => {};
        v.material = mat;
      } else {
        v.castShadow = true;
        v.receiveShadow = true;

        const old = v.material as THREE.MeshStandardMaterial;
        const nodeMat = createHologramMat(opacityProgress, swipeProgress.current);

        // 속성 복사
        nodeMat.color.copy(old.color);
        nodeMat.roughness = old.roughness;
        nodeMat.metalness = old.metalness;
        nodeMat.transparent = true;
        nodeMat.aoMap = aoMap;
        nodeMat.aoMapIntensity = 0.6;

        v.material = nodeMat;
      }
    });

    disposeReplacedMaterials(replacedMaterials);
  }, []);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      onClick?.(e);

      if (!isPlaygroundRef.current) return;
      e.stopPropagation();
      playAction();
      setIdx(Math.floor(Math.random() * 5) + 1);
    },
    [onClick, playAction, setIdx]
  );

  return (
    <group ref={groupRef} position={center}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={scene} onClick={handleClick} {...handlers} />
      </group>
      <ObjectLabel label="playground" name="playground" />
    </group>
  );
}

useGLTF.preload("/models/duck_anime.glb");
