import { memo } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  MAP_PROJECTIONS,
  type MapProjectionId,
} from "@/widgets/map-explorer/lib/mapProjections"

type GeoHeatmapHeaderProps = {
  projectionId: MapProjectionId
  onProjectionChange: (id: MapProjectionId) => void
  totalArticles?: number
}

export const GeoHeatmapHeader = memo(function GeoHeatmapHeader({
  projectionId,
  onProjectionChange,
  totalArticles,
}: GeoHeatmapHeaderProps) {
  const activeProjection = MAP_PROJECTIONS.find((p) => p.id === projectionId)

  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground bg-background px-6 py-4 shadow-[0_4px_0_0_var(--color-foreground)]">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
          Fase 3 · visión geoespacial
        </p>
        <h1 className="font-sans text-2xl font-bold">Mapa de cobertura</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Intensidad por volumen de artículos. Rueda del ratón para zoom,
          arrastra para mover. Clic en un país hace zoom y te permite añadirlo
          como filtro de lugar en el explorador.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Proyección
          </p>
          <Select
            value={projectionId}
            onValueChange={(value) =>
              onProjectionChange(value as MapProjectionId)
            }
          >
            <SelectTrigger className="w-[220px] rounded-none border-2 border-foreground">
              <SelectValue placeholder="Proyección" />
            </SelectTrigger>
            <SelectContent>
              {MAP_PROJECTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeProjection && (
            <p className="max-w-[220px] text-[10px] text-muted-foreground">
              {projectionId === "mercator"
                ? "Clásica para navegación."
                : "Buen equilibrio área y forma."}
            </p>
          )}
        </div>

        {totalArticles != null && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Artículos geolocalizados
            </p>
            <p className="font-mono text-2xl font-bold">{totalArticles}</p>
          </div>
        )}
      </div>
    </header>
  )
})
