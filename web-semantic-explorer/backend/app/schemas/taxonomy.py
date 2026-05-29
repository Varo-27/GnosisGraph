from pydantic import BaseModel


class AuthorOption(BaseModel):
    name: str


class AuthorsListResponse(BaseModel):
    authors: list[AuthorOption]
