from fastapi import APIRouter

from app.api.deps import SessionDep
from app.schemas.graph import ExpandRequest, ExpandResponse
from app.services.graph_service import expand_graph

router = APIRouter(prefix="/graph", tags=["graph"])


@router.post("/expand", response_model=ExpandResponse)
def expand_graph_route(
    request: ExpandRequest,
    session: SessionDep,
    limit: int = 5,
    threshold: float = 0.85,
) -> ExpandResponse:
    """
    Expande el grafo desde un artículo. Devuelve nodos nuevos y aristas,
    opcionalmente mezclando el contexto de las semillas (nodos input).
    """
    return expand_graph(
        session=session,
        request=request,
        limit=limit,
        threshold=threshold,
    )
