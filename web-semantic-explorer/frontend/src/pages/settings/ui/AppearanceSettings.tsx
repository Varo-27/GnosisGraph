import type { LucideIcon } from "lucide-react"
import { Check, Monitor, Moon, Sun } from "lucide-react"

import useAuth from "@/features/auth"
import {
  resolveAppearanceMode,
  resolveUserColorTheme,
  useUpdateAppearancePreferences,
} from "@/features/appearance"
import { COLOR_THEMES } from "@/shared/lib/theme/colorThemes"
import { type Theme, useTheme } from "@/shared/lib/theme/ThemeProvider"
import { cn } from "@/shared/lib/utils"

const MODE_OPTIONS: {
  value: Theme
  label: string
  icon: LucideIcon
}[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
]

const AppearanceSettings = () => {
  const { user: currentUser } = useAuth()
  const { colorTheme, theme } = useTheme()
  const { updateColorTheme, updateAppearanceMode, isPending } =
    useUpdateAppearancePreferences()

  const selectedColorTheme = resolveUserColorTheme(
    currentUser?.color_theme ?? colorTheme,
  )
  const selectedMode = resolveAppearanceMode(
    currentUser?.appearance_mode ?? theme,
  )

  return (
    <div className="max-w-2xl space-y-10">
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Tema global</h3>
          <p className="text-sm text-muted-foreground">
            Paleta de colores y estilo visual de la aplicación.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {COLOR_THEMES.map((item) => {
            const isSelected = selectedColorTheme === item.id
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={isPending}
                  aria-pressed={isSelected}
                  onClick={() => updateColorTheme(item.id)}
                  className={cn(
                    "eom-tile-card w-full p-4 text-left transition-colors",
                    isSelected && "eom-brutal-border-primary ring-1 ring-primary",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    {isSelected ? (
                      <Check className="size-4 shrink-0 text-primary" aria-hidden />
                    ) : null}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Modo de color</h3>
          <p className="text-sm text-muted-foreground">
            Claro, oscuro o según la preferencia del sistema.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {MODE_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = selectedMode === option.value
            return (
              <button
                key={option.value}
                type="button"
                disabled={isPending}
                aria-pressed={isSelected}
                onClick={() => updateAppearanceMode(option.value)}
                className={cn(
                  "eom-tile-card flex flex-col items-center gap-2 p-4 transition-colors",
                  isSelected && "eom-brutal-border-primary ring-1 ring-primary",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default AppearanceSettings
