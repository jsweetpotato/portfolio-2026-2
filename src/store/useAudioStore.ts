import { create } from "zustand";

type AudioMuteStore = {
  muted: boolean;
  toggle: () => void;
};

export const useAudioMuteStore = create<AudioMuteStore>((set) => ({
  muted: true,
  toggle: () => set((s) => ({ muted: !s.muted })),
}));
