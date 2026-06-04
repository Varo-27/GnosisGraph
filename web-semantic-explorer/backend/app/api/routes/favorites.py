from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.engagement import FavoritesListPublic, FavoriteStatusPublic
from app.services import engagement_service

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=FavoritesListPublic)
def list_favorites(session: SessionDep, current_user: CurrentUser) -> FavoritesListPublic:
    data = engagement_service.list_favorites(session, current_user)
    return FavoritesListPublic(data=data, count=len(data))


@router.post("/{article_id}", response_model=FavoriteStatusPublic)
def add_favorite(
    article_id: int,
    session: SessionDep,
    current_user: CurrentUser,
) -> FavoriteStatusPublic:
    return engagement_service.set_favorite(
        session, article_id, current_user, favorited=True
    )


@router.delete("/{article_id}", response_model=FavoriteStatusPublic)
def delete_favorite(
    article_id: int,
    session: SessionDep,
    current_user: CurrentUser,
) -> FavoriteStatusPublic:
    return engagement_service.set_favorite(
        session, article_id, current_user, favorited=False
    )
