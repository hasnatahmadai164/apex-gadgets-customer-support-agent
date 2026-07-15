from typing import Literal

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

from app.agents.orders_agent import orders_agent
from app.agents.rag_agent import answer_question
from app.agents.tickets_agent import tickets_agent
from app.core.config import get_settings
from app.core.graph_state import GraphState
from app.core.llm_clients import get_chat_model


class RouteDecision(BaseModel):
    route: Literal["rag", "orders", "tickets"] = Field(
        description="Which specialist should handle this customer message"
    )


def router_node(state: GraphState) -> dict:
    settings = get_settings()
    llm = get_chat_model(settings.azure_deployment_router).with_structured_output(RouteDecision)

    recent_messages = state["messages"][-6:]
    transcript = "\n".join(f"{message.type}: {message.content}" for message in recent_messages)
    prompt = (
        "Classify the customer's most recent message into exactly one category, "
        "using the conversation so far for context (a short reply like 'yes' "
        "usually continues whatever was being discussed):\n"
        "- rag: questions about products, prices, specs, shipping, returns or warranty\n"
        "- orders: placing a new order or checking an existing order's status\n"
        "- tickets: reporting a problem or checking a support ticket's status\n\n"
        f"Conversation:\n{transcript}"
    )

    result = llm.invoke(prompt)
    return {"route": result.route}


async def rag_node(state: GraphState) -> dict:
    question = state["messages"][-1].content
    answer = await answer_question(question)
    return {"messages": [AIMessage(content=answer)]}


async def orders_node(state: GraphState) -> dict:
    result = await orders_agent.ainvoke({"messages": state["messages"]})
    return {"messages": [result["messages"][-1]]}


async def tickets_node(state: GraphState) -> dict:
    result = await tickets_agent.ainvoke({"messages": state["messages"]})
    return {"messages": [result["messages"][-1]]}


def route_from_supervisor(state: GraphState) -> str:
    return state["route"]


def build_supervisor_graph(checkpointer=None):
    builder = StateGraph(GraphState)
    builder.add_node("router", router_node)
    builder.add_node("rag", rag_node)
    builder.add_node("orders", orders_node)
    builder.add_node("tickets", tickets_node)

    builder.add_edge(START, "router")
    builder.add_conditional_edges(
        "router",
        route_from_supervisor,
        {"rag": "rag", "orders": "orders", "tickets": "tickets"},
    )
    builder.add_edge("rag", END)
    builder.add_edge("orders", END)
    builder.add_edge("tickets", END)

    return builder.compile(checkpointer=checkpointer)


supervisor_graph = build_supervisor_graph()


async def handle_message(text: str) -> str:
    result = await supervisor_graph.ainvoke({"messages": [HumanMessage(content=text)], "route": ""})
    return result["messages"][-1].content