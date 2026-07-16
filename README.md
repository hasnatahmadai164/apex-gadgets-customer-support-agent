# Apex Gadgets Support Agent

An agentic RAG customer support system for Apex Gadgets, a fictional
e-commerce store selling phones and laptops. A supervisor agent routes
each customer message to one of three specialists — product/policy
Q&A, order management, or support tickets — and hands off to a human
confirmation step before anything gets written to the database or
emailed to a customer.

Built as a full end-to-end project: ingestion pipeline, agentic
retrieval loop, tool-calling agents, persistent conversation memory,
a streaming chat API, and a real storefront frontend to put it in
context.

## What it does

- **Product and policy Q&A** — retrieval-augmented generation over a
  Pinecone vector store, with an agentic retrieve → grade → rewrite →
  generate loop rather than naive single-shot retrieval.
- **Order placement** — collects customer details conversationally,
  shows a confirmation summary, and only writes to the database and
  sends a confirmation email after the customer explicitly confirms.
- **Order status lookups** — by order ID or email.
- **Support ticket creation and status checks** — same
  collect-confirm-execute pattern as orders, with an auto-generated
  ticket number.
- **Persistent memory** — full conversation history is checkpointed to
  Postgres per browser session and survives page refreshes and server
  restarts.
- **Streaming responses** — answers stream token-by-token over SSE
  into the chat widget.

## Tech stack

**Backend:** FastAPI, LangGraph, LangChain, Pinecone, PostgreSQL
(SQLAlchemy 2.0 async + Alembic), Azure OpenAI (Foundry, v1 API),
Gmail API (OAuth)

**Frontend:** Next.js (App Router, Turbopack), TypeScript, Tailwind
CSS, shadcn/ui, Framer Motion

**Infrastructure:** Docker, Docker Compose, Azure Container Apps,
Azure Database for PostgreSQL

See [`docs/architecture.md`](docs/architecture.md) for how the pieces
fit together, and [`docs/deployment.md`](docs/deployment.md) for
local setup and deployment instructions.

## Quick start

The fastest way to run the whole system locally is Docker Compose —
see [`docs/deployment.md`](docs/deployment.md) for full setup
including required API keys and OAuth credentials.

```bash
docker compose up --build
docker compose exec backend alembic upgrade head
```

Then visit `http://localhost:3000`.

## Project structure

```
apex-gadgets-customer-support-agent/
├── backend/
│   ├── app/
│   │   ├── agents/       supervisor, RAG, orders, tickets agents
│   │   ├── tools/        Pinecone, order, ticket, email tools
│   │   ├── db/           SQLAlchemy models + Alembic migrations
│   │   ├── api/          FastAPI routes
│   │   └── core/         settings, LLM clients, checkpointer
│   ├── ingestion/        PDF → Pinecone ingestion pipeline
│   ├── tests/            pytest suite
│   └── Dockerfile
├── frontend/
│   ├── app/               Next.js App Router pages
│   ├── components/
│   │   ├── chat-widget/   the support chat widget
│   │   └── storefront/    header, hero, product grid, footer
│   └── Dockerfile
├── docker-compose.yml
└── docs/
    ├── requirements.md
    ├── architecture.md
    └── deployment.md
```

## Status

Backend and frontend are complete and tested locally end-to-end,
including Docker Compose orchestration. Azure deployment
(Container Apps + Azure Database for PostgreSQL) is the remaining
step — see [`docs/deployment.md`](docs/deployment.md) for the planned
approach.

## License

MIT — see [`LICENSE`](LICENSE).
