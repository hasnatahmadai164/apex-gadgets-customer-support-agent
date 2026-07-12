import asyncio
import sys
from contextlib import asynccontextmanager

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agents.supervisor import build_supervisor_graph
from app.api.chat import router as chat_router
from app.core.checkpointer import get_checkpointer


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with get_checkpointer() as checkpointer:
        await checkpointer.setup()
        app.state.checkpointer = checkpointer
        app.state.graph = build_supervisor_graph(checkpointer=checkpointer)
        yield


app = FastAPI(title="Apex Gadgets Support Agent", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}