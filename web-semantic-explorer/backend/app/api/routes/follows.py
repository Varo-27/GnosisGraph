from fastapi import APIRouter, Query

from app.api.deps import CurrentUser, SessionDep
from app.schemas.engagement import FollowCreate, FollowStatusPublic, FollowsListPublic
from app.services import engagement_service

router = APIRouter(prefix="/follows", tags=["follows"])


@router.get("", response_model=FollowsListPublic)
def list_follows(session: SessionDep, current_user: CurrentUser) -> FollowsListPublic:
    data = engagement_service.list_follows(session, current_user)
    return FollowsListPublic(data=data, count=len(data))


@router.post("", response_model=FollowStatusPublic)
def follow_target(
    body: FollowCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> FollowStatusPublic:
    return engagement_service.set_follow(session, current_user, body, following=True)


@router.delete("", response_model=FollowStatusPublic)
def unfollow_target(
    session: SessionDep,
    current_user: CurrentUser,
    target_type: str = Query(..., max_length=20),
    target_id: int = Query(..., ge=1),
) -> FollowStatusPublic:
    payload = FollowCreate(target_type=target_type, target_id=target_id)
    return engagement_service.set_follow(session, current_user, payload, following=False)
