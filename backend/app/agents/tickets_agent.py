from langchain.agents import create_agent

from app.core.config import get_settings
from app.core.llm_clients import get_chat_model
from app.tools.ticket_tools import create_support_ticket, get_ticket_status

TICKETS_SYSTEM_PROMPT = (
    "You are the support ticket specialist for Apex Gadgets, an online electronics "
    "retailer. You help customers file support tickets and check the status of "
    "existing tickets.\n\n"
    "To file a ticket, collect the customer's name, email, and a description of "
    "their issue. Once you have all three details, show the customer a summary and "
    "ask them to confirm it. Only call create_support_ticket after the customer has "
    "explicitly confirmed the summary in their own words. Never call "
    "create_support_ticket with incomplete or unconfirmed information.\n\n"
    "To check a ticket's status, ask for the ticket number, then call "
    "get_ticket_status."
)


def build_tickets_agent():
    settings = get_settings()
    model = get_chat_model(settings.azure_deployment_orders_tickets)
    return create_agent(
        model,
        tools=[create_support_ticket, get_ticket_status],
        system_prompt=TICKETS_SYSTEM_PROMPT,
    )


tickets_agent = build_tickets_agent()
