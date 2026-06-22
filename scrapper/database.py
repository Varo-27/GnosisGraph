import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.exc import OperationalError
from sqlmodel import SQLModel, create_engine

load_dotenv(Path(__file__).with_name(".env"))
load_dotenv(Path(__file__).resolve().parents[1] / "web-semantic-explorer" / ".env")

DATABASE_URL = os.getenv("POSTGRES_DSN")
if not DATABASE_URL:
    raise RuntimeError(
        "Set POSTGRES_DSN in scrapper/.env or web-semantic-explorer/.env before running the scrapper"
    )

engine = create_engine(DATABASE_URL, echo=False)

def check_db_connection():
    try:
        with engine.connect() as conn:
            pass
    except OperationalError:
        print("\n❌ Error crítico: La base de datos no está respondiendo.")
        print("💡 ¿Has olvidado levantar el contenedor Docker?")
        print("🔧 Solución: Intenta ejecutar ./up o docker-compose up -d en la raíz del proyecto.\n")
        sys.exit(1)

def init_db():
    # Establecer la extension vector 
    with engine.connect() as conn:
        conn.exec_driver_sql("CREATE EXTENSION IF NOT EXISTS vector")

    # Importar todos los modelos para que SQLModel los registre antes de crear tablas
    from models.Author import Author
    from models.Category import Category
    from models.Tag import Tag
    from models.Place import Place
    from models.Article import Article
    from models.ArticleAuthor import ArticleAuthor
    from models.ArticleCategory import ArticleCategory
    from models.ArticleTag import ArticleTag
    from models.ArticlePlace import ArticlePlace
    from models.Embedding import Embedding
    from models.Topic import Topic
    from models.ArticleTopic import ArticleTopic
    from models.TopicHierarchy import TopicHierarchy

    SQLModel.metadata.create_all(engine)
