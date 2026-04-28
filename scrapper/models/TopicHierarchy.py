from sqlmodel import SQLModel, Field
from typing import Optional

class TopicHierarchy(SQLModel, table=True):
    __tablename__ = "topic_hierarchy"
    parent_topic_id: int = Field(foreign_key="topic.id", primary_key=True)
    child_topic_id: int = Field(foreign_key="topic.id", primary_key=True)
    level: Optional[int] = None
