# Deployment

## Local development (no Docker)

Useful when actively developing — faster iteration than rebuilding
containers on every change.

**Backend:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows
pip install -r requirements.txt
# fill in .env from .env.example
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
# fill in .env.local from .env.example
npm run dev
```

Requires a Postgres instance reachable at whatever `DATABASE_URL`
points to — either a local install or the Postgres container run on
its own:

```bash
docker run --name apex-postgres -e POSTGRES_USER=apex -e POSTGRES_PASSWORD=apex -e POSTGRES_DB=apex_gadgets -p 5432:5432 -d postgres:16
```

## Local development (Docker Compose)

The full stack — Postgres, backend, and frontend — running together
with one command. This is the tested, working local setup.

```bash
docker compose up --build
docker compose exec backend alembic upgrade head
```

Visit `http://localhost:3000`. The frontend's `NEXT_PUBLIC_API_URL`
is baked in at build time (set in `docker-compose.yml`) and points to
`http://localhost:8000` — the URL the *browser* can reach, not the
internal Docker service name, since browsers aren't part of Docker's
internal network.

Migrations are run explicitly, not automatically on every container
start — deliberate, so schema changes are never a surprise side
effect of a routine restart.

### Required environment variables

All of these live in `backend/.env` (see `backend/.env.example` for
the full list) and are never committed:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Local Postgres, or overridden by `docker-compose.yml` to point at the `postgres` service |
| `REFERENCE_DOCUMENT_PATH` | Local path to the product/policy reference PDF (gitignored, never committed) |
| `PINECONE_API_KEY`, `PINECONE_INDEX_NAME` | Pinecone console |
| `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY` | Azure portal → your Foundry resource → Keys and Endpoint |
| `AZURE_DEPLOYMENT_ROUTER`, `AZURE_DEPLOYMENT_RAG`, `AZURE_DEPLOYMENT_ORDERS_TICKETS`, `AZURE_DEPLOYMENT_EMBEDDINGS` | Deployment names set when deploying each model in Foundry |
| `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` | Google Cloud Console OAuth client (Desktop app type) |
| `GMAIL_TOKEN_PATH` | Local path where the OAuth token gets cached after first consent |

## Azure deployment (planned)

Not yet executed — this is the intended path once local testing is
fully signed off.

1. **Provision Azure Database for PostgreSQL – Flexible Server.**
   A separate, real production database from the local Docker
   Postgres used for development — different environments should
   never share a database.
2. **Build and push images** to a container registry (GitHub
   Container Registry, `ghcr.io`, or Azure Container Registry) for
   both `backend/Dockerfile` and `frontend/Dockerfile`.
3. **Create two Azure Container Apps** (backend, frontend), each
   pointed at its respective image.
4. **Configure secrets** in Container Apps' environment variable /
   secret settings — the same variables listed above, but as managed
   Azure secrets, never baked into the image or committed anywhere.
5. **Update CORS** in `backend/app/main.py` to allow the deployed
   frontend's real URL, replacing the local
   `http://localhost:3000` entry.
6. **Update `NEXT_PUBLIC_API_URL`** at build time to the deployed
   backend's URL before building the frontend image.
7. **Run the migration once** against the real Azure Postgres
   instance (`alembic upgrade head`), same as local, just pointed at
   production.

**Scaling note:** the original plan called for `min replicas = 0`
(scale-to-zero) to minimize cost for demo purposes. For genuine
production traffic, this trades cost for latency — a scaled-to-zero
app has a cold start on the first request after idling. Worth
deciding based on actual expected usage before deploying, not
carrying over the demo-era default by habit.
