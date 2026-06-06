import { createFileRoute } from "@tanstack/react-router"

import { FavoritesPage } from "@/pages/favorites"

export const Route = createFileRoute("/_layout/favorites")({
  component: FavoritesPage,
  head: () => ({
    meta: [{ title: "Favoritos · Semantic Explorer" }],
  }),
})
