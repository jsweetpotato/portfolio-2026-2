import { float, texture, uv, mrt, vec2 } from "three/tsl";

import * as THREE from "three/webgpu";

export type FacePart = "eyeL" | "eyeR" | "mouse";

export function createFaceMat(
  tex_img: THREE.Texture,
  selectionProgress: THREE.UniformNode<"float", number>,
  opacityProgress: THREE.UniformNode<"float", number>,
  offsetY: THREE.UniformNode<"float", number>,
) {
  const faceMat = new THREE.MeshBasicNodeMaterial({
    transparent: true,
  });

  const vUv = uv();
  const indexedUV = vec2(vUv.x, vUv.y.add(offsetY));
  const tex = texture(tex_img, indexedUV);

  faceMat.colorNode = tex.rgb;
  faceMat.opacityNode = tex.a.mul(opacityProgress);
  faceMat.alphaTestNode = float(0.2);
  faceMat.mrtNode = mrt({
    screenIntensity: selectionProgress.add(0.4).clamp(),
  });
  return faceMat;
}
