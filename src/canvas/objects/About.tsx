import { useEffect, useMemo, useRef } from "react";

import { useAnimations, useGLTF, useTexture } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import { mrt, texture, vec2, uv, color, mul, max } from "three/tsl";

import type { Props } from "@/types";
import {
  useAboutStore,
  useInteractionStore,
} from "@/store/useInteractionStore";
import { useInteractiveObject } from "@/canvas/objects/useInteractiveObject";
import ObjectLabel from "@/components/ObjectLabel";
import { createFaceMat } from "./materials/faceMat";

// --- layout ---
const SCALE = 2.3;
const Y_DOWN = -4.4;
const Y_UP = 0;
const PLACE = { x: 3, z: 2.5 };
const ROT_Y = -Math.PI * 0.15;
const FADE = 0.35;
const FADE_OUT_PROGRESS = 0.2;

// --- face ---
const FACE = {
  smile: { eyeL: 0.48, eyeR: 0.48, mouse: 0.3 },
  smile2: { eyeL: 0.23, eyeR: 0.23, mouse: 0.3 },
  default: { eyeL: -0.02, eyeR: -0.02, mouse: 0.02 },
  blink: { eyeL: 0.67, eyeR: 0.67, mouse: 0.02 },
  wink: { eyeL: 0.23, eyeR: 0.48, mouse: 0.02 },
  sad: { eyeL: 0.67, eyeR: 0.67, mouse: 0.78 },
} as const;

type FaceName = keyof typeof FACE;
type FaceMode = "waving" | "idle" | "dance" | null;

const FACE_PARTS = new Set(["eyeL", "eyeR", "mouse"]);
const BLINK_DUR = 0.15;
const DANCE_FPS = 24;
const SMILE_FACES = ["smile", "smile2"] as const satisfies FaceName[];

function applyFace(name: FaceName) {
  const f = FACE[name];
  const s = useAboutStore.getState();
  s.setEyeL(f.eyeL);
  s.setEyeR(f.eyeR);
  s.setMouse(f.mouse);
}

