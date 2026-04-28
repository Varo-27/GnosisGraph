from sqlmodel import SQLModel, Field


class ArticleAuthor(SQLModel, table=True):
    __tablename__ = "article_author"

    article_id: int = Field(foreign_key="article.id", primary_key=True)
    author_id: int = Field(foreign_key="author.id", primary_key=True)
