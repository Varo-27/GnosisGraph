import type { Edge } from "@xyflow/react"
import { type HierarchyPointNode, hierarchy, tree } from "d3-hierarchy"

import { isQueryNodeType } from "@/entities/graph/model/graphNodeTypes"
import type { AppNode } from "@/entities/graph/model/types"

import { collectDownstreamNodeIds } from "@/entities/graph/lib/subgraph/collectDownstreamNodeIds"

import { GRAPH_LAYOUT_TREE, SEARCH_ROOT_ID } from "./graphConstants"

type TreeDatum = {
  id: string
  children?: TreeDatum[]
}

function isLayoutRootNode(node: AppNode): boolean {
  return isQueryNodeType(node.type) || node.id === SEARCH_ROOT_ID
}

export function findLayoutRootIds(nodes: AppNode[]): string[] {
  const roots = nodes.filter(isLayoutRootNode).map((node) => node.id)
  if (roots.length > 0) {
    return roots
  }
  const legacyRoot = nodes.find((node) => node.id === SEARCH_ROOT_ID)
  if (legacyRoot) {
    return [legacyRoot.id]
  }
  const firstId = nodes[0]?.id
  return firstId ? [firstId] : []
}

function buildAdjacency(
  nodes: AppNode[],
  edges: Edge[],
): Map<string, string[]> {
  const nodeIds = new Set(nodes.map((node) => node.id))
  const adjacency = new Map<string, string[]>()

  edges.forEach((edge) => {
    const source = String(edge.source)
    const target = String(edge.target)
    if (!nodeIds.has(source) || !nodeIds.has(target)) {
      return
    }
    const current = adjacency.get(source) ?? []
    adjacency.set(source, [...current, target])
  })

  return adjacency
}

function buildParentsByTarget(edges: Edge[]): Map<string, string[]> {
  const parentsByTarget = new Map<string, string[]>()

  for (const edge of edges) {
    const target = String(edge.target)
    const source = String(edge.source)
    const current = parentsByTarget.get(target) ?? []
    parentsByTarget.set(target, [...current, source])
  }

  return parentsByTarget
}

function collectUpstreamQueryIds(
  nodeId: string,
  nodeById: Map<string, AppNode>,
  parentsByTarget: Map<string, string[]>,
  visited = new Set<string>(),
): string[] {
  if (visited.has(nodeId)) {
    return []
  }
  visited.add(nodeId)

  const node = nodeById.get(nodeId)
  const queries: string[] = []

  if (node && isQueryNodeType(node.type)) {
    queries.push(nodeId)
  }

  for (const parentId of parentsByTarget.get(nodeId) ?? []) {
    queries.push(
      ...collectUpstreamQueryIds(parentId, nodeById, parentsByTarget, visited),
    )
  }

  return queries
}

/** Ordena queries: primero la búsqueda padre, luego ramas desde sus artículos. */
export function sortLayoutRootIds(
  rootIds: string[],
  nodes: AppNode[],
  edges: Edge[],
): string[] {
  if (rootIds.length <= 1) {
    return rootIds
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const parentsByTarget = buildParentsByTarget(edges)
  const spawnedFrom = new Map<string, string>()
  const distanceByRoot = new Map<string, Map<string, number>>()

  for (const rootId of rootIds) {
    distanceByRoot.set(
      rootId,
      distancesFromQueryRoot(rootId, rootIds, nodes, edges),
    )
  }

  for (const childRoot of rootIds) {
    const childDistances = distanceByRoot.get(childRoot)
    if (!childDistances) {
      continue
    }

    const downstream = collectDownstreamNodeIds(childRoot, edges)

    for (const nodeId of downstream) {
      const childDistance = childDistances.get(nodeId)
      if (childDistance == null || childDistance <= 0) {
        continue
      }

      const upstreamQueries = collectUpstreamQueryIds(
        nodeId,
        nodeById,
        parentsByTarget,
      )

      for (const upstreamQuery of upstreamQueries) {
        if (upstreamQuery === childRoot || !rootIds.includes(upstreamQuery)) {
          continue
        }

        const parentDistance = distanceByRoot.get(upstreamQuery)?.get(nodeId)
        if (parentDistance == null || childDistance <= parentDistance) {
          continue
        }

        spawnedFrom.set(childRoot, upstreamQuery)
        break
      }

      if (spawnedFrom.has(childRoot)) {
        break
      }
    }
  }

  const ordered: string[] = []
  const pending = new Set(rootIds)

  while (pending.size > 0) {
    const ready = [...pending].filter(
      (rootId) => !spawnedFrom.has(rootId) || !pending.has(spawnedFrom.get(rootId)!),
    )

    const nextRoot = ready[0] ?? [...pending][0]
    ordered.push(nextRoot)
    pending.delete(nextRoot)
  }

  return ordered
}

function distancesFromQueryRoot(
  rootId: string,
  rootIds: string[],
  nodes: AppNode[],
  edges: Edge[],
): Map<string, number> {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const adjacency = buildAdjacency(nodes, edges)
  const otherRoots = new Set(rootIds.filter((id) => id !== rootId))
  const distances = new Map<string, number>()
  const queue: Array<{ id: string; depth: number }> = [{ id: rootId, depth: 0 }]

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || distances.has(current.id)) {
      continue
    }

    distances.set(current.id, current.depth)

    for (const childId of adjacency.get(current.id) ?? []) {
      const childNode = nodeById.get(childId)
      if (
        childNode &&
        isQueryNodeType(childNode.type) &&
        otherRoots.has(childId)
      ) {
        continue
      }
      if (!distances.has(childId)) {
        queue.push({ id: childId, depth: current.depth + 1 })
      }
    }
  }

  return distances
}

