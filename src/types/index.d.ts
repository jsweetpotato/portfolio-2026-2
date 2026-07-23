import { Texture } from "three";

export type Props = {
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: () => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  register?: (u: UniformLike, u2: UniformLike) => void;
};

export type UniformLike = { value: number };

export type InteractiveModel_T = Props & {
  url: string;
  aoMap?: Texture;
  onMesh?: (mesh: THREE.Mesh, opacityProgress: THREE.UniformNode<"float", number>) => void;
  shadow: string;
};

export type ScaledGroup_T = {
  center?: THREE.Vector3;
  children: React.ReactNode;
};
