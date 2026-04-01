from sqlmodel import SQLModel, create_engine
from sqlalchemy.exc import OperationalError
import psycopg2
import sys

DATABASE_URL = "postgresql://admin:renaido@localhost:5432/EOMai"

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
