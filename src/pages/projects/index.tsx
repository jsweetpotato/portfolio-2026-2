import { BackBtn, SquareBtn, SquareLink } from "@/components/Buttons";
import {
  useInteractionStore,
  useProjectStore,
} from "@/store/useInteractionStore";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { PiStarFourFill } from "react-icons/pi";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

const rule = "border-t border-current/15 mb-6";
const pad = (n: number) => String(n).padStart(2, "0");

// devlog 버튼 주변 반짝임: 위치·크기·시작 시점만 다르고 애니메이션은 하나를 공유
const SPARKLES = [
  { pos: "-top-2.5 -left-2", size: 16, delay: 0 },
  { pos: "-top-1.5 -right-2.5", size: 11, delay: 0.45 },
  { pos: "-bottom-2.5 right-4", size: 13, delay: 0.9 },
  { pos: "bottom-0 -left-3", size: 9, delay: 1.3 },
];

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <motion.div variants={item} className="flex gap-3">
      <span className="font-code-xs text-yellow w-23 shrink-0 uppercase tracking-widest flex justify-between">
        {label}
      </span>
      {children}
    </motion.div>
  );
}

const projects = [
  {
    id: 0,
    title: "Cartoon Grass",
    service: true,
    type: "Personal",
    href: "https://cartoon-grass-self.vercel.app/",
    github: "https://github.com/jsweetpotato/grass3",
    blog: "https://resonant-kitchen-b1b.notion.site/grass-1d7f5e642970804fb162cb92412e3976",
    duration: "2025.12 ~ 2026.03",
    description: "고양이가 돌아다니는 푸른 잔디밭",
    contribution: ["디자인 100%", "기획 100%", "개발 100%"],
    fullDescription: [
      "20만개의 잔디를 애니메이션과 함께 매 프레임 그리면서 프레임 드랍 발생 → 맵의 잔디를 chunk로 나눠서 Three.LOD 플레이어 거리에 따른 최적화",
      "draco압축 및 meshopt 용량을 1.54mb → 298kb로 압축, 동일한 오브젝트를 GPU Instancing으로 처리",
      "다양한 나뭇잎을 넣으면서 최적화된 방법을 강구 → DataTextureArray로 텍스쳐를 생성 → 같은 머티리얼로 texture depth를 사용해 다른 alpha map 적용, alpha blending이 아닌 alpha Test로 가벼운 투명화 구현 및 z 버퍼 충돌방지",
      "Blender에서 애니메이션 제작Mixamo와 AccuRig에서 가분수 캐릭터 리깅이 제대로 안되는 문제 발생 blender armature를 사용해서 IK를 사용해 custom animation을 만들어 캐릭터에 적용.",
    ],
    tech: [
      "TypeScript",
      "Three.js",
      "Vite",
      "Rapier",
      "Vercel",
      "Blender",
      "Cursor",
    ],
    device: "Desktop",
  },
  {
    id: 1,
    title: "Portfolio 2026",
    service: true,
    type: "Personal",
    blog: "https://resonant-kitchen-b1b.notion.site/portfolio2026-32af5e642970801db5beef193f1b81cb",
    github: "https://github.com/jsweetpotato/portfolio-2026-2",

    duration: "2026.9 ~ 2026.03",
    description: "3D 포트폴리오 웹사이트",
    contribution: ["디자인 100%", "기획 100%", "개발 100%"],
    fullDescription: [
      `mrtNode에서 파티클의 alpha를 분리해서 halfToneShader와 함께 적용하려 했지만 서로 블렌딩 되지 않음 -> `,
      "Chat GPU로 정면과 측면 이미지를 생성해 blender로 로우폴리 모델 제작했습니다.",
      `파티클이 별도 패스인 건 중요합니다. 씬 자체가 다르기 때문에 MRT로 합칠 수 없고, 전통적인 "패스를 하나 더 돌린다"가 정답인 경우입니다. 반대로 씬 A 안의 오리·컴퓨터·커피는 같은 패스에 있으면서도 서로 다른 후처리를 받습니다. 여기가 MRT가 일하는 지점입니다.`,
    ],
    tech: [
      "TypeScript",
      "Tailwind CSS",
      "Vite",
      "Vercel",
      "Cursor",
      "Zustand",
      "React Three Fiber",
      "React Three Drei",
      "TSL",
      "Lenis",
      "Blender",
    ],
    device: "Desktop",
  },
  {
    id: 3,
    title: "HealthyP",
    service: false,
    type: "Team",
    description: "건강한 레시피 커뮤니티 웹 서비스",
    duration: "2024.02.19 ~ 2024.03.15",
    fullDescription: [
      "tenstack query를 사용한 무한 스크롤 구현",
      "zod를 사용한 유효성 검사 구현",
      "PocketBase를 사용한 데이터 저장 구현",
    ],
    contribution: ["디자인 50%", "기획 25%", "개발 25%"],
    tech: [
      "React Query",
      "React",
      "TailwindCSS",
      "Swiper",
      "Jotai",
      "zod",
      "PocketBase",
      "Vite",
    ],
    device: "Mobile",
    github: "https://github.com/jsweetpotato/healthyP",
  },
];

