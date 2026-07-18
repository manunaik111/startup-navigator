import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from models import ArticleEmbedding, Article
from rag.embed import chunk_text, embed_batch


async def index_article(db: AsyncSession, article: Article) -> None:
    """
    (Re)generates embeddings for an article's content and stores them.
    Called after an article is created or its content is updated.
    """
    # Remove old chunks first (handles both re-indexing on update and fresh indexing)
    await db.execute(delete(ArticleEmbedding).where(ArticleEmbedding.article_id == article.id))

    chunks = chunk_text(article.content)
    vectors = embed_batch(chunks)

    for chunk, vector in zip(chunks, vectors):
        db.add(ArticleEmbedding(article_id=article.id, chunk_text=chunk, embedding=vector))

    await db.commit()


async def delete_article_index(db: AsyncSession, article_id: uuid.UUID) -> None:
    """Explicit cleanup helper (cascade delete on the FK already handles this on article delete)."""
    await db.execute(delete(ArticleEmbedding).where(ArticleEmbedding.article_id == article_id))
    await db.commit()