import { describe, expect, it } from "vitest"

import { GRAPH_NODE_TYPE } from "@/entities/graph/model/graphNodeTypes"
import type { AppNode } from "@/entities/graph/model/types"

import { markPipelineSearched } from "./markPipelineSearched"

function queryNode(id: string): AppNode {
  return {
    id,
    type: GRAPH_NODE_TYPE.query,
    position: { x: 0, y: 0 },
    data: { title: id },
  }
}

function filterNode(id: string): AppNode {
  return {
    id,
    type: GRAPH_NODE_TYPE.filter,
    position: { x: 0, y: 0 },
    data: { title: id, filterKey: "place", filterValue: "Madrid" },
  }
}

describe("markPipelineSearched", () => {
  it("marca input y filtros downstream como searched", () => {
    const nodes = [queryNode("input"), filterNode("filter-1"), filterNode("filter-2")]
    const edges = [
      { id: "e1", source: "input", target: "filter-1" },
      { id: "e2", source: "filter-1", target: "filter-2" },
    ]

    const locked = markPipelineSearched(nodes, "input", edges)
    const byId = new Map(locked.map((node) => [node.id, node.data.searched]))

    expect(byId.get("input")).toBe(true)
    expect(byId.get("filter-1")).toBe(true)
    expect(byId.get("filter-2")).toBe(true)
  })
})
