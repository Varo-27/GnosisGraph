from typing import Optional

from sqlmodel import Field, SQLModel


class ArticleCategory(SQLModel, table=True):
    __tablename__ = "article_category"
    article_id: int = Field(foreign_key="article.id", primary_key=True)
    category_id: int = Field(foreign_key="category.id", primary_key=True)


class ArticleAuthor(SQLModel, table=True):
    __tablename__ = "article_author"
    article_id: int = Field(foreign_key="article.id", primary_key=True)
    author_id: int = Field(foreign_key="author.id", primary_key=True)


class ArticlePlace(SQLModel, table=True):
    __tablename__ = "article_place"
    article_id: int = Field(foreign_key="article.id", primary_key=True)
    place_id: int = Field(foreign_key="place.id", primary_key=True)


class ArticleTag(SQLModel, table=True):
    __tablename__ = "article_tag"
    article_id: int = Field(foreign_key="article.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)


class ArticleTopic(SQLModel, table=True):
    __tablename__ = "article_topic"
    article_id: int = Field(foreign_key="article.id", primary_key=True)
    topic_id: int = Field(foreign_key="topic.id", primary_key=True)


class TopicHierarchy(SQLModel, table=True):
    __tablename__ = "topic_hierarchy"
    parent_topic_id: int = Field(foreign_key="topic.id", primary_key=True)
    child_topic_id: int = Field(foreign_key="topic.id", primary_key=True)
    level: Optional[int] = None
