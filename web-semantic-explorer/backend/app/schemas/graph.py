from pydantic import BaseModel, Field

from app.schemas.filters import ArticleMetadataFilters
from app.schemas.search import ArticleSearchResult


class ExpandRequest(BaseModel):
    source_article_id: int
    existing_node_ids: list[int]
    filters: ArticleMetadataFilters | None = None
    seed_queries: list[str] = Field(
        default_factory=list,
        description="Textos de nodos input upstream (semillas de la isla).",
    )
    context_article_ids: list[int] = Field(
        default_factory=list,
        description="Ids de artículos en la cadena de ancestros (walk-up).",
    )

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    similarity: float | None = None

class GraphNode(BaseModel):
    id: str
    data: ArticleSearchResult

class ExpandResponse(BaseModel):
    new_nodes: list[GraphNode]
    new_edges: list[GraphEdge]
