import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

/**
 * Marca `searched: true` en el nodo consulta tras la primera búsqueda.
 */
export function markPipelineSearched(
  nodes: AppNode[],
  inputNodeId: string,
  _edges: Edge[],
): AppNode[] {
  return nodes.map((node) =>
    node.id === inputNodeId
      ? { ...node, data: { ...node.data, searched: true } }
      : node,
  )
}
