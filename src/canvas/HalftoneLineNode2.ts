import { Fn, dot, float, screenSize, screenUV, smoothstep, texture, vec2, vec3, vec4 } from "three/tsl";
import type * as THREE from "three/webgpu";

const CELL_SIZE = 3.5;
const DARK_CUT = 0.15;
const DARK_TRANSITION = 0.3;
const ANTIALIAS_WIDTH = 1.25;

export function halftoneLineNode(outputNode: THREE.TextureNode) {
  return Fn(() => {
    const pixel = screenUV.mul(screenSize).toVar();
    const leftX = pixel.x.div(CELL_SIZE).floor().mul(CELL_SIZE).toVar();
    const rightX = leftX.add(CELL_SIZE);

    const leftUV = vec2(leftX, pixel.y).div(screenSize);
    const rightUV = vec2(rightX, pixel.y).div(screenSize);

    const leftSample = texture(outputNode, leftUV);
    const rightSample = texture(outputNode, rightUV);
    const luminanceWeights = vec3(0.299, 0.587, 0.114);

    const leftLuminance = dot(leftSample.rgb, luminanceWeights);
    const rightLuminance = dot(rightSample.rgb, luminanceWeights);
    const darkEdge = float(DARK_CUT).add(DARK_TRANSITION);

    const leftResponse = smoothstep(DARK_CUT, darkEdge, leftLuminance).toVar();
    const rightResponse = smoothstep(DARK_CUT, darkEdge, rightLuminance).toVar();

    const leftRadius = leftResponse.mul(leftResponse.sqrt()).mul(CELL_SIZE);
    const rightRadius = rightResponse.mul(rightResponse.sqrt()).mul(CELL_SIZE);

    const leftCoverage = leftRadius.sub(pixel.x.sub(leftX)).div(ANTIALIAS_WIDTH).saturate();
    const rightCoverage = rightRadius.sub(rightX.sub(pixel.x)).div(ANTIALIAS_WIDTH).saturate();

    const line = leftCoverage.add(rightCoverage).mul(2).saturate();
    return vec4(vec3(line), float(1));
  })();
}
