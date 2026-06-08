import { randomUUID } from "@/shared/lib/randomUUID"

/** Id del nodo input creado al abrir un espacio de trabajo vacío. */
export const DEFAULT_INPUT_NODE_ID = "input-default"

export function createInputNodeId(): string {
  return `input-${randomUUID()}`
}

export function createFilterNodeId(filterKey: string): string {
  return `filter-${filterKey}-${randomUUID()}`
}
