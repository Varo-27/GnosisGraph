import requests
from bs4 import BeautifulSoup
from .saveCategory import save_category
from .queryCategory import get_all_categories
from utils.logger import get_scraper_logger

logger = get_scraper_logger("CategoryScraper")

def category(url: str):
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, features="lxml")
        
        name_elem = soup.select_one("h1.page-title")
        name = name_elem.get_text(strip=True) if name_elem else ""
        slug = url.removeprefix("https://elordenmundial.com/").removesuffix("/")
        type = url.removeprefix("https://elordenmundial.com/").removesuffix("/")
        
        save_category(name, slug, url, type)
    except Exception as e:
        logger.error(f"❌ Error escrapeando categoria {url}: {e}")

def searchCategories():
    # Obtener categorías existentes
    existing_categories = get_all_categories()
    existing_urls = {c.url for c in existing_categories if c.url}

    url = "https://elordenmundial.com/category-sitemap.xml"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, features="xml")

        found_urls = [url_tag.find("loc").text for url_tag in soup.find_all("url") if url_tag.find("loc")]
        new_urls = [u for u in found_urls if u not in existing_urls]
        
        print(f"📖 Categorías: Encontradas: {len(found_urls)} - Nuevas a procesar: {len(new_urls)}")

        for loc in new_urls:
            category(loc)
            
    except Exception as e:
        logger.error(f"❌ Error al procesar sitemap de categorías: {e}")


