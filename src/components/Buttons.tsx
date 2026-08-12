import { useInteractionStore } from "@/store/useInteractionStore";
import { playButtonClick, playButtonHover } from "@/audio/buttonSfx";
import { useCallback } from "react";
import {
  motion,
  useAnimationControls,
  type HTMLMotionProps,
} from "motion/react";
import { playZoomOut } from "@/audio/useSelectionZoomAudio";

const BLINK_MS = 360;

export function SquareBtn({
  children,
  onClick,
  onMouseEnter,
  sound = true,
  anime = true,
  className = "",
  ...rest
}: React.ComponentProps<"button"> & { sound?: boolean; anime?: boolean }) {
  const controls = useAnimationControls();
  return (
    <button
      className={`font-code-xs uppercase tracking-wide fill-btn cursor-pointer border border-current/15 px-3 py-1.5 ${className}`}
      {...rest}
      onMouseEnter={(e) => {
        // playButtonHover();
        onMouseEnter?.(e);
      }}
      onClick={async (e) => {
        if (sound) playButtonClick();
        onClick?.(e);
        if (anime)
          await controls.start({
            opacity: [1, 0, 1, 0, 1],
            transition: { duration: BLINK_MS / 2000, ease: "linear" },
          });
      }}
    >
      <motion.span className="inline-block" animate={controls}>
        {children}
      </motion.span>
    </button>
  );
}

export function SquareLink({
  children,
  href,
  onClick,
  onMouseEnter,
  target,
  className = "",
  ...rest
}: Omit<HTMLMotionProps<"a">, "children"> & {
  children?: React.ReactNode;
}) {
  const controls = useAnimationControls();

  return (
    <motion.a
      href={href}
      target={target}
      className={`font-code-sm uppercase tracking-wide fill-btn cursor-pointer fill-a border border-current/60 px-3 py-1.5 ${className}`}
      animate={controls}
      initial={{ opacity: 1 }}
      {...rest}
      onMouseEnter={(e) => {
        // playButtonHover();
        onMouseEnter?.(e);
      }}
      onClick={async (e) => {
        e.preventDefault();
        playButtonClick();

        await controls.start({
          opacity: [1, 0, 1, 0, 1],
          transition: { duration: BLINK_MS / 2000, ease: "linear" },
        });
        if (!href) return;
        if (target === "_blank")
          window.open(href, "_blank", "noopener,noreferrer");
        else window.location.assign(href);
      }}
    >
      {children}
    </motion.a>
  );
}

export function BackBtn({ cb }: { cb?: () => void }) {
  const select = useInteractionStore((s) => s.select);

  const click = useCallback(() => {
    setTimeout(() => {
      select(null);
      playZoomOut();
      cb?.();
    }, 0);
  }, [select, cb]);
  return (
    <SquareBtn onClick={click} aria-label="뒤로가기" sound={false}>
      ← back
    </SquareBtn>
  );
}
