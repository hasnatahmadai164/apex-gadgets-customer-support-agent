import hashlib
import logging
from pathlib import Path

from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pinecone import Pinecone, ServerlessSpec
from pypdf import PdfReader

from app.core.config import get_settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

CHUNK_SIZE = 500
CHUNK_OVERLAP = 100
EMBEDDING_DIMENSIONS = 1536
UPSERT_BATCH_SIZE = 50


def extract_text(pdf_path: Path) -> str:
    reader = PdfReader(pdf_path)
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def chunk_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP
    )
    return splitter.split_text(text)


def build_chunk_id(source: str, chunk_index: int) -> str:
    return hashlib.sha256(f"{source}-{chunk_index}".encode()).hexdigest()[:32]


def ensure_index(pc: Pinecone, index_name: str) -> None:
    existing_names = [index.name for index in pc.indexes.list()]
    if index_name in existing_names:
        logger.info("Index %s already exists", index_name)
        return
    logger.info("Creating index %s", index_name)
    pc.indexes.create(
        name=index_name,
        dimension=EMBEDDING_DIMENSIONS,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )


def main() -> None:
    settings = get_settings()
    pdf_path = Path(settings.reference_document_path)

    text = extract_text(pdf_path)
    chunks = chunk_text(text)
    logger.info("Split %s into %d chunks", pdf_path.name, len(chunks))

    embeddings_client = OpenAIEmbeddings(
        model=settings.azure_deployment_embeddings,
        base_url=f"{settings.azure_openai_endpoint.rstrip('/')}/openai/v1/",
        api_key=settings.azure_openai_api_key,
    )

    pc = Pinecone(api_key=settings.pinecone_api_key)
    ensure_index(pc, settings.pinecone_index_name)
    index = pc.index(name=settings.pinecone_index_name)

    for batch_start in range(0, len(chunks), UPSERT_BATCH_SIZE):
        batch = chunks[batch_start : batch_start + UPSERT_BATCH_SIZE]
        vectors = embeddings_client.embed_documents(batch)

        records = [
            {
                "id": build_chunk_id(pdf_path.name, batch_start + offset),
                "values": vector,
                "metadata": {
                    "source": pdf_path.name,
                    "chunk_index": batch_start + offset,
                    "text": chunk,
                },
            }
            for offset, (chunk, vector) in enumerate(zip(batch, vectors))
        ]

        index.upsert(vectors=records)
        logger.info("Upserted batch %d-%d", batch_start, batch_start + len(batch))

    logger.info("Ingestion complete: %d chunks upserted", len(chunks))


if __name__ == "__main__":
    main()