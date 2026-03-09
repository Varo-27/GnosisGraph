from sqlmodel import SQLModel, Field


class ArticleTag(SQLModel, table=True):
    __tablename__ = "article_tag"

    article_id: int = Field(foreign_key="article.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)
