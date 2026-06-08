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
  waveformYInverted,
} from "./shared";

const PAD = 96;

const TOP_PEAKS = [
  { frame: 34, t: 0.12 },
  { frame: 54, t: 0.28 },
  { frame: 74, t: 0.44 },
  { frame: 94, t: 0.6 },
  { frame: 114, t: 0.76 },
];

const BOTTOM_PEAKS = [
  { frame: 44, t: 0.16 },
  { frame: 64, t: 0.32 },
  { frame: 84, t: 0.48 },
  { frame: 104, t: 0.64 },
  { frame: 124, t: 0.8 },
];

/** Solo 2 enlaces cruzados: 1B↔2A y 4A↔4B */
const CROSS_LINKS = [
  { frame: 150, top: 1, bottom: 0 },
  { frame: 200, top: 3, bottom: 3 },
];

const PodcastBadge: React.FC<{ label: string; style?: React.CSSProperties }> = ({
  label,
  style,
}) => (
  <div
    style={{
      border: `5px solid ${EOM.ink}`,
      background: EOM.white,
      boxShadow: `8px 8px 0 ${EOM.ink}`,
      padding: "10px 22px",
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "0.22em",
      ...style,
    }}
  >
    {label}
  </div>
);

export const OriginDualPodcastWaves: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const fadeOut = clampInterp(
    frame,
    [ORIGIN_SCENE_DURATION - 20, ORIGIN_SCENE_DURATION],
    [1, 0],
  );

  const x0 = PAD;
  const x1 = width - PAD;
  const waveAmp = 52;
  const topWaveY = 148;
  const bottomWaveY = height - 148;

  const topNodes = TOP_PEAKS.map((peak, i) => {
    const depth = 2;
    const size = getNodeSize(depth);
    const px = x0 + (x1 - x0) * peak.t;
    const py = height * 0.38 + (i % 2) * 36;
    return {
      id: `top-${i}`,
      x: px - size.w / 2,
      y: py,
      depth,
      appearFrame: peak.frame,
      tone: squareToneForId(`top-${i}`),
      peakX: px,
      peakT: peak.t,
      side: "top" as const,
    };
  });

  const bottomNodes = BOTTOM_PEAKS.map((peak, i) => {
    const depth = 2;
    const size = getNodeSize(depth);
    const px = x0 + (x1 - x0) * peak.t;
    const py = height * 0.58 + (i % 2) * 36;
    return {
      id: `bot-${i}`,
      x: px - size.w / 2,
      y: py,
      depth,
      appearFrame: peak.frame,
      tone: squareToneForId(`bot-${i}`),
      peakX: px,
      peakT: peak.t,
      side: "bottom" as const,
    };
  });

  const crossEdges: GraphEdge[] = CROSS_LINKS.map((link) => {
    const top = topNodes[link.top]!;
    const bottom = bottomNodes[link.bottom]!;
    const tSize = getNodeSize(top.depth);
    const bSize = getNodeSize(bottom.depth);
    return {
      id: `cross-${link.top}-${link.bottom}`,
      x1: top.x + tSize.w / 2,
      y1: top.y + tSize.h,
      x2: bottom.x + bSize.w / 2,
      y2: bottom.y,
      appearFrame: link.frame,
    };
  });

  const wavesIn = clampInterp(frame, [0, 28], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: EOM.white,
        fontFamily: FONT.mono,
        opacity: fadeOut,
      }}
    >
      <GridBackground />

      <PodcastBadge
        label="PODCAST A"
        style={{
          position: "absolute",
          top: 48,
          left: PAD,
          opacity: wavesIn,
        }}
      />
      <PodcastBadge
        label="PODCAST B"
        style={{
          position: "absolute",
          bottom: 48,
          left: PAD,
          opacity: wavesIn,
        }}
      />

      <GraphEdges edges={crossEdges} frame={frame} width={width} height={height} />

      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
      >
        <path
          d={buildWavePath(frame, x0, x1, topWaveY, waveAmp, 64, false, 0)}
          fill="none"
          stroke={EOM.green}
          strokeWidth={5}
          strokeLinecap="square"
          opacity={wavesIn * 0.95}
        />

        <path
          d={buildWavePath(frame, x0, x1, bottomWaveY, waveAmp, 64, true, 1.4, 0.016)}
          fill="none"
          stroke={EOM.ink}
          strokeWidth={5}
          strokeLinecap="square"
          opacity={wavesIn * 0.95}
        />

        {TOP_PEAKS.map((peak, i) => {
          if (frame < peak.frame) {
            return null;
          }
          const node = topNodes[i]!;
          const size = getNodeSize(node.depth);
          const px = node.peakX;
          const py = waveformY(frame, peak.t * 6 + frame * 0.018, topWaveY, waveAmp);
          const targetY = node.y + size.h / 2;
          const stemProgress = interpolate(frame - peak.frame, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          });
          const pulse = interpolate(frame - peak.frame, [0, 8, 24], [1, 1.6, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <g key={`top-stem-${i}`}>
              <circle
                cx={px}
                cy={py}
                r={6 * pulse}
                fill={EOM.green}
                stroke={EOM.ink}
                strokeWidth={2}
              />
              <line
                x1={px}
                y1={py}
                x2={px + (node.x + size.w / 2 - px) * stemProgress}
                y2={py + (targetY - py) * stemProgress}
                stroke={EOM.green}
                strokeWidth={3}
                opacity={0.75}
              />
            </g>
          );
        })}

        {BOTTOM_PEAKS.map((peak, i) => {
          if (frame < peak.frame) {
            return null;
          }
          const node = bottomNodes[i]!;
          const size = getNodeSize(node.depth);
          const px = node.peakX;
          const py = waveformYInverted(
            frame,
            peak.t * 6 + frame * 0.016,
            bottomWaveY,
            waveAmp,
            1.4,
          );
          const targetY = node.y + size.h / 2;
          const stemProgress = interpolate(frame - peak.frame, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          });
          const pulse = interpolate(frame - peak.frame, [0, 8, 24], [1, 1.6, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <g key={`bot-stem-${i}`}>
              <circle
                cx={px}
                cy={py}
                r={6 * pulse}
                fill={EOM.ink}
                stroke={EOM.green}
                strokeWidth={2}
              />
              <line
                x1={px}
                y1={py}
                x2={px + (node.x + size.w / 2 - px) * stemProgress}
                y2={py + (targetY - py) * stemProgress}
                stroke={EOM.ink}
                strokeWidth={3}
                opacity={0.75}
              />
            </g>
          );
        })}
      </svg>

      {[...topNodes, ...bottomNodes].map((node) => {
        const { scale, opacity, slideY } = popIn(frame, node.appearFrame, fps);
        const slide = node.side === "bottom" ? -slideY : slideY;

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
              slideY={slide}
            />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 13,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: EOM.gray,
          opacity: clampInterp(frame, [250, 270], [0, 0.85]),
        }}
      >
        {/* Dos fuentes · un mismo grafo */}
      </div>
    </AbsoluteFill>
  );
};
