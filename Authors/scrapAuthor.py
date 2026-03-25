import requests
from bs4 import BeautifulSoup
from .saveAuthor import save_author
from .queryAuthor import get_all_authors
from utils.logger import get_scraper_logger

logger = get_scraper_logger("AuthorScraper")

def autor(url: str):
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, features="lxml")
        
        name_elem = soup.select_one("h1.page-title a.url.fn.n")
        name = name_elem.get_text(strip=True) if name_elem else ""
        
        bio_elem = soup.select_one("header.archive-header div p")
        bio = bio_elem.get_text(" ", strip=True) if bio_elem else ""
        
        save_author(name, url, bio)
        print(f"✅ Autor guardado: {name}")
    except Exception as e:
        logger.error(f"❌ Error escrapeando autor {url}: {e}")

def buscarAutores():
    # Obtener las URLs de los autores que ya existen
    existing_authors = get_all_authors()
    existing_urls = {a.profile_url for a in existing_authors if a.profile_url}

    url = "https://elordenmundial.com/author-sitemap.xml"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, features="xml")

        urls_en_sitemap = [loc.text for loc in soup.find_all("loc")]
        nuevas_urls = [u for u in urls_en_sitemap if u not in existing_urls]
        
        print(f"📚 Autores existentes: {len(existing_urls)} | Encontrados: {len(urls_en_sitemap)} | Nuevos a procesar: {len(nuevas_urls)}")

        for loc in nuevas_urls:
            autor(loc)
            
    except Exception as e:
        logger.error(f"❌ Error al procesar el sitemap de autores: {e}")


