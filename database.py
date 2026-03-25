from sqlmodel import SQLModel, create_engine

DATABASE_URL = "postgresql://admin:renaido@localhost:5432/EOMai"


engine = create_engine(DATABASE_URL, echo=False)

def init_db():
    # Importar todos los modelos para que SQLModel los registre antes de crear tablas
    from Authors.Author import Author
    from Categories.Category import Category
    from Tags.Tag import Tag
    from Places.Place import Place
    from Articles.Article import Article
    from Articles.ArticleAuthor import ArticleAuthor
    from Articles.ArticleCategory import ArticleCategory
    from Articles.ArticleTag import ArticleTag
    from Articles.ArticlePlace import ArticlePlace

    SQLModel.metadata.create_all(engine)
