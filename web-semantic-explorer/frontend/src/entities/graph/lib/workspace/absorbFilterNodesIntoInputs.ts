import type { Edge } from "@xyflow/react"

import type { AppNode } from "@/entities/graph/model/types"
import {
  filterRowFromLegacyNode,
  readInputFilterRows,
  type InputFilterRow,
} from "@/entities/graph/model/inputFilters"
import {
  GRAPH_NODE_TYPE,
  isFilterNodeType,
  isQueryNodeType,
} from "@/entities/graph/model/graphNodeTypes"
import { buildEdge, createEdgeId } from "@/entities/graph/lib/edges/isValidGraphConnection"

/**
 * Convierte nodos filtro del pipeline en filas dentro del nodo consulta
 * y reconecta aristas query → artículo.
 */
export function absorbFilterNodesIntoInputs(
  nodes: AppNode[],
  edges: Edge[],
): { nodes: AppNode[]; edges: Edge[] } {
  const filterIds = new Set(
    nodes.filter((node) => isFilterNodeType(node.type)).map((node) => node.id),
  )

  if (filterIds.size === 0) {
    return { nodes, edges }
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const nextNodes = nodes
    .filter((node) => !isFilterNodeType(node.type))
    .map((node) => {
      if (!isQueryNodeType(node.type)) {
        return node
      }

      const legacyRows = collectLegacyFilterRowsForInput(node.id, nodeById, edges)
      if (legacyRows.length === 0) {
        return node
      }

      const existing = readInputFilterRows(node.data)
      return {
        ...node,
        data: {
          ...node.data,
          inputFilters: mergeFilterRows(existing, legacyRows),
        },
      }
    })

  const nextEdges = rewireEdgesWithoutFilters(edges, filterIds, nodeById)

  return { nodes: nextNodes, edges: nextEdges }
}

function collectLegacyFilterRowsForInput(
  inputId: string,
  nodeById: Map<string, AppNode>,
  edges: Edge[],
): InputFilterRow[] {
  const rows: InputFilterRow[] = []
  let currentId = inputId

  while (true) {
    const filterEdge = edges.find(
      (edge) =>
        String(edge.source) === currentId &&
        isFilterNodeType(nodeById.get(String(edge.target))?.type),
    )

    if (!filterEdge) {
      break
    }

    const filterNode = nodeById.get(String(filterEdge.target))
    if (!filterNode) {
      break
    }

    const row = filterRowFromLegacyNode(filterNode.data)
    if (row) {
      rows.push(row)
    }

    currentId = String(filterEdge.target)
  }

  return rows
}

function mergeFilterRows(
  existing: InputFilterRow[],
  legacy: InputFilterRow[],
): InputFilterRow[] {
  if (existing.length === 0) {
    return legacy
  }

  return [...existing, ...legacy]
}

function rewireEdgesWithoutFilters(
  edges: Edge[],
  filterIds: Set<string>,
  nodeById: Map<string, AppNode>,
): Edge[] {
  const keptEdges = edges.filter(
    (edge) =>
      !filterIds.has(String(edge.source)) &&
      !filterIds.has(String(edge.target)),
  )

  const edgeKeys = new Set(
    keptEdges.map((edge) => `${edge.source}->${edge.target}`),
  )

  const sources = [...nodeById.values()]
    .filter((node) => !isFilterNodeType(node.type))
    .map((node) => node.id)

  for (const sourceId of sources) {
    for (const targetId of resolveTargetsSkippingFilters(sourceId, edges, filterIds, nodeById)) {
      const key = `${sourceId}->${targetId}`
      if (edgeKeys.has(key)) {
        continue
      }
      keptEdges.push(buildEdge(sourceId, targetId))
      edgeKeys.add(key)
    }
  }

  const deduped = new Map<string, Edge>()
  for (const edge of keptEdges) {
    deduped.set(createEdgeId(String(edge.source), String(edge.target)), edge)
  }

  return [...deduped.values()]
}

function resolveTargetsSkippingFilters(
  sourceId: string,
  edges: Edge[],
  filterIds: Set<string>,
  nodeById: Map<string, AppNode>,
  visited = new Set<string>(),
): string[] {
  if (visited.has(sourceId)) {
    return []
  }
  visited.add(sourceId)

  const childIds = edges
    .filter((edge) => String(edge.source) === sourceId)
    .map((edge) => String(edge.target))

  const targets: string[] = []

  for (const childId of childIds) {
    if (filterIds.has(childId)) {
      targets.push(
        ...resolveTargetsSkippingFilters(
          childId,
          edges,
          filterIds,
          nodeById,
          visited,
        ),
      )
      continue
    }

    const childType = nodeById.get(childId)?.type
    if (childType === GRAPH_NODE_TYPE.article || isQueryNodeType(childType)) {
      targets.push(childId)
    }
  }

  return targets
}
