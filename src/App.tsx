import WebGLCanvas from "@/canvas/Canvas";
// import { SiNotion, SiGithub } from "react-icons/si";

import { useInfiniteLenis } from "./hooks/useLenis";
import Projects from "./pages/projects";
import Aboutme from "./pages/about";
import Footer from "./components/Footer";
import { Playground } from "./pages/playground";
import Menu from "./components/Menu";

export default function App() {
  useInfiniteLenis({ infinite: false, lerp: 0.1 });

  return (
    <>
      <WebGLCanvas />
      {/* <Menu /> */}
      <Projects />
      <Aboutme />

      <Playground />
      <div id="rotate-message">
        <span>🔄</span>
        <p>가로 모드로 회전해주세요</p>
      </div>

      <div className="layer w-full h-full fixed inset-0  select-none pointer-events-none mix-blend-lighten opacity-3"></div>
      <Footer />
    </>
  );
}
