# Estructura de presentación — Proyecto Fin de Ciclo EOM

Documento de apoyo para la defensa oral del **Explorador semántico de El Orden Mundial** (2º DAW 2025–2026).

Basado en la memoria *Proyecto EOM.pdf* y en el estado actual del repositorio.

---

## Resumen

La memoria (57 páginas) está bien organizada para **escribir**, pero para **presentar oralmente** conviene otro orden: primero enganchar, luego mostrar el producto, y dejar lo técnico y lo económico para cuando el tribunal ya entienda el valor.

**Duración orientativa:** 18–20 minutos + preguntas.

---

## Estructura recomendada (15 diapositivas)

Orden pensado para **contar una historia**, no para recorrer el índice del PDF.

| # | Diapositiva | Qué decir (idea clave) | Tiempo | Sección del PDF |
|---|-------------|------------------------|--------|-----------------|
| **1** | **Portada** | Nombre del proyecto, autor, ciclo, fecha. Título sugerido: *Explorador semántico de El Orden Mundial* | 30 s | — |
| **2** | **El origen: una malla invisible** | Escuchabas el podcast *No es el Fin del Mundo* y veías mentalmente una red de referencias entre episodios, libros y artículos. Querías **hacer visible esa malla**. | 1,5 min | §1.1 |
| **3** | **El giro del proyecto** | Transcribir audio era inviable en plazo → pivot a artículos de EOM. Problema nuevo: **no hay citas explícitas entre artículos**. Solución: relaciones por **similitud semántica**, no por enlaces reales. | 2 min | §1.2 |
| **4** | **El problema que resuelves** | Investigadores y lectores de geopolítica tienen miles de textos relacionados conceptualmente, pero ninguna herramienta les deja **explorarlos como un grafo navegable**. | 1,5 min | §2 |
| **5** | **La solución en una frase** | Una app que combina **búsqueda semántica + grafo interactivo + mapa geográfico** sobre ~4.600 artículos de EOM. | 1 min | §1.3 |
| **6** | **Demo / captura del producto** | Muestra el grafo con una búsqueda real (ej. “vivienda” + filtro Europa). **Aquí el tribunal ve el resultado antes de la arquitectura.** | 2 min | §6.1 |
| **7** | **Cómo funciona: el modelo de tubería** | `input → filtros → artículos`. Búsqueda semántica pura + filtros por autor, categoría, lugar, año. Expandir un artículo crea ramas usando contexto upstream. | 2 min | §5.2, §6.1 |
| **8** | **Funcionalidades principales** | Modal de detalle (valorar, favoritos, comentarios), áreas de trabajo, mapa de calor por país, sesión de usuario, temas claro/oscuro. **1 bullet = 1 captura.** | 2 min | §6.2–6.5 |
| **9** | **Motor semántico y datos** | Scraper → PostgreSQL + pgvector. Embeddings con SentenceTransformers. Búsqueda **híbrida**: similitud vectorial + metadatos. | 1,5 min | §1.3, §3.3–3.5 |
| **10** | **Stack y arquitectura** | React + React Flow · FastAPI · Docker · despliegue AWS. Diagrama simple: *Frontend ↔ API ↔ BD*. No entrar en detalle de cada librería. | 1,5 min | §3, §8 |
| **11** | **Decisiones de diseño** | Grafo como protagonista. Identidad visual EOM (verde oliva). Accesibilidad **realista**: el grafo no sustituye al buscador lineal de EOM. | 1 min | §5 |
| **12** | **Diagramas UML** | Un solo slide con casos de uso + clases + BD. Di: “En la memoria están detallados; aquí la vista global.” **No los leas.** | 1 min | §4 |
| **13** | **Modelo de negocio y viabilidad** | SaaS B2B para medios/think tanks. Cuota Cero, RETA, ingresos recurrentes. Conclusión: **viable en el 2º año**. Condensa tablas en 3 cifras clave. | 2 min | §7 |
| **14** | **Despliegue** | AWS EC2 + Docker + CI/CD en GitHub Actions. Por qué AWS: monitorización, backups, tolerancia a fallos. Portabilidad a VPS si el cliente lo pide. | 1 min | §8 |
| **15** | **Conclusiones y futuro** | Logrado: explorador funcional con corpus real. Futuro: sync workspaces en servidor, notas, podcast original. **Demo en vivo** o vídeo corto. | 1 min + Q&A | — |

---

## Por qué este orden y no el del PDF

```text
PDF (documento)          Presentación (oral)
─────────────────        ───────────────────
1. Descripción      →    2–5  Historia + problema + solución
2. Justificación    →    4    (integrado en el problema)
3. Tecnologías      →    9–10 (después de mostrar el producto)
4. Diagramas        →    12   (al final, como apoyo)
5. Diseño           →    11   (breve, visual)
6. Funcionamiento   →    6–8  (núcleo de la demo)
7. Recursos/negocio →    13   (obligatorio en PFC, pero condensado)
8. Despliegue       →    14
```

El tribunal retiene mejor si **ven el grafo en el minuto 5–6**, no en el minuto 15.

---

## Qué enfatizar en cada bloque

### Bloque narrativo (slides 2–5) — ~6 min

Es lo que te diferencia de un informe técnico genérico:

- Origen personal (podcast).
- Decisión consciente de pivotar (demuestra criterio).
- Cambio de paradigma: de *referencias explícitas* a *proximidad semántica*.

