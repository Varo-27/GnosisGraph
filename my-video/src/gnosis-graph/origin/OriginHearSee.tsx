import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GridBackground } from "../GridBackground";
import { GraphEdges, type GraphEdge } from "../GraphEdges";
import { getNodeSize, MinimalNode, squareToneForId } from "../MinimalNode";
import { EOM, FONT } from "../theme";
import { clampInterp } from "../util";
import { barEnergy, ORIGIN_SCENE_DURATION, popIn } from "./shared";

const DIVIDER_X = 960;
const PAD = 72;

const BEATS = [
  { frame: 40, slot: 0 },
  { frame: 62, slot: 1 },
  { frame: 84, slot: 2 },
  { frame: 106, slot: 3 },
  { frame: 128, slot: 4 },
  { frame: 152, slot: 5 },
  { frame: 176, slot: 6 },
  { frame: 200, slot: 7 },
  { frame: 224, slot: 8 },
  { frame: 248, slot: 9 },
];

const NODE_LAYOUT: Array<{ x: number; y: number; depth: number; parent: number | null }> = [
  { x: 1180, y: 240, depth: 1, parent: null },
  { x: 1320, y: 300, depth: 1, parent: 0 },
  { x: 1080, y: 360, depth: 2, parent: 0 },
  { x: 1420, y: 400, depth: 2, parent: 1 },
  { x: 1140, y: 480, depth: 2, parent: 2 },
  { x: 1280, y: 540, depth: 3, parent: 1 },
  { x: 1020, y: 580, depth: 3, parent: 2 },
  { x: 1480, y: 620, depth: 3, parent: 3 },
  { x: 1200, y: 700, depth: 3, parent: 4 },
  { x: 1360, y: 760, depth: 3, parent: 5 },
];

const PanelLabel: React.FC<{ text: string; opacity: number; side: "left" | "right" }> = ({
  text,
  opacity,
  side,
}) => (
  <div
    style={{
      position: "absolute",
      top: 48,
      left: side === "left" ? PAD : PAD,
      opacity,
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: "0.35em",
      color: EOM.gray,
    }}
  >
    {text}
  </div>
);

export const OriginHearSee: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const panelIn = clampInterp(frame, [0, 24], [0, 1]);
  const fadeOut = clampInterp(
    frame,
    [ORIGIN_SCENE_DURATION - 20, ORIGIN_SCENE_DURATION],
    [1, 0],
  );

  const barCount = 14;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const xNorm = i / (barCount - 1);
    const energy = barEnergy(frame, xNorm);
    return { i, h: 32 + energy * 140 };
  });

  const nodes = BEATS.map((beat, i) => {
    const layout = NODE_LAYOUT[i]!;
    return {
      id: `n${i}`,
      x: layout.x,
      y: layout.y,
      depth: layout.depth,
      appearFrame: beat.frame,
      tone: squareToneForId(`n${i}`),
    };
  });

  const edges: GraphEdge[] = BEATS.flatMap((beat, i) => {
    const layout = NODE_LAYOUT[i]!;
    if (layout.parent === null) {
      return [];
    }
    const parent = nodes[layout.parent]!;
    const child = nodes[i]!;
    const pSize = getNodeSize(parent.depth);
    const cSize = getNodeSize(child.depth);
    return [
      {
        id: `e${i}`,
        x1: parent.x + pSize.w / 2 - DIVIDER_X,
        y1: parent.y + pSize.h,
        x2: child.x + cSize.w / 2 - DIVIDER_X,
        y2: child.y,
        appearFrame: beat.frame + 2,
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

      {/* Panel OIR */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: DIVIDER_X,
          height,
          opacity: panelIn,
          transform: `translateX(${interpolate(panelIn, [0, 1], [-20, 0])}px)`,
        }}
      >
        <PanelLabel text="OIR" opacity={clampInterp(frame, [12, 28], [0, 1])} side="left" />

        <div
          style={{
            position: "absolute",
            top: 100,
            left: PAD,
            border: `5px solid ${EOM.ink}`,
            background: EOM.white,
            boxShadow: `8px 8px 0 ${EOM.ink}`,
            padding: "10px 22px",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.25em",
          }}
        >
          PODCAST
        </div>

        <div
          style={{
            position: "absolute",
            left: PAD,
            right: 48,
            top: height * 0.32,
            height: 220,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          {bars.map(({ i, h }) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: h,
                background: i % 2 === 0 ? EOM.green : EOM.ink,
                border: `3px solid ${EOM.ink}`,
                opacity: clampInterp(frame, [18 + i * 2, 34 + i * 2], [0, 0.9]),
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: DIVIDER_X - 3,
          top: 48,
          bottom: 48,
          width: 6,
          background: EOM.ink,
          opacity: panelIn,
        }}
      />

      {/* Panel VER */}
      <div
        style={{
          position: "absolute",
          left: DIVIDER_X,
          top: 0,
          width: width - DIVIDER_X,
          height,
          opacity: panelIn,
          transform: `translateX(${interpolate(panelIn, [0, 1], [20, 0])}px)`,
        }}
      >
        <PanelLabel text="VER" opacity={clampInterp(frame, [12, 28], [0, 1])} side="right" />

        <GraphEdges
          edges={edges}
          frame={frame}
          width={width - DIVIDER_X}
          height={height}
        />

        {nodes.map((node) => {
          const { scale, opacity, slideY } = popIn(frame, node.appearFrame, fps);
          const pulse =
            frame >= node.appearFrame
              ? interpolate(
                  (frame - node.appearFrame) % 18,
                  [0, 6, 18],
                  [1, 1.12, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                )
              : 1;

          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: node.x - DIVIDER_X,
                top: node.y,
                zIndex: node.depth + 2,
              }}
            >
              <MinimalNode
                label=""
                depth={node.depth}
                squareTone={node.tone}
                opacity={opacity}
                scale={scale * pulse}
                slideY={slideY}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
