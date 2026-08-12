// PostProcessing.tsx
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { pass, mrt, output, float, mix, color, vec4 } from "three/tsl";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { halftoneLineNode as mobileHalftoneLineNode } from "@/canvas/nodes/HalftoneLineMobile";
import { optimizedHalftoneLineNode } from "@/canvas/nodes/HalftoneLineDesktop";
import { useSceneStore } from "@/canvas/scene/useSceneStore";
import { useInteractionStore } from "@/store/useInteractionStore";

const BLOOM_FADE_OUT_MS = 500;

interface PostProcessingProps {
  isMobile: boolean;
}

export function PostProcessing({ isMobile }: PostProcessingProps) {
  const { gl, camera } = useThree();
  const basePipelineRef = useRef<THREE.RenderPipeline | null>(null);
  const bloomPipelineRef = useRef<THREE.RenderPipeline | null>(null);
  const activePipelineRef = useRef<THREE.RenderPipeline | null>(null);
  const bloomFadeOutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const halftoneScene = useSceneStore((s) => s.halftoneScene);
  const layerScene = useSceneStore((s) => s.layerScene);
  const bloomSelected = useInteractionStore(
    (s) => s.selected === "project" || s.selected === "contact",
  );

  // pipeline은 한 번만 생성 (scene/camera 바뀔 때만 재생성)
  useEffect(() => {
    const renderer = gl as unknown as THREE.WebGPURenderer;
    const basePipeline = new THREE.RenderPipeline(renderer);
    const bloomPipeline = new THREE.RenderPipeline(renderer);
    basePipeline.outputColorTransform = false;
    bloomPipeline.outputColorTransform = false;
    basePipelineRef.current = basePipeline;
    bloomPipelineRef.current = bloomPipeline;
    activePipelineRef.current = basePipeline;

    return () => {
      basePipeline.dispose();
      bloomPipeline.dispose();
      basePipelineRef.current = null;
      bloomPipelineRef.current = null;
      activePipelineRef.current = null;
    };
  }, [gl]);

  // HalfTone Shading
  useEffect(() => {
    const layerScenePass = pass(layerScene, camera);
    const layerTex = layerScenePass.getTextureNode();
    const premult = layerTex.rgb.mul(layerTex.a);

    const haltfToneScenePass = pass(halftoneScene, camera);

    haltfToneScenePass.setMRT(
      mrt({
        output,
        bloomIntensity: float(0),
        screenIntensity: float(1),
      }),
    );

    const outputNode = haltfToneScenePass.getTextureNode("output");
    const bloomIntensityNode =
      haltfToneScenePass.getTextureNode("bloomIntensity");
    const screenIntensityNode =
      haltfToneScenePass.getTextureNode("screenIntensity");

    // const node = isMobile
    //   ? mobileHalftoneLineNode(outputNode)
    //   : optimizedHalftoneLineNode(outputNode);
    const node = mobileHalftoneLineNode(outputNode);

    const halftoneColor = mix(color("#514b47"), color("#d4ce9c"), node.r);
    const baseColor = mix(
      outputNode.rgb,
      halftoneColor.rgb,
      screenIntensityNode.r,
    );

    const baseFinalColor = baseColor.add(premult);
    const baseOutputNode = vec4(baseFinalColor.rgb, outputNode.a).renderOutput(
      THREE.ACESFilmicToneMapping,
      THREE.SRGBColorSpace,
    );

    if (basePipelineRef.current) {
      basePipelineRef.current.outputNode = baseOutputNode;
    }

    if (!isMobile && bloomPipelineRef.current) {
      const bloomPass = bloom(
        outputNode.mul(bloomIntensityNode),
        0.5,
        0.3,
        0.1,
      );
      const bloomFinalColor = baseColor.add(bloomPass).add(premult);
      bloomPipelineRef.current.outputNode = vec4(
        bloomFinalColor.rgb,
        outputNode.a,
      ).renderOutput(THREE.ACESFilmicToneMapping, THREE.SRGBColorSpace);
    }

    const selected = useInteractionStore.getState().selected;
    activePipelineRef.current =
      !isMobile && (selected === "project" || selected === "contact")
        ? bloomPipelineRef.current
        : basePipelineRef.current;
  }, [camera, halftoneScene, isMobile, layerScene]);

  useEffect(() => {
    if (bloomFadeOutRef.current) {
      clearTimeout(bloomFadeOutRef.current);
      bloomFadeOutRef.current = null;
    }

    // bloom outputNode는 !isMobile일 때만 세팅됨 — 빈 파이프라인 render → 파란/깨진 화면
    if (isMobile) {
      activePipelineRef.current = basePipelineRef.current;
      return;
    }

    if (bloomSelected) {
      activePipelineRef.current = bloomPipelineRef.current;
      return;
    }

    if (activePipelineRef.current === bloomPipelineRef.current) {
      bloomFadeOutRef.current = setTimeout(() => {
        activePipelineRef.current = basePipelineRef.current;
        bloomFadeOutRef.current = null;
      }, BLOOM_FADE_OUT_MS);
    } else {
      activePipelineRef.current = basePipelineRef.current;
    }

    return () => {
      if (bloomFadeOutRef.current) {
        clearTimeout(bloomFadeOutRef.current);
        bloomFadeOutRef.current = null;
      }
    };
  }, [bloomSelected]);

  useFrame(() => {
    activePipelineRef.current?.render();
  }, 1);

  return null;
}
