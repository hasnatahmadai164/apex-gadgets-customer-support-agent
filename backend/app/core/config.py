from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str

    pinecone_api_key: str
    pinecone_index_name: str

    azure_openai_endpoint: str
    azure_openai_api_key: str
    azure_openai_api_version: str
    azure_deployment_router: str
    azure_deployment_rag: str
    azure_deployment_orders_tickets: str
    azure_deployment_embeddings: str

    gmail_client_id: str
    gmail_client_secret: str
    gmail_token_path: str


@lru_cache
def get_settings() -> Settings:
    return Settings()
