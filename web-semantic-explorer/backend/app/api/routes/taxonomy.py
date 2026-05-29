from fastapi import APIRouter
from sqlmodel import select

from app.api.deps import SessionDep
from app.models.relations import ArticleAuthor
from app.models.taxonomy import Author
from app.schemas.taxonomy import AuthorOption, AuthorsListResponse

router = APIRouter(prefix="/taxonomy", tags=["taxonomy"])


@router.get("/authors", response_model=AuthorsListResponse)
def list_authors(session: SessionDep) -> AuthorsListResponse:
    """Autores con al menos un artículo, ordenados por nombre (para filtros exactos)."""
    rows = session.exec(
        select(Author.name)
        .join(ArticleAuthor, ArticleAuthor.author_id == Author.id)
        .distinct()
        .order_by(Author.name)
    ).all()

    return AuthorsListResponse(
        authors=[AuthorOption(name=name) for name in rows if name]
    )
