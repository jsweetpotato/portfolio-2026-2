import { useCallback, useEffect, useRef } from "react";

import { useAnimations, useGLTF, useTexture } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import { mrt } from "three/tsl";

import type { Props } from "@/types";
import { playActionSfx } from "@/audio/actionSfx";
import { useInteractiveObject } from "@/canvas/objects/useInteractiveObject";
import ObjectLabel from "@/components/ObjectLabel";
import {
  useInteractionStore,
  usePlaygroundStore,
} from "@/store/useInteractionStore";

import createShadowMaterial from "./materials/shadowMat";
import {
  disposeReplacedMaterials,
  trackReplacedMaterials,
} from "./materialUtils";

const FADE = 0.4;
const QUACK = "/sounds/duck-quack.mp3";

export default function Duck({ register, onClick, ...handlers }: Props) {
  const idleActions = useRef<THREE.AnimationAction[]>([]);
  const clipActions = useRef<THREE.AnimationAction[]>([]);

  const isPlayground = useInteractionStore((s) => s.selected === "playground");
  const { scene, animations } = useGLTF("/models/duck_anime.glb");
  const { actions, mixer } = useAnimations(animations, scene);
  const { groupRef, center, opacityProgress, selectionProgress } =
    useInteractiveObject(scene, register);
  const setIdx = usePlaygroundStore((s) => s.setIdx);
  const triggerDuckAnimation = usePlaygroundStore(
    (s) => s.triggerDuckAnimation,
  );

  const [aoMap, shadowMap] = useTexture([
    "/images/ao_duck2.webp",
    "/images/shadow_duck2.webp",
  ]);

  useEffect(() => {
    const idle: THREE.AnimationAction[] = [];
    const clips: THREE.AnimationAction[] = [];

    for (const [name, action] of Object.entries(actions)) {
      if (!action) continue;
      if (name.toLowerCase().includes("action")) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        clips.push(action);
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity);
        idle.push(action);
      }
    }

    idleActions.current = idle;
    clipActions.current = clips;

    return () => {
      for (const a of Object.values(actions)) a?.stop();
    };
  }, [actions]);

  const playIdle = useCallback(() => {
    if (idleActions.current.some((a) => a.isRunning())) return;
    clipActions.current.forEach((a) => a.fadeOut(FADE));
    idleActions.current.forEach((a) => {
      a.enabled = true;
      a.setEffectiveTimeScale(1);
      a.setEffectiveWeight(1);
      a.reset().fadeIn(FADE).play();
    });
  }, []);

  const playAction = useCallback(() => {
    idleActions.current.forEach((a) => a.fadeOut(FADE));
    clipActions.current.forEach((a) => {
      a.enabled = true;
      a.reset().fadeIn(FADE).play();
    });
  }, []);

  useEffect(() => {
    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (
        clipActions.current.includes(e.action) &&
        useInteractionStore.getState().selected === "playground"
      ) {
        playIdle();
      }
    };
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
  }, [mixer, playIdle]);

  useEffect(() => {
    if (isPlayground) playIdle();
    else for (const a of Object.values(actions)) a?.fadeOut(FADE);
  }, [isPlayground, playIdle, actions]);

  useEffect(() => {
    aoMap.flipY = false;
    aoMap.needsUpdate = true;

    const replaced = new Set<THREE.Material>();
    const template = new THREE.MeshStandardNodeMaterial({ transparent: true });
    template.opacityNode = opacityProgress;
    template.mrtNode = mrt({
      screenIntensity: selectionProgress.add(0.4).clamp(),
    });

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
      const nodeMat = template.clone();
      nodeMat.color.copy(old.color);
      nodeMat.roughness = old.roughness;
      nodeMat.metalness = old.metalness;
      nodeMat.aoMap = aoMap;
      nodeMat.aoMapIntensity = 0.6;
      v.material = nodeMat;
    });

    disposeReplacedMaterials(replaced);
  }, []);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      // Capture before onClick selects playground.
      const alreadyIn =
        useInteractionStore.getState().selected === "playground";

      onClick?.(e);
      // 첫 진입은 navigation 연출을 쓰고, 이미 playground일 때만 spit을 재생한다
      if (!alreadyIn) return;

      triggerDuckAnimation();
      e.stopPropagation();
      playActionSfx(QUACK);
      playAction();
      setIdx(Math.floor(Math.random() * 6));
    },
    [onClick, playAction, setIdx, triggerDuckAnimation],
  );

  return (
    <group ref={groupRef} position={center}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={scene} onClick={handleClick} {...handlers} />
      </group>

      <ObjectLabel label="playground" name="playground" position={[2, 5, 0]} />
    </group>
  );
}

useGLTF.preload("/models/duck_anime.glb");
