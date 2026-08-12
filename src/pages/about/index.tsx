import { useState } from "react";
import { BackBtn, SquareBtn } from "@/components/Buttons";
import {
  useAboutStore,
  useInteractionStore,
} from "@/store/useInteractionStore";
import {
  SiBlender,
  SiCss,
  SiCursor,
  SiFigma,
  SiGit,
  SiReact,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVercel,
  SiVite,
} from "react-icons/si";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { DiPhotoshop } from "react-icons/di";

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

// projects 페이지의 stack 칩과 같은 형태

const SKILLS: {
  group: string;
  items: { label: string; icon?: typeof SiReact }[];
}[] = [
  {
    group: "frontend",
    items: [
      { label: "React", icon: SiReact },
      { label: "TypeScript", icon: SiTypescript },
      { label: "Zustand" },
      { label: "Tailwind CSS", icon: SiTailwindcss },
      { label: "CSS3", icon: SiCss },
    ],
  },
  {
    group: "3d / graphics",
    items: [
      { label: "Three.js", icon: SiThreedotjs },
      { label: "React Three Fiber" },
      { label: "GLSL" },
      { label: "Blender", icon: SiBlender },
    ],
  },
  {
    group: "dev",
    items: [
      { label: "Vite", icon: SiVite },
      { label: "Git", icon: SiGit },
      { label: "Vercel", icon: SiVercel },
      { label: "Cursor", icon: SiCursor },
    ],
  },
  {
    group: "design",
    items: [
      { label: "Figma", icon: SiFigma },
      { label: "Photoshop", icon: DiPhotoshop },
    ],
  },
];

const QUESATION = [
  { name: "whoami", qua: "어떤 개발자인가요?", answer: <WhoAreU /> },
  {
    name: "why",
    qua: "왜 3D 웹을 하나요?",
    answer: <Why3D />,
  },
  { name: "skills", qua: "어떤 기술을 사용하나요?", answer: <Skills /> },
  // {
  //   name: "challenges",
  //   qua: "힘들었던 문제를 어떻게 풀어왔나요?",
  //   answer: <Experience />,
  // },
];

function Why3D() {
  return (
    <>
      <div className="flex flex-col gap-3">
        <h2 className="font-subheading">
          성능과 비주얼 두마리 토끼를 잡는 기술이라서 좋습니다
        </h2>
        <p className="font-body">
          3D 웹은 "멋있어 보이는 것"보다 "제대로 동작하는 것" 그 둘의 집합점이라
          생각합니다. 보기에도 좋아야 하고, 성능도 잡아야 하고, 코드도 견고해야
          합니다. 그 전부를 신경 쓰면서 성장하는게 저에게 가장 보람찬 것
          같습니다.
        </p>
      </div>

      <div>
        <h2 className="font-subheading"> 어려워서 재밌습니다</h2>
        <p className="font-body opacity-80">
          WebGPU나 셰이더처럼 자료도 별로 없고 까다로운 걸 파고들 때, 안 되던게
          되는 순간이 좋습니다. 오리 메시가 애니메이션에 따라 이상하게 늘어나는
          원인 찾아 고치고, 1MB짜리를 267KB까지 깎아서 첫 화면이 빨리 뜨게
          만들었을 때 — 그런 게 3D 웹에는 계속 있습니다. 풀어야 할 문제가 끝없이
          나오고, 하나씩 파고들다 보면 실력이 늘어 있습니다.
        </p>
      </div>
    </>
  );
}

