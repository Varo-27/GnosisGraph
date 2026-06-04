import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.workspace import UserWorkspaceState, Workspace, get_datetime_utc
from app.models.user import User
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceGraphSnapshotPublic,
    WorkspacePublic,
    WorkspaceSyncItem,
    WorkspaceSyncPayload,
    WorkspaceSyncResponse,
    WorkspaceUpdate,
)


def _graph_to_dict(graph: WorkspaceGraphSnapshotPublic | None) -> dict:
    if graph is None:
        return {"nodes": [], "edges": [], "viewport": None}
    return graph.model_dump()


def _workspace_to_public(workspace: Workspace) -> WorkspacePublic:
    return WorkspacePublic(
        id=workspace.id,
        name=workspace.name,
        schema_version=workspace.schema_version,
        graph=WorkspaceGraphSnapshotPublic.model_validate(workspace.graph),
        server_revision=workspace.server_revision,
        created_at=workspace.created_at,
        updated_at=workspace.updated_at,
    )


def list_workspaces(session: Session, user: User) -> list[WorkspacePublic]:
    rows = session.exec(
        select(Workspace)
        .where(Workspace.user_id == user.id)
        .order_by(Workspace.updated_at.desc())
    ).all()
    return [_workspace_to_public(row) for row in rows]


def get_workspace(
    session: Session, workspace_id: uuid.UUID, user: User
) -> WorkspacePublic:
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.user_id != user.id:
        raise HTTPException(status_code=404, detail="Área de trabajo no encontrada")
    return _workspace_to_public(workspace)


def create_workspace(
    session: Session, user: User, payload: WorkspaceCreate
) -> WorkspacePublic:
    now = get_datetime_utc()
    workspace = Workspace(
        id=payload.id or uuid.uuid4(),
        user_id=user.id,
        name=payload.name.strip(),
        graph=_graph_to_dict(payload.graph),
        schema_version=payload.schema_version,
        server_revision=uuid.uuid4(),
        created_at=now,
        updated_at=now,
    )
    session.add(workspace)
    _ensure_user_state(session, user.id, workspace.id)
    session.commit()
    session.refresh(workspace)
    return _workspace_to_public(workspace)


def update_workspace(
    session: Session,
    workspace_id: uuid.UUID,
    user: User,
    payload: WorkspaceUpdate,
) -> WorkspacePublic:
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.user_id != user.id:
        raise HTTPException(status_code=404, detail="Área de trabajo no encontrada")

    if (
        payload.server_revision is not None
        and payload.server_revision != workspace.server_revision
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflicto de revisión: recarga desde el servidor",
        )

    if payload.name is not None:
        workspace.name = payload.name.strip()
    if payload.schema_version is not None:
        workspace.schema_version = payload.schema_version
    if payload.graph is not None:
        workspace.graph = _graph_to_dict(payload.graph)

    workspace.server_revision = uuid.uuid4()
    workspace.updated_at = get_datetime_utc()
    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    return _workspace_to_public(workspace)


def delete_workspace(
    session: Session, workspace_id: uuid.UUID, user: User
) -> None:
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.user_id != user.id:
        raise HTTPException(status_code=404, detail="Área de trabajo no encontrada")

    state = session.get(UserWorkspaceState, user.id)
    session.delete(workspace)
    if state and state.active_workspace_id == workspace_id:
        remaining = session.exec(
            select(Workspace.id)
            .where(Workspace.user_id == user.id)
            .where(Workspace.id != workspace_id)
            .order_by(Workspace.updated_at.desc())
        ).first()
        state.active_workspace_id = remaining
        state.updated_at = get_datetime_utc()
        session.add(state)
    session.commit()


def get_sync_state(session: Session, user: User) -> WorkspaceSyncResponse:
    workspaces = list_workspaces(session, user)
    state = session.get(UserWorkspaceState, user.id)
    active_id = state.active_workspace_id if state else None
    if not active_id and workspaces:
        active_id = workspaces[0].id
    if not active_id:
        default = create_workspace(
            session,
            user,
            WorkspaceCreate(name="Investigación 1"),
        )
        workspaces = [default]
        active_id = default.id

    return WorkspaceSyncResponse(
        schema_version=1,
        active_workspace_id=active_id,
        workspaces=workspaces,
    )


def sync_workspaces(
    session: Session, user: User, payload: WorkspaceSyncPayload
) -> WorkspaceSyncResponse:
    if not payload.workspaces:
        raise HTTPException(
            status_code=400, detail="Se requiere al menos un área de trabajo"
        )

    existing_rows = session.exec(
        select(Workspace).where(Workspace.user_id == user.id)
    ).all()
    existing_by_id = {row.id: row for row in existing_rows}
    incoming_ids = {item.id for item in payload.workspaces}

    for item in payload.workspaces:
        current = existing_by_id.get(item.id)
        item_updated = _normalize_datetime(item.updated_at)

        if current is None:
            workspace = Workspace(
                id=item.id,
                user_id=user.id,
                name=item.name.strip(),
                graph=item.graph.model_dump(),
                schema_version=item.schema_version,
                server_revision=uuid.uuid4(),
                created_at=item_updated,
                updated_at=item_updated,
            )
            session.add(workspace)
            continue

        if (
            item.server_revision is not None
            and item.server_revision != current.server_revision
            and current.updated_at > item_updated
        ):
            continue

        current.name = item.name.strip()
        current.graph = item.graph.model_dump()
        current.schema_version = item.schema_version
        current.server_revision = uuid.uuid4()
        current.updated_at = max(current.updated_at, item_updated)
        session.add(current)

    for workspace_id, workspace in existing_by_id.items():
        if workspace_id not in incoming_ids:
            session.delete(workspace)

    state = _ensure_user_state(
        session, user.id, payload.active_workspace_id, commit=False
    )
    state.active_workspace_id = payload.active_workspace_id
    state.updated_at = get_datetime_utc()
    session.add(state)
    session.commit()

    return get_sync_state(session, user)


def _ensure_user_state(
    session: Session,
    user_id: uuid.UUID,
    active_workspace_id: uuid.UUID | None,
    *,
    commit: bool = True,
) -> UserWorkspaceState:
    state = session.get(UserWorkspaceState, user_id)
    if state is None:
        state = UserWorkspaceState(
            user_id=user_id,
            active_workspace_id=active_workspace_id,
            updated_at=get_datetime_utc(),
        )
        session.add(state)
    elif active_workspace_id is not None:
        state.active_workspace_id = active_workspace_id
        state.updated_at = get_datetime_utc()
        session.add(state)

    if commit:
        session.commit()
        session.refresh(state)
    return state


def _normalize_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value
