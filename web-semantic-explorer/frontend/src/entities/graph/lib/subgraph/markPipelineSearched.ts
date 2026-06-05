import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

import { isFilterNodeType } from "@/entities/graph/model/graphNodeTypes"
import { collectDownstreamNodeIds } from "./collectDownstreamNodeIds"

/**
 * Marca `searched: true` en el input y todos los filtros downstream del pipeline.
 */
export function markPipelineSearched(
  nodes: AppNode[],
  inputNodeId: string,
  edges: Edge[],
): AppNode[] {
  const downstreamIds = collectDownstreamNodeIds(inputNodeId, edges)
  const lockedIds = new Set<string>([inputNodeId])

  for (const nodeId of downstreamIds) {
    const node = nodes.find((candidate) => candidate.id === nodeId)
    if (node && isFilterNodeType(node.type)) {
      lockedIds.add(nodeId)
    }
  }

  return nodes.map((node) =>
    lockedIds.has(node.id)
      ? { ...node, data: { ...node.data, searched: true } }
      : node,
  )
}