function Skills() {
  return (
    <>
      <div>
        <h2 className="font-subheading">3D관련 기술에 자신 있습니다.</h2>
        <ul className="font-body opacity-80 mt-2  flex flex-col gap-2">
          <li>
            텍스쳐 제작, 텍스쳐 및 glb 파일 압축 등 3D 모델 관련 최적화에 자신
            있습니다.
          </li>
          <li>Shader를 활용해 커스텀 머티리얼을 제작할 수 있습니다.</li>
        </ul>
      </div>
      <div>
        <p className="font-subheading ">
          CSS3를 웹디자인에 맞춰 꼼꼼하게 스타일링 할 수 있습니다.
        </p>
        <ul className="font-body opacity-80 mt-2  flex flex-col gap-2">
          <li>
            CSS3를 활용해 flex와 media query등 다양한 기기에 맞는 반응형으로
            개발할 수 있습니다.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        {SKILLS.map(({ group, items }) => (
          <div key={group}>
            <p className="mb-2 font-code-xs opacity-40">// {group}</p>

            <div className="flex flex-wrap items-center gap-1.5">
              {items.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className={
                    "inline-flex items-center gap-1.5 border border-current/25 px-2 py-0.5 font-code-sm"
                  }
                >
                  {Icon && <Icon aria-hidden />}
                  {label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function WhoAreU() {
  return (
    <>
      <div>
        <p className="font-subheading mb-2">안녕하세요!</p>
        <h2 className="font-subheading">
          실험적이고 생동감 있는 웹사이트 제작을 좋아하는 <br /> 개발자 김지수
          입니다 :)
        </h2>
      </div>

      <div>
        <h2 className="font-subheading mb-2">
          🔧화려함보다 최적화를 중요하게 생각합니다.
        </h2>
        <p className="font-body opacity-70">
          2MB정도 소요되는 모델 파일을 애니메이션 분리 + Draco 압축 + texture
          분리 및 webp 포멧 압축 + AI로 생성한 blender script로 애니메이션
          프레임 최적화 등 3D, 에셋 최적화에 무엇보다 많이 신경씁니다.
        </p>
      </div>

      {/* // 정말 필요한 부분이라는게 뭘 말하는지 X  */}
      {/* // 핵심 내용이 없음 */}
      <div>
        <h2 className="font-subheading mb-2">
          💡프로젝트를 효율적으로 개발하려 노력합니다.
        </h2>
        <p className="font-body opacity-70">
          코드를 빠르고 잘 작성하는 것에만 국한되지 않고 UI/UX, 최적화 등 어떤
          부분이 부족하고 필수적인 부분인지 고민하면서 개발합니다. Cursor의
          Skills와 Agents.md를 적극 활용해 크레딧 소모를 줄이고 필요한 부분만
          적절하게 수정하는 방식으로 개발합니다.
        </p>
      </div>

      {/* <div>
        <p className="font-body opacity-70">
          새로운 기술을 시도하며. 이 포트폴리오도 WebGPU와 TSL로 처음부터 다시
          쌓아 올렸습니다.
        </p>
      </div> */}
    </>
  );
}

export default function Aboutme() {
  const render = useInteractionStore((s) => s.selected === "aboutme");
  const dancing = useAboutStore((s) => s.aboutDancing);
  const [active, setActive] = useState("whoami");
  const current = QUESATION.find((q) => q.name === active) ?? QUESATION[0];

  return (
    <AnimatePresence mode="wait">
      {render && (
        <motion.div
          key="about-panel"
          variants={container}
          initial="hidden"
          animate="show"
          exit="exit"
          className="pointer-events-none text-(--custom-white)"
        >
          {/* left: controls — keep narrow so character stays clear */}
          <aside className="pointer-events-auto fixed lg:top-8 top-6 left-[2vw] flex w-[22vw] max-w-64 flex-col items-start gap-6">
            <motion.div className="flex gap-4" variants={item}>
              <BackBtn />

              <motion.div variants={item}>
                <SquareBtn
                  onClick={() => {
                    const s = useAboutStore.getState();
                    s.aboutDancing ? s.stopAboutDance() : s.startAboutDance();
                  }}
                >
                  {dancing ? "■ stop" : "dance?"}
                </SquareBtn>
              </motion.div>
            </motion.div>

            <motion.div
              variants={item}
              className="flex w-full flex-col gap-2 font-code-sm"
            >
              <p className="font-code-xs opacity-50 mb-1">// topics</p>
              {QUESATION.map((v, i) => {
                const on = v.name === current.name;
                return (
                  <SquareBtn
                    key={v.name}
                    anime={false}
                    onClick={() => setActive(v.name)}
                    className={`flex font-code-sm font-bold fill-btn cursor-pointer border px-3 py-1.5  ${
                      on
                        ? "border-current/50 text-(--custom-brown) bg-(--custom-white)"
                        : "border-current/15 opacity-70"
                    }`}
                  >
                    <span className="flex gap-2 text-left">
                      <span className="opacity-40 ">{pad(i + 1)}</span>
                      <span>{v.qua}</span>
                    </span>
                  </SquareBtn>
                );
              })}
            </motion.div>
          </aside>

          {/* right: document */}
          <motion.section variants={item} className="relative page-container">
            <div className="font-code-xs"></div>

            <div className="font-code-xs mb-5 lg:mb-6">
              <p> ~/about_me</p>
              <p className=" opacity-40" aria-hidden>
                $ cat {current.name}.md
              </p>
              <h1 className="sr-only">{current.qua}</h1>
            </div>

            <div className={rule} />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.name}
                variants={container}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex max-h-[55vh] flex-col gap-3 break-keep"
              >
                <motion.div variants={item}>
                  <div className="flex flex-col gap-7 lg:gap-9">
                    {current.answer}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
