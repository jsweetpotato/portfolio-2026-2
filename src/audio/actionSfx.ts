import { Howl, Howler } from "howler";
import { useAudioMuteStore } from "@/store/useAudioStore";

type ActionSfxOpts = {
  volume?: number;
  rate?: number;
  seek?: number;
};

const cache = new Map<string, Howl>();

function getHowl(src: string) {
  let howl = cache.get(src);
  if (!howl) {
    howl = new Howl({ src: [src], preload: true });
    cache.set(src, howl);
  }
  return howl;
}

/** Play a one-shot SFX by path. Respects global mute. */
export function playActionSfx(
  src: string,
  { volume = 0.45, rate = 1, seek }: ActionSfxOpts = {},
) {
  if (useAudioMuteStore.getState().muted) return;
  void Howler.ctx?.resume();
  const howl = getHowl(src);
  const id = howl.play();
  howl.volume(volume, id);
  howl.rate(rate, id);
  if (seek != null) howl.seek(seek, id);
}

/** Run cb and play SFX together. */
export function withActionSfx<Args extends unknown[]>(
  src: string,
  cb: (...args: Args) => void,
  opts?: ActionSfxOpts,
): (...args: Args) => void {
  return (...args) => {
    playActionSfx(src, opts);
    cb(...args);
  };
}
