import type { HeatmapEntry } from "@/shared/api/stats"
import type { MapProjectionId } from "@/widgets/map-explorer/lib/mapProjections"

export type {
  ChoroplethScene,
  ChoroplethViewBox,
  RenderCountry,
} from "@/widgets/map-explorer/lib/choroplethScene"

export type MapHoverState = {
  hoveredCode: string | null
  hoveredName: string | null
  selectedCode: string | null
  highlightedCodes: Set<string> | null
  hoveredRegionCodes: Set<string> | null
  hoveredRegionEntry: HeatmapEntry | null
  selectedRegionId: number | null
}

export type WorldChoroplethProps = {
  countryCounts: Map<string, number>
  maxCount: number
  selectedCode: string | null
  hoveredCode: string | null
  highlightedCodes: Set<string> | null
  hoveredRegionCodes: Set<string> | null
  projectionId: MapProjectionId
  focusCountryCode?: string | null
  onHoverCountry: (isoCode: string | null, name?: string) => void
  onSelectCountry: (isoCode: string | undefined, name?: string) => void
}

export type HeatmapPlaceGroups = {
  countryPlaces: HeatmapEntry[]
  regionPlaces: HeatmapEntry[]
  unmappedPlaces: HeatmapEntry[]
}

export const MAP_PLACE_PREVIEW_ARTICLE_LIMIT = 6

export type MapPlaceFilterIntent = {
  place: string
  q: string
  label: string
  isoCode?: string
  placeId?: number
  articleCount?: number
}
