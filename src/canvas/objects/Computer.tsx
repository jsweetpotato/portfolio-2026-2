// Computer.tsx
import { useEffect, useRef } from "react";
import { createscreenMat } from "./materials/screenMat";
import type { Props } from "@/types";
import * as THREE from "three/webgpu";
import { useInteractionStore, useProjectStore } from "@/store/useInteractionStore";
import { uniform } from "three/tsl";
import { useInteractiveObject } from "@/canvas/objects/useInteractiveObject";
import { useGLTF, useTexture } from "@react-three/drei";
import createShadowMaterial from "./materials/shadowMat";
import ObjectLabel from "@/components/ObjectLabel";
import { disposeReplacedMaterials, trackReplacedMaterials } from "./materialUtils";

const VIDEO_LIST = ["/videos/grass_fixed.mp4", "/videos/healthyP_fixed.mp4", "/videos/grass_fixed.mp4"];

let sharedVideoTex: THREE.VideoTexture | null = null;

function getSharedVideo() {
  if (sharedVideoTex) return sharedVideoTex;

  const video = document.createElement("video");
  video.src = VIDEO_LIST[0];
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  // 크롬 절전 정지 방어: DOM에 숨겨서 붙이기
  video.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none";
  document.body.appendChild(video);

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  sharedVideoTex = videoTexture;
  return videoTexture;
}

export default function Computer({ register, ...handlers }: Props) {
  const isProjectSelected = useInteractionStore((s) => s.selected === "project");
  const idx = useProjectStore((s) => s.idx);

  const screenTex = useRef(getSharedVideo());
  const swipeProgress = useRef(uniform(0));

  const aoMap = useTexture("/images/ao_computer.webp");
  const shadowMap = useTexture("/images/shadow_computer.webp");
  const { scene } = useGLTF("/models/computer2.glb");
  const { groupRef, center, opacityProgress } = useInteractiveObject(scene, register, {
    selectionProgress: swipeProgress.current
  });

  useEffect(() => {
    const video = screenTex.current.source.data as HTMLVideoElement;
    const newSrc = VIDEO_LIST[idx];

    if (!video.src.endsWith(newSrc)) {
      video.src = newSrc;
      video.load();
    }

    if (isProjectSelected) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [idx, isProjectSelected]);

  useEffect(() => {
    aoMap.flipY = false;
    aoMap.needsUpdate = true;
  }, [aoMap]);

  useEffect(() => {
    const replacedMaterials = new Set<THREE.Material>();

    scene.traverse((v) => {
      if (v instanceof THREE.Mesh) {
        trackReplacedMaterials(replacedMaterials, v.material);

        if (v.name === "shadow") {
          const mat = createShadowMaterial(opacityProgress as THREE.UniformNode<"float", number>, shadowMap);
          v.raycast = () => {};
          v.material = mat;
        } else if (v.name === "screen") {
          v.material = createscreenMat(opacityProgress, swipeProgress.current, screenTex);
          v.receiveShadow = true;
        } else {
          v.castShadow = true;
          v.receiveShadow = true;
          const old = v.material as THREE.MeshStandardMaterial;
          const nodeMat = new THREE.MeshStandardNodeMaterial();
          nodeMat.color.copy(old.color);
          nodeMat.aoMap = aoMap;
          nodeMat.aoMapIntensity = 0.6;
          nodeMat.roughness = old.roughness;
          nodeMat.metalness = old.metalness;
          nodeMat.transparent = true;
          nodeMat.opacityNode = opacityProgress;
          v.material = nodeMat;
        }
      }
    });

    disposeReplacedMaterials(replacedMaterials);
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