### Bloque demo (slides 6–8) — ~6 min

Prepara **un flujo fijo** para no improvisar:

1. Buscar “vivienda”.
2. Añadir filtro categoría “Europa”.
3. Pulsar “Ver más” en un artículo.
4. Abrir modal → favorito o valoración.
5. Ir al mapa → clic en un país → volver al grafo.

### Bloque técnico (slides 9–10) — ~3 min

Solo lo imprescindible:

- ~4.600 artículos con metadatos.
- pgvector + embeddings locales.
- React Flow para el lienzo.

### Bloque PFC / negocio (slides 12–14) — ~4 min

En 2º DAW suelen valorar la viabilidad. No leas tablas enteras; di:

- Coste anual aproximado.
- Ingresos previstos año 1 vs año 2.
- Por qué el balance es positivo (Cuota Cero + ingresos recurrentes).

---

## Slides que puedes recortar si tienes poco tiempo (≤12 min)

| Prioridad | Mantener siempre | Recortable |
|-----------|------------------|------------|
| Alta | 2, 3, 6, 7, 9, 15 | — |
| Media | 4, 8, 10, 14 | 11 (diseño) |
| Baja si hay prisa | — | 12 (UML), 13 (negocio resumido en 1 frase) |

---

## Consejos prácticos

1. **No presentes 57 páginas.** La memoria es el documento; la presentación es el trailer.
2. **El slide 6 es el más importante.** Si falla la demo en vivo, ten un vídeo de 30 s grabado.
3. **Menciona limitaciones con honestidad** (accesibilidad del grafo, workspaces aún en localStorage): demuestra madurez.
4. **Cierra volviendo al origen:** “Empecé queriendo ver la malla del podcast; terminé construyendo una herramienta para explorar conceptualmente miles de artículos de geopolítica.”

---

## Guion breve por diapositiva

### 1. Portada

> Buenas tardes. Soy Álvaro Estévez Pazos y presento mi Proyecto Fin de Ciclo: un explorador semántico de artículos de El Orden Mundial.

### 2. El origen

> El proyecto nace de escuchar el podcast *No es el Fin del Mundo*. Cada episodio remite a otros capítulos, libros y artículos. En mi cabeza se formaba una malla de conocimiento que ninguna interfaz me permitía ver ni recorrer.

### 3. El giro

> La idea original era transcribir episodios y mapear referencias explícitas. Eso chocó con plazos y precisión del audio. Pivoté a los artículos de EOM: texto estructurado y accesible, pero sin enlaces entre ellos. La solución fue generar relaciones por similitud semántica, manteniendo la idea visual del grafo.

### 4. El problema

> Quien investiga geopolítica encuentra contenidos relacionados conceptualmente, pero dispersos. Los buscadores lineales no muestran cómo se conectan las ideas. Este proyecto cubre ese vacío.

### 5. La solución

> Una aplicación web con búsqueda semántica, un grafo interactivo y un mapa de calor sobre un corpus de unos 4.600 artículos de EOM.

### 6. Demo

> [Mostrar captura o demo en vivo] Aquí busco “vivienda”, aplico un filtro por categoría y obtengo artículos relacionados desplegados como nodos en el grafo.

### 7. Modelo de tubería

> El flujo es input → filtros → artículos. Cada búsqueda alimenta solo su rama. Al pulsar “Ver más”, la expansión usa el contexto de la tubería: consulta, filtros y artículos ancestros.

### 8. Funcionalidades

> El modal permite leer detalle, valorar, comentar y guardar favoritos. Las áreas de trabajo persisten la sesión. El mapa muestra cobertura geográfica y enlaza con el explorador.

### 9. Motor semántico

> Los artículos se ingieren con metadatos. Cada texto tiene un embedding vectorial. PostgreSQL con pgvector permite búsqueda por similitud, combinada con filtros estructurados.

### 10. Arquitectura

> Frontend en React con React Flow. Backend FastAPI. Todo containerizado con Docker y desplegado en AWS con CI/CD desde GitHub Actions.

### 11. Diseño

> El grafo es el producto. La identidad visual continúa la de EOM. La accesibilidad se aborda de forma realista: navegación y modal accesibles; el lienzo del grafo es inherentemente visual.

### 12. Diagramas

> En la memoria desarrollo casos de uso, clases y base de datos. Aquí solo la vista global para contextualizar el alcance del sistema.

### 13. Viabilidad

> El modelo es SaaS B2B orientado a medios e instituciones. Con Cuota Cero, costes controlados e ingresos recurrentes, el plan es viable a partir del segundo año.

### 14. Despliegue

> Producción en AWS EC2 por monitorización, backups y tolerancia a fallos. Docker garantiza portabilidad a un VPS si el cliente lo requiere.

### 15. Cierre

> Pasé de querer visualizar la malla del podcast a construir un explorador semántico real sobre miles de artículos. Queda trabajo futuro — sync en servidor, notas, retomar el origen podcast — pero el núcleo funciona. Gracias; ¿preguntas?

---

## Referencias

- Memoria: `Proyecto EOM.pdf`
- Plan de implementación: [`plan_de_implementacion.md`](./plan_de_implementacion.md)
- Informe UML: [`informe_diagramas_clases_casos_uso.md`](./informe_diagramas_clases_casos_uso.md)
- Despliegue AWS: [`deploy-aws-ec2.md`](./deploy-aws-ec2.md)
