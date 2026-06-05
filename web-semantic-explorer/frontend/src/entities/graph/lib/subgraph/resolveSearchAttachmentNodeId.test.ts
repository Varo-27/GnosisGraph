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

function filterNode(id: string): AppNode {
  return {
    id,
    type: GRAPH_NODE_TYPE.filter,
    position: { x: 0, y: 0 },
    data: { title: id, filterKey: "place", filterValue: "Madrid" },
  }
}

function articleNode(id: string): AppNode {
  return {
    id,
    type: GRAPH_NODE_TYPE.article,
    position: { x: 0, y: 0 },
    data: { title: id },
  }
}

describe("resolveSearchAttachmentNodeId", () => {
  it("devuelve el input si no hay filtros downstream", () => {
    const nodes = [queryNode("input"), articleNode("a1")]
    const edges = [{ id: "e1", source: "input", target: "a1" }]

    expect(resolveSearchAttachmentNodeId("input", nodes, edges)).toBe("input")
  })

  it("devuelve el filtro si hay input → filtro", () => {
    const nodes = [queryNode("input"), filterNode("filter"), articleNode("a1")]
    const edges = [
      { id: "e1", source: "input", target: "filter" },
      { id: "e2", source: "filter", target: "a1" },
    ]

    expect(resolveSearchAttachmentNodeId("input", nodes, edges)).toBe("filter")
  })

  it("devuelve el último filtro en una cadena de dos filtros", () => {
    const nodes = [
      queryNode("input"),
      filterNode("filter-1"),
      filterNode("filter-2"),
      articleNode("a1"),
    ]
    const edges = [
      { id: "e1", source: "input", target: "filter-1" },
      { id: "e2", source: "filter-1", target: "filter-2" },
      { id: "e3", source: "filter-2", target: "a1" },
    ]

    expect(resolveSearchAttachmentNodeId("input", nodes, edges)).toBe("filter-2")
  })
})
