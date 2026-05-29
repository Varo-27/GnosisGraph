import { createFileRoute, redirect } from "@tanstack/react-router"

import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: DashboardLayout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})
