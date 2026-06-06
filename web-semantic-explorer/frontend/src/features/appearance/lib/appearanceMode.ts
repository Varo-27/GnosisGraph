import type { Theme } from "@/shared/lib/theme/ThemeProvider"

export function resolveAppearanceMode(
  value: string | null | undefined,
): Theme {
  if (value === "light" || value === "dark" || value === "system") {
    return value
  }
  return "system"
}
