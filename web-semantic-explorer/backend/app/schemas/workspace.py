import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class WorkspaceGraphSnapshotPublic(BaseModel):
    nodes: list[dict] = Field(default_factory=list)
    edges: list[dict] = Field(default_factory=list)
    viewport: dict | None = None


class WorkspacePublic(BaseModel):
    id: uuid.UUID
    name: str
    schema_version: int
    graph: WorkspaceGraphSnapshotPublic
    server_revision: uuid.UUID
    created_at: datetime
    updated_at: datetime


class WorkspaceCreate(BaseModel):
    id: uuid.UUID | None = None
    name: str = Field(min_length=1, max_length=255)
    schema_version: int = 1
    graph: WorkspaceGraphSnapshotPublic | None = None


class WorkspaceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    schema_version: int | None = None
    graph: WorkspaceGraphSnapshotPublic | None = None
    server_revision: uuid.UUID | None = None


class WorkspaceSyncItem(BaseModel):
    id: uuid.UUID
    name: str
    schema_version: int = 1
    updated_at: datetime
    graph: WorkspaceGraphSnapshotPublic
    server_revision: uuid.UUID | None = None


class WorkspaceSyncPayload(BaseModel):
    schema_version: int = 1
    active_workspace_id: uuid.UUID
    workspaces: list[WorkspaceSyncItem]


class WorkspaceSyncResponse(BaseModel):
    schema_version: int
    active_workspace_id: uuid.UUID
    workspaces: list[WorkspacePublic]


class WorkspacesPublic(BaseModel):
    data: list[WorkspacePublic]
    count: int
