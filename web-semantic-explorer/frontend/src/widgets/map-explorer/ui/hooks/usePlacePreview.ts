import { useQuery } from "@tanstack/react-query"

import { StatsApi } from "@/shared/api/stats"

import { MAP_PLACE_PREVIEW_ARTICLE_LIMIT } from "../types"

export function usePlacePreview(placeId: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["place-preview", placeId, MAP_PLACE_PREVIEW_ARTICLE_LIMIT],
    queryFn: () =>
      StatsApi.getPlacePreview(
        placeId as number,
        MAP_PLACE_PREVIEW_ARTICLE_LIMIT,
      ),
    enabled: enabled && placeId != null,
    staleTime: 60_000,
  })
}
