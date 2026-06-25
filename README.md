# ![GnosisGraph Dashboard Overview](web-semantic-explorer/frontend/public/assets/images/logo_letras_bl.svg)

# ![Video](assets/search_example.gif)


[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Scraping-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

**GnosisGraph** es un buscador semántico avanzado e interactivo en forma de **grafo dinámico**, desarrollado como **Proyecto de Fin de Ciclo (PFC)** para el Grado Superior en **Desarrollo de Aplicaciones Web (DAW)**. 

El proyecto transforma miles de artículos geopolíticos de la web de [*El Orden Mundial* (EOM)](https://elordenmundial.com/) y las densas conexiones de su podcast *"No es el fin del mundo"*, en una malla de conocimiento visual e intuitiva mediante IA, embeddings vectoriales y algoritmos de distribución de nodos.

---

## 🚀 Características Principales

* **Búsqueda Semántica con IA:** Indexación y comparación de artículos mediante modelos de *Sentence-Transformers* y almacenamiento vectorial en base de datos.
* **Grafo Dinámico Interactivo:** Visualización en tiempo real de artículos interconectados mediante una lógica orgánica de afinidad semántica.
* **Algoritmo de Sugiyama (Dagre):** Distribución jerárquica por capas optimizada para evitar el cruce de aristas y asegurar la máxima legibilidad de tarjetas complejas.
* **Analítica Geoespacial:** Un mapamundi político interactivo con coropletas (intensidad cromática por país según volumen de publicaciones) y soporte para cambio de proyección cartográfica.
* **Ecosistema Completo de Usuario:** Funcionalidades avanzadas de interacción como marcadores de favoritos, hilos de comentarios, valoraciones estructuradas y seguimiento detallado de autores o categorías.

---

## 📐 Arquitectura del Sistema & Fases de Desarrollo

El proyecto se diseñó de extremo a extremo dividido en tres capas fundamentales altamente optimizadas:

### 📊 1. Base de Datos Vectorial (Pipeline de Datos)
1.  **Extracción & Scraping:** Un script optimizado en **Python** empleando **Beautiful Soup** recorre el sitemap de la web objetivo, extrayendo de forma limpia el contenido y los metadatos de los artículos.
2.  **Generación de Embeddings:** Procesamiento local mediante el modelo de **Sentence-Transformers** para transformar el texto plano en vectores de alta dimensionalidad que representan el significado semántico profundo del contenido.
3.  **Persistencia:** Almacenamiento en **PostgreSQL** potenciado con la extensión **pgvector** para indexación y cálculo eficiente de distancias cosenoidales a nivel de base de datos.

### ⚡ 2. El Backend (FastAPI Core)
* Construido sobre **FastAPI**, proporcionando una API REST asíncrona, robusta y de muy baja latencia.
* **Lógica de Malla Orgánica:** Al realizar una consulta, el backend vectoriza el *input* en tiempo real y recupera los 5 resultados más cercanos.
* **Prevención de Duplicados & Relación Cruzada:** Excluye dinámicamente los artículos ya renderizados en el lienzo del usuario. Acto seguido, compara los nuevos resultados contra *todos* los nodos presentes en la pantalla; si la afinidad supera un umbral crítico de similitud, la API instruye la creación automática de una arista, tejiendo la red conceptual de forma orgánica.

### 🧩 3. El Frontend (React Ecosystem)
* **Core Gráfico:** Desarrollado sobre **React** utilizando **React Flow**, seleccionado por su extraordinario rendimiento de renderizado en el DOM y capacidades nativas de personalización.
* **Layout Engine (Dagre):** Tras descartar un enfoque basado en grafos de fuerzas (debido a la densidad de la información de las tarjetas), se implementó el **Algoritmo de Sugiyama** a través de **Dagre** para estructurar los nodos limpiamente por capas.
* **Módulo de Mapas:** Integración de un mapamundi dinámico que reacciona al volumen de datos por región geográfica con capacidad multicapa y proyecciones configurables.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
* **React.js** (Estructura orientada a componentes)
* **React Flow** (Lienzo interactivo y gestión de nodos/aristas)
* **Dagre** (Cálculo y ordenación del grafo)
* **Tailwind CSS** (Estilos y UI fluida)

### Backend & IA
* **FastAPI** (Framework web asíncrono de alto rendimiento)
* **Sentence-Transformers** (Modelos de Machine Learning para Embeddings)
* **Beautiful Soup 4** (Minería de datos y Web Scraping)
* **Uvicorn** (Servidor ASGI)

### Base de Datos
* **PostgreSQL** (Motor relacional)
* **pgvector** (Almacenamiento e indexación de vectores de características)
