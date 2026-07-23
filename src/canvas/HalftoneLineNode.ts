import {
  Fn,
  float,
  vec2,
  vec4,
  uniform,
  screenUV,
  texture,
  sin,
  cos,
  sqrt,
  pow,
  abs,
  mod,
  floor,
  clamp,
  mix,
  dot,
  If,
  step,
} from "three/tsl";
import * as THREE from "three/webgpu";

/**
 * Line Halftone TSL Node
 *
 * 원본: HalftoneShader.js (shape=3 LINE) 로직 정확히 포팅
 * 검증된 JS 로직 기반으로 TSL 변환
 *
 * 사용법:
 *   const scenePass = pass(scene, camera);
 *   const outputTex = scenePass.getTextureNode("output");
 *   const { node, uniforms } = halftoneLineNode(outputTex);
 *   const pipeline = new THREE.RenderPipeline(renderer, node);
 *   uniforms.uRadius.value = 4;
 *   uniforms.uWidth.value = window.innerWidth;
 *   uniforms.uHeight.value = window.innerHeight;
 */
export function halftoneLineNode(outputNode: any) {
  // ── Uniforms ──────────────────────────────────────────────────────────────
  const uRadius = uniform(4.0); // 셀 크기 (줄 간격)
  const uAngle = uniform(0.0); // 줄 각도 (0 = 수직)
  const uWidth = uniform(1280.0); // 화면 픽셀 너비
  const uHeight = uniform(720.0); // 화면 픽셀 높이
  const uBlending = uniform(1.0); // 원본과 블렌딩 강도 (0~1)

  // ── 메인 노드 ─────────────────────────────────────────────────────────────
  // 모든 계산을 하나의 Fn 안에서 인라인으로 처리
  // (중첩 Fn 호출은 TSL에서 불안정하므로 사용하지 않음)
  const node = Fn(() => {
    const uv = screenUV;

    // 픽셀 좌표
    const px = uv.x.mul(uWidth);
    const py = uv.y.mul(uHeight);

    // ── getReferenceCell 인라인 ─────────────────────────────────────────────
    // 원본: vec2 n = vec2(cos(angle), sin(angle))
    const nx = cos(uAngle);
    const ny = sin(uAngle);

    const cellSize = uRadius;
    const threshold = cellSize.mul(0.5);

    // dot_normal = n · (p - origin)  (origin = 0이므로 n · p)
    const dot_normal = nx.mul(px).add(ny.mul(py));
    const dot_line = ny.negate().mul(px).add(nx.mul(py));

    // offset = n * dot_normal
    const offset_x = nx.mul(dot_normal);
    const offset_y = ny.mul(dot_normal);

    // offset_normal = mod(|offset|, step)
    const offset_normal = sqrt(
      offset_x.mul(offset_x).add(offset_y.mul(offset_y)),
    ).mod(cellSize);

    // normal_dir = dot_normal < 0 ? 1 : -1
    // TSL에서 조건부: sign 사용 (음수→-1, 양수→1) → 반전
    // dot_normal < 0이면 1.0, 아니면 -1.0
    const normal_dir = dot_normal.sign().negate(); // sign: <0→-1, ≥0→1 → negate: <0→1, ≥0→-1

    // normal_scale = (offset_normal < threshold ? -offset_normal : step - offset_normal) * normal_dir
    // smoothstep 대신 mix+step으로 구현
    // offset_normal < threshold → isBelow = 1, else = 0
    const isBelow_n = float(1).sub(step(threshold, offset_normal)); // step(edge,x): x>=edge→1
    const normal_scale_abs = mix(
      cellSize.sub(offset_normal),
      offset_normal.negate(),
      isBelow_n,
    );
    const normal_scale = normal_scale_abs.mul(normal_dir);

    // offset_line = mod(|(p - offset) - origin|, step)
    const remain_x = px.sub(offset_x);
    const remain_y = py.sub(offset_y);
    const offset_line = sqrt(
      remain_x.mul(remain_x).add(remain_y.mul(remain_y)),
    ).mod(cellSize);

    const line_dir = dot_line.sign().negate();

    const isBelow_l = float(1).sub(step(threshold, offset_line));
    const line_scale_abs = mix(
      cellSize.sub(offset_line),
      offset_line.negate(),
      isBelow_l,
    );
    const line_scale = line_scale_abs.mul(line_dir);

    // p1 = p - n * normal_scale + n_perp * line_scale
    // n_perp = (-ny, nx) 이지만 원본은 (ny, -nx) 방향 → 원본 확인
    // 원본: c.p1.x = p.x - n.x * normal_scale + n.y * line_scale
    //       c.p1.y = p.y - n.y * normal_scale - n.x * line_scale
    const p1x = px.sub(nx.mul(normal_scale)).add(ny.mul(line_scale));
    const p1y = py.sub(ny.mul(normal_scale)).sub(nx.mul(line_scale));

    // p2, p3, p4 (인접 셀 중심)
    const normal_step = normal_dir.mul(
      mix(cellSize, cellSize.negate(), isBelow_n),
    );
    const line_step = line_dir.mul(mix(cellSize, cellSize.negate(), isBelow_l));

    const p2x = p1x.sub(nx.mul(normal_step));
    const p2y = p1y.sub(ny.mul(normal_step));
    const p3x = p1x.add(ny.mul(line_step));
    const p3y = p1y.sub(nx.mul(line_step));
    const p4x = p1x.sub(nx.mul(normal_step)).add(ny.mul(line_step));
    const p4y = p1y.sub(ny.mul(normal_step)).sub(nx.mul(line_step));

    // ── getSample 인라인 (단순화: 1샘플) ──────────────────────────────────
    // 원본은 8샘플 평균이지만 단순화
    const samp1 = texture(outputNode, vec2(p1x.div(uWidth), p1y.div(uHeight)));
    const samp2 = texture(outputNode, vec2(p2x.div(uWidth), p2y.div(uHeight)));
    const samp3 = texture(outputNode, vec2(p3x.div(uWidth), p3y.div(uHeight)));
    const samp4 = texture(outputNode, vec2(p4x.div(uWidth), p4y.div(uHeight)));

    // ── luminance (greyscale) ─────────────────────────────────────────────
    const lum1 = samp1.r
      .mul(0.299)
      .add(samp1.g.mul(0.587))
      .add(samp1.b.mul(0.114));
    const lum2 = samp2.r
      .mul(0.299)
      .add(samp2.g.mul(0.587))
      .add(samp2.b.mul(0.114));
    const lum3 = samp3.r
      .mul(0.299)
      .add(samp3.g.mul(0.587))
      .add(samp3.b.mul(0.114));
    const lum4 = samp4.r
      .mul(0.299)
      .add(samp4.g.mul(0.587))
      .add(samp4.b.mul(0.114));

    // ── distanceToDotRadius LINE 인라인 ──────────────────────────────────
    // rad = pow(abs(channel), 1.5) * radius
    // dot_p = (p_center.x - p.x) * nx + (p_center.y - p.y) * ny
    // dist = hypot(nx * dot_p, ny * dot_p)
    // result = rad - dist

    // ✅ 이 부분 추가 - 어두운 곳 임계값 처리
    const darkCut = float(0.15); // 이 값 이하는 줄 안 그림
    const s1 = lum1.smoothstep(darkCut, darkCut.add(float(0.3)));
    const s2 = lum2.smoothstep(darkCut, darkCut.add(float(0.3)));
    const s3 = lum3.smoothstep(darkCut, darkCut.add(float(0.3)));
    const s4 = lum4.smoothstep(darkCut, darkCut.add(float(0.3)));

    const rad1 = pow(abs(s1), float(1.5)).mul(uRadius);
    const rad2 = pow(abs(s2), float(1.5)).mul(uRadius);
    const rad3 = pow(abs(s3), float(1.5)).mul(uRadius);
    const rad4 = pow(abs(s4), float(1.5)).mul(uRadius);

    const dp1 = p1x.sub(px).mul(nx).add(p1y.sub(py).mul(ny));
    const d1 = sqrt(
      nx
        .mul(dp1)
        .mul(nx.mul(dp1))
        .add(ny.mul(dp1).mul(ny.mul(dp1))),
    );

    const dp2 = p2x.sub(px).mul(nx).add(p2y.sub(py).mul(ny));
    const d2 = sqrt(
      nx
        .mul(dp2)
        .mul(nx.mul(dp2))
        .add(ny.mul(dp2).mul(ny.mul(dp2))),
    );

    const dp3 = p3x.sub(px).mul(nx).add(p3y.sub(py).mul(ny));
    const d3 = sqrt(
      nx
        .mul(dp3)
        .mul(nx.mul(dp3))
        .add(ny.mul(dp3).mul(ny.mul(dp3))),
    );

    const dp4 = p4x.sub(px).mul(nx).add(p4y.sub(py).mul(ny));
    const d4 = sqrt(
      nx
        .mul(dp4)
        .mul(nx.mul(dp4))
        .add(ny.mul(dp4).mul(ny.mul(dp4))),
    );

    // aa = radius < 2.5 ? radius * 0.5 : 1.25
    // TSL: mix(float(1.25), uRadius.mul(0.5), step(uRadius, float(2.5)))
    const aa = mix(float(1.25), uRadius.mul(0.5), step(uRadius, float(2.5)));

    // res = clamp(dist_c > 0 ? dist_c / aa : 0, 0, 1) × 4개 합산
    const r1 = clamp(rad1.sub(d1).div(aa), float(0), float(1));
    const r2 = clamp(rad2.sub(d2).div(aa), float(0), float(1));
    const r3 = clamp(rad3.sub(d3).div(aa), float(0), float(1));
    const r4 = clamp(rad4.sub(d4).div(aa), float(0), float(1));

    const res = clamp(r1.add(r2).add(r3).add(r4), float(0), float(1));

    // ── blendColour (LINEAR mode) ────────────────────────────────────────
    // 원본: blend(a, b, 1.0 - t) = a * t + b * (1-t)
    // res = halftone 값, colour = 원본 텍스처
    const original = texture(outputNode, uv);
    const grey = res; // greyscale 고정

    // blendColour(res, colour.r, blending) = res * blending + colour.r * (1 - blending)
    const finalR = grey
      .mul(uBlending)
      .add(original.r.mul(float(1).sub(uBlending)));
    const finalG = grey
      .mul(uBlending)
      .add(original.g.mul(float(1).sub(uBlending)));
    const finalB = grey
      .mul(uBlending)
      .add(original.b.mul(float(1).sub(uBlending)));

    return vec4(finalR, finalG, finalB, float(1));
  })();

  return {
    node,
    uniforms: { uRadius, uAngle, uWidth, uHeight, uBlending },
  };
}
