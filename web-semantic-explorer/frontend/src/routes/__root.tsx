import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router"
import ErrorComponent from "@/shared/ui/error-page/ErrorComponent"
import NotFound from "@/shared/ui/error-page/NotFound"

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
  notFoundComponent: () => <NotFound />,
  errorComponent: () => <ErrorComponent />,
})
