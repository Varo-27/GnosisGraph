# Plan de Implementación: Web Semantic Explorer

Este documento contiene el plan estructurado en fases para el desarrollo de la interfaz de exploración semántica y grafos para la base de datos de artículos geopolíticos (El Orden Mundial).

## Arquitectura Base
*   **Base de datos:** PostgreSQL con extensión `pgvector` y esquemas poblados por el scrapper.
*   **Backend:** FastAPI (Python), SQLModel, SentenceTransformers (modelo local `mixedbread-ai/mxbai-embed-large-v1`).
*   **Frontend:** React, React Flow (grafos), React Simple Maps (geolocalización).

## Selecciones Técnicas y Patrones
1. **Gestor de Estado (Frontend):** **Zustand**. Permitirá que la Barra de Búsqueda, el Lienzo del Grafo y el Panel Lateral lean y escriban datos comunes (ej. `nodos`, `aristas`, `nodoSeleccionado`) con mínimo código puente sin penalizar el rendimiento por repintados masivos de React.
2. **Motor Físico del Grafo (Progresivo):** Comenzaremos situando los nodos con matemáticas simples (ej. posicionamiento radial) para comprender los límites de React Flow puros. Posteriormente, introduciremos **d3-force (en modo "Headless")** para simulaciones físicas orgánicas: `d3-force` sólo calculará la matemática invisible (x, y) en memoria, y React Flow se encargará exclusivamente de pintar el DOM con seguridad.
3. **Arquitectura de Búsqueda IA (Python + pgvector):** Usaremos el evento `lifespan` de FastAPI para mantener residente en la memoria RAM (solo 1 carga) el pesado modelo de `SentenceTransformer`. Python será un rápido "traductor" que convierte el texto en vectores al vuelo. Una vez codificado el vector, la delegación de búsqueda y la comparativa la realiza PostgreSQL usando directamente distancias con `pgvector`.
4. **Contratos Interfaz y Coherencia:** Tipado estricto con **Pydantic / SQLModel**. Se mantendrá la regla estricta de seguir la arquitectura de la plantilla de FastAPI separando responsabilidades:
    *   Ficheros de BBDD (`table=True`) no se devuelven nunca directamente.
    *   Se crearán siempre Schemas "Public" o "Response" (ej. `GraphResponse`, `GraphNode`) para proveer la estructura exacta (`{ id, data: {...} }`) que React Flow requiere.
5. **Optimizaciones de Infraestructura e IA:**
    *   **Caché en Memoria:** Uso nativo de `@lru_cache` de Python para peticiones repetidas al `SentenceTransformer`, logrando tiempos de respuesta de 0ms en búsquedas cacheadas.
    *   **Persistencia en Disco Secundario:** Configuración vía *Bind Mount* en `compose.yml` para mapear los 2GB+ de pesos del modelo de HuggingFace directamente a un segundo disco duro (ej. `/mnt/d/cache_ia`), evitando saturar el almacenamiento principal del sistema (C:).
    *   **Índices HNSW:** Creación de índice *Hierarchical Navigable Small World* en `pgvector` para reducir la latencia de las consultas de similitud (búsqueda y cruce de aristas) a niveles ultra-rápidos (O(log N)).


---

## 📍 Fase 1: El Motor Semántico (API Backend)
*Objetivo: Exponer los datos del scrapper y la lógica vectorial mediante endpoints limpios para el frontend, incluyendo la lógica de grafos.*

*   **Fase 1a: Modelos y Cliente Embedding**
    *   Migrar/Compartir los modelos de `SQLModel` / `SQLAlchemy` (Article, Embedding, Topic, Author, etc.) desde el scrapper al directorio de backend (`web-semantic-explorer/backend/app/models.py`).
    *   Integrar un cliente o servicio encapsulado para generar embeddings al vuelo usando `SentenceTransformer` dentro de la API FastAPI.
*   **Fase 1b: Endpoints de Búsqueda Inicial (Seed)**
    *   Crear endpoint `/api/search` que recibe texto libre de búsqueda.
    *   Convierte el texto en vector y hace la consulta por coseno (`ORDER BY embedding <=> query_embedding`) devolviendo los metadatos de los Top N artículos.
