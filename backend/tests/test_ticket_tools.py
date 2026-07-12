from app.tools.ticket_tools import create_support_ticket, get_ticket_status


async def test_create_ticket_and_look_up_status(monkeypatch):
    monkeypatch.setattr("app.tools.ticket_tools.send_ticket_confirmation_email", lambda *a, **k: None)

    result = await create_support_ticket(
        "Test Customer", "test.customer@example.com", "Screen is cracked"
    )
    assert "Support ticket TKT-" in result

    ticket_number = result.split()[2]
    status = await get_ticket_status(ticket_number)
    assert "pending" in status.lower()


async def test_get_ticket_status_returns_message_for_missing_ticket():
    status = await get_ticket_status("TKT-DOESNOTEXIST")
    assert "No ticket was found" in status


async def test_create_ticket_succeeds_even_if_email_sending_fails(monkeypatch):
    def _raise(*args, **kwargs):
        raise RuntimeError("email service unavailable")

    monkeypatch.setattr("app.tools.ticket_tools.send_ticket_confirmation_email", _raise)

    result = await create_support_ticket("Test Customer", "fails@example.com", "Won't turn on")
    assert "Support ticket TKT-" in result
    assert "could not be sent" in result
    