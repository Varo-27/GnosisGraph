import uuid

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspacePublic,
    WorkspaceSyncPayload,
    WorkspaceSyncResponse,
    WorkspaceUpdate,
    WorkspacesPublic,
)
from app.services import workspace_service

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.get("", response_model=WorkspacesPublic)
def list_workspaces(session: SessionDep, current_user: CurrentUser) -> WorkspacesPublic:
    data = workspace_service.list_workspaces(session, current_user)
    return WorkspacesPublic(data=data, count=len(data))


@router.get("/sync", response_model=WorkspaceSyncResponse)
def get_workspace_sync(
    session: SessionDep, current_user: CurrentUser
) -> WorkspaceSyncResponse:
    return workspace_service.get_sync_state(session, current_user)


@router.put("/sync", response_model=WorkspaceSyncResponse)
def put_workspace_sync(
    session: SessionDep,
    current_user: CurrentUser,
    payload: WorkspaceSyncPayload,
) -> WorkspaceSyncResponse:
    return workspace_service.sync_workspaces(session, current_user, payload)


@router.post("", response_model=WorkspacePublic)
def create_workspace(
    session: SessionDep,
    current_user: CurrentUser,
    payload: WorkspaceCreate,
) -> WorkspacePublic:
    return workspace_service.create_workspace(session, current_user, payload)


@router.get("/{workspace_id}", response_model=WorkspacePublic)
def get_workspace(
    workspace_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> WorkspacePublic:
    return workspace_service.get_workspace(session, workspace_id, current_user)


@router.patch("/{workspace_id}", response_model=WorkspacePublic)
def update_workspace(
    workspace_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    payload: WorkspaceUpdate,
) -> WorkspacePublic:
    return workspace_service.update_workspace(
        session, workspace_id, current_user, payload
    )


@router.delete("/{workspace_id}")
def delete_workspace(
    workspace_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> dict[str, str]:
    workspace_service.delete_workspace(session, workspace_id, current_user)
    return {"message": "Área de trabajo eliminada"}