*   **Fase 1c: Endpoint de Expansión Expansiva (5N+ Interconectados)**
    *   Crear endpoint `/api/graph/expand`.
    *   **Entrada:** `source_article_id` (el artículo a expandir) y `existing_node_ids` (lista de artículos visibles en React Flow).
    *   **Proceso (2 pasos clave):**
        1. **Extracción (Garantizar 5 nuevos):** Buscar los Top 5 artículos más similares al `source_article_id`, excluyendo explícitamente mediante SQL (`NOT IN`) los `existing_node_ids`. Esto garantiza que el grafo siempre crezca sin frustrar al usuario.
        2. **Interconexión (Cruce de aristas):** Una vez extraídos, calcular matemáticamente la similitud entre estos 5 NUEVOS nodos y TODOS los nodos pasados en `existing_node_ids`. Si la afinidad supera un umbral (ej. > 85%), se genera una arista cruzada de conexión.
        3. Formar aristas directas correspondientes (padre original -> nuevos nodos).
    *   **Salida:** JSON con lista de `{new_nodes: [...], new_edges: [...]}` listos para renderizar en UI.

---

## 📍 Fase 2: Explorador Gráfico Orgánico (Frontend)
*Objetivo: Construir el lienzo principal donde el usuario introduce una búsqueda y expande conocimiento a través de los nodos.*

*   **Fase 2a: Layout Inicial y Buscador**
    *   Configurar contenedor principal con lienzo `React Flow`.
    *   Crear una barra flotante superpuesta para introducción de búsqueda de texto libre.
*   **Fase 2b: Semilla de Búsqueda (Grafo Inicial)**
    *   Al recibir usar el buscador, hacer llamada a `/api/search`.
    *   Generar un nodo central ficticio ("Búsqueda: [texto]") y 5 nodos alrededor que representen los resultados encontrados.
    *   Configurar físicas (ej: d3-force o spring layouter) mediante utilidades de React Flow (como elk.js o custom logic) para que los nodos no se amontonen.
*   **Fase 2c: Navegación y Expansión Dinámica**
    *   Configurar evento `onNodeClick` en React Flow.
    *   Inyectar loader al nodo pulsado, recoger todos los IDs renderizados actualmente y enviarlos a `/api/graph/expand`.
    *   Actualizar estado de nodos y aristas con la respuesta recibida, causando el "despliegue" orgánico del grafo con las aristas cruzadas para representar conexiones laterales.

---

## 📍 Fase 3: Visión Geoespacial (Mapa de Calor)
*Objetivo: Vista alternativa basada en metadatos geográficos (ArticlePlace/Places) para pintar el globo terráqueo.*

*   **Fase 3a: Agregador de Estadísticas (Backend)**
    *   Endpoint `/api/stats/heatmap/` que devuelva agrupación `(Country Code / Place) -> (Número de artículos)`.
*   **Fase 3b: Visor del Mapa (Frontend)**
    *   Integrar `react-simple-maps`.
    *   Aplicar rampa de color a los polígonos de los países basados en los datos del backend.
    *   Permitir click en país para enviar al usuario de vuelta al backend/grafo ("buscar artículos de...").

---

## 📍 Fase 4: Experiencia de Usuario, Historial e Hibridación
*Objetivo: Herramientas UX comunes alrededor del concepto central.*

*   **Panel Lateral (Sidebar):** Al clicar en un nodo (además de expandirlo), abrir panel que liste: Título, Categorías, Autores, Fecha, Lugares, y un enlace original al artículo real (EOM).
*   **Favoritos / Guardados:** Sistema simple integrado en UI (local storage para modo de invitado o tabla simple DB relacionada con usuario que provee la plantilla FastAPI web-semantic-explorer) para guardar referencias "Leer más tarde".
*   **Opciones Híbridas:** Implementar selectores extra al buscar/expandir (ej. "Filtrar por año" o "Filtrar categoría"), cruzando consultas tradicionales SQL junto a los queries de distancia de `pgvector`.
