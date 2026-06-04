import { PageShell } from "@/components/Layout/PageShell"
import { GeoHeatmap } from "@/components/Map/GeoHeatmap"

export function MapPage() {
  return (
    <PageShell>
      <GeoHeatmap />
    </PageShell>
  )
}
