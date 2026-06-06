import uuid
from datetime import datetime, timezone

from pydantic import EmailStr, field_validator
from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.appearance import (
    ALLOWED_APPEARANCE_MODES,
    ALLOWED_COLOR_THEMES,
    DEFAULT_APPEARANCE_MODE,
    DEFAULT_COLOR_THEME,
)


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)
    color_theme: str | None = Field(default=None, max_length=32)
    appearance_mode: str | None = Field(default=None, max_length=16)

    @field_validator("color_theme")
    @classmethod
    def validate_color_theme(cls, value: str | None) -> str | None:
        if value is not None and value not in ALLOWED_COLOR_THEMES:
            raise ValueError(
                f"color_theme debe ser uno de: {', '.join(sorted(ALLOWED_COLOR_THEMES))}"
            )
        return value

    @field_validator("appearance_mode")
    @classmethod
    def validate_appearance_mode(cls, value: str | None) -> str | None:
        if value is not None and value not in ALLOWED_APPEARANCE_MODES:
            raise ValueError(
                "appearance_mode debe ser light, dark o system"
            )
        return value


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    color_theme: str = Field(default=DEFAULT_COLOR_THEME, max_length=32)
    appearance_mode: str = Field(default=DEFAULT_APPEARANCE_MODE, max_length=16)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None
    color_theme: str = DEFAULT_COLOR_THEME
    appearance_mode: str = DEFAULT_APPEARANCE_MODE


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int

# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
