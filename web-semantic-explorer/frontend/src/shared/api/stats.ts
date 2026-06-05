import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"

import type { HeatmapResponse } from "./types/heatmap"
import type { PlacePreviewResponse } from "./types/placePreview"

export type { HeatmapEntry, HeatmapResponse } from "./types/heatmap"
export type {
  PlaceArticlePreview,
  PlacePreviewResponse,
} from "./types/placePreview"

/** Cliente manual para endpoints de estadísticas no cubiertos por openapi-ts. */
export const StatsApi = {
  getHeatmap(): CancelablePromise<HeatmapResponse> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/stats/heatmap",
    })
  },

  getPlacePreview(
    placeId: number,
    limit = 6,
  ): CancelablePromise<PlacePreviewResponse> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/stats/places/{place_id}/preview",
      path: { place_id: placeId },
      query: { limit },
    })
  },
}
