/** Contrato de `/api/v1/stats/places/{place_id}/preview`. */

export type PlaceArticlePreview = {
  id: number
  title: string | null
  excerpt: string | null
  image_url: string | null
  date: string | null
  average_rating: number | null
  ratings_count: number
}

export type PlacePreviewResponse = {
  place_id: number
  name: string
  article_count: number
  top_rated: PlaceArticlePreview[]
}
