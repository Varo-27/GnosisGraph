import requests
from bs4 import BeautifulSoup
from .saveTag import save_tags_bulk
from .queryTag import get_all_tags
from utils import get_headers
from utils.logger import get_scraper_logger

logger = get_scraper_logger("TagScraper")

URLS = ["https://elordenmundial.com/post_tag-sitemap.xml", "https://elordenmundial.com/post_tag-sitemap2.xml", "https://elordenmundial.com/post_tag-sitemap3.xml", "https://elordenmundial.com/post_tag-sitemap4.xml"]

def parse_tag(url: str) -> dict:
    splitted_name = url.removeprefix("https://elordenmundial.com/tag/").removesuffix("/").split("-")
    name = " ".join(splitted_name).title()
    slug = url.removeprefix("https://elordenmundial.com/").removesuffix("/")
    return {"name": name, "slug": slug, "url": url}


def searchTags():
    existing_tags = get_all_tags()
    existing_urls = {t.url for t in existing_tags if t.url}
    
    for url in URLS:
        try:
            resp = requests.get(url, headers=get_headers(), timeout=10)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, features="xml")
            
            # Obtener todas las urls
            found_urls = [entry.find("loc").text for entry in soup.find_all("url") if entry.find("loc")]
            
            # Filtrar las que no existen en bbdd
            new_urls = [u for u in found_urls if u not in existing_urls]
            print(f"📖 Tags: Parseando {url} - Encontrados: {len(found_urls)} - Nuevos: {len(new_urls)}")
            
            if new_urls:
                tags = [parse_tag(u) for u in new_urls]
                save_tags_bulk(tags)
                print(f"✅ Guardados {len(tags)} nuevos tags.")
                existing_urls.update(new_urls)
        except Exception as e:
            logger.error(f"❌ Error escrapeando tags de {url}: {e}")


