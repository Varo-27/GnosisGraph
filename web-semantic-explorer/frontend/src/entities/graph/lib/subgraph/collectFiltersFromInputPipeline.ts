import type { Edge } from "@xyflow/react"
import { isQueryNodeType } from "@/entities/graph/model/graphNodeTypes"
import {
  inputFilterRowsToMetadata,
  readInputFilterRows,
} from "@/entities/graph/model/inputFilters"
import type { AppNode } from "@/entities/graph/model/types"
import type { ArticleMetadataFilters } from "@/shared/lib/filters"

/**
 * Filtros definidos en el nodo consulta (filas inline).
 */
export function collectFiltersFromInputNode(
  inputNode: AppNode,
): ArticleMetadataFilters {
  return inputFilterRowsToMetadata(readInputFilterRows(inputNode.data))
}

/**
 * Filtros activos al buscar desde un nodo consulta.
 */
export function collectFiltersFromInputPipeline(
  inputNodeId: string,
  nodes: AppNode[],
  _edges: Edge[],
): ArticleMetadataFilters {
  const inputNode = nodes.find((candidate) => candidate.id === inputNodeId)
  if (!inputNode || !isQueryNodeType(inputNode.type)) {
    return {}
  }

  return collectFiltersFromInputNode(inputNode)
}
