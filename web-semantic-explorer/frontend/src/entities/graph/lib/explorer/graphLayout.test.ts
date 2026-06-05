import { describe, expect, it, vi } from "vitest"

import { GRAPH_NODE_TYPE } from "@/entities/graph/model/graphNodeTypes"
import type { AppNode } from "@/entities/graph/model/types"

import {
  applyTreeLayout,
  assignNodesToLayoutRoots,
  sortLayoutRootIds,
} from "./graphLayout"

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

describe("assignNodesToLayoutRoots", () => {
  it("asigna un artículo compartido a la query con tubería más larga", () => {
    const nodes = [
      queryNode("query-a"),
      queryNode("query-b"),
      filterNode("filter-b"),
      articleNode("shared"),
    ]
    const edges = [
      { id: "e1", source: "query-a", target: "shared" },
      { id: "e2", source: "query-b", target: "filter-b" },
      { id: "e3", source: "filter-b", target: "shared" },
    ]

    const assignment = assignNodesToLayoutRoots(
      ["query-a", "query-b"],
      nodes,
      edges,
    )

    expect(assignment.get("shared")).toBe("query-b")
    expect(assignment.get("filter-b")).toBe("query-b")
  })
})

describe("sortLayoutRootIds", () => {
  it("coloca primero la query padre y después la rama", () => {
    const nodes = [
      queryNode("query-a"),
      queryNode("query-b"),
      filterNode("filter-b"),
      articleNode("shared"),
    ]
    const edges = [
      { id: "e1", source: "query-a", target: "shared" },
      { id: "e2", source: "query-b", target: "filter-b" },
      { id: "e3", source: "filter-b", target: "shared" },
    ]

    expect(sortLayoutRootIds(["query-b", "query-a"], nodes, edges)).toEqual([
      "query-a",
      "query-b",
    ])
  })
})

describe("applyTreeLayout (d3 bosque vertical)", () => {
  it("apila cada búsqueda debajo de la anterior", () => {
    vi.stubGlobal("window", { innerWidth: 1200 })

    const layouted = applyTreeLayout(
      [
        queryNode("query-a"),
        queryNode("query-b"),
        articleNode("a1"),
        articleNode("a2"),
        articleNode("b1"),
      ],
      [
        { id: "e1", source: "query-a", target: "a1" },
        { id: "e2", source: "query-a", target: "a2" },
        { id: "e3", source: "query-b", target: "b1" },
      ],
    )
    const byId = new Map(layouted.map((node) => [node.id, node.position]))

    expect(byId.get("a1")?.y).toBeGreaterThan(byId.get("query-a")?.y ?? 0)
    expect(byId.get("query-b")?.y).toBeGreaterThan(byId.get("a1")?.y ?? 0)
    expect(byId.get("b1")?.y).toBeGreaterThan(byId.get("query-b")?.y ?? 0)
  })

  it("coloca hijos de la query por debajo de su raíz en el segundo árbol", () => {
    vi.stubGlobal("window", { innerWidth: 1200 })

    const layouted = applyTreeLayout(
      [
        queryNode("query-a"),
        queryNode("query-b"),
        filterNode("filter-b"),
        articleNode("b1"),
        articleNode("b2"),
      ],
      [
        { id: "e1", source: "query-a", target: "b1" },
        { id: "e2", source: "query-b", target: "filter-b" },
        { id: "e3", source: "query-b", target: "b1" },
        { id: "e4", source: "query-b", target: "b2" },
      ],
    )
    const byId = new Map(layouted.map((node) => [node.id, node.position]))

    expect(byId.get("query-b")?.y).toBeGreaterThan(byId.get("query-a")?.y ?? 0)
    expect(byId.get("b1")?.y).toBeGreaterThan(byId.get("query-b")?.y ?? 0)
    expect(byId.get("filter-b")?.y).toBeGreaterThan(byId.get("query-b")?.y ?? 0)
  })
})
