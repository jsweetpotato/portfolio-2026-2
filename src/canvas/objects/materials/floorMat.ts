import {
  float,
  lights,
  mrt,
  output,
  texture,
  uniform,
  uv,
  mix,
  time,
  color,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";

export function createFloorMat(light: THREE.Light, tex: THREE.Texture) {
  const floorMat = new THREE.MeshLambertNodeMaterial({
    // color: new THREE.Color("#e8e8e8")
  });
  floorMat.lightsNode = lights([light]);

  const map = texture(tex, uv().mul(5).add(time.mul(0.05))).r;

  const utest = uniform(6);

  const lit = output.mul(utest);
  const noise = float(0.55).sub(lit).mul(map).clamp();

  // 최소값 0.1
  floorMat.outputNode = noise.add(lit).pow(2);

  return floorMat;
}
