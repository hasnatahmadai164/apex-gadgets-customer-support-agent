from pinecone import Pinecone

from app.core.config import get_settings
from app.core.llm_clients import get_embeddings_model

TOP_K = 3


def retrieve_chunks(query: str) -> list[dict]:
    settings = get_settings()
    embeddings = get_embeddings_model()
    query_vector = embeddings.embed_query(query)

    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.index(name=settings.pinecone_index_name)

    response = index.query(vector=query_vector, top_k=TOP_K, include_metadata=True)

    return [
        {
            "text": match.metadata.get("text", ""),
            "source": match.metadata.get("source", ""),
            "score": match.score,
        }
        for match in response.matches
    ]
