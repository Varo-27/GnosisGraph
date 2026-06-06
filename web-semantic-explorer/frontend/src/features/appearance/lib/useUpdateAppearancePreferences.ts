import { useMutation, useQueryClient } from "@tanstack/react-query"

import { UsersService, type UserUpdateMe } from "@/client"
import { isLoggedIn } from "@/shared/auth"
import {
  type ColorThemeId,
  resolveColorThemeId,
} from "@/shared/lib/theme/colorThemes"
import { type Theme, useTheme } from "@/shared/lib/theme/ThemeProvider"
import { handleError } from "@/shared/lib/errors"
import useCustomToast from "@/shared/lib/useCustomToast"

type AppearancePreferences = Pick<
  UserUpdateMe,
  "color_theme" | "appearance_mode"
>

export function useUpdateAppearancePreferences() {
  const queryClient = useQueryClient()
  const { setTheme, setColorTheme } = useTheme()
  const { showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (data: AppearancePreferences) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  const updateColorTheme = (colorTheme: ColorThemeId) => {
    setColorTheme(colorTheme)
    if (isLoggedIn()) {
      mutation.mutate({ color_theme: colorTheme })
    }
  }

  const updateAppearanceMode = (mode: Theme) => {
    setTheme(mode)
    if (isLoggedIn()) {
      mutation.mutate({ appearance_mode: mode })
    }
  }

  return {
    updateColorTheme,
    updateAppearanceMode,
    isPending: mutation.isPending,
  }
}

export function resolveUserColorTheme(
  value: string | null | undefined,
): ColorThemeId {
  return resolveColorThemeId(value)
}
