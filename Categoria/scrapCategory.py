import requests
from bs4 import BeautifulSoup
from .saveCategory import save_category

def category(url: str):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, features="lxml")
    
    name = soup.select_one("h1.page-title").get_text(strip=True)
    slug = url.removeprefix("https://elordenmundial.com/").removesuffix("/")
    type = url.removeprefix("https://elordenmundial.com/").removesuffix("/")
    save_category(name, slug, url, type)
    # print(url)
    # print(name)
    # print(slug)
    # print(type)



def searchCategories():
    url = "https://elordenmundial.com/category-sitemap.xml"
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, features="xml")



    for url in soup.find_all("url"):
        loc:str = url.find("loc").text
        category(loc)


