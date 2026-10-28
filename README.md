# Apex Gadgets Support Agent
 
An agentic RAG customer support system for Apex Gadgets, an ecommerce store that sells phones and laptops. A supervisor agent reads each customer message and passes it to one of three specialists: product and policy Q&A, order management or support tickets. Before anything is written to the database or emailed to a customer, the agent stops and asks for explicit confirmation.
 
The project covers the whole stack: a document ingestion pipeline, an agentic retrieval loop, agents that call tools, persistent conversation memory, a streaming chat API, and a working storefront frontend so the chat widget sits in a realistic context.
 
## What it does
 
**Product and policy Q&A.** Answers come from a Pinecone vector store. Instead of a single retrieval call, the agent retrieves, grades the results, rewrites the query when the results are weak and only then generates an answer.
 
**Order placement.** The agent collects customer details through normal conversation, shows a summary and waits. Only after the customer confirms does it save the order and send a confirmation email.
 
**Order status.** Customers can look up an order by order ID or by email.
 
**Support tickets.** Creating a ticket and checking its status follow the same pattern as orders: collect the details, confirm, then act. Each ticket gets an auto generated ticket number.
 
**Persistent memory.** The full conversation is checkpointed to Postgres for each browser session, so a page refresh or a server restart does not wipe the chat.
 
**Streaming responses.** Answers stream into the chat widget token by token over SSE.
 
## Tech stack
 
**Backend:** FastAPI, LangGraph, LangChain, Pinecone, PostgreSQL (SQLAlchemy 2.0 async and Alembic), Azure OpenAI (Foundry, v1 API), Gmail API with OAuth
 
**Frontend:** Next.js (App Router, Turbopack), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
 
**Infrastructure:** Docker, Docker Compose, Azure Container Apps, Azure Database for PostgreSQL
 
For a closer look at how the pieces fit together, read [`docs/architecture.md`](docs/architecture.md). Local setup and deployment steps are in [`docs/deployment.md`](docs/deployment.md).
 
## Quick start
 
The easiest way to run everything locally is Docker Compose. You will need your API keys and OAuth credentials ready, and `docs/deployment.md` lists all of them.
 
```
docker compose up --build
docker compose exec backend alembic upgrade head
```
 
Then open `http://localhost:3000`.
 
## Project structure
 
```
apex-gadgets-customer-support-agent/
├── backend/
│   ├── app/
│   │   ├── agents/       supervisor, RAG, orders and tickets agents
│   │   ├── tools/        Pinecone, order, ticket and email tools
│   │   ├── db/           SQLAlchemy models and Alembic migrations
│   │   ├── api/          FastAPI routes
│   │   └── core/         settings, LLM clients, checkpointer
│   ├── ingestion/        PDF to Pinecone ingestion pipeline
│   ├── tests/            pytest suite
│   └── Dockerfile
├── frontend/
│   ├── app/              Next.js App Router pages
│   ├── components/
│   │   ├── chat-widget/  the support chat widget
│   │   └── storefront/   header, hero, product grid, footer
│   └── Dockerfile
├── docker-compose.yml
└── docs/
    ├── requirements.md
    ├── architecture.md
    └── deployment.md
```
 
## Status
 
The backend and frontend are finished and tested from start to finish and the whole system is deployed on Azure.
 
## License
 
MIT. See [`LICENSE`](LICENSE).
