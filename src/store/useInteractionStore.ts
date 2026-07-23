// stores/useInteractionStore.ts
import { create } from "zustand";

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
  setHovered: (id) => set({ hovered: id })
}));

type ItemStore = {
  idx: number;
  setIdx: (id: number) => void;
};

export const useProjectStore = create<ItemStore>((set) => ({
  idx: 0,
  setIdx: (id) => set({ idx: id })
}));

export const usePlaygroundStore = create<ItemStore>((set) => ({
  idx: 0,
  setIdx: (id) => set({ idx: id })
}));
