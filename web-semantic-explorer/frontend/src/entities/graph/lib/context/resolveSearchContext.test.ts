import { describe, expect, it } from "vitest"

import type { AppNode } from "@/entities/graph/model/types"

import { resolveSearchContext } from "./resolveSearchContext"

function inputNode(
  id: string,
  query: string,
  inputFilters?: AppNode["data"]["inputFilters"],
): AppNode {
  return {
    id,
    type: "input",
    position: { x: 0, y: 0 },
    data: {
      title: `Búsqueda: ${query}`,
      query,
      inputFilters,
    },
  }
}

function filterNode(
  id: string,
  filterKey: string,
  filterValue: string,
): AppNode {
  return {
    id,
    type: "filter",
    position: { x: 0, y: 0 },
    data: { title: "Filtro", filterKey, filterValue },
  }
}

function articleNode(id: string): AppNode {
  return {
    id,
    type: "article",
    position: { x: 0, y: 0 },
    data: { title: `Artículo ${id}` },
  }
}

describe("resolveSearchContext", () => {
  it("combina filtros inline, upstream legacy y artículos padre del input", () => {
    const nodes = [
      articleNode("10"),
      inputNode("input-1", "política", [
        { id: "row-1", key: "category", value: "Economía" },
      ]),
      filterNode("filter-up", "place", "España"),
    ]
    const edges = [
      { id: "e0", source: "10", target: "input-1" },
      { id: "e2", source: "filter-up", target: "input-1" },
    ]

    const context = resolveSearchContext("input-1", nodes, edges)

    expect(context.filters).toEqual({
      category: "Economía",
      place: "España",
    })
    expect(context.seedQueries).toEqual(["política"])
    expect(context.contextArticleIds).toEqual([10])
  })
})
