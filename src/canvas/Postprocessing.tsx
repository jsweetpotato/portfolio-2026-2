// PostProcessing.tsx
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { pass, mrt, output, float, mix, color, uniform, vec4, smoothstep, cameraViewMatrix, blendOverlay, pmremTexture, outputStruct } from "three/tsl";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { halftoneLineNode } from "./HalftoneLineNode";
import { useSceneStore } from "@/store/useSceneStore";

const HDRI_PRESETS = {
  forest: "forest_slope_1k.hdr",
  city: "potsdamer_platz_1k.hdr",
  sunset: "venice_sunset_1k.hdr",
  dawn: "kiara_1_dawn_1k.hdr",
  night: "dikhololo_night_1k.hdr",
  warehouse: "empty_warehouse_01_1k.hdr",
  apartment: "lebombo_1k.hdr",
  studio: "studio_small_03_1k.hdr",
  park: "rooitou_park_1k.hdr",
  lobby: "st_fagans_interior_1k.hdr"
};
const HDRI_BASE_URL = "https://raw.githubusercontent.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/";

const focusWorld = uniform(new THREE.Vector3(0, 0, 0));
export function PostProcessing() {
  const { gl, camera, size } = useThree();
  const pipelineRef = useRef<THREE.RenderPipeline | null>(null);
  const uniformsRef = useRef<any>(null);

  const halftoneScene = useSceneStore((s) => s.halftoneScene);
  const layerScene = useSceneStore((s) => s.layerScene);

  // pipeline은 한 번만 생성 (scene/camera 바뀔 때만 재생성)
  useEffect(() => {
    const pipeline = new THREE.RenderPipeline(gl as unknown as THREE.WebGPURenderer);
    pipeline.outputColorTransform = false;
    pipelineRef.current = pipeline;

    return () => {
      pipeline.dispose();

      if (pipelineRef.current === pipeline) {
        pipelineRef.current = null;
      }
    };
  }, [gl]);

  // Environment

  // useEffect(() => {
  //   new HDRLoader().load(
  //     HDRI_BASE_URL + HDRI_PRESETS.sunset,
  //     (texture) => {
  //       console.log("HDR 로드 성공", texture);
  //       texture.mapping = THREE.EquirectangularReflectionMapping;
  //       halftoneScene.environmentNode = pmremTexture(texture);
  //       halftoneScene.environmentIntensity = 0.7; // 올려보기
  //     },
  //     undefined,
  //     (err) => console.error("HDR 로드 실패", err) // 에러 콜백 추가
  //   );
  // }, [halftoneScene]);

  // Resize시 size값 변경
  useEffect(() => {
    const u = uniformsRef.current;
    if (!u) return;
    u.uWidth.value = size.width;
    u.uHeight.value = size.height;
  }, [size]);

  // HalfTone Shading
  useEffect(() => {
    const layerScenePass = pass(layerScene, camera);
    const layerTex = layerScenePass.getTextureNode();
    const premult = layerTex.rgb.mul(layerTex.a);

    // 3. 거리별 dof

    const haltfToneScenePass = pass(halftoneScene, camera);

    haltfToneScenePass.setMRT(
      mrt({
        output,
        bloomIntensity: float(0),
        screenIntensity: float(1)
      })
    );

    const outputNode = haltfToneScenePass.getTextureNode("output");
    const bloomIntensityNode = haltfToneScenePass.getTextureNode("bloomIntensity");
    const screenIntensityNode = haltfToneScenePass.getTextureNode("screenIntensity");

    const bloomPass = bloom(outputNode.mul(bloomIntensityNode), 0.5, 0.3, 0.1);

    const { node, uniforms } = halftoneLineNode(outputNode);
    uniforms.uWidth.value = size.width;
    uniforms.uHeight.value = size.height;
    uniforms.uRadius.value = 3.5;
    uniforms.uAngle.value = 0;
    uniformsRef.current = uniforms;

    // "#2C2824"

    const halftoneColor = mix(color("#514b47"), color("#d4ce9c"), node.r);
    const baseColor = mix(outputNode.rgb, halftoneColor.rgb, screenIntensityNode.r);

    // 알파로 마스킹해서 배경 위에 얹기
    const scene = baseColor.add(bloomPass);

    const finalColor = scene.add(premult);
    // const finalColor = vec4(scene.rgb, layerScenePass.a);

    if (pipelineRef.current) pipelineRef.current.outputNode = vec4(finalColor.rgb, outputNode.a).renderOutput(THREE.ACESFilmicToneMapping, THREE.SRGBColorSpace);

    // if (pipelineRef.current) pipelineRef.current.outputNode = haltfToneScenePass;

    return () => {
      if (pipelineRef.current) pipelineRef.current = null;
    };
  }, [halftoneScene, layerScene]);

  // ✅ renderPriority 1 → R3F 자동 렌더 끄고 pipeline으로 렌더
  useFrame(() => {
    pipelineRef.current?.render();
  }, 1);

  return null;
}
