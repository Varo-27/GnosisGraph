import { describe, expect, it } from "vitest"

import { GRAPH_NODE_TYPE } from "@/entities/graph/model/graphNodeTypes"
import type { AppNode } from "@/entities/graph/model/types"

import { resolveSearchAttachmentNodeId } from "./resolveSearchAttachmentNodeId"

function queryNode(id: string): AppNode {
  return {
    id,
    type: GRAPH_NODE_TYPE.query,
    position: { x: 0, y: 0 },
    data: { title: id },
  }
}

describe("resolveSearchAttachmentNodeId", () => {
  it("devuelve siempre el id del nodo consulta", () => {
    const nodes = [queryNode("input")]
    const edges: { id: string; source: string; target: string }[] = []

    expect(resolveSearchAttachmentNodeId("input", nodes, edges)).toBe("input")
  })
})
