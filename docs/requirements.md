# Requirements

## Overview

Apex Gadgets Customer Support Agent is an agentic RAG customer support system for
Apex Gadgets, an e-commerce company selling mobile phones and laptops.
It handles product and policy Q&A, order placement, order status
lookups and support ticket management through a conversational
interface. A supervisor agent routes each incoming message to the
appropriate specialist, which either retrieves and reasons over product
knowledge or executes a state-changing action (placing an order, filing
a ticket) only after explicit user confirmation.

## Functional Requirements

**FR1   Product and Policy Q&A**
The system answers questions about products and store policies using
retrieval-augmented generation over a Pinecone vector store. Retrieval
is agentic: results are graded for relevance, the query is rewritten
and retried if the results are weak and only then is an answer
generated.

**FR2   Persistent Session Memory**
Conversation state persists across page refreshes via LangGraph's
PostgresSaver, keyed by a thread_id stored in a cookie. A "Clear Chat"
action deletes that thread's checkpoints from Postgres and resets the
frontend state.

**FR3   Streaming Responses**
Responses stream to the frontend over SSE, from the point the model
starts generating through to the widget.

**FR4   Order Placement**
The agent conversationally collects customer name, email, phone number,
home address and desired product, presents a confirmation summary and
waits for explicit user confirmation before writing anything. On
confirmation, it writes an order record to Postgres, sends a
confirmation email and replies with confirmation to the user.

**FR5   Order Status Check**
Given an order ID or email, the agent reports current order status,
including a reason if the order is delayed.

**FR6   Support Ticket Creation**
The agent conversationally collects name, email and issue description,
confirms with the user, then on confirmation writes a ticket record
with an auto-generated ticket number to Postgres and sends a
confirmation email.

**FR7   Support Ticket Status Check**
Given a ticket number, the agent reports whether the ticket is resolved
or pending.

## Non-Functional Requirements

**Performance**
Time to first streamed token should feel conversational, not batch —
users should see output beginning within roughly 1–2 seconds of
sending a message, even when that message triggers a retrieval or
tool-calling path.

**Reliability and Data Integrity**
Order and ticket writes are the system's source of truth and must not
be lost or duplicated. The confirmation email is sent only after the
database write succeeds, never before and never as a substitute for
it.

**Security**
No secrets (API keys, OAuth credentials, database URLs) are committed
to the repository. All external credentials are loaded from
environment variables. The database write and email send for any
order or ticket are gated behind an explicit human confirmation step —
the agent never executes either autonomously.

**Scalability**
The backend is stateless per request — all session state lives in
Postgres, not in memory so it can run multiple replicas behind a
load balancer without sticky sessions.

**Maintainability**
Each specialist agent, its tools, and its prompts are isolated in
their own modules so that a change to one specialist's behavior
doesn't require touching the others.
