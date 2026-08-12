// stores/useInteractionStore.ts
import { create } from "zustand";
import type * as THREE from "three/webgpu";
import { uniform } from "three/tsl";

// interface InteractionStore {
//   selected: string | null;
//   select: (id: string | null) => void;
// }

// export const useInteractionStore = create<InteractionStore>((set) => ({
//   selected: null,
//   select: (id) => set({ selected: id })
// }));

type InteractionStore = {
  selected: string | null;
  hovered: string | null; // 추가

  select: (id: string | null) => void;
  setHovered: (id: string | null) => void; // 추가
};

export const useInteractionStore = create<InteractionStore>((set) => ({
  selected: null,
  hovered: null,

  select: (id) => set({ selected: id }),
  setHovered: (id) => set({ hovered: id }),
}));

type aboutItem = {
  aboutDancing: boolean;
  eyeL: THREE.UniformNode<"float", number>;
  eyeR: THREE.UniformNode<"float", number>;
  mouse: THREE.UniformNode<"float", number>;
  startAboutDance: () => void;
  stopAboutDance: () => void;
  setEyeL: (value: number) => void;
  setEyeR: (value: number) => void;
  setMouse: (value: number) => void;
};

const faceEyeL = uniform(0);
const faceEyeR = uniform(0);
const faceMouse = uniform(0);

export const useAboutStore = create<aboutItem>((set) => ({
  aboutDancing: false,
  eyeL: faceEyeL,
  eyeR: faceEyeR,
  mouse: faceMouse,
  startAboutDance: () => set({ aboutDancing: true }),
  stopAboutDance: () => set({ aboutDancing: false }),

  setEyeL: (value) => {
    faceEyeL.value = value;
  },
  setEyeR: (value) => {
    faceEyeR.value = value;
  },
  setMouse: (value) => {
    faceMouse.value = value;
  },
}));

type ItemStore = {
  idx: number;
  setIdx: (id: number) => void;
};

export const useProjectStore = create<ItemStore>((set) => ({
  idx: 0,
  setIdx: (id) => set({ idx: id }),
}));

type PlaygroundAnimation = "duck" | "navigation";

type PlaygroundStore = ItemStore & {
  animation: PlaygroundAnimation;
  animationVersion: number;
  setAnimation: (animation: PlaygroundAnimation) => void;
  triggerDuckAnimation: () => void;
};

export const usePlaygroundStore = create<PlaygroundStore>((set) => ({
  idx: 0,
  animation: "duck",
  animationVersion: 0,
  setIdx: (id) => set({ idx: id }),
  setAnimation: (animation) => set({ animation }),
  triggerDuckAnimation: () =>
    set((state) => ({
      animation: "duck",
      animationVersion: state.animationVersion + 1,
    })),
}));
