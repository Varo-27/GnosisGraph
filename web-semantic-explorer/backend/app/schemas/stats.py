from pydantic import BaseModel, Field


class HeatmapEntry(BaseModel):
    place_id: int
    name: str
    slug: str | None = None
    country_code: str | None = None
    map_country_codes: list[str] = []
    article_count: int


class HeatmapResponse(BaseModel):
    total_articles: int
    entries: list[HeatmapEntry] = Field(default_factory=list)


class PlaceArticlePreview(BaseModel):
    id: int
    title: str | None = None
    excerpt: str | None = None
    image_url: str | None = None
    date: str | None = None
    average_rating: float | None = None
    ratings_count: int = 0


class PlacePreviewResponse(BaseModel):
    place_id: int
    name: str
    article_count: int
    top_rated: list[PlaceArticlePreview] = Field(default_factory=list)
