# Requirements

## Overview

Apex Gadgets Customer Support Agent is an agentic RAG customer support system for Apex Gadgets, an ecommerce company that sells mobile phones and laptops. Customers chat with it to ask about products and policies, place orders, check order status, and manage support tickets.

A supervisor agent reads each incoming message and routes it to the right specialist. A specialist either retrieves and reasons over product knowledge, or carries out an action that changes data, like placing an order or filing a ticket. Those actions only happen after the customer explicitly confirms.

## Functional requirements

### FR1. Product and policy Q&A

The system answers questions about products and store policies using retrieval augmented generation over a Pinecone vector store. Retrieval is agentic. The results are graded for relevance, and if they are weak the query is rewritten and tried again. Only after that does the system generate an answer.

### FR2. Persistent session memory

Conversation state survives page refreshes. LangGraph's Postgres checkpointer (`AsyncPostgresSaver`) stores it, keyed by a `thread_id` kept in a cookie. A "Clear Chat" action deletes that thread's checkpoints from Postgres and resets the frontend state.

### FR3. Streaming responses

Responses stream to the frontend over SSE, starting from the moment the model begins generating and continuing all the way to the chat widget.

### FR4. Order placement

The agent collects the customer's name, email, phone number, home address and the product they want, all through conversation. It then shows a confirmation summary and waits for the customer to explicitly confirm before writing anything. Once confirmed, it saves the order to Postgres, sends a confirmation email, and tells the customer the order went through.

### FR5. Order status check

Given an order ID or an email, the agent reports the current status of the order. If the order is delayed, it also gives the reason.

### FR6. Support ticket creation

The agent collects the customer's name, email and a description of the issue, then confirms with them. After they confirm, it saves a ticket with an auto generated ticket number to Postgres and sends a confirmation email.

### FR7. Support ticket status check

Given a ticket number, the agent reports whether the ticket is resolved or still pending.

## Non functional requirements

### Performance

Replies should feel like a conversation, not a batch job. Users should see the answer start appearing as it is generated instead of waiting for the whole thing. This applies to messages that trigger a document search or a tool call too, not just simple ones.

### Reliability and data integrity

Orders and tickets in the database are the source of truth, so they must never be lost or saved twice. The confirmation email is sent only after the database write succeeds. It never goes out before the write, and it never replaces it.

### Security

No secrets are committed to the repository. That covers API keys, OAuth credentials and database URLs. All external credentials are loaded from environment variables. The database write and the email for any order or ticket sit behind an explicit human confirmation step, so the agent never does either one on its own.

### Scalability

The backend keeps no session state in memory. Everything lives in Postgres, so the backend can run as several replicas behind a load balancer without sticky sessions.

### Maintainability

Each specialist agent, its tools and its prompts live in their own modules. Changing how one specialist behaves does not mean touching the others.
