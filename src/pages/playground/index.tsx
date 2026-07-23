import BackBtn from "@/components/BackButton";
import { useInteractionStore, usePlaygroundStore } from "@/store/useInteractionStore";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useMemo } from "react";

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
    description: "영화 엘리멘탈 캐릭터 카드를 만들어봤습니다. 포켓몬 카드깡처럼 반짝거리는 효과는 포켓카드를 참고해서 만들었습니다. 각 캐릭터 카드를 클릭하면 음악도 나옵니다.",
    link: "https://js-homework-mission-02.vercel.app/",
    image: "/images/elemental.webp",
    video: "/videos/playground/elementalcard.mp4",
    device: "desktop"
  },
  {
    id: 2,
    title: "Text particle",
    subtitle: "Three.js로 구현한 동적 텍스트 파티클 이펙트",
    description: "텍스트를 입력하고 Enter키를 누르면 파티클 애니메이션과 함께 텍스트가 나타납니다. 파티클 애니메이션은 Three.js를 사용해서 만들었습니다.",
    link: "https://text-particle.vercel.app/",
    image: "/images/textparticles.webp",
    video: "/videos/playground/textparticles.mp4",
    device: "desktop"
  },
  {
    id: 3,
    title: "Cosmetic",
    subtitle: "R3F로 구현한 화장품 소개 데모",
    description: "Blender 연습으로 만든 화장품을 R3F로 애니메이션과 함께 소개하는 데모 페이지입니다.",
    link: "https://cosmetic-rho.vercel.app/",
    image: "/images/cosmetic.webp",
    video: "/videos/playground/cosmetic.mp4",
    device: "desktop"
  },
  {
    id: 4,
    title: "Portal",
    subtitle: "Three.js journey의 portal 챕터 연습",
    description: "Three.js journey의 Portal 챕터를 참고해서 만든 포탈 데모입니다.",
    link: "https://crystal-portal.vercel.app/",
    image: "/images/portal.webp",
    video: "/videos/playground/portal.mp4",
    device: "desktop"
  },
  {
    id: 5,
    title: "Swiper TV",
    subtitle: "Swiper JS를 사용한 TV",
    description: "GSAP와 Swiper JS를 활용한 프로젝트 입니다. 망가진 TV를 두드려서 고칠 수 있습니다.",
    link: "https://tv-carousel-mission-03.vercel.app/",
    image: "/images/swipertv.webp",
    video: "/videos/playground/swipertv.mp4",
    device: "desktop"
  },
  {
    id: 6,
    title: "3rd Person Camera",
    subtitle: "Three.js 3인칭 시점 컨트롤러",
    description: "Grass를 개발하면서 만든 3인칭 시점 컨트롤러 데모입니다. 아직 데스크탑에서만 동작합니다. Shift를 누르면 데쉬도 할 수 있어요.",
    link: "https://3rd-person-controller-tau.vercel.app/",
    image: "/images/third-person-camera.webp",
    video: "/videos/playground/third-person-camera.mp4",
    device: "desktop"
  }
];

// 패널 전체 페이드
const panel: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, when: "beforeChildren" } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

// 오리 입(좌측 하단)에서 튀어나와 자리잡기
const spit: Variants = {
  hidden: { opacity: 0, x: -220, y: 160, rotate: -14, scale: 0.6 },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 240, damping: 17, mass: 1 }
  },
  exit: { opacity: 0, x: 60, y: -20, scale: 0.9, transition: { duration: 0.2 } }
};

export function Playground() {
  const selected = useInteractionStore((s) => s.selected);
  const idx = usePlaygroundStore((s) => s.idx);
  const setIdx = usePlaygroundStore((s) => s.setIdx);
  const render = selected === "playground";

  const activeItem = useMemo(() => PLAYGROUND_ITEMS.find((it) => it.id === idx) ?? null, [idx]);
  const total = PLAYGROUND_ITEMS.length;
  const current = activeItem ? PLAYGROUND_ITEMS.indexOf(activeItem) + 1 : 0;

  const goPrev = () => {
    if (!activeItem) return;
    const i = PLAYGROUND_ITEMS.indexOf(activeItem);
    setIdx(PLAYGROUND_ITEMS[(i - 1 + total) % total].id);
  };
  const goNext = () => {
    if (!activeItem) return;
    const i = PLAYGROUND_ITEMS.indexOf(activeItem);
    setIdx(PLAYGROUND_ITEMS[(i + 1) % total].id);
  };

  return (
    <AnimatePresence mode="wait">
      {render && activeItem && (
        <motion.section
          key="playground"
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="scrollbar-none relative h-screen  right-0 top-0 flex w-[52vw] flex-col gap-6 overflow-y-auto px-16 py-12 font-mono text-[#f5efe2] ml-auto">
          {/* 상단 바 */}
          <header className="flex items-center justify-between text-xs tracking-widest ">
            <BackBtn />

            <div className="flex items-center gap-4">
              <span>
                {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>
          </header>

          {/* 튀어나오는 콘텐츠 */}

          <motion.article key={activeItem.id} variants={spit} initial="hidden" animate="show" exit="exit" className="h-full overflow-hidden flex origin-bottom-left flex-col gap-5">
            {/* 타이틀 */}
            <div>
              <div className="flex justify-between w-full items-center">
                <h1 className="font-large leading-tight">{activeItem.title}</h1>
              </div>

              <p className="text-sm leading-relaxed">{activeItem.description}</p>
            </div>

            {/* 영상 */}
            <div className="overflow-hidden  bg-black">
              <video key={activeItem.video} src={activeItem.video} muted autoPlay loop className="aspect-video w-full object-cover" />
            </div>

            <a
              href={activeItem.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-max inline-block fill-btn border  border-current/30 px-3 py-1.5 font-mono-sm uppercase mt-2 text-[#1d1d1d]">
              → View website
            </a>
            {/* 링크 + device */}
          </motion.article>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
