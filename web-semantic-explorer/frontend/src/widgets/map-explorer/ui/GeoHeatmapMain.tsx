import { Loader2 } from "lucide-react"
import { memo, useCallback, useMemo } from "react"

import type { HeatmapEntry } from "@/shared/api/stats"
import { getCountrySearchLabel } from "@/widgets/map-explorer/lib/countrySearchLabels"
import { resolveCountryClickSearch } from "@/widgets/map-explorer/lib/heatmapColors"
import type { MapProjectionId } from "@/widgets/map-explorer/lib/mapProjections"

import { GeoHeatmapMapTooltip } from "./GeoHeatmapMapTooltip"
import { GeoHeatmapSidebar } from "./GeoHeatmapSidebar"
import { useMapHoverState } from "./hooks/useMapHoverState"
import type { HeatmapPlaceGroups, MapPlaceFilterIntent } from "./types"
import { WorldChoropleth } from "./WorldChoropleth"

type GeoHeatmapMainProps = {
  projectionId: MapProjectionId
  focusCountryCode: string | null
  onFocusCountry: (isoCode: string) => void
  isLoading: boolean
  isError: boolean
  hasData: boolean
  countryCounts: Map<string, number>
  maxCount: number
  placeGroups: HeatmapPlaceGroups
  findDirectForCountry: (isoCode: string) => HeatmapEntry | undefined
  findRegionsForCountry: (isoCode: string) => HeatmapEntry[]
  activeWorkspaceName?: string
  isGuestMode: boolean
  onMapCountrySelect: (intent: MapPlaceFilterIntent) => void
  onAddCountryToCurrent: (entry: HeatmapEntry) => void
  onAddCountryToNew: (entry: HeatmapEntry) => void
}

export const GeoHeatmapMain = memo(function GeoHeatmapMain({
  projectionId,
  focusCountryCode,
  onFocusCountry,
  isLoading,
  isError,
  hasData,
  countryCounts,
  maxCount,
  placeGroups,
  findDirectForCountry,
  findRegionsForCountry,
  activeWorkspaceName,
  isGuestMode,
  onMapCountrySelect,
  onAddCountryToCurrent,
  onAddCountryToNew,
}: GeoHeatmapMainProps) {
  const {
    hoverState,
    goToGraphWithPlace,
    handleCountryPlaceClick,
    handleRegionPlaceClick,
    handleCountryClick,
    handleCountryHover,
    handleCountryListHover,
    handleRegionListHover,
  } = useMapHoverState({ onFocusCountry })

  const onMapCountryClick = useCallback(
    (isoCode: string | undefined, countryName?: string) => {
      handleCountryClick(isoCode, countryName)
      if (!isoCode) return

      const direct = findDirectForCountry(isoCode)
      const { place, q } = resolveCountryClickSearch(
        placeGroups.countryPlaces,
        isoCode,
        countryName,
        getCountrySearchLabel,
      )
      onMapCountrySelect({
        place,
        q,
        label: place,
        isoCode,
        placeId: direct?.place_id,
        articleCount:
          direct?.article_count ?? countryCounts.get(isoCode) ?? 0,
      })
    },
    [
      countryCounts,
      findDirectForCountry,
      handleCountryClick,
      onMapCountrySelect,
      placeGroups.countryPlaces,
    ],
  )

  const hoveredDirect = useMemo(() => {
    if (!hoverState.hoveredCode) return undefined
    return findDirectForCountry(hoverState.hoveredCode)
  }, [findDirectForCountry, hoverState.hoveredCode])

  const hoveredRegions = useMemo(() => {
    if (!hoverState.hoveredCode) return []
    return findRegionsForCountry(hoverState.hoveredCode)
  }, [findRegionsForCountry, hoverState.hoveredCode])

  const openSelectedRegion = useCallback(() => {
    const entry = placeGroups.regionPlaces.find(
      (e) => e.place_id === hoverState.selectedRegionId,
    )
    if (entry) goToGraphWithPlace(entry)
  }, [goToGraphWithPlace, hoverState.selectedRegionId, placeGroups.regionPlaces])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      <div className="relative min-h-[min(50vh,360px)] min-w-0 flex-1 overflow-hidden border-b-2 border-foreground bg-map-ocean lg:min-h-0 lg:border-b-0 lg:border-r-2">
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/70 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Cargando mapa…
          </div>
        )}

        {isError && !hasData && (
          <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-sm text-muted-foreground">
            No se pudo cargar el mapa.
          </div>
        )}

        {hasData && (
          <WorldChoropleth
            countryCounts={countryCounts}
            maxCount={maxCount}
            selectedCode={hoverState.selectedCode}
            hoveredCode={hoverState.hoveredCode}
            highlightedCodes={hoverState.highlightedCodes}
            hoveredRegionCodes={hoverState.hoveredRegionCodes}
            focusCountryCode={focusCountryCode}
            projectionId={projectionId}
            onHoverCountry={handleCountryHover}
            onSelectCountry={onMapCountryClick}
          />
        )}

        <GeoHeatmapMapTooltip
          hoveredCode={hoverState.hoveredCode}
          hoveredName={hoverState.hoveredName}
          hoveredRegionEntry={hoverState.hoveredRegionEntry}
          countryCounts={countryCounts}
          hoveredDirect={hoveredDirect}
          hoveredRegions={hoveredRegions}
        />
      </div>

      <GeoHeatmapSidebar
        maxCount={maxCount}
        placeGroups={placeGroups}
        hoveredCode={hoverState.hoveredCode}
        hoveredRegionEntry={hoverState.hoveredRegionEntry}
        selectedRegionId={hoverState.selectedRegionId}
        activeWorkspaceName={activeWorkspaceName}
        isGuestMode={isGuestMode}
        onCountryRowClick={handleCountryPlaceClick}
        onAddCountryToCurrent={onAddCountryToCurrent}
        onAddCountryToNew={onAddCountryToNew}
        onRegionPlaceClick={handleRegionPlaceClick}
        onCountryListHover={handleCountryListHover}
        onRegionListHover={handleRegionListHover}
        onOpenSelectedRegion={openSelectedRegion}
        onUnmappedPlaceClick={goToGraphWithPlace}
      />
    </div>
  )
})
