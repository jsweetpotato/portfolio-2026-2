// A11yButtons.tsx
import { useInteractionStore } from "@/store/useInteractionStore";
import { useCallback, useRef } from "react";

const objects = [
  { id: "playground", label: "오리 꿱 꿱" },
  { id: "project", label: "컴퓨터. 클릭하면 화면이 켜집니다" },
  { id: "aboutme", label: "책. 클릭하면 정보를 봅니다" },
  { id: "contact", label: "커피 컵. 클릭하면 정보를 봅니다" }
];

export default function A11yButtons() {
  const btnContainer = useRef<HTMLDivElement | null>(null);
  const select = useInteractionStore((s) => s.select);
  const setHovered = useInteractionStore((s) => s.setHovered);
  const selected = useInteractionStore((s) => s.selected);

  return (
    <div ref={btnContainer} role="group" aria-label="씬의 인터랙티브 오브젝트">
      {objects.map((o) => (
        <button
          key={o.id}
          className="sr-only"
          onClick={() => select(o.id)}
          onFocus={() => setHovered(o.id)} // 키보드 포커스 → hover
          onBlur={() => setHovered(null)}
          onPointerOver={() => setHovered(o.id)} // 마우스도 동일
          onPointerOut={() => setHovered(null)}
          disabled={!!selected}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
