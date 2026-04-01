from sqlmodel import SQLModel, Field
from typing import Optional

class Topic(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    keywords: Optional[str] = None
    size: Optional[int] = None
