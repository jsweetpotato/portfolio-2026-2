// components/Menu.tsx
import { useInteractionStore } from "@/store/useInteractionStore";
import { AnimatePresence, motion, useDragControls, type Variants } from "motion/react";
import { useRef, useState } from "react";

const MENU_ITEMS = [
  { id: "project", label: "project", desc: "작업물 모음" },
  { id: "aboutme", label: "about me", desc: "소개" },
  { id: "contact", label: "contact", desc: "연락처" },
  { id: "playground", label: "playground", desc: "실험작" }
];

export default function Menu() {
  <AnimatePresence mode="wait">
    <div>
      <button>Menu</button>
      <button aria-disabled> </button>
    </div>
  </AnimatePresence>;
}
