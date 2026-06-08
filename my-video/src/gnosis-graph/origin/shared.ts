import { interpolate, spring } from "remotion";

export const ORIGIN_SCENE_DURATION = 300;

export const waveformY = (
  frame: number,
  xNorm: number,
  baseY: number,
  amp: number,
  phase = 0,
) => {
  const t = frame / 30 + phase;
  const wave =
    Math.sin(xNorm * 10 + t * 4.2) * 0.42 +
    Math.sin(xNorm * 22 + t * 6.5) * 0.28 +
    Math.sin(xNorm * 5 + t * 2.1) * 0.18 +
    Math.sin(xNorm * 38 + t * 9) * 0.12;
  return baseY - wave * amp;
};

/** Onda invertida (picos hacia abajo) para el podcast inferior */
export const waveformYInverted = (
  frame: number,
  xNorm: number,
  baseY: number,
  amp: number,
  phase = 0,
) => {
  const t = frame / 30 + phase;
  const wave =
    Math.sin(xNorm * 8 + t * 3.8) * 0.4 +
    Math.sin(xNorm * 19 + t * 5.9) * 0.3 +
    Math.sin(xNorm * 4 + t * 1.9) * 0.2 +
    Math.sin(xNorm * 31 + t * 8.2) * 0.1;
  return baseY + wave * amp;
};

export const buildWavePath = (
  frame: number,
  x0: number,
  x1: number,
  baseY: number,
  amp: number,
  samples = 64,
  inverted = false,
  phase = 0,
  scroll = 0.018,
) => {
  const sampleY = inverted ? waveformYInverted : waveformY;
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = x0 + (x1 - x0) * t;
    const y = sampleY(frame, t * 6 + frame * scroll, baseY, amp, phase);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

export const popIn = (frame: number, appearFrame: number, fps: number) => {
  const progress = spring({
    frame: frame - appearFrame,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.48 },
  });
  const opacity = interpolate(frame - appearFrame, [0, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {
    scale: progress,
    opacity,
    slideY: interpolate(progress, [0, 1], [-14, 0]),
  };
};

export const barEnergy = (frame: number, xNorm: number) =>
  Math.abs(
    Math.sin(xNorm * 10 + frame * 0.22) * 0.5 +
      Math.sin(xNorm * 22 + frame * 0.35) * 0.35 +
      Math.sin(xNorm * 5 + frame * 0.12) * 0.25,
  );
