import * as THREE from "three/webgpu";
import { useTexture } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { useMemo } from "react";
import { uv, mix, color, texture } from "three/tsl";

extend({ meshBasicNodeMaterial: THREE.MeshBasicNodeMaterial });

export default function BGtext() {
  const textTexture = useTexture("/text.svg");

  const mat = useMemo(() => {
    const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, alphaTest: 0.1 });
    mat.transparent = true;

    mat.opacityNode = texture(textTexture, uv()).a;
    mat.colorNode = mix(color("#898989"), color("#a0a0a0"), uv().y.add(0.2)).mul(0.75);
    // mat.mrtNode = mrt({ screenIntensity: float(0) });

    return mat;
  }, [texture]);

  return (
    <mesh position={[-0.1, 2, -10]}>
      <planeGeometry args={[20, 4.25, 1, 1]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}
