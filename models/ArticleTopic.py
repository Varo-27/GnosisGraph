from sqlmodel import SQLModel, Field

class ArticleTopic(SQLModel, table=True):
    __tablename__ = "article_topic"
    article_id: int = Field(foreign_key="article.id", primary_key=True)
    topic_id: int = Field(foreign_key="topic.id", primary_key=True)
