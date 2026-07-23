// components/ObjectLabel.tsx
import { Html } from "@react-three/drei";
import { useInteractionStore } from "@/store/useInteractionStore";
import { AnimatePresence, motion } from "motion/react";
import type { Vector3 } from "three";

type Props = {
  name: string; // "project" 같은 내부 이름
  label: string; // "project", "about me" 등 표시할 텍스트
  position?: [number, number, number] | Vector3; // 오브젝트 기준 라벨 높이
};

export default function ObjectLabel({ name, label, position = [0, 3, 0] }: Props) {
  const show = useInteractionStore((s) => s.hovered === name && !s.selected);

  return (
    <Html position={position} center zIndexRange={[50, 0]} style={{ pointerEvents: "none" }}>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="whitespace-nowrap font-mono-xs uppercase tracking-wide text-[#f5efe2] border border-current/40 bg-[#2a251f]/80 backdrop-blur-sm px-3 py-1.5">
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </Html>
  );
}
