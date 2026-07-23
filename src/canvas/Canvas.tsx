// Canvas.tsx
import * as THREE from "three/webgpu";
import { Canvas } from "@react-three/fiber";
import { color } from "three/tsl";

import { Suspense } from "react";

import { PostProcessing } from "./Postprocessing";
import Objects from "./objects/objects";

import { useSceneStore } from "@/store/useSceneStore";
import ResizeHandler from "@/utils/ResizeHandler";
import A11yButtons from "@/components/A11yButtons";
import Particle from "./objects/Particle";
import { Environment, OrthographicCamera } from "@react-three/drei";
import CameraRig from "./CameraRig";
import { useInteractionStore } from "@/store/useInteractionStore";

const CONTENT_WIDTH = 20;
const CONTENT_HEIGHT = 10;

const aspect = window.innerWidth / window.innerHeight;
const contentAspect = CONTENT_WIDTH / CONTENT_HEIGHT;

let camWidth: number;
let camHeight: number;

if (aspect > contentAspect) {
  camHeight = CONTENT_HEIGHT / 2;
  camWidth = camHeight * aspect;
} else {
  camWidth = CONTENT_WIDTH / 2;
  camHeight = camWidth / aspect;
}

// gl 함수도 밖으로
const glInit = async (props: any) => {
  const gl = new THREE.WebGPURenderer({ ...props });

  await gl.init();
  gl.setSize(window.innerWidth + 2, window.innerHeight);
  return gl;
};

// camera도 밖으로
const cameraConfig = {
  // left: -camWidth,
  // right: camWidth,
  // top: camHeight,
  // bottom: -camHeight,
  near: 0.01,
  far: 300,
  fov: 20,
  // position: new THREE.Vector3(0, 7.1542, 20),
  position: new THREE.Vector3(0, 25.1542, 30),
  target: new THREE.Vector3(0, 1.9255, 0)
};

export default function WebGLCanvas() {
  const pointLight = useSceneStore((s) => s.pointLight);
  const halftoneScene = useSceneStore((s) => s.halftoneScene);
  const layerScene = useSceneStore((s) => s.layerScene);
  const select = useInteractionStore((s) => s.select);

  console.log("rendering canvas");

  return (
    <>
      <Canvas
        gl={glInit}
        shadows={"basic"}
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
          zIndex: 0
        }}>
        <ResizeHandler contentWidth={CONTENT_WIDTH} contentHeight={CONTENT_HEIGHT} />
        <PostProcessing />

        <Environment preset="forest" environmentIntensity={1} />

        <primitive object={halftoneScene}>
          <Suspense fallback={null}>
            <Objects />
          </Suspense>
          <ambientLight color={"#ffffaa"} intensity={1.5} />

          {/* <primitive object={spotLight} position={[-1.3, 12.4, 1.5]} /> */}
          <primitive object={pointLight} position={[0, 4.4, 0]} />
          <CameraRig />
        </primitive>

        <primitive object={layerScene}>
          <Particle />
        </primitive>
      </Canvas>

      <A11yButtons />
    </>
  );
}
