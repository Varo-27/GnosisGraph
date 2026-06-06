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

describe("markPipelineSearched", () => {
  it("marca solo el nodo consulta como searched", () => {
    const nodes = [queryNode("input"), queryNode("other")]
    const edges: { id: string; source: string; target: string }[] = []

    const locked = markPipelineSearched(nodes, "input", edges)
    const byId = new Map(locked.map((node) => [node.id, node.data.searched]))

    expect(byId.get("input")).toBe(true)
    expect(byId.get("other")).toBeUndefined()
  })
})
