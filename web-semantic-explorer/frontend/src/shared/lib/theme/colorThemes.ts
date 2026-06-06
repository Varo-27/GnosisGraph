/** Temas de color registrados (data-theme en documentElement). */
export const DEFAULT_COLOR_THEME = "eom" as const

export const COLOR_THEMES = [
  {
    id: "eom",
    label: "El Orden Mundial",
    description: "Verde EOM, tipografía Expose, estilo brutalista.",
  },
] as const

export type ColorThemeId = (typeof COLOR_THEMES)[number]["id"] | (string & {})

export function isColorThemeId(value: string): value is ColorThemeId {
  return COLOR_THEMES.some((theme) => theme.id === value)
}

export function resolveColorThemeId(
  value: string | null | undefined,
): ColorThemeId {
  if (value && isColorThemeId(value)) {
    return value
  }
  return DEFAULT_COLOR_THEME
}
