// Particle.tsx

import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

import { useMemo, useRef } from "react";
import { cameraProjectionMatrix, cameraViewMatrix, color, float, hash, instanceIndex, mod, pass, positionGeometry, rotate, step, texture, time, uv, vec3, vec4 } from "three/tsl";
import * as THREE from "three/webgpu";

interface ParticleProps {
  isMobile: boolean;
}

export default function Particle({ isMobile }: ParticleProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const dustTexture = useTexture("/images/dust.png");

  // 각 파티클의 초기 위치 + 속도 + 위상

  const mesh = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(0.2, 0.2, 1, 1);
    const mat = new THREE.MeshBasicNodeMaterial();

    const count = isMobile ? 100 : 400;

    // 인스턴스마다 다른 랜덤값 (instanceIndex 기반)
    const seed = hash(instanceIndex).toVar();
    const seed2 = hash(instanceIndex.add(1)).toVar();
    const seed3 = isMobile ? seed2 : hash(instanceIndex.add(2)).toVar();

    // 초기 위치 (랜덤 분포)
    const baseX = seed.sub(0.5).mul(50);
    const baseZ = seed3.sub(0.5).mul(30).sub(10);

    // 속도도 인스턴스별로
    const speed = seed2.mul(isMobile ? 0.3 : 0.5).add(0.2);

    // Y는 시간에 따라 위로 상승 + 순환
    const rawY = time.mul(speed).add(seed2.mul(50));
    const y = mod(rawY.add(25), float(50)).sub(25);

    // X는 좌우로 흔들림
    const x = isMobile
      ? baseX
      : baseX.add(
          time
            .mul(0.5)
            .add(seed.mul(6.28))
            .sin()
            .mul(seed3.mul(1.5).add(0.5))
        );

    const centerView = cameraViewMatrix.mul(vec4(x, y, baseZ, 1.0));

    const randSize = isMobile ? float(0.45) : seed3.mul(0.4).add(0.3);
    const localOffset = isMobile
      ? vec3(positionGeometry.xy, 0.0)
      : rotate(vec3(positionGeometry.xy, 0.0), vec3(0, 0, seed3.mul(Math.PI * 2)));

    const billboardView = centerView.xyz.add(vec3(localOffset.xy.mul(randSize), 0.0));

    mat.vertexNode = cameraProjectionMatrix.mul(vec4(billboardView, 1.0));

    const dustMap = texture(dustTexture, uv());

    mat.colorNode = baseZ.remap(-40, 20, 0, 1).mul(dustMap.a).mul(color("#ffeccf"));
    mat.alphaTestNode = step(dustMap.a, 0.02);

    const inst = new THREE.InstancedMesh(geometry, mat, count);
    inst.frustumCulled = false;
    return inst;
  }, [dustTexture, isMobile]);

  return <primitive ref={meshRef} object={mesh} />;
}
