import time
import random
from stats import mostrar_estadisticas_finales

# Importamos los entrypoints de cada scraper
from Authors.scrapAuthor import buscarAutores
from Tags.scrapTag import searchTags
from Categories.scrapCategory import searchCategories
from Articles.scrapArticle import searchArticles
from Articles.saveArticle import save_article

from Embeddings.process_articles import process_all_articles


def run_scrapers():
    print("🔵 1. Iniciando scraper de Autores...")
    buscarAutores()
    
    print("\n🔵 2. Iniciando scraper de Tags...")
    searchTags()
    
    print("\n🔵 3. Iniciando scraper de Categorías...")
    searchCategories()
    
    print("\n🔵 4. Iniciando scraper de Artículos (limit=1000)...")
    searchArticles() 
    
    print("✅ Todos los scrapers han finalizado.")

if __name__ == "__main__":
    # Ejecuta la secuencia de scrapers
    run_scrapers()

    print("\n🔵 5. Generando embeddings de artículos...")
    process_all_articles()

    # Al terminar, mostramos el reporte
    mostrar_estadisticas_finales()