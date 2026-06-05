import { Loader2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import type { HeatmapEntry, PlaceArticlePreview } from "@/shared/api/stats"
import type { AppNode } from "@/entities/graph"
import { useWorkspaceStore } from "@/entities/workspace"
import { ArticleNodeModal } from "@/widgets/article-modal"
import { getCountrySearchLabel } from "@/widgets/map-explorer/lib/countrySearchLabels"
import { resolveCountryClickSearch } from "@/widgets/map-explorer/lib/heatmapColors"
import {
  DEFAULT_PROJECTION_ID,
  MAP_PROJECTIONS,
  type MapProjectionId,
} from "@/widgets/map-explorer/lib/mapProjections"

import { GeoHeatmapMapTooltip } from "./GeoHeatmapMapTooltip"
import { GeoHeatmapSidebar } from "./GeoHeatmapSidebar"
import { useHeatmapData } from "./hooks/useHeatmapData"
import { useMapHoverState } from "./hooks/useMapHoverState"
import { MapPlaceFilterDialog } from "./MapPlaceFilterDialog"
import type { MapPlaceFilterIntent } from "./types"
import { WorldChoropleth } from "./WorldChoropleth"

export function GeoHeatmap() {
  const navigate = useNavigate()
  const [projectionId, setProjectionId] = useState<MapProjectionId>(
    DEFAULT_PROJECTION_ID,
  )
  const [focusCountryCode, setFocusCountryCode] = useState<string | null>(null)
  const [placeFilterIntent, setPlaceFilterIntent] =
    useState<MapPlaceFilterIntent | null>(null)
  const [articleModalNode, setArticleModalNode] = useState<AppNode | null>(null)
  const [articleModalOpen, setArticleModalOpen] = useState(false)

  const isGuestMode = useWorkspaceStore((state) => state.isGuestMode)
  const hydrateForCurrentUser = useWorkspaceStore(
    (state) => state.hydrateForCurrentUser,
  )
  const activeWorkspaceName = useWorkspaceStore((state) => {
    const active = state.workspaces.find((ws) => ws.id === state.activeWorkspaceId)
    return active?.name
  })

  useEffect(() => {
    void hydrateForCurrentUser()
  }, [hydrateForCurrentUser])

  const focusCountryOnMap = useCallback((isoCode: string) => {
    setFocusCountryCode(null)
    requestAnimationFrame(() => setFocusCountryCode(isoCode))
  }, [])

  const openPlaceFilter = useCallback((intent: MapPlaceFilterIntent) => {
    setPlaceFilterIntent(intent)
  }, [])

  const {
    data,
    isLoading,
    isError,
    countryCounts,
    maxCount,
    placeGroups,
    findDirectForCountry,
    findRegionsForCountry,
  } = useHeatmapData()

  const {
    hoverState,
    goToGraphWithPlace,
    handleCountryPlaceClick,
    handleRegionPlaceClick,
    handleCountryClick,
    handleCountryHover,
    handleCountryListHover,
    handleRegionListHover,
  } = useMapHoverState({
    onFocusCountry: focusCountryOnMap,
  })

  const onMapCountrySelect = useCallback(
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
      openPlaceFilter({
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
      openPlaceFilter,
      placeGroups.countryPlaces,
    ],
  )

  const addPlaceToExplorer = useCallback(
    (intent: MapPlaceFilterIntent, target: "current" | "new") => {
      if (target === "new" && !isGuestMode) {
        useWorkspaceStore
          .getState()
          .createWorkspace(`Mapa · ${intent.label}`)
      }

      void navigate({
        to: "/",
        search: {
          place: intent.place,
          q: intent.q,
        },
      })
    },
    [isGuestMode, navigate],
  )

  const intentFromEntry = useCallback(
    (entry: HeatmapEntry): MapPlaceFilterIntent => ({
      place: entry.name,
      q: entry.name,
      label: entry.name,
      isoCode:
        entry.map_country_codes?.[0] ?? entry.country_code ?? undefined,
    }),
    [],
  )

  const onSidebarCountryRowClick = useCallback(
    (entry: HeatmapEntry) => {
      handleCountryPlaceClick(entry)
    },
    [handleCountryPlaceClick],
  )

  const onAddCountryToCurrent = useCallback(
    (entry: HeatmapEntry) => {
      addPlaceToExplorer(intentFromEntry(entry), "current")
    },
    [addPlaceToExplorer, intentFromEntry],
  )

  const onAddCountryToNew = useCallback(
    (entry: HeatmapEntry) => {
      if (isGuestMode) return
      addPlaceToExplorer(intentFromEntry(entry), "new")
    },
    [addPlaceToExplorer, intentFromEntry, isGuestMode],
  )

  const closePlaceFilter = useCallback((open: boolean) => {
    if (!open) {
      setPlaceFilterIntent(null)
    }
  }, [])

  const handleAddToCurrentWorkspace = useCallback(() => {
    if (!placeFilterIntent) return
    addPlaceToExplorer(placeFilterIntent, "current")
    setPlaceFilterIntent(null)
  }, [addPlaceToExplorer, placeFilterIntent])

  const handleAddToNewWorkspace = useCallback(() => {
    if (!placeFilterIntent || isGuestMode) return
    addPlaceToExplorer(placeFilterIntent, "new")
    setPlaceFilterIntent(null)
  }, [addPlaceToExplorer, isGuestMode, placeFilterIntent])

  const handleMapArticleSelect = useCallback((article: PlaceArticlePreview) => {
    setArticleModalNode({
      id: String(article.id),
      type: "article",
      position: { x: 0, y: 0 },
      data: {
        title: article.title?.trim() || "Sin título",
        excerpt: article.excerpt ?? undefined,
        imageUrl: article.image_url ?? undefined,
        appearDelay: 0,
      },
    })
    setArticleModalOpen(true)
  }, [])

  const activeProjection = MAP_PROJECTIONS.find((p) => p.id === projectionId)

  const hoveredDirect = useMemo(() => {
    if (!hoverState.hoveredCode) return undefined
    return findDirectForCountry(hoverState.hoveredCode)
  }, [findDirectForCountry, hoverState.hoveredCode])

  const hoveredRegions = useMemo(() => {
    if (!hoverState.hoveredCode) return []
    return findRegionsForCountry(hoverState.hoveredCode)
  }, [findRegionsForCountry, hoverState.hoveredCode])

  const openSelectedRegion = () => {
    const entry = placeGroups.regionPlaces.find(
      (e) => e.place_id === hoverState.selectedRegionId,
    )
    if (entry) goToGraphWithPlace(entry)
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-background">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground bg-background px-6 py-4 shadow-[0_4px_0_0_var(--color-foreground)]">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
            Fase 3 · visión geoespacial
          </p>
          <h1 className="font-sans text-2xl font-bold">Mapa de cobertura</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Intensidad por volumen de artículos. Rueda del ratón para zoom,
            arrastra para mover. Clic en un país hace zoom y te permite añadirlo
            como filtro de lugar en el explorador.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Proyección
            </p>
            <Select
              value={projectionId}
              onValueChange={(value) =>
                setProjectionId(value as MapProjectionId)
              }
            >
              <SelectTrigger className="w-[220px] rounded-none border-2 border-foreground">
                <SelectValue placeholder="Proyección" />
              </SelectTrigger>
              <SelectContent>
                {MAP_PROJECTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeProjection && (
              <p className="max-w-[220px] text-[10px] text-muted-foreground">
                {projectionId === "mercator"
                  ? "Clásica para navegación."
                  : "Buen equilibrio área y forma."}
              </p>
            )}
          </div>

          {data && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Artículos geolocalizados
              </p>
              <p className="font-mono text-2xl font-bold">
                {data.total_articles}
              </p>
            </div>
          )}
        </div>
      </header>

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

          {isError && !data && (
            <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-sm text-muted-foreground">
              No se pudo cargar el mapa.
            </div>
          )}

          {data && (
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
              onSelectCountry={onMapCountrySelect}
            />
          )}

          <GeoHeatmapMapTooltip
            hoverState={hoverState}
            countryCounts={countryCounts}
            hoveredDirect={hoveredDirect}
            hoveredRegions={hoveredRegions}
          />
        </div>

        <GeoHeatmapSidebar
          maxCount={maxCount}
          placeGroups={placeGroups}
          hoverState={hoverState}
          activeWorkspaceName={activeWorkspaceName}
          isGuestMode={isGuestMode}
          onCountryRowClick={onSidebarCountryRowClick}
          onAddCountryToCurrent={onAddCountryToCurrent}
          onAddCountryToNew={onAddCountryToNew}
          onRegionPlaceClick={handleRegionPlaceClick}
          onCountryListHover={handleCountryListHover}
          onRegionListHover={handleRegionListHover}
          onOpenSelectedRegion={openSelectedRegion}
          onUnmappedPlaceClick={goToGraphWithPlace}
        />
      </div>

      <MapPlaceFilterDialog
        intent={placeFilterIntent}
        activeWorkspaceName={activeWorkspaceName}
        isGuestMode={isGuestMode}
        onOpenChange={closePlaceFilter}
        onAddToCurrent={handleAddToCurrentWorkspace}
        onAddToNew={handleAddToNewWorkspace}
        onArticleSelect={handleMapArticleSelect}
      />

      <ArticleNodeModal
        node={articleModalNode}
        open={articleModalOpen}
        onOpenChange={setArticleModalOpen}
      />
    </div>
  )
}
