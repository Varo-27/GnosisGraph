import { select } from "d3-selection"
import { type ZoomTransform, zoom, zoomIdentity, zoomTransform } from "d3-zoom"
import { useCallback, useEffect, useRef, useState } from "react"

import type { ChoroplethViewBox } from "@/widgets/map-explorer/lib/choroplethScene"
import type { MapProjectionId } from "@/widgets/map-explorer/lib/mapProjections"

const ZOOM_DURATION_MS = 450

function lerpTransform(
  from: ZoomTransform,
  to: ZoomTransform,
  t: number,
): ZoomTransform {
  return zoomIdentity
    .translate(
      from.x + (to.x - from.x) * t,
      from.y + (to.y - from.y) * t,
    )
    .scale(from.k + (to.k - from.k) * t)
}

function boundsToTransform(
  bounds: [[number, number], [number, number]],
  viewBox: ChoroplethViewBox,
): ZoomTransform {
  const [[x0, y0], [x1, y1]] = bounds
  const bw = Math.max(x1 - x0, 1)
  const bh = Math.max(y1 - y0, 1)
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2

  const padding = Math.min(viewBox.width, viewBox.height) * 0.14
  const scale = Math.min(
    14,
    Math.max(
      0.45,
      Math.min(
        (viewBox.width - padding * 2) / bw,
        (viewBox.height - padding * 2) / bh,
      ),
    ),
  )

  return zoomIdentity
    .translate(viewBox.x + viewBox.width / 2, viewBox.y + viewBox.height / 2)
    .scale(scale)
    .translate(-cx, -cy)
}

export function useChoroplethZoom(
  countriesLoaded: boolean,
  projectionId: MapProjectionId,
) {
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<ReturnType<typeof zoom<SVGSVGElement, unknown>> | null>(
    null,
  )
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity)

  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl || !countriesLoaded) return

    const svg = select(svgEl)
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.45, 14])
      .on("zoom", (event) => {
        setTransform(event.transform)
      })

    zoomRef.current = zoomBehavior
    svg.call(zoomBehavior)

    return () => {
      svg.on(".zoom", null)
      zoomRef.current = null
    }
  }, [countriesLoaded])

  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl) return
    select(svgEl).call(zoom<SVGSVGElement, unknown>().transform, zoomIdentity)
    setTransform(zoomIdentity)
  }, [projectionId])

  const applyTransform = useCallback(
    (next: ZoomTransform, animate = true) => {
      const svgEl = svgRef.current
      const zoomBehavior = zoomRef.current
      if (!svgEl || !zoomBehavior) return

      const svg = select(svgEl)
      if (!animate) {
        svg.call(zoomBehavior.transform, next)
        setTransform(next)
        return
      }

      const from = zoomTransform(svgEl)
      const start = performance.now()

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / ZOOM_DURATION_MS)
        const eased = 1 - (1 - t) ** 2
        const current = lerpTransform(from, next, eased)
        svg.call(zoomBehavior.transform, current)
        setTransform(current)
        if (t < 1) requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
    },
    [],
  )

  const resetView = useCallback(() => {
    applyTransform(zoomIdentity, true)
  }, [applyTransform])

  const zoomToBounds = useCallback(
    (
      bounds: [[number, number], [number, number]],
      viewBox: ChoroplethViewBox,
    ) => {
      applyTransform(boundsToTransform(bounds, viewBox), true)
    },
    [applyTransform],
  )

  return { svgRef, transform, resetView, zoomToBounds }
}
