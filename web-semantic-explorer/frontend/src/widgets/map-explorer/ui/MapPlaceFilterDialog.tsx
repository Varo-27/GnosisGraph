import { FolderPlus, Layers, Loader2, MapPin, X } from "lucide-react"

import type { PlaceArticlePreview } from "@/shared/api/stats"
import { cn } from "@/shared/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

import { usePlacePreview } from "./hooks/usePlacePreview"
import { MapPlaceArticleRow } from "./MapPlaceArticleRow"
import type { MapPlaceFilterIntent } from "./types"

type MapPlaceFilterDialogProps = {
  intent: MapPlaceFilterIntent | null
  activeWorkspaceName?: string
  isGuestMode: boolean
  onOpenChange: (open: boolean) => void
  onAddToCurrent: () => void
  onAddToNew: () => void
  onArticleSelect: (article: PlaceArticlePreview) => void
}

export function MapPlaceFilterDialog({
  intent,
  activeWorkspaceName,
  isGuestMode,
  onOpenChange,
  onAddToCurrent,
  onAddToNew,
  onArticleSelect,
}: MapPlaceFilterDialogProps) {
  const open = intent !== null
  const placeId = intent?.placeId

  const {
    data: preview,
    isLoading,
    isError,
  } = usePlacePreview(placeId, open)

  const articleCount =
    preview?.article_count ?? intent?.articleCount ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "map-country-modal",
          "eom-brutal-border eom-shadow-xs eom-surface-flat",
          "max-h-[min(88vh,680px)] max-w-xl rounded-none border-foreground bg-background p-0 shadow-none",
        )}
      >
        <div className="flex max-h-[min(88vh,680px)] flex-col">
          <div className="flex items-start gap-2 border-b border-foreground/15 p-5 pb-4">
            <DialogHeader className="min-w-0 flex-1 space-y-2 text-left">
              <DialogTitle className="font-sans text-3xl font-bold leading-tight">
                {intent?.label}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-5 w-5 shrink-0" aria-hidden />
                    Lugar geográfico
                  </span>
                  <span className="font-mono text-xl font-bold tabular-nums text-foreground">
                    {articleCount} artículos
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>
            <button
              type="button"
              aria-label="Cerrar"
              className="graph-node__delete-close shrink-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="graph-node__icon" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <p className="map-country-modal__section-label">Mejor valorados</p>

            {!placeId && (
              <p className="map-country-modal__body-text">
                No hay un lugar editorial vinculado directamente a este país en
                el mapa. Puedes añadirlo al explorador como filtro semántico.
              </p>
            )}

            {placeId && isLoading && (
              <div className="map-country-modal__body-text flex items-center gap-2 py-6">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Cargando artículos…
              </div>
            )}

            {placeId && isError && !isLoading && (
              <p className="map-country-modal__body-text">
                No se pudieron cargar los artículos destacados.
              </p>
            )}

            {placeId && preview && preview.top_rated.length === 0 && (
              <p className="map-country-modal__body-text">
                Aún no hay artículos publicados para este lugar.
              </p>
            )}

            {preview && preview.top_rated.length > 0 && (
              <ul className="space-y-2">
                {preview.top_rated.map((article) => (
                  <li key={article.id}>
                    <MapPlaceArticleRow
                      article={article}
                      onSelect={onArticleSelect}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="shrink-0 border-t border-foreground/15 bg-muted/20 px-5 py-4">
            <p className="map-country-modal__section-label">Añadir al explorador</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="map-country-modal__add-btn"
                onClick={onAddToCurrent}
              >
                <Layers className="h-5 w-5 shrink-0" aria-hidden />
                <span className="truncate">
                  {activeWorkspaceName ?? "Área actual"}
                </span>
              </button>
              <button
                type="button"
                className="map-country-modal__add-btn"
                onClick={onAddToNew}
                disabled={isGuestMode}
                title={
                  isGuestMode
                    ? "Inicia sesión para crear varias áreas de trabajo"
                    : undefined
                }
              >
                <FolderPlus className="h-5 w-5 shrink-0" aria-hidden />
                Nuevo
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
