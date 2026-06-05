import { useQuery } from "@tanstack/react-query"

import { StatsApi } from "@/shared/api/stats"

export function usePlacePreview(placeId: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["place-preview", placeId],
    queryFn: () => StatsApi.getPlacePreview(placeId as number),
    enabled: enabled && placeId != null,
    staleTime: 60_000,
  })
}
