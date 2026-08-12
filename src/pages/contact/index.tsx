import { BackBtn, SquareLink } from "@/components/Buttons";
import { useInteractionStore } from "@/store/useInteractionStore";
import {
  AnimatePresence,
  easeInOut,
  easeOut,
  motion,
  type Variants,
} from "motion/react";
import { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";

const EMAIL = "jsweetpotato37@gmail.com";
const LINKS = [
  {
    label: "→ view blog",
    href: "https://resonant-kitchen-b1b.notion.site/4235a6d823fd41658ade513836ea9b52?v=060f694d23f742d7b53a9add5d19fe95&source=copy_link",
  },
  {
    label: "→ github profile",
    href: "https://github.com/jsweetpotato",
  },
] as const;

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

export default function Contact() {
  const render = useInteractionStore((s) => s.selected === "contact");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL).then(() => setCopied(true));
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {render && (
          <motion.section
            key="contact-note"
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
            className="pointer-events-auto relative page-container flex flex-col h-screen"
          >
            <motion.div variants={item} className="mb-10">
              <BackBtn />
            </motion.div>

            <motion.div variants={item} className="my-auto">
              <p
                className="hidden lg:flex font-code-xs opacity-50 mb-2"
                aria-hidden
              >
                $ cat contact.md
              </p>
              <motion.div variants={item} className="items-center gap-3 mb-6">
                <div className="relative">
                  <AnimatePresence>
                    {copied && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.05, ease: easeOut }}
                        className="absolute -top-9 left-0 flex items-center gap-1.5 px-3 py-1.5 bg-(--custom-white) text-(--custom-brown) rounded-full font-code-xs pointer-events-none shadow-md"
                      >
                        <FiCheck aria-hidden size={14} />
                        <span>copied!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="font-display text-left underline decoration-current/30 underline-offset-5 cursor-pointer hover:opacity-60 transition-opacity break-all"
                  >
                    {EMAIL}
                  </button>
                </div>
              </motion.div>

              <motion.p variants={item} className="font-code opacity-80 mt-1">
                궁금한 점, 협업, 커피챗 모두 편하게 메일 주세요.
              </motion.p>
              <motion.p
                variants={item}
                className="font-code opacity-80 mt-1 mb-6"
              >
                감사합니다 :)
              </motion.p>

              <motion.div variants={item} className={rule} />

              <div className="flex flex-col gap-3">
                <motion.p variants={item} className="font-code-xs opacity-50">
                  // links
                </motion.p>
                <motion.div
                  variants={item}
                  className="flex flex-wrap gap-3 font-code-sm uppercase"
                >
                  {LINKS.map(({ label, href }) => (
                    <SquareLink
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
                    </SquareLink>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
