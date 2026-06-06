import { useEffect, useRef } from "react"
import {
  centerPaletteDropPosition,
  createInputFilterRow,
  createQueryNodeAtPosition,
  GRAPH_NODE_TYPE,
  useGraphStore,
} from "@/entities/graph"
import type { GraphSearchParams } from "@/shared/lib/filters"
import { searchParamsToFilters } from "@/shared/lib/filters"

type UseMapSearchBootstrapOptions = {
  searchParams: GraphSearchParams
  enabled: boolean
  onConsumed?: () => void
}

/**
 * Al llegar desde el mapa con ?place=&q=, crea consulta con filtro lugar inline y lanza búsqueda.
 */
export function useMapSearchBootstrap({
  searchParams,
  enabled,
  onConsumed,
}: UseMapSearchBootstrapOptions) {
  const consumedRef = useRef(false)

  useEffect(() => {
    if (!enabled || consumedRef.current) {
      return
    }

    const queryText = searchParams.q?.trim()
    const place = searchParams.place?.trim()
    const extraFilters = searchParamsToFilters(searchParams)

    if (!queryText && !place && !Object.keys(extraFilters).length) {
      return
    }

    consumedRef.current = true

    const { nodes, edges } = useGraphStore.getState()
    const existingQuery = nodes.find(
      (node) => node.type === GRAPH_NODE_TYPE.query,
    )
    const queryNode =
      existingQuery ??
      createQueryNodeAtPosition(
        centerPaletteDropPosition({ x: 480, y: 280 }, "query"),
      )

    const filterRows = place
      ? [{ ...createInputFilterRow("place"), value: place }]
      : undefined

    const nextNodes = existingQuery
      ? nodes.map((node) =>
          node.id === queryNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  query: queryText ?? node.data.query ?? "",
                  inputFilters: filterRows ?? node.data.inputFilters,
                },
              }
            : node,
        )
      : [
          ...nodes,
          {
            ...queryNode,
            data: {
              ...queryNode.data,
              query: queryText ?? "",
              inputFilters: filterRows,
            },
          },
        ]

    const nextEdges = [...edges]
    const searchNodeId = queryNode.id
    const searchQuery = queryText ?? place ?? ""

    useGraphStore.getState().setNodes(nextNodes)
    useGraphStore.getState().setEdges(nextEdges)

    const searchFromInput = useGraphStore.getState().searchFromInput
    if (searchFromInput && searchQuery.trim()) {
      window.setTimeout(() => {
        searchFromInput(searchNodeId, searchQuery.trim())
      }, 120)
    }

    onConsumed?.()
  }, [enabled, onConsumed, searchParams])
}
