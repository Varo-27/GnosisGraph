# Estructura de presentación — GnosisGraph (PFC EOM)

Documento de apoyo para la defensa oral. **~15 minutos** · guión en [`Charla.md`](./Charla.md).

## Presentación en Canva

| Campo | Valor |
|-------|-------|
| **Nombre** | GnosisGraph |
| **Design ID** | `DAHMFulERLc` |
| **Editar** | [Abrir presentación](https://www.canva.com/d/7QCpZ4be12rtfhA) |
| **Estado** | Titulares mínimos aplicados · logo en portada · slides 6–9, 12, 14–15 vacías (pendiente borrar) |

---

## Identidad visual (EOM / brutalista)

| Token | Hex | Uso en slides |
|-------|-----|---------------|
| Fondo | `#FFFFFF` | Todas las slides (demo: `#F8F9FA` opcional) |
| Texto | `#212529` | Titulares |
| Acento | `#497d0b` | Barra lateral, subrayados, bullets |
| Acento claro | `#EBF2E3` | Bloques de contraste opcionales |
| Borde | `#000000` 2 px | Marcos de capturas / logos tech |

**Logo exportado:** [`docs/assets/logo-gnosisgraph-presentacion.png`](./assets/logo-gnosisgraph-presentacion.png) (2400 px, verde `#497d0b`, fondo transparente). Fuente SVG: [`logo-gnosisgraph-presentacion.svg`](./assets/logo-gnosisgraph-presentacion.svg).

**Tipografía Canva:** sans-serif bold (Poppins / Montserrat). Evitar serif, esquinas redondeadas y fotos stock orgánicas.

---

## Estructura simplificada (8 diapositivas activas)

Usa **solo las slides 1–5, 10, 11 y 13**. **Borra 6–9, 12, 14–15** en Canva (ya están vacías de texto; quedan líneas del template).

| Slide | Titular en Canva | Tiempo | Qué dices (oral) | Guion |
|-------|------------------|--------|------------------|-------|
| **1** | Logo + «Álvaro Estévez Pazos · PFC 2º DAW 2025–2026» | ~30 s | Intro personal en voz | Charla §1 |
| **2** | Del podcast al pivot | ~2 min | Podcast → malla invisible → pivot EOM | Charla §1–2 |
| **3** | ¿Para quién? ¿Por qué ahora? | ~2 min | Universidades, editoriales, despachos | Charla §2 |
| **4** | Solución: scraper → embeddings → grafo | ~2 min | Pipeline y grafo | Charla §3 |
| **5** | Demo en directo | ~5 min | Transición → web en vivo | Charla demo |
| **10** | Arquitectura · React · React Flow · FastAPI · Postgres/pgvector | ~2 min | Stack y despliegue | Charla §3 |
| **11** | Modelo B2B | ~1 min | Cuota Cero, ingresos recurrentes | Charla §viabilidad |
| **13** | Viabilidad · Capturas Excel | ~2 min | Balance 2º año, cierre | Charla §viabilidad |

### Deck mínimo recomendado

```text
1  Portada (logo GnosisGraph)
2  Del podcast al pivot
3  ¿Para quién? ¿Por qué ahora?
4  Solución: scraper → embeddings → grafo
5  Demo en directo
10 Arquitectura
11 Modelo B2B
13 Viabilidad
```

---

## Qué ampliar oralmente (sin más slides)

Durante la demo en vivo puedes desglosar sin cambiar diapositiva:

- Buscador y nodos
- Filtros y tubería (`input → filtros → artículos`)
- Favoritos y valoración
- Mapa: proyección, hover, modal país
- Layout Sugiyama (por qué el árbol no es caos)

Durante arquitectura puedes mencionar logos de tecnologías (Postgres, React, FastAPI…) aunque no estén en la slide.

---

## Checklist Canva

- [x] Logo `logo-gnosisgraph-presentacion.png` en portada (centrado)
- [x] Titulares mínimos en slides 1–5, 10, 11, 13 (sin párrafos del guion)
- [x] Fotos stock eliminadas en slides 2, 3, 6, 11
- [ ] **Eliminar slides 6–9, 12, 14–15** (MCP no borra páginas; hacerlo a mano)
- [ ] Fondo blanco puro en todas; barra oliva 8–12 px a la izquierda (ajuste visual manual)
- [ ] Cambiar tipografía serif → sans-serif bold en titulares
- [ ] Slide **13**: sustituir gráficos IA por **capturas Excel** reales
- [ ] Slide **10**: opcional — logos tech con marco negro 2 px
- [ ] Slide **15**: eliminar o dejar solo «Gracias» si se conserva cierre

---

## Referencias

- Guion oral: [`Charla.md`](./Charla.md)
- Memoria: `Proyecto EOM.pdf`
- Plan técnico: [`plan_de_implementacion.md`](./plan_de_implementacion.md)
