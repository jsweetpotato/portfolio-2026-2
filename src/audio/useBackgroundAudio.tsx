import { Howl, Howler } from "howler";
import { useEffect, useRef } from "react";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { useInteractionStore } from "@/store/useInteractionStore";
import { useAudioMuteStore } from "@/store/useAudioStore";

type TrackDef = {
  src: string;
  open: number;
  dim: number;
  /** Seconds trimmed from the end before looping */
  loopTrimS?: number;
};

// Playlist: comment/uncomment or push/pop entries.
const TRACKS: TrackDef[] = [
  { src: "/sounds/music.mp3", open: 1.05, dim: 0.75, loopTrimS: 0.05 },
  // { src: "/sounds/ambient.mp3", open: 0.2, dim: 0.1 },
];

const FADE_MS = { in: 900, out: 700, dim: 800 } as const;
const FILTER_HZ = { open: 22050, dim: 19000 } as const;
const RAMP_S = 0.8;

type Track = { def: TrackDef; howl: Howl };

function rampLowpass(filter: BiquadFilterNode, toHz: number, seconds: number) {
  const now = Howler.ctx.currentTime;
  const from = Math.max(filter.frequency.value, 1);
  filter.frequency.cancelScheduledValues(now);
  filter.frequency.setValueAtTime(from, now);
  filter.frequency.exponentialRampToValueAtTime(toHz, now + seconds);
}

function fadeTo(howl: Howl, to: number, ms: number) {
  howl.fade(howl.volume(), to, ms);
}

function volFor(def: TrackDef, dim: boolean) {
  return dim ? def.dim : def.open;
}

function fadeAll(
  tracks: Track[],
  to: number | "mix",
  ms: number,
  dim: boolean,
) {
  for (const { howl, def } of tracks) {
    fadeTo(howl, to === "mix" ? volFor(def, dim) : to, ms);
  }
}

function createTrack({ src, loopTrimS }: TrackDef) {
  if (loopTrimS == null) {
    return new Howl({ src: [src], loop: true, volume: 0, preload: true });
  }

  const howl = new Howl({
    src: [src],
    volume: 0,
    preload: true,
    onload() {
      const ms = Math.max((howl.duration() - loopTrimS) * 1000, 1);
      (
        howl as unknown as {
          _sprite: Record<string, [number, number, boolean]>;
        }
      )._sprite.loop = [0, ms, true];
    },
  });
  return howl;
}

function playTrack({ howl, def }: Track) {
  if (howl.playing()) return;
  const play = () => howl.play(def.loopTrimS != null ? "loop" : undefined);
  if (howl.state() === "loaded") play();
  else howl.once("load", play);
}

export function useBackgroundAudio() {
  const selectedRef = useRef(useInteractionStore.getState().selected);
  const mutedRef = useRef(useAudioMuteStore.getState().muted);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    const tracks: Track[] = TRACKS.map((def) => ({
      def,
      howl: createTrack(def),
    }));

    const ctx = Howler.ctx;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = FILTER_HZ.open;
    Howler.masterGain.disconnect();
    Howler.masterGain.connect(filter);
    filter.connect(ctx.destination);
    filterRef.current = filter;

    const dimNow = () => selectedRef.current != null;

    const fadeInCurrent = () => {
      if (mutedRef.current || document.hidden) return;
      fadeAll(tracks, "mix", FADE_MS.in, dimNow());
    };

    const ensurePlaying = () => {
      for (const track of tracks) playTrack(track);
    };

    const onVisibility = () => {
      if (document.hidden) {
        fadeAll(tracks, 0, FADE_MS.out, false);
        return;
      }
      if (mutedRef.current) return;
      void Howler.ctx.resume();
      ensurePlaying();
      fadeInCurrent();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const unsubSelected = useInteractionStore.subscribe((state, prev) => {
      if (state.selected === prev.selected) return;
      selectedRef.current = state.selected;
      if (!filterRef.current || document.hidden || mutedRef.current) return;
      const dim = state.selected != null;
      fadeAll(tracks, "mix", FADE_MS.dim, dim);
      rampLowpass(filter, dim ? FILTER_HZ.dim : FILTER_HZ.open, RAMP_S);
    });

    const unsubMute = useAudioMuteStore.subscribe((state, prev) => {
      if (state.muted === prev.muted) return;
      mutedRef.current = state.muted;

      if (state.muted) {
        fadeAll(tracks, 0, FADE_MS.out, false);
        return;
      }

      if (document.hidden || !filterRef.current) return;
      void Howler.ctx.resume();
      ensurePlaying();
      fadeInCurrent();
    });

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      unsubSelected();
      unsubMute();
      for (const { howl } of tracks) howl.unload();

      filter.disconnect();
      filterRef.current = null;
      Howler.masterGain.disconnect();
      Howler.masterGain.connect(Howler.ctx.destination);
    };
  }, []);
}

export function MuteButton() {
  const muted = useAudioMuteStore((s) => s.muted);
  const toggle = useAudioMuteStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "소리 켜기" : "소리 끄기"}
      className="p-2 text-[--custom-white] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
    >
      {muted ? <FiVolumeX size={24} /> : <FiVolume2 size={24} />}
    </button>
  );
}