/** Cada nodo al árbol de la query con el camino descendente más largo. */
export function assignNodesToLayoutRoots(
  rootIds: string[],
  nodes: AppNode[],
  edges: Edge[],
): Map<string, string> {
  const assignment = new Map<string, string>()
  const distanceByRoot = new Map<string, Map<string, number>>()

  for (const rootId of rootIds) {
    distanceByRoot.set(rootId, distancesFromQueryRoot(rootId, rootIds, nodes, edges))
    assignment.set(rootId, rootId)
  }

  for (const node of nodes) {
    if (isLayoutRootNode(node)) {
      continue
    }

    let bestRoot = rootIds[0]
    let bestDistance = -1

    for (const rootId of rootIds) {
      const distance = distanceByRoot.get(rootId)?.get(node.id)
      if (distance == null) {
        continue
      }
      if (
        distance > bestDistance ||
        (distance === bestDistance &&
          rootIds.indexOf(rootId) > rootIds.indexOf(bestRoot))
      ) {
        bestDistance = distance
        bestRoot = rootId
      }
    }

    if (bestDistance >= 0) {
      assignment.set(node.id, bestRoot)
    }
  }

  return assignment
}

function buildHierarchyDataForRoot(
  rootId: string,
  nodes: AppNode[],
  edges: Edge[],
  assignment: Map<string, string>,
): TreeDatum {
  const adjacency = buildAdjacency(nodes, edges)
  const visited = new Set<string>()

  const buildNode = (id: string): TreeDatum => {
    visited.add(id)
    const childrenIds = (adjacency.get(id) ?? []).filter(
      (childId) =>
        assignment.get(childId) === rootId && !visited.has(childId),
    )
    const children = childrenIds.map((childId) => buildNode(childId))

    return children.length ? { id, children } : { id }
  }

  return buildNode(rootId)
}

/**
 * Bosque de árboles d3: una raíz por query, apilados verticalmente.
 * (Variante intermedia: d3 + asignación por camino largo, sin filas manuales.)
 */
export const applyTreeLayout = (nodes: AppNode[], edges: Edge[]) => {
  if (nodes.length === 0) {
    return nodes
  }

  const { nodeWidth, nodeHeight, horizontalGap, verticalGap, offsetY } =
    GRAPH_LAYOUT_TREE

  const rootIds = sortLayoutRootIds(findLayoutRootIds(nodes), nodes, edges)
  const assignment = assignNodesToLayoutRoots(rootIds, nodes, edges)

  const positionMap = new Map<string, { x: number; y: number }>()
  let forestOffsetY = 0
  const treeGap = verticalGap

  for (const rootId of rootIds) {
    const hierarchyData = buildHierarchyDataForRoot(
      rootId,
      nodes,
      edges,
      assignment,
    )

    const layout = tree<TreeDatum>().nodeSize([
      nodeWidth + horizontalGap,
      nodeHeight + verticalGap,
    ])
    const layoutRoot = layout(hierarchy(hierarchyData))
    const descendants: HierarchyPointNode<TreeDatum>[] =
      layoutRoot.descendants()

    if (descendants.length === 0) {
      continue
    }

    const yValues = descendants.map((descendant) => descendant.y)
    const minY = Math.min(...yValues)

    for (const descendant of descendants) {
      positionMap.set(descendant.data.id, {
        x: descendant.x,
        y: descendant.y - minY + forestOffsetY,
      })
    }

    const maxY = Math.max(...yValues)
    forestOffsetY += maxY - minY + treeGap
  }

  const positionedX = [...positionMap.values()].map((position) => position.x)
  const centerOffsetX =
    positionedX.length > 0
      ? window.innerWidth / 2 -
        (Math.min(...positionedX) + Math.max(...positionedX)) / 2
      : 0

  return nodes.map((node) => {
    const position = positionMap.get(node.id)
    if (!position) {
      return node
    }

    return {
      ...node,
      position: {
        x: position.x + centerOffsetX - nodeWidth / 2,
        y: position.y + offsetY,
      },
    }
  })
}
