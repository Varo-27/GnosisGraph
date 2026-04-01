import sys
import os

from sqlmodel import Session, select
from database import engine
from models.Author import Author
from models.Article import Article
from models.ArticleAuthor import ArticleAuthor

authors_to_add = [
    {
        "name": "José María Blanco",
        "profile_url": "https://elordenmundial.com/author/jose-maria-blanco/",
        "article_url": "https://elordenmundial.com/crimen-organizado-mexico/"
    },
    {
        "name": "Adam Reichardt",
        "profile_url": "https://elordenmundial.com/author/adam-reichardt/",
        "article_url": "https://elordenmundial.com/entrevista-andrius-kubilius-industria-defensa-union-europea/"
    }
]

def fix():
    with Session(engine) as session:
        for data in authors_to_add:
            print(f"Procesando: {data['name']}")
            
            # Buscar el autor o crearlo
            author = session.exec(select(Author).where(Author.name == data['name'])).first()
            if not author:
                author = Author(name=data['name'], profile_url=data['profile_url'], bio="")
                session.add(author)
                session.commit()
                session.refresh(author)
                print(f"✅ Creado autor: {author.name}")
            else:
                print(f"ℹ️ El autor {author.name} ya existe (ID: {author.id})")
                
            # Buscar el articulo
            article = session.exec(select(Article).where(Article.url == data['article_url'])).first()
            if not article:
                print(f"❌ Error: No se encontró el artículo {data['article_url']}")
                continue
                
            print(f"📝 Encontrado artículo con ID: {article.id}")
                
            # Crear relacion
            relation = session.exec(select(ArticleAuthor).where(
                ArticleAuthor.article_id == article.id, 
                ArticleAuthor.author_id == author.id)
            ).first()
            
            if not relation:
                relation = ArticleAuthor(article_id=article.id, author_id=author.id)
                session.add(relation)
                session.commit()
                print(f"🔗 Relación creada entre {author.name} y el artículo.")
            else:
                print(f"ℹ️ La relación ya existe.")

if __name__ == '__main__':
    fix()
