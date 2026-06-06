import type { PlaceArticlePreview } from "@/shared/api/stats"
import { StarRating } from "@/features/article-rating"
import { cn } from "@/shared/lib/utils"

type MapPlaceArticleCardProps = {
  article: PlaceArticlePreview
  onSelect: (article: PlaceArticlePreview) => void
}

export function MapPlaceArticleCard({
  article,
  onSelect,
}: MapPlaceArticleCardProps) {
  const title = article.title?.trim() || "Sin título"

  return (
    <button
      type="button"
      onClick={() => onSelect(article)}
      className={cn("eom-tile-card map-country-modal__article-card")}
    >
      {article.image_url ? (
        <img
          src={article.image_url}
          alt=""
          className="map-country-modal__article-card-thumb"
          loading="lazy"
        />
      ) : (
        <span
          className="map-country-modal__article-card-thumb-fallback"
          aria-hidden
        >
          EOM
        </span>
      )}
      <span className="map-country-modal__article-card-body">
        <span className="map-country-modal__article-card-title">{title}</span>
        {article.average_rating != null ? (
          <span className="map-country-modal__article-card-rating">
            <StarRating value={article.average_rating} size="sm" />
            <span className="map-country-modal__article-meta">
              {article.average_rating.toFixed(1)}
            </span>
          </span>
        ) : (
          <span className="map-country-modal__article-empty">
            Sin valoraciones
          </span>
        )}
      </span>
    </button>
  )
}
