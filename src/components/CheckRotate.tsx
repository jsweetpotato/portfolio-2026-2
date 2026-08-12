import { MdScreenRotation } from "react-icons/md";
import { motion } from "motion/react";

// 세로 화면에서만 보이는 전체 화면 안내. 표시 여부는 portrait 미디어 쿼리만으로 결정한다.
export default function CheckRotate() {
  return (
    <div
      role="alertdialog"
      aria-label="가로 모드로 회전해주세요"
      className="fixed inset-0 z-9999 hidden portrait:flex flex-col items-center justify-center gap-6 bg-[#2a2520] px-8 text-center text-[#d4ce9c]"
    >
      <motion.span
        aria-hidden
        className="inline-block"
        animate={{ rotate: [0, 0, -90, -90, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.15, 0.45, 0.8, 1],
        }}
      >
        <MdScreenRotation size={64} />
      </motion.span>

      <p className="font-heading">가로 모드로 회전해주세요</p>

      <span aria-hidden className="h-px w-16 bg-current opacity-25" />
    </div>
  );
}
