import { Howler } from "howler";
import { useAudioMuteStore } from "@/store/useAudioStore";

const DUR = 0.58;

type ZoomTone = {
  volume: number;
  /** Bandpass sweep */
  startHz: number;
  endHz: number;
  /** Sine sweep */
  sineStartHz: number;
  sineEndHz: number;
};

const ZOOM = {
  in: {
    volume: 4,
    startHz: 700,
    endHz: 2000,
    sineStartHz: 320,
    sineEndHz: 720,
  } satisfies ZoomTone,
  out: {
    volume: 1.65,
    startHz: 100,
    endHz: 20,
    sineStartHz: 530,
    sineEndHz: 200,
  } satisfies ZoomTone,
};

/** Same graph as the live synth, rendered once into a buffer. */
async function bakeZoom(tone: ZoomTone): Promise<AudioBuffer> {
  const sampleRate = Howler.ctx.sampleRate;
  const offline = new OfflineAudioContext(
    1,
    Math.floor(sampleRate * DUR),
    sampleRate,
  );
  const t0 = offline.currentTime;
  const n = Math.floor(sampleRate * DUR);

  const noiseBuf = offline.createBuffer(1, n, sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;

  const noise = offline.createBufferSource();
  noise.buffer = noiseBuf;

  const filter = offline.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.4;
  filter.frequency.setValueAtTime(tone.startHz, t0);
  filter.frequency.exponentialRampToValueAtTime(tone.endHz, t0 + DUR);

  const noiseGain = offline.createGain();
  noiseGain.gain.setValueAtTime(0.0001, t0);
  noiseGain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.04);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + DUR);

  const osc = offline.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(tone.sineStartHz, t0);
  osc.frequency.exponentialRampToValueAtTime(tone.sineEndHz, t0 + DUR);

  const oscGain = offline.createGain();
  oscGain.gain.setValueAtTime(0.0001, t0);
  oscGain.gain.exponentialRampToValueAtTime(0.05, t0 + 0.03);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + DUR);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(offline.destination);
  osc.connect(oscGain);
  oscGain.connect(offline.destination);

  noise.start(t0);
  noise.stop(t0 + DUR);
  osc.start(t0);
  osc.stop(t0 + DUR);

  return offline.startRendering();
}

function playBuffer(buffer: AudioBuffer, volume: number) {
  if (useAudioMuteStore.getState().muted || !Howler.ctx) return;
  void Howler.ctx.resume();
  const src = Howler.ctx.createBufferSource();
  const gain = Howler.ctx.createGain();
  gain.gain.value = volume;
  src.buffer = buffer;
  src.connect(gain);
  gain.connect(Howler.masterGain);
  src.start();
}

let zoomIn: AudioBuffer | null = null;
let zoomOut: AudioBuffer | null = null;

/** Call once from App after Howler.ctx exists. */
export async function bakeZoomSfx() {
  if (!Howler.ctx || (zoomIn && zoomOut)) return;
  const [inn, out] = await Promise.all([
    bakeZoom(ZOOM.in),
    bakeZoom(ZOOM.out),
  ]);
  zoomIn = inn;
  zoomOut = out;
}

export function playZoomIn() {
  if (zoomIn) playBuffer(zoomIn, ZOOM.in.volume);
}

export function playZoomOut() {
  if (zoomOut) playBuffer(zoomOut, ZOOM.out.volume);
}
