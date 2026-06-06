import { useQuery } from "@tanstack/react-query"

import { fetchFavorites } from "@/shared/api/workspaces"
import { isLoggedIn } from "@/shared/auth"

import { FAVORITES_QUERY_KEY } from "./favoritesFilters"

export function useFavoritesList() {
  const loggedIn = isLoggedIn()

  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => fetchFavorites(),
    enabled: loggedIn,
    staleTime: 30_000,
  })
}
