from fastapi import APIRouter

from app.api.routes import (
    articles,
    favorites,
    follows,
    graph,
    login,
    private,
    ratings,
    search,
    stats,
    taxonomy,
    users,
    utils,
    workspaces,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(search.router)
api_router.include_router(graph.router)
api_router.include_router(stats.router)
api_router.include_router(taxonomy.router)
api_router.include_router(articles.router)
api_router.include_router(articles.comments_router)
api_router.include_router(favorites.router)
api_router.include_router(follows.router)
api_router.include_router(ratings.router)
api_router.include_router(users.router)
api_router.include_router(workspaces.router)
api_router.include_router(utils.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
