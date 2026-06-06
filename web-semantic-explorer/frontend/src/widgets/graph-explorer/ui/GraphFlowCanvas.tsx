import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  type EdgeTypes,
  type IsValidConnection,
  type NodeChange,
  type NodeMouseHandler,
  type NodeTypes,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  type AppNode,
  GRAPH_BACKGROUND_PROPS,
  GRAPH_FIT_VIEW_OPTIONS,
  GRAPH_MAX_ZOOM,
  GRAPH_MIN_ZOOM,
  isActiveNodeDrag,
  useGraphStore,
} from "@/entities/graph"
import type { WorkspaceViewport } from "@/entities/workspace"
import { useWorkspaceStore } from "@/entities/workspace"
import { useThemeCssVariable } from "@/shared/lib/theme"
import { decorateEdgesForFocus } from "./edges/decorateEdgesForFocus"
import { GraphFlowEdge } from "./edges/GraphFlowEdge"

const edgeTypes: EdgeTypes = {
  graphFlow: GraphFlowEdge,
}

const defaultEdgeOptions = { type: "graphFlow" as const }

type GraphFlowCanvasProps = {
  nodeTypes: NodeTypes
  colorMode: "light" | "dark" | "system"
  onInit: (instance: ReactFlowInstance<AppNode, Edge>) => void
  onNodeClick: NodeMouseHandler<AppNode>
  onEdgesDelete: (edges: Edge[]) => void
  onMoveEnd: (viewport: WorkspaceViewport | null) => void
  isWorkspaceHydrated: boolean
  isValidConnection?: IsValidConnection
}

function GraphFlowCanvasComponent({
  nodeTypes,
  colorMode,
  onInit,
  onNodeClick,
  onEdgesDelete,
  onMoveEnd,
  isWorkspaceHydrated,
  isValidConnection,
}: GraphFlowCanvasProps) {
  const reactFlowRef = useRef<ReactFlowInstance<AppNode, Edge> | null>(null)
  const fitViewDoneRef = useRef(false)
  const isDraggingRef = useRef(false)
  const flowNodesRef = useRef<AppNode[]>([])

  const storeNodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)
  const activeNodeId = useGraphStore((state) => state.activeNodeId)
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  const focusNodeId = hoveredNodeId ?? activeNodeId
  const graphGridColor = useThemeCssVariable(
    "--graph-grid-color",
    "color-mix(in srgb, var(--primary) 25%, transparent)",
  )
  const displayEdges = useMemo(
    () => decorateEdgesForFocus(edges, focusNodeId),
    [edges, focusNodeId],
  )
  const onConnect = useGraphStore((state) => state.onConnect)

  const handleConnect = useCallback(
    (connection: Connection) => {
      onConnect(connection)
    },
    [onConnect],
  )
  const commitNodes = useGraphStore((state) => state.commitNodes)

  const [flowNodes, setFlowNodes] = useState(storeNodes)
  flowNodesRef.current = flowNodes

  useEffect(() => {
    if (isDraggingRef.current) {
      return
    }
    flowNodesRef.current = storeNodes
    setFlowNodes(storeNodes)
  }, [storeNodes])

  useEffect(() => {
    if (
      !isWorkspaceHydrated ||
      fitViewDoneRef.current ||
      storeNodes.length === 0
    ) {
      return
    }

    const active = useWorkspaceStore.getState().getActiveWorkspace()
    const saved = active?.graph.viewport
    fitViewDoneRef.current = true

    requestAnimationFrame(() => {
      const flow = reactFlowRef.current
      if (!flow) {
        return
      }
      if (saved) {
        flow.setViewport(saved)
        return
      }
      flow.fitView(GRAPH_FIT_VIEW_OPTIONS)
    })
  }, [isWorkspaceHydrated, storeNodes.length])

  const handleFlowInit = useCallback(
    (instance: ReactFlowInstance<AppNode, Edge>) => {
      reactFlowRef.current = instance
      onInit(instance)
    },
    [onInit],
  )

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const next = applyNodeChanges(changes, flowNodesRef.current) as AppNode[]
      flowNodesRef.current = next
      setFlowNodes(next)

      if (isActiveNodeDrag(changes)) {
        isDraggingRef.current = true
        return
      }

      isDraggingRef.current = false
      queueMicrotask(() => {
        commitNodes(next, changes)
      })
    },
    [commitNodes],
  )

  const handleNodeDragStop = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const handleMoveEnd = useCallback(() => {
    const viewport = reactFlowRef.current?.getViewport()
    onMoveEnd(
      viewport ? { x: viewport.x, y: viewport.y, zoom: viewport.zoom } : null,
    )
  }, [onMoveEnd])

  const handleNodeMouseEnter: NodeMouseHandler<AppNode> = useCallback(
    (_event, node) => {
      setHoveredNodeId(node.id)
    },
    [],
  )

  const handleNodeMouseLeave: NodeMouseHandler<AppNode> = useCallback(() => {
    setHoveredNodeId(null)
  }, [])

  return (
    <ReactFlow
      className="h-full w-full"
      style={{ width: "100%", height: "100%" }}
      nodes={flowNodes}
      edges={displayEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      isValidConnection={isValidConnection}
      onEdgesDelete={onEdgesDelete}
      deleteKeyCode={["Backspace", "Delete"]}
      onInit={handleFlowInit}
      onNodeDragStop={handleNodeDragStop}
      onMoveEnd={handleMoveEnd}
      onNodeClick={onNodeClick}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      colorMode={colorMode}
      minZoom={GRAPH_MIN_ZOOM}
      maxZoom={GRAPH_MAX_ZOOM}
      onlyRenderVisibleElements
    >
      <Controls />
      <Background
        variant={BackgroundVariant.Lines}
        gap={GRAPH_BACKGROUND_PROPS.gap}
        size={GRAPH_BACKGROUND_PROPS.size}
        color={graphGridColor}
      />
    </ReactFlow>
  )
}

export const GraphFlowCanvas = memo(GraphFlowCanvasComponent)
