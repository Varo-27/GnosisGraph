# Guion oral — GnosisGraph · ~15 min

Mapa slide ↔ bloque. Las diapositivas son **ancla visual**; el detalle lo cuentas hablando.

| Slide Canva | Bloque | Tiempo |
|-------------|--------|--------|
| 1 | Portada | 0:30 |
| 2 | Intro personal y problema | 2:00 |
| 3 | Situación y necesidad | 2:00 |
| 4 | Solución | 2:00 |
| 5 | Demo (transición → web) | 5:00 |
| 10 | Arquitectura y tecnologías | 2:00 |
| 11 | Modelo de negocio | 1:00 |
| 13 | Viabilidad | 2:00 |
| | **Total** | **~15 min** |

---

## 1. Portada (slide 1) — solo en la diapositiva

Llevo muchos años escuchando el que es mi podcast favorito, *No es el fin del mundo*, en el que tratan los temas desde la perspectiva geopolítica. Con tanto trayecto, cada vez se vuelve más frecuente que hagan referencias a otros capítulos, elementos en su web o que prometían hacer uno para ese tema.

Ahí es donde me di cuenta que me faltaba algo: una herramienta que me permitiera no solo escuchar, sino **visualizar las conexiones** entre todos esos contenidos. De esa idea nació **GnosisGraph**.

---

## 2. Intro personal y problema (slide 2)

La idea original era construir una red de referencias entre episodios: transcribir, segmentar, analizar los segmentos… Con esa barrera técnica y el tiempo decidí **pivotar**. Me enfoqué en los artículos escritos de El Orden Mundial: en teoría más estructurados y fáciles de procesar.

Eso cambió el significado de las relaciones: de **referencias explícitas** a **conexiones semánticas invisibles**.

---

## 3. Situación y necesidad (slide 3)

¿Con este cambio la aplicación sigue teniendo sentido? ¿Hay un público objetivo?

Sí: entidades con grandes volúmenes de dato especializado — universidades, editoriales, despachos de abogados. La necesidad surge porque la información compleja se publica de forma **segmentada**, ocultando conexiones que cruzan distintas categorías.

Los buscadores tradicionales además ordenan por **actualidad**. La búsqueda semántica soluciona esos dos problemas: revaloriza lo histórico y rescata relaciones latentes.

---

## 4. Solución (slide 4)

El desarrollo se centró en el tipo de datos. Un **scraper** recogió todos los artículos de la web oficial y sus metadatos (autores, países, categorías…). Se puede relanzar: salta los ya almacenados y guarda los nuevos.

Después, un **pipeline** convierte cada artículo en un vector numérico que permite medir similitudes. Sobre eso: grafo interactivo + mapa de calor + búsqueda híbrida.

*(Opcional oral: mencionar ~4.600 artículos.)*

---

## 5. Demo en directo (slide 5 → web)

> «Procedo a enseñaros la aplicación…»

**Slide 5 = transición.** Cambias a la web. No hay diapositiva de demo.

Recorrido sugerido (~5 min):

1. **Buscador** — consulta + filtros
2. **Nodos** — expandir con «Ver más», tubería
3. **Herramientas del buscador** — paleta, filtros encadenados
4. **Favoritos** — guardar artículo
5. **Mapa** — proyección, hover, clic país, modal

Vuelves a Canva en slide 10.

---

## 6. Arquitectura y tecnologías (slide 10)

**Postgres + pgvector**: base relacional y vectorial en uno; consultas eficientes, arquitectura simple.

Stack (mencionar logos si los añades en Canva):

- Plantilla **full stack FastAPI** oficial
- **React** + **React Flow** para el grafo
- Layout **Sugiyama** para que la generación dinámica del árbol no sea un caos (p. 33 memoria)
- **Docker** + despliegue **AWS EC2** vía GitHub Actions

No te pares en todas las tecnologías; apunta a la p. 10 del documento si preguntan.

---

## 7. Modelo de negocio (slide 11)

Producto **B2B** para organizaciones con grandes volúmenes de información especializada (las del slide 3).

Financiación inicial: inversión propia reducida + ayudas públicas (Cuota Cero).

Estrategia: cartera estable de clientes → **ingresos recurrentes** por mantenimiento → menos dependencia de nuevas implantaciones.

---

## 8. Viabilidad (slide 13)

La viabilidad está desarrollada en detalle en la documentación — **pon capturas de tus Excel** en esta slide.

Mensaje clave: balance positivo proyectado a partir del **2º año** gracias a ingresos recurrentes + Cuota Cero.

Cierra: «¿Preguntas?»

---

## Notas de ensayo

- Si te pasas de tiempo, acorta arquitectura (1 min) o modelo de negocio (30 s).
- Si te quedas corto, amplía la demo o el pivot del slide 2.
- No leas texto de las slides; son titulares.
