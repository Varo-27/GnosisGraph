import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

import {
  type ColorThemeId,
  DEFAULT_COLOR_THEME,
  resolveColorThemeId,
} from "./colorThemes"

export type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorThemeId
  storageKey?: string
  colorThemeStorageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "dark" | "light"
  colorTheme: ColorThemeId
  setTheme: (theme: Theme) => void
  setColorTheme: (colorTheme: ColorThemeId) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | null>(null)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorTheme = DEFAULT_COLOR_THEME,
  storageKey = "vite-ui-theme",
  colorThemeStorageKey = "vite-ui-color-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  )

  const [colorTheme, setColorThemeState] = useState<ColorThemeId>(() =>
    resolveColorThemeId(
      localStorage.getItem(colorThemeStorageKey) ?? defaultColorTheme,
    ),
  )

  const getResolvedTheme = useCallback((theme: Theme): "dark" | "light" => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }
    return theme
  }, [])

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() =>
    getResolvedTheme(theme),
  )

  const applyDocumentTheme = useCallback(
    (mode: Theme, palette: ColorThemeId) => {
      const root = window.document.documentElement

      root.dataset.theme = palette
      root.classList.remove("light", "dark")

      if (mode === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light"
        root.classList.add(systemTheme)
        return
      }

      root.classList.add(mode)
    },
    [],
  )

  useEffect(() => {
    applyDocumentTheme(theme, colorTheme)
    setResolvedTheme(getResolvedTheme(theme))

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      if (theme === "system") {
        applyDocumentTheme("system", colorTheme)
        setResolvedTheme(getResolvedTheme("system"))
      }
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, colorTheme, applyDocumentTheme, getResolvedTheme])

  const value = {
    theme,
    resolvedTheme,
    colorTheme,
    setTheme: (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme)
      setTheme(nextTheme)
    },
    setColorTheme: (nextColorTheme: ColorThemeId) => {
      localStorage.setItem(colorThemeStorageKey, nextColorTheme)
      setColorThemeState(resolveColorThemeId(nextColorTheme))
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
