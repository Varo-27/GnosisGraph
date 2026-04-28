from sqlmodel import SQLModel, Field
from typing import Optional

class Author(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    profile_url: str
    bio: Optional[str] = None
