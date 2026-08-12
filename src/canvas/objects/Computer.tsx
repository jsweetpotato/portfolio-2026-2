import { useEffect, useRef } from "react";

import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three/webgpu";

import type { Props } from "@/types";
import { useInteractiveObject } from "@/canvas/objects/useInteractiveObject";
import ObjectLabel from "@/components/ObjectLabel";
import {
  useInteractionStore,
  useProjectStore,
} from "@/store/useInteractionStore";

import { createscreenMat } from "./materials/screenMat";
import createShadowMaterial from "./materials/shadowMat";
import {
  disposeReplacedMaterials,
  trackReplacedMaterials,
} from "./materialUtils";

const VIDEO_LIST = [
  "/videos/grass_fixed.mp4",
  "/videos/portfolio_fixed.mp4",
  "/videos/healthyP_fixed.mp4",
];

let sharedVideoTex: THREE.VideoTexture | null = null;

function getSharedVideo() {
  if (sharedVideoTex) return sharedVideoTex;

  const video = document.createElement("video");
  video.src = VIDEO_LIST[0];
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  // Keep in DOM so Chrome doesn't throttle the hidden video.
  video.style.cssText =
    "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none";
  document.body.appendChild(video);

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  sharedVideoTex = videoTexture;
  return videoTexture;
}

export default function Computer({ register, ...handlers }: Props) {
  const isProjectSelected = useInteractionStore(
    (s) => s.selected === "project",
  );
  const idx = useProjectStore((s) => s.idx);

  const screenTex = useRef(getSharedVideo());
  const aoMap = useTexture("/images/ao_computer.webp");
  const shadowMap = useTexture("/images/shadow_computer.webp");
  const { scene } = useGLTF("/models/computer2.glb");
  const { groupRef, center, opacityProgress, selectionProgress } =
    useInteractiveObject(scene, register);

  useEffect(() => {
    const video = screenTex.current.source.data as HTMLVideoElement;
    const next = VIDEO_LIST[idx];

    if (!video.src.endsWith(next)) {
      video.src = next;
      video.load();
    }

    if (isProjectSelected) video.play().catch(() => {});
    else video.pause();
  }, [idx, isProjectSelected]);

  useEffect(() => {
    aoMap.flipY = false;
    aoMap.needsUpdate = true;

    const replaced = new Set<THREE.Material>();

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

      if (v.name === "screen") {
        v.material = createscreenMat(
          opacityProgress,
          selectionProgress,
          screenTex,
        );
        return;
      }

      const old = v.material as THREE.MeshStandardMaterial;
      const nodeMat = new THREE.MeshStandardNodeMaterial({ transparent: true });
      nodeMat.color.copy(old.color);
      nodeMat.roughness = old.roughness;
      nodeMat.metalness = old.metalness;
      nodeMat.aoMap = aoMap;
      nodeMat.aoMapIntensity = 0.6;
      nodeMat.opacityNode = opacityProgress;
      v.material = nodeMat;
    });

    disposeReplacedMaterials(replaced);
  }, []);

  return (
    <group ref={groupRef} position={center}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={scene} {...handlers} />
      </group>
      <ObjectLabel label="project" name="project" />
    </group>
  );
}
