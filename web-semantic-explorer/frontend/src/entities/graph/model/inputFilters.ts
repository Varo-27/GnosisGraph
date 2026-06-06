import type { ArticleMetadataFilters } from "@/shared/lib/filters"
import type { FilterNodeKind } from "./graphNodeTypes"
import { FILTER_NODE_DIMENSIONS } from "./graphNodeTypes"
import type { AppNodeData } from "./types"

export type InputFilterRow = {
  id: string
  key: FilterNodeKind
  value: string
}

let filterRowCounter = 0

export function createInputFilterRow(
  key: FilterNodeKind = "place",
): InputFilterRow {
  filterRowCounter += 1
  return {
    id: `filter-row-${Date.now()}-${filterRowCounter}`,
    key,
    value: "",
  }
}

export function readInputFilterRows(data: AppNodeData): InputFilterRow[] {
  const raw = data.inputFilters
  if (!Array.isArray(raw)) {
    return []
  }

  return raw
    .map((entry) => normalizeInputFilterRow(entry))
    .filter((row): row is InputFilterRow => row != null)
}

function normalizeInputFilterRow(entry: unknown): InputFilterRow | null {
  if (!entry || typeof entry !== "object") {
    return null
  }

  const record = entry as Record<string, unknown>
  const key = record.key
  if (typeof key !== "string" || !(key in FILTER_NODE_DIMENSIONS)) {
    return null
  }

  const id =
    typeof record.id === "string" && record.id.trim()
      ? record.id
      : createInputFilterRow(key as FilterNodeKind).id

  return {
    id,
    key: key as FilterNodeKind,
    value:
      typeof record.value === "string"
        ? record.value
        : String(record.value ?? ""),
  }
}

export function inputFilterRowsToMetadata(
  rows: InputFilterRow[],
): ArticleMetadataFilters {
  const accumulated: ArticleMetadataFilters = {}

  for (const row of rows) {
    applyFilterRowValue(row, accumulated)
  }

  return accumulated
}

export function applyFilterRowValue(
  row: InputFilterRow,
  accumulated: ArticleMetadataFilters,
): void {
  const { key, value } = row

  if (key === "year_start" || key === "year_end") {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      accumulated[key] = parsed
    }
    return
  }

  const text = value.trim()
  if (text) {
    accumulated[key] = text
  }
}

export function filterRowFromLegacyNode(
  data: AppNodeData,
): InputFilterRow | null {
  const key = data.filterKey
  if (typeof key !== "string" || !(key in FILTER_NODE_DIMENSIONS)) {
    return null
  }

  return {
    id: createInputFilterRow(key as FilterNodeKind).id,
    key: key as FilterNodeKind,
    value: String(data.filterValue ?? ""),
  }
}
