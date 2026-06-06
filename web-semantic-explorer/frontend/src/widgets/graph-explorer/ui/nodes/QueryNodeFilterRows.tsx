import { Plus, X } from "lucide-react"
import { memo, useCallback } from "react"

import {
  createInputFilterRow,
  FILTER_NODE_DIMENSIONS,
  type FilterNodeKind,
  type InputFilterRow,
  readInputFilterRows,
} from "@/entities/graph"
import type { AppNode } from "@/entities/graph"
import { useGraphStore } from "@/entities/graph"
import { Button } from "@/shared/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

import { FilterValueField } from "./FilterValueField"

type QueryNodeFilterRowsProps = {
  nodeId: string
  data: AppNode["data"]
  disabled?: boolean
}

function updateInputFilters(nodeId: string, rows: InputFilterRow[]) {
  const { nodes, setNodes } = useGraphStore.getState()
  setNodes(
    nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            data: {
              ...node.data,
              inputFilters: rows.length > 0 ? rows : undefined,
            },
          }
        : node,
    ),
  )
}

function QueryNodeFilterRowsComponent({
  nodeId,
  data,
  disabled = false,
}: QueryNodeFilterRowsProps) {
  const rows = readInputFilterRows(data)

  const patchRow = useCallback(
    (rowId: string, patch: Partial<InputFilterRow>) => {
      const next = rows.map((row) =>
        row.id === rowId ? { ...row, ...patch } : row,
      )
      updateInputFilters(nodeId, next)
    },
    [nodeId, rows],
  )

  const removeRow = useCallback(
    (rowId: string) => {
      updateInputFilters(
        nodeId,
        rows.filter((row) => row.id !== rowId),
      )
    },
    [nodeId, rows],
  )

  const addRow = useCallback(() => {
    updateInputFilters(nodeId, [...rows, createInputFilterRow("place")])
  }, [nodeId, rows])

  return (
    <div className="graph-node__filter-rows">
      <div className="graph-node__filter-rows-header">
        <span className="eom-label">Filtros</span>
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="graph-node__filter-add nodrag nopan h-8 gap-1 px-2 font-mono text-[10px] uppercase tracking-widest"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={addRow}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Nuevo filtro
          </Button>
        )}
      </div>

      {rows.length === 0 && (
        <p className="graph-node__filter-rows-empty">
          {disabled
            ? "Sin filtros adicionales."
            : "Añade filtros por autor, lugar, categoría o año."}
        </p>
      )}

      <ul className="graph-node__filter-rows-list">
        {rows.map((row) => (
          <li key={row.id} className="graph-node__filter-row">
            <Select
              value={row.key}
              disabled={disabled}
              onValueChange={(value) =>
                patchRow(row.id, {
                  key: value as FilterNodeKind,
                  value: "",
                })
              }
            >
              <SelectTrigger
                className="graph-node__filter-type nodrag nopan h-9 w-[9.5rem] shrink-0 rounded-none border-foreground/40 text-xs"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(FILTER_NODE_DIMENSIONS) as [
                    FilterNodeKind,
                    string,
                  ][]
                ).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FilterValueField
              filterKey={row.key}
              value={row.value}
              disabled={disabled}
              onCommit={(value) => patchRow(row.id, { value })}
            />

            {!disabled && (
              <button
                type="button"
                aria-label="Quitar filtro"
                className="graph-node__filter-row-remove nodrag nopan"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={() => removeRow(row.id)}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const QueryNodeFilterRows = memo(QueryNodeFilterRowsComponent)
