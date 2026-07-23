import { create } from "zustand";
import * as THREE from "three/webgpu";
import { color, dot, mix, screenUV, vec2 } from "three/tsl";

interface SceneStore {
  spotLight: THREE.SpotLight;
  pointLight: THREE.PointLight;
  halftoneScene: THREE.Scene;
  layerScene: THREE.Scene;
}

export const useSceneStore = create<SceneStore>(() => ({
  // 인스턴스는 한 번만 생성되어 계속 유지됨
  spotLight: (() => {
    const spotLight = new THREE.SpotLight("white", 3.49, 100, 0.9, 0.5, 0.644);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;

    return spotLight;
  })(),

  pointLight: (() => {
    const pointLight = new THREE.PointLight("#838383", 3.5, 100, 0.3);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 512;
    pointLight.shadow.mapSize.height = 512;
    pointLight.shadow.bias = -0.001;
    return pointLight;
  })(),
  halftoneScene: (() => {
    const scene = new THREE.Scene();
    const remap = vec2(screenUV.x.sub(0.5).mul(0.8), screenUV.y.sub(0.8).mul(1.4));
    // scene.backgroundNode = mix(color("black"), color("#ff0000"), dot(remap, remap).smoothstep(0, 0.3));
    scene.backgroundNode = color("black");
    return scene;
  })(),
  layerScene: (() => {
    const scene = new THREE.Scene();
    return scene;
  })()
}));
