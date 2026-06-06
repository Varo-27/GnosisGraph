export const FAVORITES_QUERY_KEY = ["favorites"] as const

export type RatedFilter = "all" | "rated" | "not_rated" | "my_rating"

export type FavoritesFilters = {
  search: string
  author: string
  category: string
  place: string
  rated: RatedFilter
}

export const EMPTY_FAVORITES_FILTERS: FavoritesFilters = {
  search: "",
  author: "",
  category: "",
  place: "",
  rated: "all",
}

export function hasActiveFavoritesFilters(filters: FavoritesFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.author.length > 0 ||
    filters.category.length > 0 ||
    filters.place.length > 0 ||
    filters.rated !== "all"
  )
}
