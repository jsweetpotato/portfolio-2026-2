import BackBtn from "@/components/BackButton";
import { useInteractionStore, useProjectStore } from "@/store/useInteractionStore";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useEffect, useState } from "react";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const item: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
};

const projects = [
  {
    id: 1,
    title: "Cartoon Grass",
    service: true,
    type: "Personal",
    href: "https://cartoon-grass-self.vercel.app/",
    github: "https://github.com/jsweetpotato/grass3",
    duration: "2025.12 ~ 2026.03",
    description: "고양이가 돌아다니는 푸른 잔디밭",
    contribution: ["디자인 100%", "기획 100%", "개발 100%"],
    fullDescription: [
      "20만개의 잔디를 애니메이션과 함께 매 프레임 그리면서 프레임 드랍 발생→ 맵의 잔디를 chunk로 나눠서 Three.LOD 플레이어 거리에 따른 최적화",
      "사지가 짧은 캐릭터의 auto riging 문제→ riging을 직접 만들고 애니메이션도 만들어서 캐릭터 만듬",
      "오브젝트 최적화 → draco압축 및 meshopt 압축으로 최적화, 같은 오브젝트는 GPU Instancing으로 데이터 80퍼 압축 → alpha blending말고 alpha Test로 픽셀 구멍 뚫어 투명화 구현",
      "Blender에서 애니메이션 제작Mixamo와 AccuRig에서 가분수 캐릭터 리깅이 제대로 안되는 문제 발생 blender armature를 사용해서 IK를 사용해 custom animation을 만들어 캐릭터에 적용."
    ],
    tech: ["TypeScript", "Three.js", "Vite", "Rapier", "Vercel"],
    device: "desktop"
  },
  {
    id: 2,
    title: "Enter EUID",
    service: false,
    type: "Team",
    contribution: ["디자인 10%", "기획 10%", "개발 25%"],
    description: "개발자를 위한 중고거래 커뮤니티 웹 서비스",
    duration: "2024.11.24 ~ 2024.12.08",
    fullDescription: ["멋쟁이 사자처럼 프론트엔드 스쿨에서 일주일 기간동안 4인 팀프로젝트로 진행한 바닐라 JS 프로젝트입니다. "],
    tech: ["JavaScript", "CSS"],

    github: "https://github.com/jsweetpotato/sunfish-EUID"
  },
  {
    id: 3,
    title: "HealthyP",
    service: false,
    type: "Team",
    description: "건강한 레시피 커뮤니티 웹 서비스",
    duration: "2024.02.19 ~ 2024.03.15",
    fullDescription: ["tenstack query를 사용한 무한 스크롤 구현", "zod를 사용한 유효성 검사 구현", "PocketBase를 사용한 데이터 저장 구현"],
    contribution: ["디자인 50%", "기획 25%", "개발 25%"],
    tech: ["Tanstack Query", "React", "TailwindCSS", "Zustand", "zod", "PocketBase", "Vite"],
    device: "mobile",
    github: "https://github.com/jsweetpotato/healthyP"
  }
];

