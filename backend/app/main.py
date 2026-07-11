import asyncio
import sys

from fastapi import FastAPI

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

app = FastAPI(title="Apex Gadgets Support Agent")


@app.get("/health")
def health_check():
    return {"status": "ok"}
