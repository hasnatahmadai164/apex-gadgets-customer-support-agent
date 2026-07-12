from app.tools.ticket_tools import create_support_ticket, get_ticket_status


async def test_create_ticket_and_look_up_status():
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
