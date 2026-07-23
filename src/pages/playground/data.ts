export type PlaygroundItem = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  link: string;
  image: string;
  video: string;
  device: string;
  // 창 크기 (px). 없으면 기본값 사용
  w?: number;
  h?: number;
};

export const PLAYGROUND_ITEMS: PlaygroundItem[] = [
  {
    id: 1,
    title: "Elemental cards",
    subtitle: "마우스에 반응하는 3D 인터랙티브 카드",
    description: "영화 엘리멘탈 캐릭터 카드를 만들어봤습니다. 포켓몬 카드깡처럼 반짝거리는 효과는 포켓카드를 참고해서 만들었습니다. 각 캐릭터 카드를 클릭하면 음악도 나옵니다.",
    link: "https://js-homework-mission-02.vercel.app/",
    image: "/images/elemental.webp",
    video: "/videos/elementalcard.mp4",
    device: "desktop",
    w: 360,
    h: 300
  },
  {
    id: 2,
    title: "Text particle",
    subtitle: "Three.js로 구현한 동적 텍스트 파티클 이펙트",
    description: "텍스트를 입력하고 Enter키를 누르면 파티클 애니메이션과 함께 텍스트가 나타납니다. 파티클 애니메이션은 Three.js를 사용해서 만들었습니다.",
    link: "https://text-particle.vercel.app/",
    image: "/images/textparticles.webp",
    video: "/videos/textparticles.mp4",
    device: "desktop",
    w: 300,
    h: 230
  },
  {
    id: 3,
    title: "Cosmetic",
    subtitle: "R3F로 구현한 화장품 소개 데모",
    description: "Blender 연습으로 만든 화장품을 R3F로 애니메이션과 함께 소개하는 데모 페이지입니다.",
    link: "https://cosmetic-rho.vercel.app/",
    image: "/images/cosmetic.webp",
    video: "/videos/cosmetic.mp4",
    device: "desktop",
    w: 340,
    h: 280
  },
  {
    id: 4,
    title: "Portal",
    subtitle: "Three.js journey의 portal 챕터 연습",
    description: "Three.js journey의 Portal 챕터를 참고해서 만든 포탈 데모입니다.",
    link: "https://crystal-portal.vercel.app/",
    image: "/images/portal.webp",
    video: "/videos/portal.mp4",
    device: "desktop",
    w: 300,
    h: 230
  },
  {
    id: 5,
    title: "Swiper TV",
    subtitle: "Swiper JS를 사용한 TV",
    description: "GSAP와 Swiper JS를 활용한 프로젝트 입니다. 망가진 TV를 두드려서 고칠 수 있습니다.",
    link: "https://tv-carousel-mission-03.vercel.app/",
    image: "/images/swipertv.webp",
    video: "/videos/swipertv.mp4",
    device: "desktop",
    w: 320,
    h: 250
  },
  {
    id: 6,
    title: "3rd Person Camera",
    subtitle: "Three.js 3인칭 시점 컨트롤러",
    description: "Grass를 개발하면서 만든 3인칭 시점 컨트롤러 데모입니다. 아직 데스크탑에서만 동작합니다. Shift를 누르면 데쉬도 할 수 있어요.",
    link: "https://3rd-person-controller-tau.vercel.app/",
    image: "/images/third-person-camera.webp",
    video: "/videos/third-person-camera.mp4",
    device: "desktop",
    w: 340,
    h: 270
  }
];
