import type { PlaceArticlePreview } from "@/shared/api/stats"
import { StarRating } from "@/features/article-rating"
import { cn } from "@/shared/lib/utils"

type MapPlaceArticleRowProps = {
  article: PlaceArticlePreview
  onSelect: (article: PlaceArticlePreview) => void
}

export function MapPlaceArticleRow({ article, onSelect }: MapPlaceArticleRowProps) {
  const title = article.title?.trim() || "Sin título"

  return (
    <button
      type="button"
      onClick={() => onSelect(article)}
      className={cn(
        "map-country-modal__article",
        "flex w-full border border-transparent text-left transition-colors",
        "hover:border-foreground hover:bg-accent/60",
      )}
    >
      {article.image_url ? (
        <img
          src={article.image_url}
          alt=""
          className="map-country-modal__article-thumb"
          loading="lazy"
        />
      ) : (
        <span className="map-country-modal__article-thumb-fallback" aria-hidden>
          EOM
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="map-country-modal__article-title">{title}</span>
        {article.average_rating != null ? (
          <span className="mt-2 flex items-center gap-2">
            <StarRating value={article.average_rating} size="md" />
            <span className="map-country-modal__article-meta">
              {article.average_rating.toFixed(1)}
              {article.ratings_count > 0
                ? ` · ${article.ratings_count}`
                : null}
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
