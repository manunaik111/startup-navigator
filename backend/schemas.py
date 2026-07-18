import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth ----------

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: EmailStr
    role: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
# ---------- Articles ----------

class ArticleCreate(BaseModel):
    title: str
    category: str
    content: str
    summary: str | None = None


class ArticleUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    content: str | None = None
    summary: str | None = None


class ArticleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    category: str
    content: str
    summary: str | None
    created_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
# ---------- AI Search ----------

class SearchRequest(BaseModel):
    query: str


class SearchSource(BaseModel):
    article_id: uuid.UUID
    article_title: str
    similarity: float


class SearchResponse(BaseModel):
    answer: str
    sources: list[SearchSource]


class SearchHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    query: str
    answer: str
    source_article_ids: list[uuid.UUID] | None
    created_at: datetime
# ---------- Admin dashboard ----------

class CategoryCount(BaseModel):
    category: str
    count: int


class AdminStats(BaseModel):
    total_users: int
    total_articles: int
    total_resources: int
    total_searches: int
    articles_by_category: list[CategoryCount]
    searches_last_7_days: int
# ---------- Resources ----------

class ResourceCreate(BaseModel):
    title: str
    url: str | None = None
    description: str | None = None
    category: str | None = None


class ResourceUpdate(BaseModel):
    title: str | None = None
    url: str | None = None
    description: str | None = None
    category: str | None = None


class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    url: str | None
    description: str | None
    category: str | None
    created_by: uuid.UUID | None
    created_at: datetime


# ---------- Contact ----------

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    message: str


class ContactMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str | None
    email: str | None
    message: str | None
    created_at: datetime