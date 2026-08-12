import { useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { OrthographicCamera } from "three/webgpu";
import { useIsMobile } from "@/hooks/useIsMobile";

// ResizeHandler.tsx
interface ResizeHandlerProps {
  contentWidth: number;
  contentHeight: number;
}

export default function ResizeHandler({
  contentWidth,
  contentHeight,
}: ResizeHandlerProps) {
  const { gl, camera, size } = useThree();
  const isMobile = useIsMobile();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const aspect = size.width / size.height;
      const contentAspect = contentWidth / contentHeight;

      let camWidth: number;
      let camHeight: number;

      if (aspect > contentAspect) {
        camHeight = contentHeight / 2;
        camWidth = camHeight * aspect;
      } else {
        camWidth = contentWidth / 2;
        camHeight = camWidth / aspect;
      }

      if (camera instanceof OrthographicCamera) {
        camera.left = -camWidth;
        camera.right = camWidth;
        camera.top = camHeight;
        camera.bottom = -camHeight;
        camera.updateProjectionMatrix();
      }

      gl.setSize(size.width, size.height);
      // 모바일은 고DPR 기기에서 선명도를 위해 최대 2배까지, 데스크톱은 1배 유지
      gl.setPixelRatio(isMobile ? 2 : 1);
    }, 100);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [size, gl, camera, contentWidth, contentHeight, isMobile]);

  return null;
}
