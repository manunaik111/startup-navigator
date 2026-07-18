import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models import Article, User
from schemas import ArticleCreate, ArticleUpdate, ArticleOut
from auth.dependencies import require_admin

router = APIRouter()


@router.get("", response_model=list[ArticleOut])
async def list_articles(category: str | None = None, db: AsyncSession = Depends(get_db)):
    query = select(Article).order_by(Article.created_at.desc())
    if category:
        query = query.where(Article.category == category)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{article_id}", response_model=ArticleOut)
async def get_article(article_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return article


@router.post("", response_model=ArticleOut, status_code=status.HTTP_201_CREATED)
async def create_article(
    payload: ArticleCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    article = Article(
        title=payload.title,
        category=payload.category,
        content=payload.content,
        summary=payload.summary,
        created_by=admin.id,
    )
    db.add(article)
    await db.commit()
    await db.refresh(article)

    # NOTE: once the RAG module is built (step 5), embedding generation for this
    # article's content will be triggered here so it becomes searchable immediately.

    return article


@router.put("/{article_id}", response_model=ArticleOut)
async def update_article(
    article_id: uuid.UUID,
    payload: ArticleUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(article, field, value)

    await db.commit()
    await db.refresh(article)

    # NOTE: if content changed, embeddings should be regenerated here (step 5).

    return article


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    await db.delete(article)  # cascades to article_embeddings
    await db.commit()