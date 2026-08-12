import { FiAlignLeft } from "react-icons/fi";
import type { NodeObject } from "three/src/nodes/TSL.js";
import {
  float,
  mrt,
  blendOverlay,
  dot,
  texture,
  time,
  uv,
  vec2,
  attribute,
  cameraProjectionMatrix,
  cameraViewMatrix,
  color,
  modelWorldMatrix,
  positionLocal,
  vec3,
  vec4,
  mx_noise_float,
  mix,
  abs,
  sin,
  smoothstep,
  step,
} from "three/tsl";
import * as THREE from "three/webgpu";

export default function createSteamMat(
  opacityProgress: THREE.Node<"float">,
  selectionProgress: THREE.Node<"float">,
) {
  const steamMat = new THREE.MeshBasicNodeMaterial({ transparent: true });

  const centerWorld = modelWorldMatrix.mul(attribute("center", "vec3"));
  const centerView = cameraViewMatrix.mul(centerWorld);
  const offsetX = positionLocal.x;
  const offsetY = positionLocal.y.mul(1.5).add(0.6);
  const billboardViewPos = centerView.xyz.add(
    vec3(offsetX, offsetY.oneMinus(), 0.0),
  );

  steamMat.vertexNode = cameraProjectionMatrix.mul(vec4(billboardViewPos, 1.0));
  // steamMat.vertexNode = billboarding({ position: centerWorld.add(vec3(offsetX, offsetY.oneMinus(), 0.0)) });

  // steamMat.positionNode = positionLocal.mul(vec3(1, 1.5, 0)).add(vec3(0, -0.4, 0));

  const uvNode = uv();
  const u = uvNode.x.sub(0.5).mul(2); // -0.5 ~ 0.5 (중앙 기준)
  const v = uvNode.y; // 0(위) ~ 1(아래)

  // 1. S자 흔들림 — sin으로 x축을 시간에 따라 구부림
  const sway = sin(
    v
      .mul(Math.PI * 3.5) // 구부러지는 주기
      .add(time.mul(4.5)), // 시간에 따라 흐름
  ).mul(positionLocal.y.oneMinus().mul(0.6)); // 흔들림 강도
  const sway2 = sin(
    v
      .mul(Math.PI * 1.3)
      .add(time.mul(2.0))
      .add(float(1.2)),
  ).mul(0.07);

  const warpedU = u.sub(sway).sub(sway2).div(2).abs();
  const vertFade = smoothstep(0.0, 0.35, v);
  const vertFade2 = smoothstep(1.2, 0.7, v);

  const final = warpedU
    .abs()
    .oneMinus()
    .sub(0.49)
    .pow(3)
    .mul(vertFade)
    .mul(vertFade2);

  steamMat.colorNode = color("white");
  steamMat.alphaTestNode = step(final.clamp(), 0.09);
  steamMat.opacityNode = opacityProgress;

  // @ts-ignore
  steamMat.emissiveNode = color("#787775");

  steamMat.mrtNode = mrt({
    bloomIntensity: selectionProgress.oneMinus(),
    screenIntensity: selectionProgress,
  });

  return steamMat;
}
