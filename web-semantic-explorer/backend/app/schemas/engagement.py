from datetime import datetime

from pydantic import BaseModel, Field


class ArticleCommentPublic(BaseModel):
    id: int
    content: str
    author_name: str
    created_at: datetime
    is_own: bool = False


class ArticleDetailPublic(BaseModel):
    id: int
    title: str | None
    url: str
    excerpt: str | None
    image_url: str | None
    date: datetime | None
    paywalled: bool
    authors: list[str]
    categories: list[str]
    places: list[str]
    comments: list[ArticleCommentPublic]
    average_rating: float | None
    ratings_count: int
    user_rating: int | None = None
    is_favorited: bool = False
    user_note: str | None = None
    user_note_updated_at: datetime | None = None
    follow_targets: list["FollowTargetPublic"] = Field(default_factory=list)


class FavoriteStatusPublic(BaseModel):
    article_id: int
    is_favorited: bool


class FavoriteArticlePublic(BaseModel):
    article_id: int
    title: str | None
    excerpt: str | None
    image_url: str | None
    url: str
    authors: list[str]
    categories: list[str]
    favorited_at: datetime


class FavoritesListPublic(BaseModel):
    data: list[FavoriteArticlePublic]
    count: int


class RatingUpsert(BaseModel):
    value: int = Field(ge=1, le=5)


class RatingSummaryPublic(BaseModel):
    article_id: int
    average_rating: float | None
    ratings_count: int
    user_rating: int | None = None


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class CommentUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class CommentPublic(BaseModel):
    id: int
    article_id: int
    content: str
    author_name: str
    created_at: datetime
    updated_at: datetime | None = None
    is_own: bool = False


class NotePublic(BaseModel):
    article_id: int
    content: str
    updated_at: datetime | None = None


class NoteUpsert(BaseModel):
    content: str = Field(max_length=8000)


class FollowTargetPublic(BaseModel):
    target_type: str
    target_id: int
    label: str
    is_following: bool = False


class FollowCreate(BaseModel):
    target_type: str = Field(max_length=20)
    target_id: int = Field(ge=1)


class FollowStatusPublic(BaseModel):
    target_type: str
    target_id: int
    is_following: bool


class FollowPublic(BaseModel):
    target_type: str
    target_id: int
    label: str
    created_at: datetime


class FollowsListPublic(BaseModel):
    data: list[FollowPublic]
    count: int
