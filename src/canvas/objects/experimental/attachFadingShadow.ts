import { Fn, hash, vertexIndex } from "three/tsl";
import * as THREE from "three/webgpu";
// 공통으로 재질에 적용 (useInteractiveObject나 각 material factory에서)
export function attachFadingShadow(material: THREE.NodeMaterial, opacityProgress: THREE.Node<"float">) {
  material.castShadowNode = Fn(() => {
    // opacityProgress가 낮을수록 discard될 확률이 높아짐 → 그림자도 같이 사라짐
    hash(vertexIndex).greaterThan(opacityProgress).discard();
  })();
}
