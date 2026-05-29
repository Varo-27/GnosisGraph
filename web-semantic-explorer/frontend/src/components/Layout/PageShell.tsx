import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PageShellProps = {
  children: ReactNode
  className?: string
}

/** Contenedor flex de altura completa para vistas Grafo/Mapa dentro del layout. */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  )
}
