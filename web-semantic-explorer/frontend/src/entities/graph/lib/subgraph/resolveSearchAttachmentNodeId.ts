import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"

import { isFilterNodeType } from "@/entities/graph/model/graphNodeTypes"

/**
 * Recorre downstream desde el input por la cadena input → filtro → …
 * y devuelve el último nodo del pipeline antes de artículos.
 */
export function resolveSearchAttachmentNodeId(
  inputNodeId: string,
  nodes: AppNode[],
  edges: Edge[],
): string {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  let currentId = inputNodeId

  while (true) {
    const filterChildren = edges
      .filter((edge) => String(edge.source) === currentId)
      .map((edge) => String(edge.target))
      .filter((targetId) => {
        const node = nodeById.get(targetId)
        return node != null && isFilterNodeType(node.type)
      })
      .sort()

    if (filterChildren.length === 0) {
      return currentId
    }

    currentId = filterChildren[0]
  }
}
