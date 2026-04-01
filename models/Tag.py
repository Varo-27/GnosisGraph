from sqlmodel import SQLModel, Field
from typing import Optional

class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    slug: Optional[str] = None
    url: Optional[str] = None

