import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

import { type UserPublic, UsersService } from "@/client"
import { isLoggedIn } from "@/shared/auth"
import { resolveColorThemeId } from "@/shared/lib/theme/colorThemes"
import { useTheme } from "@/shared/lib/theme/ThemeProvider"

import { resolveAppearanceMode } from "./appearanceMode"

export function useThemePreferencesSync() {
  const { setTheme, setColorTheme } = useTheme()
  const lastSyncedRef = useRef<string | null>(null)

  const { data: user } = useQuery<UserPublic>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    enabled: isLoggedIn(),
  })

  useEffect(() => {
    if (!user) {
      lastSyncedRef.current = null
      return
    }

    const syncKey = `${user.id}:${user.color_theme ?? ""}:${user.appearance_mode ?? ""}`
    if (lastSyncedRef.current === syncKey) {
      return
    }
    lastSyncedRef.current = syncKey

    setColorTheme(resolveColorThemeId(user.color_theme))
    setTheme(resolveAppearanceMode(user.appearance_mode))
  }, [user, setTheme, setColorTheme])
}
