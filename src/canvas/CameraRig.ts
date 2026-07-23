import { useThree, useFrame } from "@react-three/fiber";
import { useInteractionStore } from "@/store/useInteractionStore";
import * as THREE from "three/webgpu";
import { useEffect, useRef } from "react";
import { button, folder, useControls } from "leva";
import { EASINGS } from "@/utils/math";

const CAMERA_VIEWS = {
  default: { pos: new THREE.Vector3(0, 25.15, 30), target: new THREE.Vector3(0, 1.3, 0) },
  playground: { pos: new THREE.Vector3(1.97, 4, 14.0), target: new THREE.Vector3(-3, 1, -3.41) },
  project: { pos: new THREE.Vector3(0, 5.97, 5), target: new THREE.Vector3(-1.5, 3.17, -2.92) },
  aboutme: { pos: new THREE.Vector3(2.6, 5.55, 13.84), target: new THREE.Vector3(3.93, -1.02, 0.0) },
  contact: { pos: new THREE.Vector3(8, 5, 10), target: new THREE.Vector3(3, 2, 0) }
} as const;

const BASE_ASPECT = 16 / 9;
type ViewKey = keyof typeof CAMERA_VIEWS;

const range = 10;

const DURATION = 0.8; // 전환 시간(초) — 들어가든 나오든 동일

export default function CameraRig() {
  const selected = useInteractionStore((s) => s.selected);
  const { camera, size } = useThree();

  const look = useRef(CAMERA_VIEWS.default.target.clone());
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  const progress = useRef(0);
  const fromPos = useRef(new THREE.Vector3());
  const fromLook = useRef(new THREE.Vector3());
  const prevKey = useRef<ViewKey>("default");

  const _tempDir = useRef(new THREE.Vector3());

  // const [{ debug, applyAspect, px, py, pz, tx, ty, tz }, set] = useControls(() => ({
  //   camera: folder({
  //     debug: false, // 켜면 Leva가 카메라 직접 제어
  //     applyAspect: true, // aspect 거리 보정 on/off
  //     px: { value: 0, min: -range, max: range, label: "pos x", step: 0.01 },
  //     py: { value: 25, min: -range, max: range, label: "pos y", step: 0.01 },
  //     pz: { value: 30, min: -range, max: range, label: "pos z", step: 0.01 },
  //     tx: { value: 0, min: -range, max: range, label: "target x", step: 0.01 },
  //     ty: { value: 1.3, min: -range, max: range, label: "target y", step: 0.01 },
  //     tz: { value: 0, min: -range, max: range, label: "target z", step: 0.01 },
  //     logCurrent: button((get) => {
  //       // pos + target 둘 다 프리셋 형식으로 출력 → 바로 복붙 가능
  //       const p = [get("camera.px"), get("camera.py"), get("camera.pz")];
  //       const t = [get("camera.tx"), get("camera.ty"), get("camera.tz")];
  //       console.log(`pos: new THREE.Vector3(${p.join(", ")}),\ntarget: new THREE.Vector3(${t.join(", ")})`);
  //     })
  //   })
  // }));

  // // debug 켜는 순간 현재 카메라/타겟 값을 슬라이더에 복사
  // useEffect(() => {
  //   if (debug) {
  //     set({
  //       px: +camera.position.x.toFixed(2),
  //       py: +camera.position.y.toFixed(2),
  //       pz: +camera.position.z.toFixed(2),
  //       tx: +look.current.x.toFixed(2),
  //       ty: +look.current.y.toFixed(2),
  //       tz: +look.current.z.toFixed(2)
  //     });
  //   }
  // }, [debug]);

  useFrame((state, dt) => {
    // // ── 디버그 모드: Leva 값 직접 적용 ──
    // if (debug) {
    //   state.camera.position.set(px, py, pz);
    //   look.current.set(tx, ty, tz);
    //   state.camera.lookAt(look.current);
    //   return;
    // }

    const key = (selected && selected in CAMERA_VIEWS ? selected : "default") as ViewKey;
    const view = CAMERA_VIEWS[key];

    // 뷰가 바뀌면 전환 시작
    if (key !== prevKey.current) {
      prevKey.current = key;
      progress.current = 0;
      fromPos.current.copy(camera.position);
      fromLook.current.copy(look.current);
    }

    if (progress.current >= 1) return;

    // aspect 보정 목표 위치 계산
    const aspect = size.width / size.height;
    // const distanceScale = applyAspect && aspect < BASE_ASPECT ? BASE_ASPECT / aspect : 1;
    const distanceScale = aspect < BASE_ASPECT ? BASE_ASPECT / aspect : 1;

    // 💡 3. clone() 대신 미리 만들어둔 _tempDir를 재사용하여 계산합니다.
    _tempDir.current.subVectors(view.pos, view.target);
    const baseDistance = _tempDir.current.length();
    _tempDir.current.normalize().multiplyScalar(baseDistance * distanceScale);

    // 연산 결과를 targetPos에 바로 덮어씌웁니다.
    targetPos.current.copy(view.target).add(_tempDir.current);
    targetLook.current.copy(view.target);

    // 시간 기반 진행 (0→1)
    progress.current = Math.min(1, progress.current + dt / DURATION);
    const e = EASINGS.easeInOutQuad(progress.current); // 이징 적용

    camera.position.lerpVectors(fromPos.current, targetPos.current, e);
    look.current.lerpVectors(fromLook.current, targetLook.current, e);
    camera.lookAt(look.current);
  });

  return null;
}
