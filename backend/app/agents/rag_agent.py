from typing import TypedDict

from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.llm_clients import get_chat_model
from app.tools.pinecone_tools import retrieve_chunks

MAX_REWRITES = 1


class RAGState(TypedDict):
    question: str
    search_query: str
    retrieved_chunks: list[dict]
    is_relevant: bool
    rewrite_count: int
    answer: str


class GradeResult(BaseModel):
    is_relevant: bool = Field(
        description="True if the retrieved context has enough information to answer the question"
    )


class RewrittenQuery(BaseModel):
    query: str = Field(
        description="A rewritten version of the search query, optimized for vector retrieval"
    )


def retrieve_node(state: RAGState) -> dict:
    chunks = retrieve_chunks(state["search_query"])
    return {"retrieved_chunks": chunks}


def grade_node(state: RAGState) -> dict:
    settings = get_settings()
    llm = get_chat_model(settings.azure_deployment_rag).with_structured_output(GradeResult)

    context = "\n\n".join(chunk["text"] for chunk in state["retrieved_chunks"])
    prompt = (
        f"Question: {state['question']}\n\n"
        f"Retrieved context:\n{context}\n\n"
        "Does the context above contain enough information to answer the question?"
    )

    result = llm.invoke(prompt)
    return {"is_relevant": result.is_relevant}


def rewrite_node(state: RAGState) -> dict:
    settings = get_settings()
    llm = get_chat_model(settings.azure_deployment_rag).with_structured_output(RewrittenQuery)

    prompt = (
        "The following search query did not retrieve enough relevant information "
        "to answer the customer's question.\n\n"
        f"Original question: {state['question']}\n"
        f"Search query used: {state['search_query']}\n\n"
        "Rewrite the search query to be more likely to retrieve relevant results "
        "from a product and policy knowledge base."
    )

    result = llm.invoke(prompt)
    return {
        "search_query": result.query,
        "rewrite_count": state["rewrite_count"] + 1,
    }


def generate_node(state: RAGState) -> dict:
    settings = get_settings()
    llm = get_chat_model(settings.azure_deployment_rag)

    context = "\n\n".join(chunk["text"] for chunk in state["retrieved_chunks"])
    prompt = (
        "You are a customer support assistant for Apex Gadgets, an online electronics "
        "retailer. Answer the customer's question using only the context below. "
        "If the context does not contain enough information to answer, say so honestly "
        "rather than guessing.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {state['question']}"
    )

    result = llm.invoke(prompt)
    return {"answer": result.content}


def route_after_grade(state: RAGState) -> str:
    if state["is_relevant"]:
        return "generate"
    if state["rewrite_count"] < MAX_REWRITES:
        return "rewrite"
    return "generate"


def build_rag_graph():
    builder = StateGraph(RAGState)
    builder.add_node("retrieve", retrieve_node)
    builder.add_node("grade", grade_node)
    builder.add_node("rewrite", rewrite_node)
    builder.add_node("generate", generate_node)

    builder.add_edge(START, "retrieve")
    builder.add_edge("retrieve", "grade")
    builder.add_conditional_edges(
        "grade",
        route_after_grade,
        {"rewrite": "rewrite", "generate": "generate"},
    )
    builder.add_edge("rewrite", "retrieve")
    builder.add_edge("generate", END)

    return builder.compile()


rag_graph = build_rag_graph()


async def answer_question(question: str) -> str:
    result = await rag_graph.ainvoke(
        {
            "question": question,
            "search_query": question,
            "retrieved_chunks": [],
            "is_relevant": False,
            "rewrite_count": 0,
            "answer": "",
        }
    )
    return result["answer"]