const TOTAL = projects.length;

export default function Projects() {
  const render = useInteractionStore((s) => s.selected === "project");
  const idx = useProjectStore((s) => s.idx);
  const setIdx = useProjectStore((s) => s.setIdx);
  const lenis = useLenis();

  const activeIndex = Math.min(Math.max(idx, 0), TOTAL - 1);
  const {
    title,
    id,
    contribution,
    description,
    device,
    duration,
    fullDescription,
    github,
    href,
    tech,
    type,
    blog,
  } = projects[activeIndex];

  const goPrev = () => setIdx(Math.max(0, activeIndex - 1));
  const goNext = () => setIdx(Math.min(TOTAL - 1, activeIndex + 1));

  return (
    <AnimatePresence mode="wait">
      {render && (
        <motion.section
          key="project-panel"
          variants={container}
          initial="hidden"
          animate="show"
          exit="exit"
          className="relative page-container"
        >
          <motion.div
            variants={item}
            className="fixed w-[45%] z-10 pr-12 flex items-center justify-between font-code-xs mb-8"
          >
            <BackBtn />
            <div className="flex items-center gap-4 tracking-wide">
              <span className="opacity-40">
                {pad(activeIndex + 1)} / {pad(TOTAL)}
              </span>
              <div className="flex items-center gap-1">
                <SquareBtn
                  onClick={goPrev}
                  disabled={activeIndex === 0}
                  aria-label="이전 프로젝트"
                >
                  ← prev
                </SquareBtn>
                <SquareBtn
                  onClick={goNext}
                  disabled={activeIndex === TOTAL - 1}
                  aria-label="다음 프로젝트"
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
            <motion.div
              key={id}
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
              className="pt-16"
            >
              <motion.div variants={item} className="mb-10">
                <p
                  className="hidden lg:flex font-code-xs opacity-50 mb-2"
                  aria-hidden
                >
                  $ cat project.md
                </p>
                <h1 className="font-display">{title}</h1>
                <p className="font-code opacity-80 mt-1">{description}</p>
              </motion.div>

              <motion.div
                variants={item}
                className="flex gap-4 font-code-sm uppercase mb-10"
              >
                {github && (
                  <SquareLink
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    → github
                  </SquareLink>
                )}
                {href && (
                  <SquareLink
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    → view project
                  </SquareLink>
                )}
                {blog && (
                  <div className="flex relative">
                    <SquareLink
                      href={blog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-300/20"
                    >
                      → devlog
                    </SquareLink>
                    {SPARKLES.map(({ pos, size, delay }) => (
                      <motion.span
                        key={pos}
                        aria-hidden
                        className={`pointer-events-none absolute text-amber-300 drop-shadow-[0_0_4px_rgb(253_224_71/0.9)] ${pos}`}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.3, 1, 0.3],
                          rotate: [0, 90],
                        }}
                        transition={{
                          duration: 1.8,
                          delay,
                          repeat: Infinity,
                          repeatDelay: 0.6,
                          ease: "easeInOut",
                        }}
                      >
                        <PiStarFourFill size={size} />
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div variants={item} className={rule} />

              <div className="font-code-sm flex flex-col gap-2.5 mb-6">
                <MetaRow label="type">
                  <span>{type}</span>
                </MetaRow>
                <MetaRow label="role">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {contribution.map((v) => (
                      <span key={v}>{v}</span>
                    ))}
                  </div>
                </MetaRow>
                <MetaRow label="Duration">
                  <span>{duration}</span>
                </MetaRow>
                {device && (
                  <MetaRow label="platform">
                    <span>{device}</span>
                  </MetaRow>
                )}
                <MetaRow label="stack">
                  <div className="flex flex-wrap gap-2">
                    {tech.map((v) => (
                      <span
                        key={v}
                        className="border border-current/25 px-2 py-0.5 font-code-xs"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </MetaRow>
              </div>

              <motion.div variants={item} className={rule} />

              <div className="font-code-sm flex flex-col gap-3">
                <motion.p variants={item} className="font-code-xs opacity-30">
                  // dev log
                </motion.p>
                {fullDescription.map((v, i) => (
                  <motion.p
                    key={i}
                    variants={item}
                    className="flex gap-2.5 opacity-90"
                  >
                    <span className="opacity-40 shrink-0">{pad(i + 1)}</span>
                    <span>{v}</span>
                  </motion.p>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
