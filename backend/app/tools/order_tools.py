from sqlalchemy import select

from app.db.models import Order
from app.db.session import async_session_factory


async def create_order(
    customer_name: str,
    email: str,
    phone_number: str,
    home_address: str,
    product: str,
) -> str:
    """Create a new order after the customer has explicitly confirmed the order summary.

    Only call this after the customer has seen a full summary of their order
    (name, email, phone, address, product) and explicitly confirmed it.
    """
    async with async_session_factory() as session:
        order = Order(
            customer_name=customer_name,
            email=email,
            phone_number=phone_number,
            home_address=home_address,
            product=product,
            status="processing",
        )
        session.add(order)
        await session.commit()
        await session.refresh(order)

    return f"Order #{order.id} placed for {product}, status: {order.status}."


async def get_order_status(order_id: int | None = None, email: str | None = None) -> str:
    """Look up an order's status by order ID or by customer email.

    If both are given, order_id takes priority. If searching by email and
    multiple orders exist, the most recent one is returned.
    """
    if order_id is None and email is None:
        return "Please provide either an order ID or an email address to look up the order."

    async with async_session_factory() as session:
        if order_id is not None:
            result = await session.execute(select(Order).where(Order.id == order_id))
        else:
            result = await session.execute(
                select(Order).where(Order.email == email).order_by(Order.created_at.desc())
            )

        order = result.scalars().first()

    if order is None:
        return "No matching order was found."

    if order.notes:
        return f"Order #{order.id} for {order.product} is {order.status}. {order.notes}"

    return f"Order #{order.id} for {order.product} is {order.status}."
