# Introduccion, solo en la portada

Llevo muchos años escuchando el que es mi podcast favorito,No es el fin del mundo, en el que tratan los temas que sean siempre desde la perspectiva geopolitica.Con tanta cantidad de episodios, cada vez se vuelve más frecuente que hagan referencias a otros capitulos, elementos en su web o que prometian hacer uno para ese tema.

Ahí es donde me di cuenta que me faltaba algo, una herramienta que me permitiera no solo escuchar, sino visualizar las conexiones entre todos esos contenidos, de esa idea nació Gnosis Graph.

# 2da diapositiva

La idea original era construir una red de referencias entre edisodios, transcribirlo, sogmentarlo, analiza los segmentos... Con esa barrera técnica y el tiempo decidí pivotar. Decidí enfocarme en los artículos escritos, en teoría, más estructurados y fáciles de procesar. Algo que hizo cambiar el significado de las relaciones, de referencias explicitas a conexiones semánticas invisibles.


¿Con este cambio la aplicación sigue teniendo sentido? ¿Hay un público objetivo detrás de esta perspectiva?
Las entidades con grandes volumenes dato especializados como las universidades, editoriales o despachos de abogados. La necesidad surge porque la información compleja se publica de forma segmentada ocultando conexiones que cruzan distintas categorías. Los buscadores tradicionales además ordenan los resultados por actualidad,la búsqueda semántica soluciona esos dos problemas, revaloriza la información histórica de los datos mas antiguos y rescatan esas relaciones latentes.

# 3ra diapositiva

El desarrollo de la aplicación se centró en el tipo de datos que maneja. Utilicé un scraper que recogió todos los articulos de la web oficial y sus metadatos como autores, paises, categorias... este, se puede lanzar las veces que se quiera, se salta los artículos ya almacenados y guarda los nuevos.

Después de eso, un pipeline convierte cada artículo en un vector numérico que permite medir similitudes

# aquí van imágenes de los logos de las tecnologias que usé

Se utilizó Postgres porque gracias a su extension PGVector, combina tener una base de datos relacional, con capacidades vectoriales, haciento las consultas eficientes y simplificando la arquitectura.

Siguiendo con el stack tecnológico, no me puedo parar en todas, pagina 10 del documento, la base del proyecto es la plantilla oficial full stack de fastapi
El frontend está hecho en React, ReactFlow es la libreria con la que dibujar en pantalla los arboles de nodos

Cabe resaltar la pagina 33 del documento, en la que explico como se consiguió que la generación dinámica del arbol no fuera un caos, se utilizó una libreria adicional de reactFlow que aplica el framework de sugiyama.


# una diapo blanca para cambiar y volver de la demo

Procedo a enseñaros la aplicación.... 
Buscador
nodos
Herramientas buscador

favoritos

mapa
proyeccion
hover
modal pais
//enseñar la aplicacion no tiene pagina de canva es en directo la web

# diapos sobre la viabilidad, pondé capturas de los excel

La viabilidad del proyecto


Para finalizar, aunque la parte económica está desarrollada en detalle en la documentación, comentar que el proyecto se plantea como un producto B2B dirigido a organizaciones con grandes volúmenes de información especializada, como las mencionadas anteriormente.

La financiación inicial se apoya en una inversión propia reducida y en las ayudas públicas disponibles para nuevos emprendedores durante los primeros años de actividad.

La estrategia empresarial consiste en aprovechar ese periodo inicial para construir una cartera estable de clientes y evolucionar hacia un modelo basado en ingresos recurrentes mediante cuotas de mantenimiento, reduciendo así la dependencia de nuevas implantaciones y garantizando la sostenibilidad del proyecto a largo plazo.
