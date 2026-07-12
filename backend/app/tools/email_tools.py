from pathlib import Path

from app.core.config import get_settings

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def _build_client_config() -> dict:
    settings = get_settings()
    return {
        "installed": {
            "client_id": settings.gmail_client_id,
            "client_secret": settings.gmail_client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost"],
        }
    }


def _get_credentials():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow

    settings = get_settings()
    token_path = Path(settings.gmail_token_path or "./token.json")

    creds = None
    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_config(_build_client_config(), SCOPES)
            creds = flow.run_local_server(port=0)
        token_path.write_text(creds.to_json())

    return creds


def _send_email(to: str, subject: str, body: str) -> None:
    import base64
    from email.mime.text import MIMEText

    from googleapiclient.discovery import build

    creds = _get_credentials()
    service = build("gmail", "v1", credentials=creds)

    message = MIMEText(body)
    message["to"] = to
    message["subject"] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

    service.users().messages().send(userId="me", body={"raw": raw}).execute()


def send_order_confirmation_email(to: str, order_id: int, product: str) -> None:
    subject = f"Apex Gadgets - Order Confirmation #{order_id}"
    body = (
        f"Hi,\n\n"
        f"Your order for {product} has been placed successfully.\n"
        f"Order ID: {order_id}\n\n"
        f"We'll notify you when it ships.\n\n"
        f"Thanks for shopping with Apex Gadgets."
    )
    _send_email(to, subject, body)


def send_ticket_confirmation_email(to: str, ticket_number: str) -> None:
    subject = f"Apex Gadgets - Support Ticket {ticket_number}"
    body = (
        f"Hi,\n\n"
        f"Your support ticket has been created.\n"
        f"Ticket number: {ticket_number}\n\n"
        f"Our team will follow up with you shortly.\n\n"
        f"Thanks for your patience."
    )
    _send_email(to, subject, body)
    