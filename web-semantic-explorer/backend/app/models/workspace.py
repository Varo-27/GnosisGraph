import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, JSON
from sqlmodel import Field, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


class Workspace(SQLModel, table=True):
    __tablename__ = "workspace"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    name: str = Field(max_length=255)
    graph: dict = Field(default_factory=dict, sa_column=Column(JSON))
    schema_version: int = Field(default=1)
    server_revision: uuid.UUID = Field(default_factory=uuid.uuid4)
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class UserWorkspaceState(SQLModel, table=True):
    __tablename__ = "user_workspace_state"

    user_id: uuid.UUID = Field(primary_key=True, foreign_key="user.id")
    active_workspace_id: uuid.UUID | None = Field(default=None)
    updated_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
