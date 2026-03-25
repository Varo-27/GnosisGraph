import requests
from bs4 import BeautifulSoup, XMLParsedAsHTMLWarning
from utils import get_headers
from datetime import datetime
import time
import random
import re
import logging
import warnings
from sqlmodel import Session, select
from database import engine
from Articles.Article import Article

# --- SILENCIAR ADVERTENCIAS DE BS4 ---
warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

# Importamos la función de guardado
from .saveArticle import save_article

# --- CONFIGURACIÓN DE LOGS ---
logger = logging.getLogger("scraper")
logger.setLevel(logging.DEBUG)

c_handler = logging.StreamHandler()
c_handler.setLevel(logging.INFO)
c_handler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))

f_handler = logging.FileHandler("critical_errors.log", encoding='utf-8')
f_handler.setLevel(logging.WARNING)
f_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))

logger.addHandler(c_handler)
logger.addHandler(f_handler)

logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

def extract_authors(soup):
    authors = []
    author_blocks = soup.select(".author.vcard a") or soup.select("[rel='author']")
    if author_blocks:
        authors = [a.get_text(strip=True) for a in author_blocks]
    
    if not authors:
        meta_auth = soup.find("meta", attrs={"name": "author"})
        if meta_auth: authors = [meta_auth.get("content", "")]

    if not authors or len(authors) == 1:
        raw_text = authors[0] if authors else ""
        if not raw_text:
            auth_div = soup.select_one(".entry-content-head-author")
            if auth_div: raw_text = auth_div.get_text(strip=True).replace("Por", "", 1).strip()

        if raw_text and raw_text != "El Orden Mundial":
            parts = re.split(r',\s*|\s+y\s+', raw_text)
            authors = [p.strip() for p in parts if p.strip()]

    final = list(dict.fromkeys([a for a in authors if a]))
    
    # Mantener "Elorden" tal cual viene en la web original
    if not final: return ["El Orden Mundial"]
    return final

def article_scraper(url: str):
    if any(url.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.xml', '.gif', '.svg', '.svgz']):
        return None

    try:
        resp = requests.get(url, headers=get_headers(), timeout=20)
        if resp.status_code != 200: return None
        soup = BeautifulSoup(resp.text, 'lxml')
        
        article_tag = soup.find("article")
        if not article_tag: return None

        # --- EXCERPT ---
        excerpt_tag = soup.select_one(".entry-header__entradilla, .excerpt")
        db_excerpt = excerpt_tag.get_text(strip=True)[:300] if excerpt_tag else ""
        if not db_excerpt:
            first_p = soup.select_one(".entry-content p")
            db_excerpt = first_p.get_text(strip=True)[:300] if first_p else ""

        # --- TÍTULO ---
        title_tag = soup.select_one("h1.entry-title") or soup.find("h1")
        db_title = title_tag.get_text(strip=True) if title_tag else "Sin título"

        # --- CONTENIDO ---
        is_paywalled = soup.select_one(".payment-wall, .mepr-unauthorized-excerpt") is not None
        content_div = soup.select_one(".mepr-unauthorized-excerpt") if is_paywalled else soup.select_one(".entry-content")
        
        db_content = ""
        if content_div:
            for noise in content_div.select(".entry-content-head, .audioarticulo, .payment-wall, .cbxwpbkmarkwrap, script, ins, .share-pill-wrapper, .post-tags"):
                noise.decompose()
            db_content = content_div.get_text("\n\n", strip=True)

        # --- IMAGEN ROBUSTA (Anti-LazyLoad) ---
        db_image = None
        # Prioridad 1: Meta Tag OG (URL limpia y directa)
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            db_image = og_image["content"]
        
        # Prioridad 2: Atributos data-src si el meta falla
        if not db_image:
            img_tag = soup.select_one(".post-thumbnail img, .entry-content img")
            if img_tag:
                db_image = img_tag.get('data-src') or img_tag.get('data-lazy-src') or img_tag.get('src')
        
        # Filtro final para descartar data:image (base64)
        if db_image and ("data:image" in db_image or "viewBox" in db_image):
            db_image = None

        classes = article_tag.get('class', [])
        
        return {
            "url": url,
            "title": db_title,
            "excerpt": db_excerpt,
            "content": db_content,
            "date": datetime.now(),
            "authors": extract_authors(soup),
            "categories": [c.replace('category-', '') for c in classes if c.startswith('category-')],
            "places": [c.replace('lugar-', '') for c in classes if c.startswith('lugar-')],
            "tags": [c.replace('tag-', '') for c in classes if c.startswith('tag-')],
            "image_url": db_image,
            "paywalled": is_paywalled
        }
    except Exception as e:
        logger.error(f"❌ Error en scraper para {url}: {str(e)}")
        return None

def searchArticles(limit=1000):
    sitemap_url = "https://elordenmundial.com/post-sitemap.xml"
    print(f"\n🚀 --- INICIANDO SCRAPER MASIVO ---")
    
    try:
        resp = requests.get(sitemap_url, headers=get_headers())
        soup = BeautifulSoup(resp.text, 'xml')
        raw_urls = [loc.text for loc in soup.find_all("loc")]
        
        extensiones_basura = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.xml', '.svgz')
        urls = [u for u in raw_urls if not u.lower().endswith(extensiones_basura)]
        
        total_validas = len(urls)
        print(f"🎯 URLs válidas: {total_validas}\n")
        
        count = 0
        with Session(engine) as session:
            for i, url in enumerate(urls):
                if count >= limit: break
                
                existing = session.exec(select(Article).where(Article.url == url)).first()
                if existing:
                    if i % 10 == 0: print(f"[{i+1}/{total_validas}] ⏩ Saltando existentes...")
                    continue 
                
                print(f"[{i+1}/{total_validas}] 🔍 Scrapeando: {url}")
                
                data = article_scraper(url)
                if data:
                    saved = save_article(data, session=session)
                    if saved:
                        count += 1
                        print(f"   ✅ GUARDADO: {saved.title[:60]}...")
                    time.sleep(random.uniform(1.5, 2.5))
        
        print(f"\n✨ TERMINADO: {count} nuevos.")
    except Exception as e:
        print(f"💥 ERROR: {e}")