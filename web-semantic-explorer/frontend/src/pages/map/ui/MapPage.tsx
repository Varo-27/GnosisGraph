import { PageShell } from "@/components/Layout/PageShell"
import { GeoHeatmap } from "@/widgets/map-explorer"

export function MapPage() {
  return (
    <PageShell>
      <GeoHeatmap />
    </PageShell>
  )
}
