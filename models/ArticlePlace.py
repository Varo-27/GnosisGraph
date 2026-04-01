from sqlmodel import SQLModel, Field


class ArticlePlace(SQLModel, table=True):
    __tablename__ = "article_place"

    article_id: int = Field(foreign_key="article.id", primary_key=True)
    place_id: int = Field(foreign_key="place.id", primary_key=True)