export default function Projects() {
  const selected = useInteractionStore((s) => s.selected);
  const select = useInteractionStore((s) => s.select);
  const render = selected === "project";
  const projectIndex = useProjectStore((s) => s.idx);
  const setProjectIndex = useProjectStore((s) => s.setIdx);
  const current = projects[projectIndex];

  const { title, id, contribution, description, device, duration, fullDescription, github, href, service, tech, type } = current;

  const goPrev = () => setProjectIndex(Math.max(0, projectIndex - 1));
  const goNext = () => setProjectIndex(Math.min(projects.length - 1, projectIndex + 1));

  return (
    <AnimatePresence mode="wait">
      {render && (
        <motion.section
          key="project-panel" // ⭐ id가 아니라 고정 key → 진입/퇴장만 애니메이션
          variants={container}
          initial="hidden"
          animate="show"
          exit="exit"
          className="relative w-[45%] ml-auto pt-8 pb-50 pr-12 text-[#f5efe2]">
          {/* 상단 바: 진입 시 한 번만 애니메이션, prev/next엔 반응 안 함 */}
          <motion.div variants={item} className="flex items-center justify-between font-mono-xs mb-8">
            <BackBtn cb={() => setProjectIndex(0)} />
            <div className="flex items-center gap-4 tracking-wide">
              <span className="opacity-40">
                {String(projectIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </span>
              <div className="flex  items-center gap-1">
                <button onClick={goPrev} disabled={projectIndex === 0} aria-label="이전 프로젝트" className="fill-btn border border-current/25 px-2.5 py-1.5 uppercase cursor-pointer">
                  ← prev
                </button>
                <button
                  onClick={goNext}
                  disabled={projectIndex === projects.length - 1}
                  aria-label="다음 프로젝트"
                  className="fill-btn border border-current/25 px-2.5 py-1.5 uppercase cursor-pointer">
                  next →
                </button>
              </div>
            </div>
          </motion.div>

          {/* ⭐ 내용만 프로젝트 바뀔 때 재애니메이션 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={id} // ⭐ 여기에 id → prev/next 시 이 블록만 교체 애니메이션
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit">
              {/* 경로 표시 */}
              <motion.div variants={item} className="font-mono-xs text-yellow mb-2">
                ~/projects/{id}
              </motion.div>

              {/* 헤더 */}
              <motion.div variants={item} className="mb-10">
                <p className="font-mono-xs opacity-50 mb-2">$ cat project.md</p>
                <h1 className="font-large leading-tight">{title}</h1>
                <p className="font-medium opacity-80 mt-1">{description}</p>
              </motion.div>

              {/* 링크 */}
              <motion.div variants={item} className="flex gap-4 font-mono-sm uppercase mb-10  ">
                {href && (
                  <a className="fill-btn border border-current/30 px-3 py-1.5" href={href} target="_blank" rel="noopener noreferrer">
                    → view project
                  </a>
                )}
                {github && (
                  <a className="fill-btn border border-current/30 px-3 py-1.5" href={github} target="_blank" rel="noopener noreferrer">
                    → github
                  </a>
                )}
              </motion.div>

              <motion.div variants={item} className="border-t border-current/15 mb-6" />

              {/* 메타 정보 */}
              <div className="font-mono-sm flex flex-col gap-2.5 mb-6">
                <motion.div variants={item} className="flex gap-3">
                  <span className="text-yellow w-24 shrink-0">type</span>
                  <span>{type}</span>
                </motion.div>
                <motion.div variants={item} className="flex gap-3">
                  <span className="text-yellow w-24 shrink-0">role</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {contribution.map((v, i) => (
                      <span key={i}>{v}</span>
                    ))}
                  </div>
                </motion.div>
                <motion.div variants={item} className="flex gap-3">
                  <span className="text-yellow w-24 shrink-0">period</span>
                  <span>{duration}</span>
                </motion.div>
                <motion.div variants={item} className="flex gap-3">
                  <span className="text-yellow w-24 shrink-0">platform</span>
                  <span>{device}</span>
                </motion.div>
                <motion.div variants={item} className="flex gap-3">
                  <span className="text-yellow w-24 shrink-0">stack</span>
                  <div className="flex flex-wrap gap-2">
                    {tech.map((v, i) => (
                      <span key={i} className="border border-current/25 px-2 py-0.5 font-mono-xs">
                        {v}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div variants={item} className="border-t border-current/15 mb-6" />

              {/* 상세 설명 */}
              <div className="font-mono-sm flex flex-col gap-3">
                <motion.p variants={item} className="font-mono-xs opacity-50">
                  // dev log
                </motion.p>
                {fullDescription.map((v, i) => (
                  <motion.p key={i} variants={item} className="flex gap-2.5 opacity-90">
                    <span className="opacity-40 shrink-0">{String(i + 1).padStart(2, "0")}</span>
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

//    --text-sm: .875rem;
//   --text-sm--line-height: calc(1.25 / .875);
