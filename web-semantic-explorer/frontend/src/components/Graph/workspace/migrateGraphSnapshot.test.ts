import { describe, expect, it } from "vitest"

import { migrateGraphSnapshot } from "./migrateGraphSnapshot"

describe("migrateGraphSnapshot", () => {
  it("convierte searchCenter en nodo input", () => {
    const snapshot = migrateGraphSnapshot({
      nodes: [
        {
          id: "search-root",
          type: "searchCenter",
          position: { x: 0, y: 0 },
          data: { title: "Búsqueda: economía" },
        },
      ],
      edges: [{ id: "e1", source: "search-root", target: "42" }],
      viewport: null,
    })

    const inputNode = snapshot.nodes[0]
    expect(inputNode.type).toBe("input")
    expect(inputNode.id).not.toBe("search-root")
    expect(inputNode.data.query).toBe("economía")
    expect(snapshot.edges[0].source).toBe(inputNode.id)
  })
})
