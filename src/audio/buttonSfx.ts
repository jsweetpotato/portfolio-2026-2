import { playActionSfx } from "@/audio/actionSfx";

export function playButtonHover() {
  playActionSfx("/sounds/click2.mp3", { volume: 0.6, rate: 1.2 });
}

export function playButtonClick() {
  playActionSfx("/sounds/click.mp3", {
    volume: 4.45,
    rate: 1.5,
    seek: 0.22,
  });
}
