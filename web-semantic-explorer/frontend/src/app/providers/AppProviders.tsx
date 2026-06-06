import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"

import { ApiError } from "@/client"
import { configureOpenAPI } from "@/client/setup"
import { useThemePreferencesSync } from "@/features/appearance"
import { routeTree } from "@/routeTree.gen"
import { ThemeProvider } from "@/shared/lib/theme/ThemeProvider"
import { Toaster } from "@/shared/ui/sonner"

configureOpenAPI(import.meta.env.VITE_API_URL)

const handleApiError = (error: Error) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

function ThemePreferencesSync() {
  useThemePreferencesSync()
  return null
}

export function AppProviders() {
  return (
    <ThemeProvider
      defaultTheme="dark"
      defaultColorTheme="eom"
      storageKey="vite-ui-theme"
    >
      <QueryClientProvider client={queryClient}>
        <ThemePreferencesSync />
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
