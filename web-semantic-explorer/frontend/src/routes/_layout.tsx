import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/components/Layout/DashboardLayout"

export const Route = createFileRoute("/_layout")({
  component: DashboardLayout,
})
