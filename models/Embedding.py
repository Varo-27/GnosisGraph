from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from pgvector.sqlalchemy import Vector


class Embedding(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    entity_type: str
    entity_id: int

    vector: list[float] = Field(
        sa_column=Column(Vector(1024))
    )
