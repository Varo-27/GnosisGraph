import { FolderPlus, Layers, Loader2, X } from "lucide-react"

import type { PlaceArticlePreview } from "@/shared/api/stats"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

import { usePlacePreview } from "./hooks/usePlacePreview"
import { MapPlaceArticleCard } from "./MapPlaceArticleCard"
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
      <DialogContent showCloseButton={false} className="map-country-modal">
        <div className="map-country-modal__shell">
          <div className="map-country-modal__header">
            <DialogHeader className="map-country-modal__header-inner">
              <p className="map-country-modal__kicker">Lugar geográfico</p>
              <DialogTitle className="map-country-modal__title">
                {intent?.label}
              </DialogTitle>
              <div className="map-country-modal__meta">
                <span className="map-country-modal__meta-count">
                  {articleCount} artículos
                </span>
              </div>
            </DialogHeader>
            <button
              type="button"
              aria-label="Cerrar"
              className="map-country-modal__close"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="map-country-modal__body">
            <p className="map-country-modal__section-label">Mejor valorados</p>

            {!placeId && (
              <p className="map-country-modal__body-text">
                No hay un lugar editorial vinculado directamente a este país en
                el mapa. Puedes añadirlo al explorador como filtro semántico.
              </p>
            )}

            {placeId && isLoading && (
              <div className="map-country-modal__loading">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
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
              <div className="map-country-modal__articles">
                <ul className="map-country-modal__article-grid">
                  {preview.top_rated.map((article) => (
                    <li key={article.id} className="min-h-0">
                      <MapPlaceArticleCard
                        article={article}
                        onSelect={onArticleSelect}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="map-country-modal__footer">
            <p className="map-country-modal__section-label">
              Añadir al explorador
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="map-country-modal__add-btn"
                onClick={onAddToCurrent}
              >
                <Layers className="h-4 w-4 shrink-0" aria-hidden />
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
                <FolderPlus className="h-4 w-4 shrink-0" aria-hidden />
                Nuevo
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
