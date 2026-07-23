import { useInteractionStore } from "@/store/useInteractionStore";
import { useState, useEffect } from "react";

export default function Aboutme() {
  const selected = useInteractionStore((s) => s.selected);
  const [render, setRender] = useState(false);

  useEffect(() => {
    setRender(selected === "aboutme");
  }, [selected]);

  return (
    render && (
      <section style={{ position: "relative", width: "100%" }}>
        <h1 style={{ margin: 0, lineHeight: " 160%" }}>안녕하세요. 다양한 3D 인터렉션 및 셰이더를 활용한 개발을 좋아하는 개발자 지수입니다!</h1>

        <h2>만들어 보고 싶은건 다 만들어보는 개발자</h2>
        <p>생동감있고 시각적으로 흥미로운 웹사이트를 만드는 것을 좋아합니다.</p>
        <p>특히 Three.js를 활용한 웹 개발에 자신있습니다.</p>

        <p>구현하고 싶은게 생기면 끝까지 집요하게 만듭니다.</p>
        <p>처음 웹에서 3D를 구현할 때 </p>

        <h2>glsl shader coding</h2>
      </section>
    )
  );
}
