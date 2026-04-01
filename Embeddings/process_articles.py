# Embeddings/process_articles.py

from sqlmodel import Session
from sqlalchemy import text
from Embeddings.local_embedding_client import get_embedding_local
from database import engine
from models import Embedding

def process_all_articles():
    print("🔵 Generando embeddings de artículos...")

    with Session(engine) as session:
        stmt = text("""
            SELECT a.id, a.title, a.content
            FROM article a
            LEFT JOIN embedding e
                ON e.entity_type = 'article' AND e.entity_id = a.id
            WHERE e.id IS NULL
        """)

        results = session.exec(stmt).all()
        print(f"Encontrados {len(results)} artículos sin embedding.")

        for idx, (article_id, title, content) in enumerate(results, start=1):
            print(f"→ Embedding artículo {idx}: {title[:50]}...")

            text_to_embed = f"{title}\n\n{content}"
            vector = get_embedding_local(text_to_embed)

            emb = Embedding(
                entity_type="article",
                entity_id=article_id,
                vector=vector
            )

            session.add(emb)
            session.commit()
