from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Article(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(unique=True)
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    date: Optional[datetime] = None
    paywalled: bool = Field(default=False)
