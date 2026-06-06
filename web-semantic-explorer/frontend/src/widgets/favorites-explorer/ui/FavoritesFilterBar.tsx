import { X } from "lucide-react"

import type { FavoritesFilters } from "@/features/favorites"
import { hasActiveFavoritesFilters } from "@/features/favorites"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

type FavoritesFilterBarProps = {
  filters: FavoritesFilters
  options: {
    authors: string[]
    categories: string[]
    places: string[]
  }
  resultCount: number
  totalCount: number
  onChange: (filters: FavoritesFilters) => void
  onReset: () => void
}

const RATED_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "rated", label: "Valoradas" },
  { value: "not_rated", label: "Sin valorar" },
  { value: "my_rating", label: "Con mi valoración" },
] as const

export function FavoritesFilterBar({
  filters,
  options,
  resultCount,
  totalCount,
  onChange,
  onReset,
}: FavoritesFilterBarProps) {
  const active = hasActiveFavoritesFilters(filters)

  return (
    <div className="favorites-filters">
      <div className="favorites-filters__row">
        <Input
          value={filters.search}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
          placeholder="Buscar por palabras…"
          className="favorites-filters__search"
          aria-label="Buscar favoritos"
        />

        <Select
          value={filters.rated}
          onValueChange={(value) =>
            onChange({
              ...filters,
              rated: value as FavoritesFilters["rated"],
            })
          }
        >
          <SelectTrigger className="favorites-filters__select">
            <SelectValue placeholder="Valoración" />
          </SelectTrigger>
          <SelectContent>
            {RATED_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {active && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="favorites-filters__reset"
            onClick={onReset}
          >
            <X className="size-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="favorites-filters__row favorites-filters__row--meta">
        <Select
          value={filters.author || "__all__"}
          onValueChange={(value) =>
            onChange({
              ...filters,
              author: value === "__all__" ? "" : value,
            })
          }
        >
          <SelectTrigger className="favorites-filters__select">
            <SelectValue placeholder="Autor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los autores</SelectItem>
            {options.authors.map((author) => (
              <SelectItem key={author} value={author}>
                {author}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category || "__all__"}
          onValueChange={(value) =>
            onChange({
              ...filters,
              category: value === "__all__" ? "" : value,
            })
          }
        >
          <SelectTrigger className="favorites-filters__select">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las categorías</SelectItem>
            {options.categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.place || "__all__"}
          onValueChange={(value) =>
            onChange({
              ...filters,
              place: value === "__all__" ? "" : value,
            })
          }
        >
          <SelectTrigger className="favorites-filters__select">
            <SelectValue placeholder="Lugar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los lugares</SelectItem>
            {options.places.map((place) => (
              <SelectItem key={place} value={place}>
                {place}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="favorites-filters__count">
          {resultCount} de {totalCount}
        </p>
      </div>
    </div>
  )
}
