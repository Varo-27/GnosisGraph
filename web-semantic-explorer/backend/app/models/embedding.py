from pgvector.sqlalchemy import Vector
from sqlalchemy import Column
from sqlmodel import Field, SQLModel


class Embedding(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    entity_type: str
    entity_id: int

    vector: list[float] = Field(
        sa_column=Column(Vector(1024))
    )
