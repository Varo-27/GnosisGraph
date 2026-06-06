import type { FilterNodeKind } from "@/entities/graph"

export const PALETTE_DRAG_MIME = "application/x-wse-graph-node"

export type PaletteArticleDragData = {
  article_id: number
  title: string | null
  excerpt: string | null
  image_url: string | null
  url: string
  authors: string[]
  categories: string[]
}

export type PaletteDragPayload =
  | { type: "query" }
  | { type: "input" }
  | { type: "filter"; filterKey: FilterNodeKind }
  | { type: "article"; favorite: PaletteArticleDragData }

function isPaletteArticleDragData(
  value: unknown,
): value is PaletteArticleDragData {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as Record<string, unknown>
  return (
    typeof record.article_id === "number" &&
    typeof record.url === "string" &&
    Array.isArray(record.authors) &&
    Array.isArray(record.categories)
  )
}

export function setPaletteDragData(
  event: React.DragEvent,
  payload: PaletteDragPayload,
): void {
  event.dataTransfer.setData(PALETTE_DRAG_MIME, JSON.stringify(payload))
  event.dataTransfer.effectAllowed = "move"
}

export function readPaletteDragData(
  event: React.DragEvent,
): PaletteDragPayload | null {
  const raw = event.dataTransfer.getData(PALETTE_DRAG_MIME)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as PaletteDragPayload
    if (parsed.type === "query" || parsed.type === "input") {
      return { type: "query" }
    }
    if (parsed.type === "filter" && typeof parsed.filterKey === "string") {
      return { type: "filter", filterKey: parsed.filterKey as FilterNodeKind }
    }
    if (
      parsed.type === "article" &&
      isPaletteArticleDragData(parsed.favorite)
    ) {
      return { type: "article", favorite: parsed.favorite }
    }
    return null
  } catch {
    return null
  }
}

export function isPaletteDragEvent(event: React.DragEvent): boolean {
  return event.dataTransfer.types.includes(PALETTE_DRAG_MIME)
}
