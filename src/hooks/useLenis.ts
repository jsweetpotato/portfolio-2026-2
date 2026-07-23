// useInfiniteLenis.ts
import { useEffect } from "react";
import Lenis from "lenis";
import { create } from "zustand";

// R3F useFrame에서 읽을 스크롤 상태
interface ScrollState {
  progress: number; // 0~1 정규화된 진행도 (무한 순환)
  velocity: number; // 스크롤 속도
  raw: number; // 원본 scroll 값
}

export const useScrollStore = create<ScrollState>(() => ({
  progress: 0,
  velocity: 0,
  raw: 0
}));

interface Options {
  /** 무한 반복 여부 */
  infinite?: boolean;
  /** 관성 강도 (0~1, 낮을수록 부드러움) */
  lerp?: number;
  /** 터치 스크롤 배율 (모바일) */
  touchMultiplier?: number;
}

export function useInfiniteLenis({ infinite = true, lerp = 0.2, touchMultiplier = 1.5 }: Options = {}) {
  useEffect(() => {
    const lenis = new Lenis({
      infinite,
      lerp,
      touchMultiplier,
      smoothWheel: true, // 데스크톱 휠 부드럽게
      syncTouch: true // 모바일 터치 관성 동기화 (중요)
    });

    const update = () => {
      const limit = lenis.limit;

      // infinite면 scroll이 limit을 넘어 계속 증가/감소하므로 모듈로로 순환

      const raw = lenis.scroll;
      let normalized = raw / limit;

      console.log(normalized);
      useScrollStore.setState({
        progress: normalized,
        velocity: lenis.velocity,
        raw
      });
    };

    lenis.on("scroll", update);

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", update);
      lenis.destroy();
    };
  }, [infinite, lerp, touchMultiplier]);
}
