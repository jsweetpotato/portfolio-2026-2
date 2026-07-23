import { Fn, dot, float, screenSize, screenUV, smoothstep, step, texture, vec2, vec3, vec4 } from "three/tsl";
import type * as THREE from "three/webgpu";

const CELL_SIZE = 3.5;
const HALF_CELL = CELL_SIZE * 0.5;
const DARK_CUT = 0.15;
const DARK_EDGE = 0.45;
const ANTIALIAS_WIDTH = 1.25;

export function optimizedHalftoneLineNode(outputNode: THREE.TextureNode) {
  return Fn(() => {
    const pixel = screenUV.mul(screenSize).toVar();
    const cellOffset = pixel.mod(CELL_SIZE).toVar();
    const nearestCell = pixel.div(CELL_SIZE).add(0.5).floor().mul(CELL_SIZE).toVar();
    const neighborDirection = step(HALF_CELL, cellOffset).mul(2).sub(1);
    const neighborCell = nearestCell.add(neighborDirection.mul(CELL_SIZE)).toVar();

    const nearestDistance = nearestCell.x.sub(pixel.x).abs();
    const neighborDistance = neighborCell.x.sub(pixel.x).abs();
    const inverseScreenSize = screenSize.reciprocal();

    const sample1 = texture(outputNode, nearestCell.mul(inverseScreenSize));
    const sample2 = texture(outputNode, vec2(neighborCell.x, nearestCell.y).mul(inverseScreenSize));
    const sample3 = texture(outputNode, vec2(nearestCell.x, neighborCell.y).mul(inverseScreenSize));
    const sample4 = texture(outputNode, neighborCell.mul(inverseScreenSize));
    const luminanceWeights = vec3(0.299, 0.587, 0.114);

    const response1 = smoothstep(DARK_CUT, DARK_EDGE, dot(sample1.rgb, luminanceWeights)).toVar();
    const response2 = smoothstep(DARK_CUT, DARK_EDGE, dot(sample2.rgb, luminanceWeights)).toVar();
    const response3 = smoothstep(DARK_CUT, DARK_EDGE, dot(sample3.rgb, luminanceWeights)).toVar();
    const response4 = smoothstep(DARK_CUT, DARK_EDGE, dot(sample4.rgb, luminanceWeights)).toVar();

    const radius1 = response1.mul(response1.sqrt()).mul(CELL_SIZE);
    const radius2 = response2.mul(response2.sqrt()).mul(CELL_SIZE);
    const radius3 = response3.mul(response3.sqrt()).mul(CELL_SIZE);
    const radius4 = response4.mul(response4.sqrt()).mul(CELL_SIZE);

    const coverage1 = radius1.sub(nearestDistance).div(ANTIALIAS_WIDTH).saturate();
    const coverage2 = radius2.sub(neighborDistance).div(ANTIALIAS_WIDTH).saturate();
    const coverage3 = radius3.sub(nearestDistance).div(ANTIALIAS_WIDTH).saturate();
    const coverage4 = radius4.sub(neighborDistance).div(ANTIALIAS_WIDTH).saturate();

    const line = coverage1.add(coverage2, coverage3, coverage4).saturate();
    return vec4(vec3(line), float(1));
  })();
}
