from langchain_core.messages import HumanMessage
from langgraph.graph import END, START, StateGraph

from app.core.checkpointer import delete_thread, get_checkpointer
from app.core.graph_state import GraphState


def _echo_node(state):
    return {"messages": [HumanMessage(content="ack")]}


def _build_echo_graph(checkpointer):
    builder = StateGraph(GraphState)
    builder.add_node("echo", _echo_node)
    builder.add_edge(START, "echo")
    builder.add_edge("echo", END)
    return builder.compile(checkpointer=checkpointer)


async def test_state_persists_across_turns_on_the_same_thread():
    async with get_checkpointer() as checkpointer:
        await checkpointer.setup()
        graph = _build_echo_graph(checkpointer)
        config = {"configurable": {"thread_id": "test-persistence"}}

        await graph.ainvoke({"messages": [HumanMessage(content="first")], "route": ""}, config)
        result = await graph.ainvoke({"messages": [HumanMessage(content="second")], "route": ""}, config)

        assert len(result["messages"]) == 4


async def test_threads_are_isolated_from_each_other():
    async with get_checkpointer() as checkpointer:
        await checkpointer.setup()
        graph = _build_echo_graph(checkpointer)
        config_a = {"configurable": {"thread_id": "test-isolation-a"}}
        config_b = {"configurable": {"thread_id": "test-isolation-b"}}

        await graph.ainvoke({"messages": [HumanMessage(content="on thread a")], "route": ""}, config_a)
        result_b = await graph.ainvoke(
            {"messages": [HumanMessage(content="on thread b")], "route": ""}, config_b
        )

        assert len(result_b["messages"]) == 2


async def test_delete_thread_clears_persisted_state():
    async with get_checkpointer() as checkpointer:
        await checkpointer.setup()
        graph = _build_echo_graph(checkpointer)
        config = {"configurable": {"thread_id": "test-deletion"}}

        await graph.ainvoke({"messages": [HumanMessage(content="first")], "route": ""}, config)
        await delete_thread(checkpointer, "test-deletion")
        result = await graph.ainvoke({"messages": [HumanMessage(content="fresh")], "route": ""}, config)

        assert len(result["messages"]) == 2
