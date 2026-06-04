import { PageShell } from "@/components/Layout/PageShell"
import { GraphExplorer } from "@/widgets/graph-explorer"

export function GraphPage() {
  return (
    <PageShell className="relative">
      <GraphExplorer />
    </PageShell>
  )
}
