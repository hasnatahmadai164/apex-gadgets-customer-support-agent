from contextlib import asynccontextmanager

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.core.config import get_settings


def _psycopg_dsn() -> str:
    settings = get_settings()
    return settings.database_url.replace("postgresql+psycopg://", "postgresql://", 1)


@asynccontextmanager
async def get_checkpointer():
    async with AsyncPostgresSaver.from_conn_string(_psycopg_dsn()) as checkpointer:
        yield checkpointer


async def delete_thread(checkpointer: AsyncPostgresSaver, thread_id: str) -> None:
    await checkpointer.adelete_thread(thread_id)
