import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { HeatmapEntry, PlaceArticlePreview } from "@/shared/api/stats"
import type { AppNode } from "@/entities/graph"
import { useWorkspaceStore } from "@/entities/workspace"
import { ArticleNodeModal } from "@/widgets/article-modal"
import {
  DEFAULT_PROJECTION_ID,
  type MapProjectionId,
} from "@/widgets/map-explorer/lib/mapProjections"

import { GeoHeatmapHeader } from "./GeoHeatmapHeader"
import { GeoHeatmapMain } from "./GeoHeatmapMain"
import { useHeatmapData } from "./hooks/useHeatmapData"
import { MapPlaceFilterDialog } from "./MapPlaceFilterDialog"
import type { MapPlaceFilterIntent } from "./types"

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

  const onMapCountrySelect = useCallback((intent: MapPlaceFilterIntent) => {
    setPlaceFilterIntent(intent)
  }, [])

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

  return (
    <div className="relative flex h-full w-full flex-col bg-background">
      <GeoHeatmapHeader
        projectionId={projectionId}
        onProjectionChange={setProjectionId}
        totalArticles={data?.total_articles}
      />

      <GeoHeatmapMain
        projectionId={projectionId}
        focusCountryCode={focusCountryCode}
        onFocusCountry={focusCountryOnMap}
        isLoading={isLoading}
        isError={isError}
        hasData={Boolean(data)}
        countryCounts={countryCounts}
        maxCount={maxCount}
        placeGroups={placeGroups}
        findDirectForCountry={findDirectForCountry}
        findRegionsForCountry={findRegionsForCountry}
        activeWorkspaceName={activeWorkspaceName}
        isGuestMode={isGuestMode}
        onMapCountrySelect={onMapCountrySelect}
        onAddCountryToCurrent={onAddCountryToCurrent}
        onAddCountryToNew={onAddCountryToNew}
      />

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
