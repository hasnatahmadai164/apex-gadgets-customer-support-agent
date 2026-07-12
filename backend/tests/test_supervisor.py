from unittest.mock import AsyncMock

from langchain_core.messages import AIMessage, HumanMessage

from app.agents.supervisor import orders_node, rag_node, route_from_supervisor, tickets_node

def test_route_from_supervisor_returns_the_stored_route():
    assert route_from_supervisor({"route": "rag"}) == "rag"
    assert route_from_supervisor({"route": "orders"}) == "orders"
    assert route_from_supervisor({"route": "tickets"}) == "tickets"


async def test_orders_node_delegates_to_the_orders_agent(monkeypatch):
    fake_response = {"messages": [HumanMessage(content="hi"), AIMessage(content="order agent reply")]}
    monkeypatch.setattr(
        "app.agents.supervisor.orders_agent.ainvoke",
        AsyncMock(return_value=fake_response),
    )
    state = {"messages": [HumanMessage(content="I want to order a phone")], "route": "orders"}
    result = await orders_node(state)
    assert result["messages"][0].content == "order agent reply"


async def test_tickets_node_delegates_to_the_tickets_agent(monkeypatch):
    fake_response = {"messages": [HumanMessage(content="hi"), AIMessage(content="ticket agent reply")]}
    monkeypatch.setattr(
        "app.agents.supervisor.tickets_agent.ainvoke",
        AsyncMock(return_value=fake_response),
    )
    state = {"messages": [HumanMessage(content="my item is broken")], "route": "tickets"}
    result = await tickets_node(state)
    assert result["messages"][0].content == "ticket agent reply"


def test_rag_node_wraps_the_rag_agent_answer(monkeypatch):
    monkeypatch.setattr(
        "app.agents.supervisor.answer_question",
        lambda question: "canned answer",
    )
    state = {"messages": [HumanMessage(content="what is the delivery time?")], "route": "rag"}
    result = rag_node(state)
    assert result["messages"][0].content == "canned answer"