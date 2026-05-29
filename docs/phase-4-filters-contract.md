# Contrato Fase 4a — Filtros de metadatos (Backend)

Contrato back–front para combinar búsqueda semántica (pgvector) con filtros SQL sobre metadatos de artículos.

**Estado:** Implementado (backend). Frontend en Fase 4b.

---

## Modelo compartido: `ArticleMetadataFilters`

Definido en `backend/app/schemas/filters.py`. Todos los campos son opcionales; `null` / ausencia = sin filtro.

| Campo | Tipo | Semántica SQL |
|-------|------|----------------|
| `place` | `string \| null` | Artículo vinculado a `Place` donde `name ILIKE '%place%'` **OR** `slug ILIKE '%place%'` (tabla puente `article_place`) |
| `category` | `string \| null` | Join `article_category` + `Category.name ILIKE '%category%'` |
| `author` | `string \| null` | Join `article_author` + `Author.name ILIKE '%author%'` |
| `year_start` | `int \| null` | `extract(year from article.date) >= year_start` |
| `year_end` | `int \| null` | `extract(year from article.date) <= year_end` |

> **Nota de modelo:** La columna de fecha en BD es `article.date` (no `published_at`). La API expone el campo como `date` en `ArticleSearchResult`.

Los filtros activos se combinan con **AND**. Se aplican **antes** del `ORDER BY` vectorial para restringir el universo de candidatos.

---

## GET `/api/v1/search`

### Query params

| Param | Requerido | Default | Descripción |
|-------|-----------|---------|-------------|
| `q` | sí | — | Texto libre de búsqueda semántica |
| `limit` | no | `5` | Máximo de resultados |
| `place` | no | — | Filtro por lugar |
| `category` | no | — | Filtro por categoría |
| `author` | no | — | Filtro por autor |
| `year_start` | no | — | Año mínimo (inclusive) |
| `year_end` | no | — | Año máximo (inclusive) |

### Respuesta

Sin cambios: `SearchResponse` con `query` y `results: ArticleSearchResult[]`.

### Ejemplo

```bash
curl -G "http://localhost:8000/api/v1/search" \
  --data-urlencode "q=conflicto geopolítico" \
  --data-urlencode "place=España" \
  --data-urlencode "year_start=2020" \
  --data-urlencode "limit=5"
```

---

## POST `/api/v1/graph/expand`

### Query params (sin cambios)

| Param | Default | Descripción |
|-------|---------|-------------|
| `limit` | `5` | Nodos nuevos a devolver |
| `threshold` | `0.85` | Umbral de similitud para aristas cruzadas |

### Body: `ExpandRequest`

```json
{
  "source_article_id": 1,
  "existing_node_ids": [1, 2, 3],
  "filters": {
    "place": "España",
    "category": null,
    "author": null,
    "year_start": 2020,
    "year_end": null
  }
}
```

- `filters` es **opcional**. Si se omite o todos los campos son `null`, el comportamiento es el actual (sin restricción por metadatos).
- Los filtros se aplican a la query de extracción de nodos similares (antes del orden vectorial).

### Respuesta

Sin cambios: `ExpandResponse` con `new_nodes` y `new_edges`.

### Ejemplo

```bash
curl -X POST "http://localhost:8000/api/v1/graph/expand?limit=5&threshold=0.85" \
  -H "Content-Type: application/json" \
  -d '{
    "source_article_id": 1,
    "existing_node_ids": [1, 2, 3],
    "filters": { "place": "España", "year_start": 2020 }
  }'
```

---

## Implementación backend

| Archivo | Rol |
|---------|-----|
| `app/schemas/filters.py` | `ArticleMetadataFilters` |
| `app/schemas/search.py` | Reexporta `ArticleMetadataFilters` |
| `app/schemas/graph.py` | `ExpandRequest.filters: ArticleMetadataFilters \| null` |
| `app/services/filter_service.py` | `apply_metadata_filters(statement, session, filters)` |
| `app/api/routes/search.py` | Query params → filtros → búsqueda vectorial |
| `app/api/routes/graph.py` | Body.filters → expansión vectorial filtrada |
| `tests/services/test_filter_service.py` | Tests unitarios (place + year_range, SQL compilado) |

---

## Regenerar cliente OpenAPI (frontend)

Tras cambios en el backend, desde la raíz del monorepo:

```bash
./scripts/generate-client.sh
```

Genera `openapi.json` y actualiza el cliente TypeScript en `frontend/` vía `openapi-ts`.

---

## Verificación local

```bash
cd backend
uv run python -c "from app.services.filter_service import apply_metadata_filters; from app.schemas.filters import ArticleMetadataFilters"
uv run pytest tests/services/test_filter_service.py -v
./scripts/lint.sh   # si existe
```
