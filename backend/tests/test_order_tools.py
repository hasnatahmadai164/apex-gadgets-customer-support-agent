from app.tools.order_tools import create_order, get_order_status


async def test_create_order_and_look_up_by_email():
    result = await create_order(
        "Test Customer", "test.customer@example.com", "555-0000", "1 Test St", "Galaxy S25"
    )
    assert "Order #" in result

    status = await get_order_status(email="test.customer@example.com")
    assert "Galaxy S25" in status


async def test_get_order_status_returns_message_for_missing_order():
    status = await get_order_status(order_id=987654321)
    assert "No matching order" in status


async def test_get_order_status_requires_id_or_email():
    status = await get_order_status()
    assert "provide either" in status.lower()
