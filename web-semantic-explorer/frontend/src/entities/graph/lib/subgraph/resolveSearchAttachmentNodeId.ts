import type { AppNode } from "@/entities/graph/model/types"

/**
 * Los artículos cuelgan directamente del nodo consulta (filtros inline).
 */
export function resolveSearchAttachmentNodeId(
  inputNodeId: string,
  _nodes: AppNode[],
  _edges: unknown[],
): string {
  return inputNodeId
}
