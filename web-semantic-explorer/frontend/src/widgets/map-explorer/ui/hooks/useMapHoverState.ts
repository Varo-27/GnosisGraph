import { useNavigate } from "@tanstack/react-router"
import { useCallback, useMemo, useReducer } from "react"

import type { HeatmapEntry } from "@/shared/api/stats"

import type { MapHoverState } from "../types"

type UseMapHoverStateOptions = {
  onFocusCountry?: (isoCode: string) => void
}

type HoverState = MapHoverState

type HoverAction =
  | { type: "country_hover"; isoCode: string | null; name?: string }
  | { type: "country_list_hover"; entry: HeatmapEntry | null }
  | { type: "region_list_hover"; entry: HeatmapEntry | null }
  | { type: "country_click"; isoCode: string; name?: string }
  | { type: "country_place_click"; entry: HeatmapEntry; isoCode: string }
  | { type: "region_place_click"; entry: HeatmapEntry }

const initialState: HoverState = {
  hoveredCode: null,
  hoveredName: null,
  selectedCode: null,
  highlightedCodes: null,
  hoveredRegionCodes: null,
  hoveredRegionEntry: null,
  selectedRegionId: null,
}

function regionCodesEqual(
  a: Set<string> | null,
  b: Set<string> | null,
): boolean {
  if (a === b) return true
  if (!a || !b || a.size !== b.size) return false
  for (const code of a) {
    if (!b.has(code)) return false
  }
  return true
}

function hoverReducer(state: HoverState, action: HoverAction): HoverState {
  switch (action.type) {
    case "country_hover": {
      const { isoCode, name } = action
      if (isoCode === null) {
        if (state.hoveredCode === null && state.hoveredName === null) {
          return state
        }
        return { ...state, hoveredCode: null, hoveredName: null }
      }

      const nextName = name ?? null
      if (
        state.hoveredCode === isoCode &&
        state.hoveredName === nextName &&
        state.hoveredRegionCodes === null &&
        state.hoveredRegionEntry === null
      ) {
        return state
      }

      return {
        ...state,
        hoveredCode: isoCode,
        hoveredName: nextName,
        hoveredRegionCodes: null,
        hoveredRegionEntry: null,
      }
    }

    case "country_list_hover": {
      const { entry } = action
      if (!entry) {
        if (state.hoveredCode !== null) {
          return {
            ...state,
            hoveredCode: null,
            hoveredName: state.hoveredRegionEntry ? state.hoveredName : null,
          }
        }
        if (!state.hoveredRegionEntry && state.hoveredName !== null) {
          return { ...state, hoveredName: null }
        }
        return state
      }

      const isoCode =
        entry.map_country_codes?.[0] ?? entry.country_code ?? null
      if (!isoCode) return state

      if (
        state.hoveredCode === isoCode &&
        state.hoveredName === entry.name &&
        state.hoveredRegionCodes === null &&
        state.hoveredRegionEntry === null
      ) {
        return state
      }

      return {
        ...state,
        hoveredCode: isoCode,
        hoveredName: entry.name,
        hoveredRegionCodes: null,
        hoveredRegionEntry: null,
      }
    }

    case "region_list_hover": {
      const { entry } = action
      if (!entry) {
        if (state.hoveredRegionCodes === null && state.hoveredRegionEntry === null) {
          if (!state.hoveredCode && state.hoveredName) {
            return { ...state, hoveredName: null }
          }
          return state
        }
        return {
          ...state,
          hoveredRegionCodes: null,
          hoveredRegionEntry: null,
          hoveredName: state.hoveredCode ? state.hoveredName : null,
        }
      }

      const nextCodes = new Set(entry.map_country_codes)
      if (
        state.hoveredRegionEntry?.place_id === entry.place_id &&
        state.hoveredName === entry.name &&
        state.hoveredCode === null &&
        regionCodesEqual(state.hoveredRegionCodes, nextCodes)
      ) {
        return state
      }

      return {
        ...state,
        hoveredRegionEntry: entry,
        hoveredRegionCodes: nextCodes,
        hoveredName: entry.name,
        hoveredCode: null,
      }
    }

    case "country_click":
      return {
        ...state,
        selectedCode: action.isoCode,
        highlightedCodes: null,
        selectedRegionId: null,
        hoveredName: action.name ?? null,
      }

    case "country_place_click":
      return {
        ...state,
        selectedCode: action.isoCode,
        highlightedCodes: null,
        selectedRegionId: null,
        hoveredName: action.entry.name,
      }

    case "region_place_click": {
      const nextCodes = new Set(action.entry.map_country_codes)
      if (
        state.selectedRegionId === action.entry.place_id &&
        regionCodesEqual(state.highlightedCodes, nextCodes) &&
        state.hoveredRegionCodes === null &&
        state.hoveredRegionEntry === null
      ) {
        return state
      }

      return {
        ...state,
        hoveredRegionCodes: null,
        hoveredRegionEntry: null,
        highlightedCodes: nextCodes,
        selectedRegionId: action.entry.place_id,
      }
    }

    default:
      return state
  }
}

export function useMapHoverState({ onFocusCountry }: UseMapHoverStateOptions = {}) {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(hoverReducer, initialState)

  const goToGraphWithPlace = useCallback(
    (entry: HeatmapEntry) => {
      navigate({
        to: "/",
        search: { place: entry.name, q: entry.name },
      })
    },
    [navigate],
  )

  const handleCountryPlaceClick = useCallback(
    (entry: HeatmapEntry) => {
      const isoCode =
        entry.map_country_codes?.[0] ?? entry.country_code ?? null
      if (!isoCode) return

      dispatch({ type: "country_place_click", entry, isoCode })
      onFocusCountry?.(isoCode)
    },
    [onFocusCountry],
  )

  const handleRegionPlaceClick = useCallback((entry: HeatmapEntry) => {
    dispatch({ type: "region_place_click", entry })
  }, [])

  const handleCountryClick = useCallback(
    (isoCode: string | undefined, countryName?: string) => {
      if (!isoCode) return
      dispatch({ type: "country_click", isoCode, name: countryName })
      onFocusCountry?.(isoCode)
    },
    [onFocusCountry],
  )

  const handleCountryHover = useCallback(
    (isoCode: string | null, name?: string) => {
      dispatch({ type: "country_hover", isoCode, name })
    },
    [],
  )

  const handleCountryListHover = useCallback((entry: HeatmapEntry | null) => {
    dispatch({ type: "country_list_hover", entry })
  }, [])

  const handleRegionListHover = useCallback((entry: HeatmapEntry | null) => {
    dispatch({ type: "region_list_hover", entry })
  }, [])

  const hoverState = useMemo(() => state, [state])

  return {
    hoverState,
    goToGraphWithPlace,
    handleCountryPlaceClick,
    handleRegionPlaceClick,
    handleCountryClick,
    handleCountryHover,
    handleCountryListHover,
    handleRegionListHover,
  }
}
