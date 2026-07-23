import { color, dot, mix, normalView, positionLocal, positionViewDirection, mrt, float, materialColor, time, positionView, normalFlat, positionGeometry, positionWorld, min, max } from "three/tsl";
import * as THREE from "three/webgpu";
export default function createHologramMat(opacityProgress: THREE.Node<"float">, swipeProgress: THREE.UniformNode<"float", number>) {
  const hologramMat = new THREE.MeshStandardNodeMaterial({ transparent: true, side: THREE.DoubleSide });

  const stripe = positionWorld.y.add(time.mul(0.1)).mod(0.15);

  const fresnel = dot(normalView, positionViewDirection).abs().pow(3).oneMinus();
  // hologramMat.colorNode = mix(materialColor, fresnel.add(stripe).mul(color("black")), swipeProgress);

  // @ts-ignore
  hologramMat.mrtNode = mrt({ screenIntensity: float(max(swipeProgress.oneMinus(), 0.6)) });
  // hologramMat.opacityNode = mix(opacityProgress, fresnel.add(stripe), swipeProgress);
  hologramMat.opacityNode = opacityProgress;

  return hologramMat;
}
