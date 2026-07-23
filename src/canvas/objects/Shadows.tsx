import { useGLTF, useTexture } from "@react-three/drei";

import { useMemo } from "react";
import { color, texture, uv } from "three/tsl";
import * as THREE from "three/webgpu";

export default function Shadows({ opacityProgress }: { opacityProgress: THREE.UniformNode<"float", number> }) {
  const coffee_map = useTexture("/shadow_coffee.png");
  const duck_map = useTexture("/shadow_duck.png");
  const computer_map = useTexture("/shadow_computer.png");

  const shadowMat = useMemo(() => {
    const mat = new THREE.MeshBasicNodeMaterial();
    const map = texture(computer_map, uv());
    mat.colorNode = color("black");
    mat.alphaTestNode = map.step(0.1).oneMinus();
    return mat;
  }, [computer_map]);

  return (
    <mesh material={shadowMat} position={[-5, 0.1, -5]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[4, 4, 1, 1]} />
    </mesh>
  );
}
