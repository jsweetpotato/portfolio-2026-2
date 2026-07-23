import * as THREE from "three/webgpu";

import type { NodeObject } from "three/src/nodes/TSL.js";
import { float, Fn, hash, mix, vec3, vec4, vertexIndex } from "three/tsl";

export const over = Fn(([base, layer]: [NodeObject<THREE.Vector4>, NodeObject<THREE.Vector4>]) => {
  const rgb = vec3(mix(base.rgb, layer.rgb, layer.a));
  return vec4(rgb, float(1.0));
});
export function attachFadingShadow(material: THREE.NodeMaterial, opacityProgress: THREE.Node<"float">) {
  material.castShadowNode = Fn(() => {
    // opacityProgress가 낮을수록 discard될 확률이 높아짐 → 그림자도 같이 사라짐
    hash(vertexIndex).greaterThan(opacityProgress).discard();
  })();
}
