import { ChevronRight } from "lucide-react"
import { memo } from "react"

import { cn } from "@/shared/lib/utils"

import {
  GeoHeatmapSidebarContent,
  type GeoHeatmapSidebarContentProps,
} from "./GeoHeatmapSidebarContent"

type GeoHeatmapSidebarProps = GeoHeatmapSidebarContentProps & {
  collapsed: boolean
  onCollapse: () => void
}

export const GeoHeatmapSidebar = memo(function GeoHeatmapSidebar({
  collapsed,
  onCollapse,
  ...contentProps
}: GeoHeatmapSidebarProps) {
  return (
    <aside
      className={cn("map-sidebar", collapsed && "map-sidebar--collapsed")}
      aria-hidden={collapsed}
    >
      <div className="map-sidebar__inner">
        <div className="map-sidebar__toolbar">
          <p className="map-sidebar__toolbar-label">Panel del mapa</p>
          <button
            type="button"
            className="map-sidebar__collapse-btn"
            aria-label="Ocultar panel"
            onClick={onCollapse}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <GeoHeatmapSidebarContent {...contentProps} />
      </div>
    </aside>
  )
})
