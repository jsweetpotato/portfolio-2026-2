import { MuteButton } from "@/audio/useBackgroundAudio";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { FiInfo, FiX } from "react-icons/fi";
import { BackBtn, SquareBtn } from "./Buttons";
import { playZoomIn, playZoomOut } from "@/audio/useSelectionZoomAudio";

const CREDITS = [
  {
    label: "music",
    author: "Samuel F. Johanns",
    authorHref:
      "https://pixabay.com/users/samuelfjohanns-1207793/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=122133",
    sourceHref:
      "https://pixabay.com/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=122133",
  },
  {
    label: "ambient",
    author: "freesound_community",
    authorHref:
      "https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=108373",
    sourceHref:
      "https://pixabay.com/sound-effects/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=108373",
  },
  {
    label: "click",
    author: "Eduardo Rodrigues",
    authorHref:
      "https://pixabay.com/users/iedurodrigues-27915902/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=112941",
    sourceHref:
      "https://pixabay.com/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=112941",
  },
  {
    label: "hover",
    author: "Samuel F. Johanns",
    authorHref:
      "https://pixabay.com/users/samuelfjohanns-1207793/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=122131",
    sourceHref:
      "https://pixabay.com/sound-effects/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=122131",
  },
  {
    label: "duck",
    author: "juniorsoundays",
    authorHref:
      "https://pixabay.com/users/juniorsoundays-19205462/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=527841",
    sourceHref:
      "https://pixabay.com/sound-effects/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=527841",
  },
] as const;

const linkCls =
  "underline decoration-current/30 underline-offset-2 hover:opacity-100 opacity-80 transition-opacity";

const soft = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

export default function Footer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <footer className="fixed inset-x-0 bottom-3 flex justify-between items-center px-6 lg:px-12 font-code-xs text-(--custom-white)/60">
      <p>ⓒ Jisu Kim 2026</p>

      <div className="flex gap-2">
        <button
          type="button"
          aria-label="크레딧 정보"
          aria-expanded={open}
          onClick={() => {
            playZoomIn();
            setOpen(true);
          }}
          className="cursor-pointer p-2 opacity-70 transition-opacity hover:opacity-100"
        >
          <FiInfo size={23} />
        </button>
        <MuteButton />
      </div>

      {/* Separate presence roots so backdrop + panel both finish exit */}
      <AnimatePresence>
        {open && (
          <motion.button
            key="credits-backdrop"
            type="button"
            aria-label="추가정보 창 닫기"
            className="fixed inset-0 z-50 cursor-pointer bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={soft}
            onClick={() => {
              playZoomOut();
              setOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="credits-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="credits-title"
            className="fixed inset-0 z-50 m-auto h-fit w-[calc(100%-3rem)] max-w-lg border border-(--custom-white)/20 bg-(--custom-brown)/90 px-7 py-6 font-code-xs tracking-wide text-(--custom-white)"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={soft}
          >
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <p id="credits-title" className="opacity-50">
                  $ cat attribution.md
                </p>
              </div>
              <SquareBtn
                type="button"
                aria-label="추가정보 창 닫기"
                sound={false}
                onClick={() => {
                  playZoomOut();
                  setOpen(false);
                }}
              >
                <FiX size={14} className="inline" /> close
              </SquareBtn>
            </div>

            <h2 className="mb-1 font-medium text-[clamp(1.1rem,2vw,1.45rem)] leading-tight tracking-normal">
              Sound credits
            </h2>
            <p className="mb-6 opacity-70">
              Effects used in this portfolio · sourced from Pixabay
            </p>

            <div className="mb-4 border-t border-current/15" />

            <p className="mb-3 opacity-50">// attribution log</p>
            <ul className="flex flex-col gap-2.5">
              {CREDITS.map((c, i) => (
                <li
                  key={c.label}
                  className="flex gap-3 border border-current/10 bg-black/10 px-3 py-2.5 leading-relaxed"
                >
                  <span className="shrink-0 opacity-40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-16 shrink-0 text-yellow">{c.label}</span>
                  <span className="min-w-0 opacity-90">
                    by
                    <a
                      href={c.authorHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      {c.author}
                    </a>
                    <span className="opacity-40"> · </span>
                    <a
                      href={c.sourceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      Pixabay
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
