import type { RefObject } from "react";
import type { Group, Texture } from "three/webgpu";

export type Props = {
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: () => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  register?: (registration: InteractiveRegistration) => void;
};

export type UniformLike = { value: number };

export type InteractiveRegistration = {
  groupRef: RefObject<Group | null>;
  scaleProgress: UniformLike;
  opacityProgress: UniformLike;
  selectionProgress: UniformLike;
  scaleAmount: number;
  selectionProgress?: UniformLike;
};

export type InteractiveModel_T = Props & {
  url: string;
  aoMap?: Texture;
  onMesh?: (
    mesh: THREE.Mesh,
    opacityProgress: THREE.UniformNode<"float", number>,
  ) => void;
  shadow: string;
};

export type ScaledGroup_T = {
  center?: THREE.Vector3;
  children: React.ReactNode;
};
