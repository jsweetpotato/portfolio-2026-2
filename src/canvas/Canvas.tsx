// Canvas.tsx
import * as THREE from "three/webgpu";
import { Canvas } from "@react-three/fiber";
import { color } from "three/tsl";

import { Suspense, type ComponentProps } from "react";

import { PostProcessing } from "@/canvas/scene/PostProcessing";
import Objects from "@/canvas/objects/Objects";

import { useSceneStore } from "@/canvas/scene/useSceneStore";
import ResizeHandler from "@/canvas/scene/ResizeHandler";
import A11yButtons from "@/components/A11yButtons";
import Particle from "./objects/Particle";
import CameraRig from "@/canvas/scene/CameraRig";
import { useInteractionStore } from "@/store/useInteractionStore";
import { useIsMobile } from "@/hooks/useIsMobile";

const CONTENT_WIDTH = 20;
const CONTENT_HEIGHT = 10;

type CanvasGlFactory = Extract<
  NonNullable<ComponentProps<typeof Canvas>["gl"]>,
  (...args: never[]) => unknown
>;
type CanvasGlProps = Parameters<CanvasGlFactory>[0];
type WebGPURendererProps = NonNullable<
  ConstructorParameters<typeof THREE.WebGPURenderer>[0]
>;

// gl 함수도 밖으로
const glInit = async (props: CanvasGlProps) => {
  const powerPreference =
    props.powerPreference === "default" ? undefined : props.powerPreference;
  // R3F와 three/webgpu가 서로 다른 OffscreenCanvas 선언을 사용한다.
  const rendererProps = {
    ...props,
    powerPreference,
  } as unknown as WebGPURendererProps;
  const gl = new THREE.WebGPURenderer(rendererProps);

  await gl.init();
  return gl;
};

// camera도 밖으로
const cameraConfig = {
  near: 0.1,
  far: 300,
  fov: 20,
  position: new THREE.Vector3(0, 25.1542, 30),
  target: new THREE.Vector3(0, 1.9255, 0),
};

export default function WebGLCanvas() {
  const pointLight = useSceneStore((s) => s.pointLight);
  const halftoneScene = useSceneStore((s) => s.halftoneScene);
  const layerScene = useSceneStore((s) => s.layerScene);
  const select = useInteractionStore((s) => s.select);
  const isMobile = useIsMobile();

  return (
    <>
      <Canvas
        gl={glInit}
        shadows={isMobile ? false : "basic"}
        // orthographic
        dpr={[1, 1]}
        camera={cameraConfig}
        onCreated={({ scene, camera }) => {
          camera.lookAt(0, 1.3, 0);
          camera.updateProjectionMatrix();
          scene.backgroundNode = color("black");
        }}
        onPointerMissed={() => select(null)}
        style={{
          width: "100dvw",
          height: "100dvh",
          position: "fixed",
          inset: 0,
          maxWidth: "none",
          maxHeight: "none",
          zIndex: 0,
        }}
      >
        <ResizeHandler
          contentWidth={CONTENT_WIDTH}
          contentHeight={CONTENT_HEIGHT}
        />
        <PostProcessing isMobile={isMobile} />

        <primitive object={halftoneScene}>
          <Suspense fallback={null}>
            <Objects />
          </Suspense>
          <ambientLight color={"#ffffaa"} intensity={1.5} />

          {/* <primitive object={spotLight} position={[-1.3, 12.4, 1.5]} /> */}
          <primitive
            object={pointLight}
            position={[0, 4.4, 0]}
            castShadow={!isMobile}
          />
          <CameraRig />
        </primitive>

        <primitive object={layerScene}>
          <Particle isMobile={isMobile} />
        </primitive>
      </Canvas>

      <A11yButtons />
    </>
  );
}
