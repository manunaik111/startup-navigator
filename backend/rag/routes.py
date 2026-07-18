from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models import User, SearchHistory
from schemas import SearchRequest, SearchResponse, SearchSource
from auth.dependencies import get_current_user
from rag.search import retrieve_relevant_chunks
from rag.generate import generate_answer

router = APIRouter()


@router.post("", response_model=SearchResponse)
async def ai_search(
    payload: SearchRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chunks = await retrieve_relevant_chunks(db, payload.query, top_k=5)
    answer = generate_answer(payload.query, chunks)

    # Deduplicate article ids while preserving order (a single article can supply multiple chunks)
    seen = set()
    unique_sources = []
    for chunk in chunks:
        if chunk.article_id not in seen:
            seen.add(chunk.article_id)
            unique_sources.append(chunk)

    history_entry = SearchHistory(
        user_id=user.id,
        query=payload.query,
        answer=answer,
        source_article_ids=[c.article_id for c in unique_sources],
    )
    db.add(history_entry)
    await db.commit()

    return SearchResponse(
        answer=answer,
        sources=[
            SearchSource(article_id=c.article_id, article_title=c.article_title, similarity=round(c.similarity, 3))
            for c in unique_sources
        ],
    )