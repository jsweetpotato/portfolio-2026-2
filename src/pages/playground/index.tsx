import { BackBtn, SquareBtn, SquareLink } from "@/components/Buttons";
import {
  useInteractionStore,
  usePlaygroundStore,
} from "@/store/useInteractionStore";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useEffect, useState } from "react";

type PlaygroundItem = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  link: string;
  image: string;
  video: string;
  device: string;
};

const PLAYGROUND_ITEMS: PlaygroundItem[] = [
  {
    id: 1,
    title: "Elemental cards",
    subtitle: "마우스에 반응하는 3D 인터랙티브 카드",
    description:
      "영화 엘리멘탈 캐릭터 카드를 만들어봤습니다. 포켓몬 카드깡처럼 반짝거리는 효과는 포켓카드를 참고해서 만들었습니다. 각 캐릭터 카드를 클릭하면 음악도 나옵니다.",
    link: "https://js-homework-mission-02.vercel.app/",
    image: "/images/elemental.webp",
    video: "/videos/playground/elementalcard.mp4",
    device: "desktop",
  },
  {
    id: 2,
    title: "Text particle",
    subtitle: "Three.js로 구현한 동적 텍스트 파티클 이펙트",
    description:
      "Three.js Points와 VertexShader를 활용한 GPU기반 파티클 시뮬레이션입니다.",
    link: "https://text-particle.vercel.app/",
    image: "/images/textparticles.webp",
    video: "/videos/playground/textparticles.mp4",
    device: "desktop",
  },
  {
    id: 3,
    title: "Cosmetic",
    subtitle: "R3F로 구현한 화장품 소개 데모",
    description:
      "Blender로 연습 삼아 작업한 화장품 모델링을 R3F를 활용해 웹 애니메이션으로 구현해 보았습니다",
    link: "https://cosmetic-rho.vercel.app/",
    image: "/images/cosmetic.webp",
    video: "/videos/playground/cosmetic.mp4",
    device: "desktop",
  },
  {
    id: 4,
    title: "Portal",
    subtitle: "Three.js journey의 portal 챕터 연습",
    description:
      "Three.js journey의 Portal 챕터를 참고해서 만든 포탈 데모입니다.",
    link: "https://crystal-portal.vercel.app/",
    image: "/images/portal.webp",
    video: "/videos/playground/portal.mp4",
    device: "desktop",
  },
  {
    id: 5,
    title: "Swiper TV",
    subtitle: "Swiper JS를 사용한 TV",
    description:
      "태킷 프론트엔드 스쿨에서 JavaScript와 Swiper JS로 웹페이지 구현 과제입니다. 애니메이션은 GSAP로 만들었습니다. 망가진 TV를 두드려서 고칠 수 있습니다.",
    link: "https://tv-carousel-mission-03.vercel.app/",
    image: "/images/swipertv.webp",
    video: "/videos/playground/swipertv.mp4",
    device: "desktop",
  },
  {
    id: 6,
    title: "3rd Person Camera",
    subtitle: "Three.js 3인칭 시점 컨트롤러",
    description:
      "Grass를 개발하면서 만든 Vanila Three.js 3인칭 시점 컨트롤입니다. 아직 데스크탑에서만 동작합니다. ",
    link: "https://3rd-person-controller-tau.vercel.app/",
    image: "/images/third-person-camera.webp",
    video: "/videos/playground/third-person-camera.mp4",
    device: "desktop",
  },
];

const TOTAL = PLAYGROUND_ITEMS.length;

const panel: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

const spit: Variants = {
  hidden: { opacity: 0, x: -220, y: 160, rotate: -14, scale: 0.6 },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: {
      delay: 0.5,
      type: "spring",
      stiffness: 240,
      damping: 17,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    x: 60,
    y: -20,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

export function Playground() {
  const render = useInteractionStore((s) => s.selected === "playground");
  const idx = usePlaygroundStore((s) => s.idx);
  const setIdx = usePlaygroundStore((s) => s.setIdx);
  const animation = usePlaygroundStore((s) => s.animation);
  const animationVersion = usePlaygroundStore((s) => s.animationVersion);
  const setAnimation = usePlaygroundStore((s) => s.setAnimation);
  const lenis = useLenis();

  const activeIndex = Math.min(Math.max(idx, 0), TOTAL - 1);
  const activeItem = PLAYGROUND_ITEMS[activeIndex];

  // 나가면 navigation으로 되돌려 다음 진입도 projects와 같은 연출로 시작
  useEffect(() => {
    if (render) return;
    if (usePlaygroundStore.getState().animation !== "duck") {
      setAnimation("duck");
    }
  }, [render, setAnimation]);

  const goPrev = () => {
    setAnimation("navigation");
    setIdx(Math.max(0, activeIndex - 1));
  };
  const goNext = () => {
    setAnimation("navigation");
    setIdx(Math.min(TOTAL - 1, activeIndex + 1));
  };
  return (
    <AnimatePresence mode="wait">
      {render && (
        <motion.section
          key="playground-panel"
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="relative page-container"
        >
          <motion.div
            variants={item}
            className="fixed w-[45%] z-10 pr-12 flex items-center justify-between font-code-xs mb-8"
          >
            <div className="fixed left-[20vw] top-10 uppercase font-heading">
              👇 Click Duck
            </div>
            <BackBtn cb={() => setIdx(0)} />
            <div className="flex items-center gap-4 tracking-wide">
              <span className="opacity-40">
                {pad(activeIndex + 1)} / {pad(TOTAL)}
              </span>
              <div className="flex items-center gap-1">
                <SquareBtn
                  onClick={goPrev}
                  disabled={activeIndex === 0}
                  aria-label="이전"
                >
                  ← prev
                </SquareBtn>
                <SquareBtn
                  onClick={goNext}
                  disabled={activeIndex === TOTAL - 1}
                  aria-label="다음"
                >
                  next →
                </SquareBtn>
              </div>
            </div>
          </motion.div>

          <AnimatePresence
            mode="wait"
            onExitComplete={() => lenis?.scrollTo(0, { immediate: true })}
          >
            <motion.article
              key={`${activeItem.id}-${animationVersion}`}
              variants={animation === "duck" ? spit : panel}
              initial="hidden"
              animate="show"
              exit="exit"
              className="pt-16 origin-bottom-left overflow-x-clip"
            >
              <motion.div variants={item} className="mb-10">
                <p
                  className="hidden lg:flex font-code-xs opacity-50 mb-2"
                  aria-hidden
                >
                  $ cat playground.md
                </p>
                <h1 className="font-display">{activeItem.title}</h1>
                <p className="font-code-sm opacity-80">
                  {activeItem.description}
                </p>
              </motion.div>

              <motion.div
                variants={item}
                className="flex gap-4 font-code-sm uppercase mb-10"
              >
                <SquareLink
                  href={activeItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → view website
                </SquareLink>
              </motion.div>

              <motion.div variants={item} className="overflow-hidden">
                <video
                  key={activeItem.video}
                  src={activeItem.video}
                  controls
                  controlsList="nodownload"
                  muted
                  autoPlay
                  loop
                  playsInline
                  className="aspect-video w-full object-cover "
                />
              </motion.div>
            </motion.article>
          </AnimatePresence>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
