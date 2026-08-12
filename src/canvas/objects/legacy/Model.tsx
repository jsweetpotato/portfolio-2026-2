import { useInteractionStore } from "@/store/useInteractionStore";
import { useAnimations, useGLTF, useTexture } from "@react-three/drei";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { mrt } from "three/tsl";

const Y0 = -3;
const FADE = 0.35;

type ModelProps = {
  selectionProgress: THREE.UniformNode<"float", number>;
} & Omit<ThreeElements["primitive"], "object">;

export default function Model({ selectionProgress, ...props }: ModelProps) {
  const progress = useRef(0);

  const face_atlas = useTexture("/images/face_atlas.webp");
  const diffuse = useTexture("/images/base_color.webp");
  const { scene, animations } = useGLTF("/models/model.glb");
  const { animations: wavingClips } = useGLTF("/models/model_waving.glb");
  const { animations: danceClips } = useGLTF("/models/model_dance.glb");

  const clips = useMemo(
    () => [animations[0], wavingClips[0], danceClips[0]],
    [animations, wavingClips, danceClips],
  );

  const { ref, actions, mixer } = useAnimations(clips, scene);

  const fadeOthers = (keep: THREE.AnimationAction) => {
    for (const a of Object.values(actions)) {
      if (a && a !== keep) a.fadeOut(FADE);
    }
  };

  const playIdle = () => {
    const idle = actions.idle;
    if (!idle) return;
    fadeOthers(idle);
    idle.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(FADE).play();
  };

  const playOnce = (name: "waving" | "dance") => {
    const action = actions[name];
    if (!action) return;
    fadeOthers(action);
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.fadeIn(FADE).play();
  };

  // material + pose (once)
  useEffect(() => {
    diffuse.flipY = false;
    diffuse.needsUpdate = true;
    const faceMat = new THREE.MeshBasicNodeMaterial({
      map: face_atlas,
    });
    faceMat.mrtNode = mrt({ screenIntensity: selectionProgress });
    const mat = new THREE.MeshStandardNodeMaterial({ map: diffuse });
    mat.mrtNode = mrt({ screenIntensity: selectionProgress });
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      if (child.name.includes("face")) {
        console.log("face");
        child.material = faceMat;
      } else child.material = mat;
    });
  }, []);

  // enter aboutme → waving; leave → stop
  useEffect(() => {
    const onSelect = (selected: string | null, prev: string | null) => {
      if (selected === prev) return;
      if (selected === "aboutme") {
        playOnce("waving");
        return;
      }
      if (prev === "aboutme") {
        useInteractionStore.getState().stopAboutDance();
        for (const a of Object.values(actions)) a?.fadeOut(0.2);
      }
    };

    onSelect(useInteractionStore.getState().selected, null);

    return useInteractionStore.subscribe((s, p) =>
      onSelect(s.selected, p.selected),
    );
  }, []);

  // Dance? / Stop
  useEffect(() => {
    return useInteractionStore.subscribe((s, p) => {
      if (s.aboutDancing === p.aboutDancing) return;
      if (s.aboutDancing) playOnce("dance");
      else if (p.aboutDancing) playIdle();
    });
  }, []);

  // clip finished → next
  useEffect(() => {
    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (useInteractionStore.getState().selected !== "aboutme") return;
      const name = e.action.getClip().name;

      if (name === "waving") {
        playIdle();
        return;
      }
      if (name === "dance") {
        // stopAboutDance → subscribe plays idle
        useInteractionStore.getState().stopAboutDance();
      }
    };
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
  }, [mixer]);

  useFrame((_, dt) => {
    const selected = useInteractionStore.getState().selected === "aboutme";
    progress.current = THREE.MathUtils.damp(
      progress.current,
      selected ? 1 : 0,
      4,
      dt,
    );
    if (ref.current) {
      ref.current.position.y = THREE.MathUtils.lerp(Y0, 0, progress.current);
    }
  });

  return <primitive ref={ref} object={scene} {...props} />;
}
