import { Globe2, MapPin } from "lucide-react"
import { memo, useMemo } from "react"

import type { HeatmapEntry } from "@/shared/api/stats"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import {
  EOM_GREEN,
  EOM_GREEN_COVERAGE_LEGEND,
  getHeatmapColorForCount,
} from "@/widgets/map-explorer/lib/heatmapColors"

import { MapCountryAddMenu } from "./MapCountryAddMenu"
import type { HeatmapPlaceGroups } from "./types"

const GeoHeatmapSidebarLegend = memo(function GeoHeatmapSidebarLegend() {
  return (
    <section className="map-sidebar__legend" aria-label="Leyenda del mapa">
      <div className="map-sidebar__legend-heading">
        <Globe2 className="h-4 w-4 shrink-0" aria-hidden />
        Leyenda · EOM
      </div>

      <div
        className="map-sidebar__legend-gradient"
        style={{
          background: `linear-gradient(90deg, ${EOM_GREEN[100]} 0%, ${EOM_GREEN[300]} 33%, ${EOM_GREEN[700]} 66%, ${EOM_GREEN[950]} 100%)`,
        }}
        aria-hidden
      />

      <ul className="map-sidebar__legend-steps map-sidebar__legend-steps--four">
        {EOM_GREEN_COVERAGE_LEGEND.map((step) => (
          <li key={String(step.key)} className="map-sidebar__legend-step">
            <span
              className="map-sidebar__legend-swatch"
              style={{ backgroundColor: EOM_GREEN[step.key] }}
              aria-hidden
            />
            <span className="map-sidebar__legend-step-label">{step.label}</span>
          </li>
        ))}
      </ul>

      <ul className="map-sidebar__legend-notes">
        <li>Ámbar claro: hover en mapa o lista.</li>
        <li>Dorado: país o macro-región seleccionada.</li>
        <li>Botón + junto al conteo para añadir al explorador.</li>
      </ul>
    </section>
  )
})

type GeoHeatmapCountryListProps = {
  countryPlaces: HeatmapEntry[]
  maxCount: number
  hoveredCode: string | null
  selectedCode: string | null
  activeWorkspaceName?: string
  isGuestMode: boolean
  scrollClassName?: string
  onCountryRowClick: (entry: HeatmapEntry) => void
  onAddCountryToCurrent: (entry: HeatmapEntry) => void
  onAddCountryToNew: (entry: HeatmapEntry) => void
  onCountryListHover: (entry: HeatmapEntry | null) => void
}

