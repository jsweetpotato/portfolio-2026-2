import { float, lights, mrt, output, texture, uniform, uv, mix, time, color } from "three/tsl";
import * as THREE from "three/webgpu";

export function createFloorMat(light: THREE.Light, tex: THREE.Texture) {
  const floorMat = new THREE.MeshLambertNodeMaterial({
    // color: new THREE.Color("#e8e8e8")
  });
  floorMat.lightsNode = lights([light]);

  const map = texture(tex, uv().mul(5).add(time.mul(0.05)));

  const intensity = uniform(4.2);

  //@ts-ignore

  floorMat.outputNode = float(0.55).sub(output.r.mul(6)).mul(map).clamp().add(output.mul(6).clamp()).pow(2);
  return floorMat;
}
