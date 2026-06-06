import { TextCursorInput } from "lucide-react"

import { cn } from "@/shared/lib/utils"

import { setPaletteDragData } from "./paletteDrag"

type GraphNodePaletteProps = {
  isLoading?: boolean
}

const paletteItemClass =
  "graph-palette__draggable flex items-center gap-2 rounded-none border-2 border-foreground font-mono text-xs uppercase tracking-wider shadow-[2px_2px_0_0_var(--color-foreground)] transition-opacity disabled:pointer-events-none disabled:opacity-50"

export function GraphNodePalette({ isLoading }: GraphNodePaletteProps) {
  const disabled = isLoading === true

  return (
    <div className="graph-palette">
      <div>
        <h2 className="eom-heading-section">Añadir nodos</h2>
        <p className="graph-palette__hint">
          Arrastra un nodo consulta al lienzo. Añade filtros dentro del nodo
          y conéctalo con los artículos.
        </p>
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        draggable={!disabled}
        aria-label="Arrastrar nodo consulta al lienzo"
        className={cn(
          paletteItemClass,
          "h-10 justify-start bg-background px-3",
        )}
        onDragStart={(event) => {
          setPaletteDragData(event, { type: "query" })
        }}
      >
        <TextCursorInput className="h-4 w-4 shrink-0 text-primary" />
        Nodo consulta
      </div>
    </div>
  )
}
