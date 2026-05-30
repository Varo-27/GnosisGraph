import type { XYPosition } from "@xyflow/react"

import type { AppNode } from "@/store/useGraphStore"

import { createFilterNodeId, createInputNodeId } from "../graphNodeIds"
import {
  FILTER_NODE_DIMENSIONS,
  type FilterNodeKind,
  GRAPH_NODE_TYPE,
} from "../graphNodeTypes"

export function createInputNodeAtPosition(
  position: XYPosition,
  nodeId = createInputNodeId(),
): AppNode {
  return {
    id: nodeId,
    type: GRAPH_NODE_TYPE.input,
    position,
    data: {
      title: "Nueva búsqueda",
      query: "",
      appearDelay: 0,
    },
  }
}

export function createFilterNodeAtPosition(
  filterKey: FilterNodeKind,
  position: XYPosition,
  nodeId = createFilterNodeId(filterKey),
): AppNode {
  const label = FILTER_NODE_DIMENSIONS[filterKey]

  return {
    id: nodeId,
    type: GRAPH_NODE_TYPE.filter,
    position,
    data: {
      title: `${label}: …`,
      filterKey,
      filterValue: "",
      appearDelay: 0,
    },
  }
}
