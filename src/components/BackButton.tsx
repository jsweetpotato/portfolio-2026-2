import { useInteractionStore } from "@/store/useInteractionStore";
import { useCallback } from "react";

export default function BackBtn({ cb }: { cb?: () => void }) {
  const select = useInteractionStore((s) => s.select);
  const click = useCallback(() => {
    select(null);
    cb?.();
  }, [select]);
  return (
    <button onClick={click} className="font-mono-xs uppercase tracking-wide fill-btn cursor-pointer border border-current/25 px-3 py-1.5 " aria-label="뒤로가기">
      ← back
    </button>
  );
}
