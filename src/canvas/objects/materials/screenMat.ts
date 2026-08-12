import type { RefObject } from "react";
import {
  float,
  mrt,
  dot,
  texture,
  time,
  uv,
  vec2,
  mix,
  sin,
  color,
  uniform,
  defined,
} from "three/tsl";
import * as THREE from "three/webgpu";

// 각 비디오를 cache에 미리 넣어놓는다.
// id에 맞는 비디오를 보여준다.

// 비디오 세개를 미리 한번에 로드하는 것보다 -> 섹렉트 할 떄 로드 -> 이후 한번더 동일한걸 보여주면 캐시된걸 보여줌.

export function createscreenMat(
  opacityProgress: THREE.Node<"float">,
  swipeProgress: THREE.UniformNode<"float", number>,
  screenTex: RefObject<THREE.VideoTexture>,
) {
  const screenMat = new THREE.MeshStandardNodeMaterial({
    transparent: true,
    metalness: 0.1,
    roughness: 0.5,
  });
  const 줄무늬 = uv().y.sub(time).mul(30).fract().sub(0.5).abs();

  const scaledUV = uv().sub(0.5).mul(vec2(0.7, -1)).add(0.5);
  const videoNode = texture(screenTex.current, scaledUV);

  const mask = dot(uv().mul(2).sub(1), uv().mul(2).sub(1)).clamp();

  //@ts-ignore
  screenMat.emissiveNode = videoNode.mul(줄무늬).mul(swipeProgress.oneMinus());

  screenMat.colorNode = mix(
    color("#cdb4b4"),
    videoNode,
    // swipeProgress.oneMinus().mul(mask.oneMinus().add(0.5)),
    swipeProgress.oneMinus(),
  );

  // @ts-ignore
  screenMat.mrtNode = mrt({
    bloomIntensity: float(swipeProgress.oneMinus().mul(0.35)),
    screenIntensity: float(swipeProgress),
  });
  screenMat.opacityNode = opacityProgress;

  return screenMat;
}
