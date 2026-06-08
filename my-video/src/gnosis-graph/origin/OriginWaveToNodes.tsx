import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GridBackground } from "../GridBackground";
import { GraphEdges, type GraphEdge } from "../GraphEdges";
import { getNodeSize, MinimalNode, squareToneForId } from "../MinimalNode";
import { EOM, FONT } from "../theme";
import { clampInterp } from "../util";
import {
  buildWavePath,
  ORIGIN_SCENE_DURATION,
  popIn,
  waveformY,
} from "./shared";

const PAD = 96;

const PEAKS: Array<{ frame: number; t: number; lift: number }> = [
  { frame: 36, t: 0.08, lift: 0 },
  { frame: 56, t: 0.18, lift: 1 },
  { frame: 76, t: 0.28, lift: 0 },
  { frame: 96, t: 0.38, lift: 2 },
  { frame: 118, t: 0.48, lift: 1 },
  { frame: 140, t: 0.58, lift: 0 },
  { frame: 164, t: 0.68, lift: 2 },
  { frame: 188, t: 0.78, lift: 1 },
  { frame: 212, t: 0.88, lift: 0 },
  { frame: 236, t: 0.95, lift: 1 },
];

const PARENT: Array<number | null> = [
  null, 0, 0, 1, 2, 3, 4, 5, 6, 7,
];

export const OriginWaveToNodes: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const fadeOut = clampInterp(
    frame,
    [ORIGIN_SCENE_DURATION - 20, ORIGIN_SCENE_DURATION],
    [1, 0],
  );

  const waveBaseY = height * 0.72;
  const waveAmp = 88;
  const x0 = PAD;
  const x1 = width - PAD;

  const nodes = PEAKS.map((peak, i) => {
    const depth = i < 2 ? 1 : i < 5 ? 2 : 3;
    const size = getNodeSize(depth);
    const px = x0 + (x1 - x0) * peak.t;
    const py = waveBaseY - waveAmp - 100 - peak.lift * 72;
    return {
      id: `n${i}`,
      x: px - size.w / 2,
      y: py,
      depth,
      appearFrame: peak.frame,
      tone: squareToneForId(`n${i}`),
      peakX: px,
      peakT: peak.t,
    };
  });

  const edges: GraphEdge[] = PEAKS.flatMap((peak, i) => {
    const parentIdx = PARENT[i];
    if (parentIdx === null) {
      return [];
    }
    const parent = nodes[parentIdx]!;
    const child = nodes[i]!;
    const pSize = getNodeSize(parent.depth);
    const cSize = getNodeSize(child.depth);
    return [
      {
        id: `e${i}`,
        x1: parent.x + pSize.w / 2,
        y1: parent.y + pSize.h,
        x2: child.x + cSize.w / 2,
        y2: child.y,
        appearFrame: peak.frame + 2,
      },
    ];
  });

  return (
    <AbsoluteFill
      style={{
        background: EOM.white,
        fontFamily: FONT.mono,
        opacity: fadeOut,
      }}
    >
      <GridBackground />

      <GraphEdges edges={edges} frame={frame} width={width} height={height} />

      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
      >
        <line
          x1={x0}
          y1={waveBaseY + waveAmp + 28}
          x2={x1}
          y2={waveBaseY + waveAmp + 28}
          stroke={EOM.border}
          strokeWidth={2}
        />
        <path
          d={buildWavePath(frame, x0, x1, waveBaseY, waveAmp)}
          fill="none"
          stroke={EOM.green}
          strokeWidth={5}
          strokeLinecap="square"
          opacity={clampInterp(frame, [16, 32], [0, 1])}
        />

        {PEAKS.map((peak, i) => {
          if (frame < peak.frame) {
            return null;
          }
          const node = nodes[i]!;
          const size = getNodeSize(node.depth);
          const px = node.peakX;
          const py = waveformY(frame, peak.t * 6 + frame * 0.018, waveBaseY, waveAmp);
          const stemProgress = interpolate(frame - peak.frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          });
          const pulse = interpolate(
            frame - peak.frame,
            [0, 8, 24],
            [1, 1.7, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <g key={peak.frame}>
              <circle
                cx={px}
                cy={py}
                r={7 * pulse}
                fill={EOM.green}
                stroke={EOM.ink}
                strokeWidth={2}
              />
              <line
                x1={px}
                y1={py}
                x2={px}
                y2={py + (node.y + size.h / 2 - py) * stemProgress}
                stroke={EOM.green}
                strokeWidth={3}
                opacity={0.75}
              />
            </g>
          );
        })}
      </svg>

      {nodes.map((node) => {
        const { scale, opacity, slideY } = popIn(frame, node.appearFrame, fps);
        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y,
              zIndex: node.depth + 2,
            }}
          >
            <MinimalNode
              label=""
              depth={node.depth}
              squareTone={node.tone}
              opacity={opacity}
              scale={scale}
              slideY={slideY}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
