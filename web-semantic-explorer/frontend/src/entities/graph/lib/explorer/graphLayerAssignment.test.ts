import { describe, expect, it } from "vitest"

import { assignLayersLongestPath } from "./graphLayerAssignment"

describe("assignLayersLongestPath", () => {
  it("asigna capa 1 a nodos sin padres", () => {
    const layers = assignLayersLongestPath(["solo"], [])

    expect(layers.get("solo")).toBe(1)
  })

  it("asigna input=1, artículos=2", () => {
    const nodeIds = ["input", "a1", "a2"]
    const edges = [
      { id: "e1", source: "input", target: "a1" },
      { id: "e2", source: "input", target: "a2" },
    ]

    const layers = assignLayersLongestPath(nodeIds, edges)

    expect(layers.get("input")).toBe(1)
    expect(layers.get("a1")).toBe(2)
    expect(layers.get("a2")).toBe(2)
  })

  it("usa max(padres)+1 con multi-padre", () => {
    const nodeIds = ["query-a", "query-b", "shared"]
    const edges = [
      { id: "e1", source: "query-a", target: "shared" },
      { id: "e2", source: "query-b", target: "shared" },
    ]

    const layers = assignLayersLongestPath(nodeIds, edges)

    expect(layers.get("query-a")).toBe(1)
    expect(layers.get("query-b")).toBe(1)
    expect(layers.get("shared")).toBe(2)
  })
})
