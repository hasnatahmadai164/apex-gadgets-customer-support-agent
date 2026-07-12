import asyncio
import uuid

from sqlalchemy import select

from app.db.models import SupportTicket
from app.db.session import async_session_factory
from app.tools.email_tools import send_ticket_confirmation_email


def _generate_ticket_number() -> str:
    return f"TKT-{uuid.uuid4().hex[:8].upper()}"


async def create_support_ticket(name: str, email: str, issue_description: str) -> str:
    """Create a new support ticket after the customer has explicitly confirmed the summary.

    Only call this after the customer has seen a summary of their name, email,
    and issue description and explicitly confirmed it.
    """
    async with async_session_factory() as session:
        ticket = SupportTicket(
            ticket_number=_generate_ticket_number(),
            name=name,
            email=email,
            issue_description=issue_description,
            status="pending",
        )
        session.add(ticket)
        await session.commit()
        await session.refresh(ticket)

    try:
        await asyncio.to_thread(send_ticket_confirmation_email, email, ticket.ticket_number)
        email_status = "A confirmation email has been sent."
    except Exception:
        email_status = "The ticket was created, but the confirmation email could not be sent."

    return f"Support ticket {ticket.ticket_number} created, status: {ticket.status}. {email_status}"


async def get_ticket_status(ticket_number: str) -> str:
    """Look up a support ticket's status by its ticket number."""
    async with async_session_factory() as session:
        result = await session.execute(
            select(SupportTicket).where(SupportTicket.ticket_number == ticket_number)
        )
        ticket = result.scalars().first()

    if ticket is None:
        return "No ticket was found with that number."

    return f"Ticket {ticket.ticket_number} is {ticket.status}."
