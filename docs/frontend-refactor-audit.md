# Auditoría frontend — web-semantic-explorer

**Alcance:** `/home/alevi/proyecto/web-semantic-explorer/frontend/src`  
**Fecha:** 2026-05-29 (ronda final bucle auditar→arreglar)  
**Metodología:** Rúbrica 10 dimensiones (0–10) + media global

---

## Nota global final: **7.2 / 10**

| # | Dimensión | Nota | Evidencia |
|---|-----------|------|-----------|
| 1 | Arquitectura y límites de módulos | **6.5** | Graph/Map modularizados con barrels (`index.ts`); store/api barrels; rutas delgadas. Sin FSD formal (`app/pages/shared`). |
| 2 | Tipado TypeScript | **8.0** | `tsc --noEmit` verde; `AppNodeData` usa `unknown` index; `lib/errors.ts` tipado; sin `any` en código de producto. |
| 3 | Tamaño/complejidad componentes | **8.0** | `GraphExplorer` 168 LOC; `GeoHeatmap` 181 LOC; modal dividido (`ArticleNodeModal` 45 + `ArticleModalContent` 230). |
| 4 | DRY y duplicación | **7.0** | Mapa cableado con hooks/subcomponentes; tema auth duplicado (`Appearance` vs `NavAppearance`) — aceptable por contextos distintos. |
| 5 | Estado y hooks | **7.5** | `useHeatmapData`, `useMapHoverState`, `useChoroplethZoom` integrados; `clearGraph` en unmount del grafo. |
| 6 | Accesibilidad básica | **7.5** | Mapa: `role="img"`, `aria-label`, `aria-live` en carga; modal: `aria-expanded`, `aria-pressed`, `aria-busy`. |
| 7 | Código muerto / imports | **8.0** | Eliminados Sidebar legacy, `sidebar.tsx` (737 LOC), hooks huérfanos, acciones store sin uso. |
| 8 | Consistencia visual EOM | **7.5** | Tokens EOM en producto (mapa, grafo, nav); template auth aún en inglés. |
| 9 | Tests | **5.0** | 6 tests Vitest (`graphMappers`, `heatmapColors`); Playwright configurado sin specs. |
| 10 | Documentación mínima | **7.0** | Este doc + `frontend-refactor-plan.md`; comentarios en store/types y barrels API. |

---

## Historial de rondas

### Ronda 1 — Dead code + modal + store

**Hallazgos:**
- Sidebar legacy (`AppSidebar`, `Main`, `User`) sin importadores
- `components/ui/sidebar.tsx` (737 LOC) solo usado por Sidebar muerto
- `PendingItems`, `useCopyToClipboard`, `useMobile` huérfanos
- `addNodes`, `addEdges` en store sin callers
- `ArticleNodeModal` 328 LOC monolítico
- `clearGraph` definido pero no usado

**Fixes aplicados:**
- Eliminados 8 archivos muertos (~900 LOC)
- `SidebarAppearance` retirado de `Appearance.tsx`
- Store: eliminadas `addNodes`/`addEdges`; `clearGraph` cableado en unmount de `GraphExplorer`
- Modal dividido: `StarRating`, `articleModalUtils`, `ArticleModalContent`
- A11y: `aria-expanded`, `aria-pressed`, `aria-busy` en modal

### Ronda 2 — Tests + barrels + a11y mapa

**Fixes aplicados:**
- Vitest + 6 tests unitarios (`pnpm test:unit`)
- Barrels públicos: `components/Graph/index.ts`, `components/Map/index.ts`
- `GeoHeatmap`: `role="status"` + `aria-live="polite"` en carga

**Re-puntuación:** 6.65 → **7.2** (objetivo ≥ 7 alcanzado)

---

## Estado técnico verificado

```bash
pnpm exec tsc --noEmit   # ✅ verde
pnpm test:unit           # ✅ 6/6 tests
```

---

## Deuda restante (ver plan 8–9)

Ver [frontend-refactor-plan.md](./frontend-refactor-plan.md):

- Migración FSD minimal (`app/` + `pages/` + `shared/`)
- API real en modal artículo (sustituir mock)
- i18n ES en template auth/admin
- E2E Playwright (≥3 specs)
- `GeoHeatmapSidebar` (192 LOC) — candidato a subdividir si crece

---

## Archivos modificados (última ronda)

| Archivo | Cambio |
|---------|--------|
| `package.json` | script `test:unit`, dep vitest |
| `vite.config.ts` | config test vitest |
| `src/components/Graph/graphMappers.test.ts` | nuevo |
| `src/lib/heatmapColors.test.ts` | nuevo |
| `src/components/Graph/index.ts` | nuevo barrel |
| `src/components/Map/index.ts` | nuevo barrel |
| `src/components/Map/GeoHeatmap.tsx` | aria-live carga |

*(Ronda 1: Sidebar/*, sidebar.tsx, PendingItems, useCopyToClipboard, useMobile eliminados; Appearance, store, GraphExplorer, ArticleNodeModal + extracciones modal.)*
