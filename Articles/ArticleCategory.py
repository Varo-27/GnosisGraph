from sqlmodel import SQLModel, Field


class ArticleCategory(SQLModel, table=True):
    __tablename__ = "article_category"

    article_id: int = Field(foreign_key="article.id", primary_key=True)
    category_id: int = Field(foreign_key="category.id", primary_key=True)
