import { useTexture } from "@react-three/drei";
import { color, texture, uv, vec2 } from "three/tsl";
import * as THREE from "three/webgpu";

export default function createShadowMaterial(progress: THREE.UniformNode<"float", number>, map: THREE.Texture) {
  const mat = new THREE.MeshBasicNodeMaterial({ transparent: true });
  const alpha = texture(map, vec2(uv().x, uv().y.oneMinus())).r.toVar();
  mat.colorNode = color("#2d2d2d").mul(alpha);
  mat.opacityNode = progress.pow(2);
  mat.alphaTestNode = alpha.step(0.1).oneMinus();

  return mat;
}
