import json
import uuid

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse
from langchain_core.messages import HumanMessage
from pydantic import BaseModel

from app.core.checkpointer import delete_thread

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def chat(request: Request, body: ChatRequest):
    thread_id = request.cookies.get("thread_id") or str(uuid.uuid4())
    graph = request.app.state.graph
    config = {"configurable": {"thread_id": thread_id}}

    async def event_stream():
        async for message_chunk, metadata in graph.astream(
            {"messages": [HumanMessage(content=body.message)], "route": ""},
            config,
            stream_mode="messages",
        ):
            if metadata.get("langgraph_node") == "router":
                continue
            if message_chunk.content:
                yield f"data: {json.dumps({'content': message_chunk.content})}\n\n"
        yield "data: [DONE]\n\n"

    response = StreamingResponse(event_stream(), media_type="text/event-stream")
    response.set_cookie(key="thread_id", value=thread_id, httponly=True)
    return response


@router.post("/chat/clear")
async def clear_chat(request: Request):
    thread_id = request.cookies.get("thread_id")
    response = JSONResponse({"status": "cleared"})
    if thread_id:
        checkpointer = request.app.state.checkpointer
        await delete_thread(checkpointer, thread_id)
    response.delete_cookie("thread_id")
    return response