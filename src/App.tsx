import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import WebGLCanvas from "@/canvas/Canvas";

import { useBackgroundAudio } from "@/audio/useBackgroundAudio";
import { bakeZoomSfx } from "@/audio/useSelectionZoomAudio";
import Projects from "@/pages/projects";
import Aboutme from "@/pages/about";
import Footer from "@/components/Footer";
import CheckRotate from "@/components/CheckRotate";
import { Playground } from "@/pages/playground";
import Contact from "./pages/contact";

function LenisEffects() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const ro = new ResizeObserver(() => lenis.resize());
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [lenis]);

  return null;
}

export default function App() {
  useBackgroundAudio();
  useEffect(() => {
    void bakeZoomSfx();
  }, []);

  return (
    <>
      <WebGLCanvas />
      <ReactLenis root options={{ lerp: 0.1, syncTouch: true }}>
        <LenisEffects />
        <Projects />
        <Aboutme />
        <Playground />
      </ReactLenis>
      <CheckRotate />
      <div className="layer w-full h-full fixed inset-0 select-none pointer-events-none mix-blend-lighten opacity-3" />
      <Contact />
      <Footer />
    </>
  );
}
