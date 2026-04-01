from sqlmodel import select
from models import Article

def load_articles(session):
    return session.exec(select(Article)).all()

def build_text(article):
    parts = [
        article.title or "",
        article.excerpt or "",
        article.content or ""
    ]
    return "\n".join(parts).strip()
