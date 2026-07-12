from fastapi.testclient import TestClient

from app.main import app


def test_health_check():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


def test_chat_clear_without_existing_thread():
    with TestClient(app) as client:
        response = client.post("/chat/clear")
        assert response.status_code == 200
        assert response.json() == {"status": "cleared"}


def test_chat_clear_deletes_existing_thread(monkeypatch):
    calls = []

    async def fake_delete_thread(checkpointer, thread_id):
        calls.append(thread_id)

    monkeypatch.setattr("app.api.chat.delete_thread", fake_delete_thread)

    with TestClient(app) as client:
        client.cookies.set("thread_id", "some-thread-id")
        response = client.post("/chat/clear")
        assert response.status_code == 200
        assert calls == ["some-thread-id"]


def test_chat_streams_sse_formatted_tokens():
    class FakeChunk:
        def __init__(self, content):
            self.content = content

    async def fake_astream(*args, **kwargs):
        for text in ["Hello", " world"]:
            yield FakeChunk(text), {}

    with TestClient(app) as client:
        client.app.state.graph.astream = fake_astream
        response = client.post("/chat", json={"message": "hi"})

        assert response.status_code == 200
        assert "data: " in response.text
        assert '{"content": "Hello"}' in response.text
        assert '{"content": " world"}' in response.text
        assert "data: [DONE]" in response.text
        assert "thread_id" in response.cookies


def test_chat_reuses_existing_thread_id_cookie():
    async def fake_astream(*args, **kwargs):
        return
        yield

    with TestClient(app) as client:
        client.app.state.graph.astream = fake_astream
        client.cookies.set("thread_id", "existing-thread")
        response = client.post("/chat", json={"message": "hi"})

        assert response.cookies["thread_id"] == "existing-thread"
