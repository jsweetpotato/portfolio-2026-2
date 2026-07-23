// PostProcessing.tsx
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { pass, mrt, output, float, mix, color, vec4 } from "three/tsl";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { halftoneLineNode as mobileHalftoneLineNode } from "./HalftoneLineNode2";
import { optimizedHalftoneLineNode } from "./HalftoneLineNodeOptimized";
import { useSceneStore } from "@/store/useSceneStore";

interface PostProcessingProps {
  isMobile: boolean;
}

export function PostProcessing({ isMobile }: PostProcessingProps) {
  const { gl, camera } = useThree();
  const pipelineRef = useRef<THREE.RenderPipeline | null>(null);

  const halftoneScene = useSceneStore((s) => s.halftoneScene);
  const layerScene = useSceneStore((s) => s.layerScene);

  // pipeline은 한 번만 생성 (scene/camera 바뀔 때만 재생성)
  useEffect(() => {
    const pipeline = new THREE.RenderPipeline(
      gl as unknown as THREE.WebGPURenderer,
    );
    pipeline.outputColorTransform = false;
    pipelineRef.current = pipeline;

    return () => {
      pipeline.dispose();

      if (pipelineRef.current === pipeline) {
        pipelineRef.current = null;
      }
    };
  }, [gl]);

  // HalfTone Shading
  useEffect(() => {
    const layerScenePass = pass(layerScene, camera);
    const layerTex = layerScenePass.getTextureNode();
    const premult = layerTex.rgb.mul(layerTex.a);

    const haltfToneScenePass = pass(halftoneScene, camera);

    haltfToneScenePass.setMRT(
      isMobile
        ? mrt({
            output,
            screenIntensity: float(1),
          })
        : mrt({
            output,
            bloomIntensity: float(0),
            screenIntensity: float(1),
          }),
    );

    const outputNode = haltfToneScenePass.getTextureNode("output");
    const screenIntensityNode =
      haltfToneScenePass.getTextureNode("screenIntensity");

    const node = isMobile
      ? mobileHalftoneLineNode(outputNode)
      : optimizedHalftoneLineNode(outputNode);

    const halftoneColor = mix(color("#514b47"), color("#d4ce9c"), node.r);
    const baseColor = mix(
      outputNode.rgb,
      halftoneColor.rgb,
      screenIntensityNode.r,
    );

    // 알파로 마스킹해서 배경 위에 얹기
    const scene = isMobile
      ? baseColor
      : baseColor.add(
          bloom(
            outputNode.mul(haltfToneScenePass.getTextureNode("bloomIntensity")),
            0.5,
            0.3,
            0.1,
          ),
        );

    const finalColor = scene.add(premult);

    if (pipelineRef.current)
      pipelineRef.current.outputNode = vec4(
        finalColor.rgb,
        outputNode.a,
      ).renderOutput(THREE.ACESFilmicToneMapping, THREE.SRGBColorSpace);
  }, [camera, halftoneScene, isMobile, layerScene]);

  // ✅ renderPriority 1 → R3F 자동 렌더 끄고 pipeline으로 렌더
  useFrame(() => {
    pipelineRef.current?.render();
  }, 1);

  return null;
}
