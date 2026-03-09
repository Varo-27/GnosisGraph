import requests
from bs4 import BeautifulSoup
from .saveArticle import save_article

def article(url: str):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, features="lxml")
    
    name = soup.select_one("h1.page-title a.url.fn.n").get_text(strip=True)
    bio = soup.select_one("header.archive-header div p").get_text(" ", strip=True)
    
    title = "",
    excerpt = "",
    content = "",
    image_url = "",
    date = "",
    paywalled = False,
    author_ids = [],
    category_ids = [],
    tag_ids = [],
    place_ids = []

# PENDIENTE DE HACER LA LOGICA

    save_article(url, title, excerpt,content,image_url,date,paywalled,author_ids,category_ids,tag_ids,place_ids)



def searchArticles():
    url = "https://elordenmundial.com/post-sitemap4.xml"
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, features="xml")



    for url in soup.find_all("url"):
        loc:str = url.find("loc").text
        article(loc)