const GeoHeatmapCountryList = memo(function GeoHeatmapCountryList({
  countryPlaces,
  maxCount,
  hoveredCode,
  selectedCode,
  activeWorkspaceName,
  isGuestMode,
  scrollClassName,
  onCountryRowClick,
  onAddCountryToCurrent,
  onAddCountryToNew,
  onCountryListHover,
}: GeoHeatmapCountryListProps) {
  const sortedPlaces = useMemo(
    () => [...countryPlaces].sort((a, b) => b.article_count - a.article_count),
    [countryPlaces],
  )

  return (
    <div className={cn("space-y-1", scrollClassName)}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Países ({countryPlaces.length})
      </p>
      <ul className="space-y-0.5">
        {sortedPlaces.map((entry) => {
          const swatchColor = getHeatmapColorForCount(
            entry.article_count,
            maxCount,
          )
          const isoCode =
            entry.map_country_codes?.[0] ?? entry.country_code ?? null
          const isHovered = Boolean(isoCode && hoveredCode === isoCode)
          const isSelected = Boolean(isoCode && selectedCode === isoCode)
          return (
            <li
              key={entry.place_id}
              className={cn(
                "flex items-center gap-1 border px-1 py-0.5 hover:border-foreground hover:bg-accent/60",
                isSelected &&
                  "border-map-region-selected bg-map-region-selected/15",
                isHovered &&
                  !isSelected &&
                  "border-map-region-hover bg-map-region-hover/15",
                !isSelected && !isHovered && "border-transparent",
              )}
              onMouseEnter={() => onCountryListHover(entry)}
              onMouseLeave={() => onCountryListHover(null)}
            >
              <button
                type="button"
                onClick={() => onCountryRowClick(entry)}
                className="flex min-w-0 flex-1 items-center gap-2 px-1 py-0.5 text-left text-sm"
              >
                <span
                  className="h-4 w-4 shrink-0 border border-foreground/30"
                  style={{ backgroundColor: swatchColor }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {entry.name}
                </span>
              </button>
              <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                {entry.article_count}
              </span>
              <MapCountryAddMenu
                countryName={entry.name}
                activeWorkspaceName={activeWorkspaceName}
                isGuestMode={isGuestMode}
                onAddToCurrent={() => onAddCountryToCurrent(entry)}
                onAddToNew={() => onAddCountryToNew(entry)}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
})

type GeoHeatmapRegionListProps = {
  regionPlaces: HeatmapEntry[]
  hoveredRegionEntry: HeatmapEntry | null
  selectedRegionId: number | null
  onRegionPlaceClick: (entry: HeatmapEntry) => void
  onRegionListHover: (entry: HeatmapEntry | null) => void
  onOpenSelectedRegion: () => void
}

const GeoHeatmapRegionList = memo(function GeoHeatmapRegionList({
  regionPlaces,
  hoveredRegionEntry,
  selectedRegionId,
  onRegionPlaceClick,
  onRegionListHover,
  onOpenSelectedRegion,
}: GeoHeatmapRegionListProps) {
  if (regionPlaces.length === 0) return null

  return (
    <div className="shrink-0 space-y-1 border-t border-foreground/20 pt-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Macro-regiones ({regionPlaces.length})
      </p>
      <ul className="max-h-40 space-y-0.5 overflow-y-auto">
        {regionPlaces.map((entry) => {
          const isRegionHovered =
            hoveredRegionEntry?.place_id === entry.place_id
          const isRegionSelected = selectedRegionId === entry.place_id
          return (
            <li key={entry.place_id}>
              <button
                type="button"
                onClick={() => onRegionPlaceClick(entry)}
                onMouseEnter={() => onRegionListHover(entry)}
                onMouseLeave={() => onRegionListHover(null)}
                className={`flex w-full items-center gap-2 border px-2 py-1 text-left text-sm hover:border-foreground hover:bg-accent ${
                  isRegionSelected
                    ? "border-map-region-selected bg-map-region-selected/15"
                    : isRegionHovered
                      ? "border-map-region-hover bg-map-region-hover/15"
                      : "border-transparent"
                }`}
              >
                <span
                  className="h-4 w-4 shrink-0 border border-foreground/30 bg-chart-4"
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {entry.name}
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    ({entry.map_country_codes.length} países)
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {entry.article_count}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {selectedRegionId && (
        <button
          type="button"
          className="w-full border border-foreground px-2 py-1 text-xs hover:bg-muted/60"
          onClick={onOpenSelectedRegion}
        >
          Abrir grafo con esta región
        </button>
      )}
    </div>
  )
})

export type GeoHeatmapSidebarContentProps = {
  maxCount: number
  placeGroups: HeatmapPlaceGroups
  hoveredCode: string | null
  selectedCode: string | null
  hoveredRegionEntry: HeatmapEntry | null
  selectedRegionId: number | null
  activeWorkspaceName?: string
  isGuestMode: boolean
  onCountryRowClick: (entry: HeatmapEntry) => void
  onAddCountryToCurrent: (entry: HeatmapEntry) => void
  onAddCountryToNew: (entry: HeatmapEntry) => void
  onRegionPlaceClick: (entry: HeatmapEntry) => void
  onCountryListHover: (entry: HeatmapEntry | null) => void
  onRegionListHover: (entry: HeatmapEntry | null) => void
  onOpenSelectedRegion: () => void
  onUnmappedPlaceClick: (entry: HeatmapEntry) => void
}

export const GeoHeatmapSidebarContent = memo(function GeoHeatmapSidebarContent({
  maxCount,
  placeGroups,
  hoveredCode,
  selectedCode,
  hoveredRegionEntry,
  selectedRegionId,
  activeWorkspaceName,
  isGuestMode,
  onCountryRowClick,
  onAddCountryToCurrent,
  onAddCountryToNew,
  onRegionPlaceClick,
  onCountryListHover,
  onRegionListHover,
  onOpenSelectedRegion,
  onUnmappedPlaceClick,
}: GeoHeatmapSidebarContentProps) {
  const { countryPlaces, regionPlaces, unmappedPlaces } = placeGroups

  return (
    <>
      <GeoHeatmapSidebarLegend />

      <GeoHeatmapCountryList
        countryPlaces={countryPlaces}
        maxCount={maxCount}
        hoveredCode={hoveredCode}
        selectedCode={selectedCode}
        activeWorkspaceName={activeWorkspaceName}
        isGuestMode={isGuestMode}
        scrollClassName="map-sidebar__country-list"
        onCountryRowClick={onCountryRowClick}
        onAddCountryToCurrent={onAddCountryToCurrent}
        onAddCountryToNew={onAddCountryToNew}
        onCountryListHover={onCountryListHover}
      />

      <GeoHeatmapRegionList
        regionPlaces={regionPlaces}
        hoveredRegionEntry={hoveredRegionEntry}
        selectedRegionId={selectedRegionId}
        onRegionPlaceClick={onRegionPlaceClick}
        onRegionListHover={onRegionListHover}
        onOpenSelectedRegion={onOpenSelectedRegion}
      />

      {unmappedPlaces.length > 0 && (
        <div className="shrink-0 space-y-2 border-t-2 border-foreground pt-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Sin mapa ({unmappedPlaces.length})
          </div>
          <p className="text-[10px] text-muted-foreground">
            Mundo, polos y ártico editorial (sin país ISO único).
          </p>
          <div className="flex flex-wrap gap-2">
            {unmappedPlaces.map((entry) => (
              <Badge
                key={entry.place_id}
                asChild
                variant="outline"
                className="cursor-pointer rounded-none border-foreground"
              >
                <button
                  type="button"
                  onClick={() => onUnmappedPlaceClick(entry)}
                >
                  {entry.name} ({entry.article_count})
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  )
})
