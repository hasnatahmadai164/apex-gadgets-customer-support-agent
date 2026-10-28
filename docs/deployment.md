# Deployment

## Local development without Docker

This is the setup I use while actively working on the code. Changes show up faster than they would if I rebuilt containers every time.

### Backend

```
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows
pip install -r requirements.txt
# fill in .env from .env.example
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```
cd frontend
npm install
# fill in .env.local from .env.example
npm run dev
```

You need a Postgres instance that `DATABASE_URL` can reach. That can be a local install, or you can run the Postgres container on its own:

```
docker run --name apex-postgres -e POSTGRES_USER=apex -e POSTGRES_PASSWORD=apex -e POSTGRES_DB=apex_gadgets -p 5432:5432 -d postgres:16
```

## Local development with Docker Compose

This runs Postgres, the backend and the frontend together with one command. It is the local setup I have tested the most.

```
docker compose up --build
docker compose exec backend alembic upgrade head
```

Then open `http://localhost:3000`.

The frontend's `NEXT_PUBLIC_API_URL` is baked in at build time. It is set in `docker-compose.yml` and points to `http://localhost:8000`. That is the address your browser can reach. It is not the internal Docker service name, because the browser sits outside Docker's internal network.

Migrations run only when you run them yourself, never automatically when a container starts. I did this on purpose so a schema change never sneaks in as a side effect of a routine restart.

### Required environment variables

All of these go in `backend/.env`, and `backend/.env.example` has the full list. None of them are ever committed.

| Variable                                                                                                            | Where to get it                                                                          |
|---------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| `DATABASE_URL`                                                                                                      | Local Postgres, or overridden by `docker-compose.yml` to point at the `postgres` service |
| `REFERENCE_DOCUMENT_PATH`                                                                                           | Local path to the product and policy reference PDF (gitignored, never committed)         |
| `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`                                                                           | Pinecone console                                                                         |
| `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`                                                                     | Azure portal, then your Foundry resource, then Keys and Endpoint                         |
| `AZURE_DEPLOYMENT_ROUTER`, `AZURE_DEPLOYMENT_RAG`, `AZURE_DEPLOYMENT_ORDERS_TICKETS`, `AZURE_DEPLOYMENT_EMBEDDINGS` | The deployment names you chose when deploying each model in Foundry                      |
| `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`                                                                            | Google Cloud Console OAuth client (Desktop app type)                                     |
| `GMAIL_TOKEN_PATH`                                                                                                  | Local path where the OAuth token is cached after the first consent                       |

## Azure deployment

The system runs on Azure Container Apps, with Azure Database for PostgreSQL as the database. Here is how it gets deployed.

1. Provision an Azure Database for PostgreSQL Flexible Server. This is a separate production database. It does not share anything with the local Docker Postgres, because different environments should never share a database.
2. Build the images from `backend/Dockerfile` and `frontend/Dockerfile`, then push both to a container registry.
3. Create two Azure Container Apps, one for the backend and one for the frontend, each pointed at its own image.
4. Add the environment variables listed above to the Container Apps as secrets. They are never baked into an image or committed anywhere.
5. Update CORS in `backend/app/main.py` so it allows the deployed frontend's real URL in place of the local `http://localhost:3000` entry.
6. Set `NEXT_PUBLIC_API_URL` to the deployed backend's URL before building the frontend image, since it is applied at build time.
7. Run the migration once against the Azure Postgres instance with `alembic upgrade head`. It is the same command as locally, just pointed at production.
