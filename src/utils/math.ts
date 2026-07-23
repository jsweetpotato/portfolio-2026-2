export const EASINGS = {
  linear: (x: number) => x,

  // Out 계열: 시작 빠르고 끝이 부드러움 (도착이 자연스러워 멀미 덜함)
  easeOutQuad: (x: number) => 1 - (1 - x) * (1 - x),
  easeOutCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  easeOutQuart: (x: number) => 1 - Math.pow(1 - x, 4),
  easeOutExpo: (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  easeOutCirc: (x: number) => Math.sqrt(1 - Math.pow(x - 1, 2)),

  // InOut 계열: 시작/끝 둘 다 부드러움 (급가속 있어서 멀미날 수 있음)
  easeInOutQuad: (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
  easeInOutCubic: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  easeInOutSine: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,

  // 부드러운 S커브 (급가속 적어서 편안함)
  smoothstep: (x: number) => x * x * (3 - 2 * x),
  smootherstep: (x: number) => x * x * x * (x * (x * 6 - 15) + 10)
} as const;

type EasingKey = keyof typeof EASINGS;
