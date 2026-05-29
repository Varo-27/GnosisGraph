import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import GraphExplorer from "@/components/Graph/GraphExplorer"
import { PageShell } from "@/components/Layout/PageShell"

const graphSearchSchema = z.object({
  place: z.string().optional(),
  q: z.string().optional(),
})

export const Route = createFileRoute("/_layout/")({
  validateSearch: graphSearchSchema,
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Semantic Graph Explorer",
      },
    ],
  }),
})

function Dashboard() {
  const { place, q } = Route.useSearch()

  return (
    <PageShell className="relative">
      <GraphExplorer initialPlace={place} initialQuery={q} />
    </PageShell>
  )
}
