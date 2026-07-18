"""
Run once after connecting to a fresh Supabase Postgres database.
Enables the pgvector extension and creates all tables defined in models.py.

Usage:
    python db_init.py
"""
import asyncio

from sqlalchemy import text

from db import engine, Base
import models  # noqa: F401 - import ensures all models are registered on Base.metadata


async def init_db():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialized: pgvector enabled, all tables created.")


if __name__ == "__main__":
    asyncio.run(init_db())