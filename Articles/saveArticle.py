from datetime import datetime
from typing import Optional
from sqlmodel import Session, select
from database import engine
from .Article import Article
from .ArticleAuthor import ArticleAuthor
from .ArticleCategory import ArticleCategory
from .ArticleTag import ArticleTag
from .ArticlePlace import ArticlePlace


def save_article(
    url: str,
    title: Optional[str] = None,
    excerpt: Optional[str] = None,
    content: Optional[str] = None,
    image_url: Optional[str] = None,
    date: Optional[datetime] = None,
    paywalled: bool = False,
    author_ids: list[int] = [],
    category_ids: list[int] = [],
    tag_ids: list[int] = [],
    place_ids: list[int] = [],
):
    with Session(engine) as session:
        # Evitar duplicados por URL
        existing = session.exec(select(Article).where(Article.url == url)).first()
        if existing:
            print(f"Artículo ya existe: {url}")
            return

        article = Article(
            url=url,
            title=title,
            excerpt=excerpt,
            content=content,
            image_url=image_url,
            date=date,
            paywalled=paywalled,
        )
        session.add(article)
        session.flush()  # obtiene article.id sin cerrar la sesión

        session.add_all([ArticleAuthor(article_id=article.id, author_id=aid) for aid in author_ids])
        session.add_all([ArticleCategory(article_id=article.id, category_id=cid) for cid in category_ids])
        session.add_all([ArticleTag(article_id=article.id, tag_id=tid) for tid in tag_ids])
        session.add_all([ArticlePlace(article_id=article.id, place_id=pid) for pid in place_ids])

        session.commit()
        print(f"Artículo guardado con ID {article.id}: {title}")
