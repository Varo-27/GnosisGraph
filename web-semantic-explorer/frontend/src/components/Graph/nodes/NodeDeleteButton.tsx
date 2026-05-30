import { Trash2 } from "lucide-react"
import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useGraphStore } from "@/store/useGraphStore"

type NodeDeleteButtonProps = {
  nodeId: string
  ariaLabel?: string
}

export function NodeDeleteButton({
  nodeId,
  ariaLabel = "Eliminar nodo",
}: NodeDeleteButtonProps) {
  const removeNode = useGraphStore((state) => state.removeNode)
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    setOpen(false)
    removeNode(nodeId)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "graph-node__icon-btn nodrag nopan",
            open && "graph-node__icon-btn--armed",
          )}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <Trash2 className="graph-node__icon" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="top"
        className="graph-node__delete-menu"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <p className="graph-node__delete-prompt">¿Eliminar este nodo?</p>
        <div className="mt-2 flex flex-col gap-1">
          <DropdownMenuItem
            className="graph-node__delete-confirm"
            onSelect={(event) => {
              event.preventDefault()
              handleConfirm()
            }}
          >
            Sí, eliminar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="graph-node__delete-cancel"
            onSelect={(event) => {
              event.preventDefault()
              setOpen(false)
            }}
          >
            Cancelar
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
