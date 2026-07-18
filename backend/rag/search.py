import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import ArticleEmbedding, Article
from rag.embed import embed_text


@dataclass
class RetrievedChunk:
    article_id: uuid.UUID
    article_title: str
    chunk_text: str
    similarity: float


async def retrieve_relevant_chunks(
    db: AsyncSession, query: str, top_k: int = 5
) -> list[RetrievedChunk]:
    """
    Embeds the user's query and finds the top_k most similar article chunks
    using pgvector cosine distance (<=> operator).
    """
    query_vector = embed_text(query)

    # cosine_distance = 1 - cosine_similarity, so we order ascending (closest first)
    distance = ArticleEmbedding.embedding.cosine_distance(query_vector)

    stmt = (
        select(ArticleEmbedding, Article.title, distance.label("distance"))
        .join(Article, Article.id == ArticleEmbedding.article_id)
        .order_by(distance)
        .limit(top_k)
    )

    result = await db.execute(stmt)
    rows = result.all()

    return [
        RetrievedChunk(
            article_id=chunk.article_id,
            article_title=title,
            chunk_text=chunk.chunk_text,
            similarity=1 - dist,
        )
        for chunk, title, dist in rows
    ]