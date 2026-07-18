from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models import User, Article, Resource, SearchHistory
from schemas import AdminStats, CategoryCount
from auth.dependencies import require_admin

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar_one()
    total_articles = (await db.execute(select(func.count()).select_from(Article))).scalar_one()
    total_resources = (await db.execute(select(func.count()).select_from(Resource))).scalar_one()
    total_searches = (await db.execute(select(func.count()).select_from(SearchHistory))).scalar_one()

    category_rows = await db.execute(
        select(Article.category, func.count()).group_by(Article.category)
    )
    articles_by_category = [CategoryCount(category=cat, count=count) for cat, count in category_rows.all()]

    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    searches_last_7_days = (
        await db.execute(
            select(func.count()).select_from(SearchHistory).where(SearchHistory.created_at >= seven_days_ago)
        )
    ).scalar_one()

    return AdminStats(
        total_users=total_users,
        total_articles=total_articles,
        total_resources=total_resources,
        total_searches=total_searches,
        articles_by_category=articles_by_category,
        searches_last_7_days=searches_last_7_days,
    )