function pickFace(names: readonly FaceName[]) {
  return names[Math.floor(Math.random() * names.length)];
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function faceForDanceFrame(frame: number): FaceName {
  if (frame <= 78) return "sad";
  if (frame <= 100) return "wink";
  return SMILE_FACES[Math.floor(frame / 128) % 2];
}

type FaceState = {
  mode: FaceMode;
  timer: number;
  blinkHold: number;
  lastDanceFace: FaceName | null;
};

function enterFace(face: FaceState, mode: FaceMode) {
  face.mode = mode;
  face.blinkHold = 0;
  face.lastDanceFace = null;
  if (mode === "waving") {
    applyFace(pickFace(SMILE_FACES));
  } else if (mode === "idle") {
    applyFace("default");
    face.timer = rand(2, 4);
  } else if (mode === "dance") {
    applyFace("sad");
    face.lastDanceFace = "sad";
  }
}

function tickFace(
  face: FaceState,
  dt: number,
  danceAction?: THREE.AnimationAction | null,
) {
  if (!face.mode || face.mode === "waving") return;

  if (face.mode === "dance") {
    if (!danceAction?.isRunning()) return;
    const next = faceForDanceFrame(Math.floor(danceAction.time * DANCE_FPS));
    if (next !== face.lastDanceFace) {
      applyFace(next);
      face.lastDanceFace = next;
    }
    return;
  }

  if (face.blinkHold > 0) {
    face.blinkHold -= dt;
    if (face.blinkHold <= 0) {
      applyFace("default");
      face.timer = rand(2, 4);
    }
    return;
  }

  face.timer -= dt;
  if (face.timer > 0) return;

  applyFace("blink");
  face.blinkHold = BLINK_DUR;
}

export default function About({ register, onClick, ...handlers }: Props) {
  const progress = useRef(0);
  const riseRef = useRef<THREE.Group>(null);
  const stoppedRef = useRef(false);
  const actionsRef = useRef<ReturnType<typeof useAnimations>["actions"]>({});
  const face = useRef<FaceState>({
    mode: null,
    timer: 0,
    blinkHold: 0,
    lastDanceFace: null,
  });

  const api = useRef({
    playIdle: () => {},
    playOnce: (_: "waving" | "dance") => {},
  });

  // --- assets ---
  const face_atlas = useTexture("/images/face_atlas.webp");
  const diffuse = useTexture("/images/base_color.webp");
  const shadowTexture = useTexture("/images/shadow_model.webp");

  const { scene, animations } = useGLTF("/models/model.glb");
  const { scene: shadow } = useGLTF("/models/model_shadow.glb");

  const { animations: wavingClips } = useGLTF("/models/model_waving.glb");
  const { animations: danceClips } = useGLTF("/models/model_dance2.glb");
  const { groupRef, center, opacityProgress, selectionProgress } =
    useInteractiveObject(scene, register);

  const clips = useMemo(
    () => [animations[0], wavingClips[0], danceClips[0]].filter(Boolean),
    [animations, wavingClips, danceClips],
  );
  const { ref, actions, mixer } = useAnimations(clips, scene);
  actionsRef.current = actions;

  // --- body animation ---
  api.current.playIdle = () => {
    const idle = actionsRef.current.idle;
    if (!idle) return;
    for (const a of Object.values(actionsRef.current)) {
      if (a && a !== idle) a.fadeOut(FADE);
    }
    idle.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(FADE).play();
    enterFace(face.current, "idle");
  };

  api.current.playOnce = (name) => {
    const action = actionsRef.current[name];
    if (!action) return;
    for (const a of Object.values(actionsRef.current)) {
      if (a && a !== action) a.fadeOut(FADE);
    }
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.fadeIn(FADE).play();
    enterFace(face.current, name);
  };

  // --- materials (once) ---
  useEffect(() => {
    diffuse.flipY = false;
    diffuse.needsUpdate = true;
    face_atlas.flipY = false;
    face_atlas.needsUpdate = true;

    const bodyMat = new THREE.MeshStandardNodeMaterial({
      map: diffuse,
      transparent: true,
      metalness: 0.25,
      roughness: 0.7,
      alphaTest: 0.1,
    });
    bodyMat.opacityNode = opacityProgress;

    bodyMat.mrtNode = mrt({
      screenIntensity: selectionProgress.add(0.4).clamp(),
    });
    const faceOffsets = useAboutStore.getState();

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (FACE_PARTS.has(child.name)) {
        child.material = createFaceMat(
          face_atlas,
          selectionProgress,
          opacityProgress,
          faceOffsets[child.name as "eyeL" | "eyeR" | "mouse"],
        );
      } else {
        child.material = bodyMat;
      }
    });
  }, []);

  // -----------------------------Shadow -------------------------------

  useEffect(() => {
    const mat = new THREE.MeshBasicNodeMaterial({ transparent: true });

    const alpha = texture(
      shadowTexture,
      vec2(uv().x, uv().y.oneMinus()),
    ).r.toVar();
    mat.colorNode = color("#2d2d2d").mul(alpha);
    mat.opacityNode = opacityProgress.mul(selectionProgress).pow(2);
    mat.alphaTestNode = alpha.step(0.1).oneMinus();

    shadow.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.material = mat;
    });
  }, []);

  // --- interaction ---
  useEffect(() => {
    const onSelect = (selected: string | null, prev: string | null) => {
      if (selected === prev) return;
      if (selected === "aboutme") {
        api.current.playOnce("waving");
        return;
      }
      if (prev === "aboutme") {
        useAboutStore.getState().stopAboutDance();
        face.current.mode = null;
      }
    };

    onSelect(useInteractionStore.getState().selected, null);

    const unsubSelect = useInteractionStore.subscribe((s, p) =>
      onSelect(s.selected, p.selected),
    );

    const unsubDance = useAboutStore.subscribe((s, p) => {
      if (s.aboutDancing === p.aboutDancing) return;
      if (useInteractionStore.getState().selected !== "aboutme") return;
      if (s.aboutDancing) api.current.playOnce("dance");
      else api.current.playIdle();
    });

    return () => {
      unsubSelect();
      unsubDance();
    };
  }, []);

  useEffect(() => {
    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (useInteractionStore.getState().selected !== "aboutme") return;
      const name = e.action.getClip().name;
      if (name === "waving") api.current.playIdle();
      else if (name === "dance") useAboutStore.getState().stopAboutDance();
    };
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
  }, [mixer]);

  // --- frame ---
  useFrame((_, dt) => {
    const selected = useInteractionStore.getState().selected === "aboutme";
    progress.current = THREE.MathUtils.damp(
      progress.current,
      selected ? 1 : 0,
      4,
      dt,
    );
    if (riseRef.current) {
      riseRef.current.position.y = THREE.MathUtils.lerp(
        Y_DOWN,
        Y_UP,
        progress.current,
      );
    }

    if (selected) {
      tickFace(face.current, dt, actionsRef.current.dance);
      stoppedRef.current = false;
      return;
    }
    if (!stoppedRef.current && progress.current <= FADE_OUT_PROGRESS) {
      for (const a of Object.values(actionsRef.current)) a?.fadeOut(FADE);
      stoppedRef.current = true;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[center.x + PLACE.x, center.y, center.z + PLACE.z]}
      rotation-y={ROT_Y}
    >
      <group ref={riseRef}>
        <group position={[-center.x, -center.y, -center.z]} scale={SCALE}>
          <primitive
            ref={ref}
            object={scene}
            {...handlers}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onClick(e);
              applyFace(pickFace(SMILE_FACES));
            }}
          />
        </group>
      </group>
      <primitive object={shadow} position={[-0.5, 0, -0.5]} scale={SCALE} />
      <ObjectLabel name="aboutme" label="about me" />
    </group>
  );
}
