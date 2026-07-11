from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from app.core.config import get_settings


def _azure_base_url() -> str:
    settings = get_settings()
    return f"{settings.azure_openai_endpoint.rstrip('/')}/openai/v1/"


def get_chat_model(deployment: str, temperature: float = 0.0) -> ChatOpenAI:
    settings = get_settings()
    return ChatOpenAI(
        model=deployment,
        base_url=_azure_base_url(),
        api_key=settings.azure_openai_api_key,
        temperature=temperature,
    )


def get_embeddings_model() -> OpenAIEmbeddings:
    settings = get_settings()
    return OpenAIEmbeddings(
        model=settings.azure_deployment_embeddings,
        base_url=_azure_base_url(),
        api_key=settings.azure_openai_api_key,
    )
