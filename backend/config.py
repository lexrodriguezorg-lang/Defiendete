"""Configuración central de Defiéndete."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "Defiéndete"
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "cambiar-en-produccion"

    # Anthropic
    anthropic_api_key: str = ""
    model_haiku: str = "claude-haiku-4-5-20251001"   # diagnóstico gratis (bajo costo)
    model_agents: str = "claude-sonnet-4-6"          # pipeline pago (Especialista, OC, Redactor)
    model_auditor: str = "claude-opus-4-8"           # auditoría final

    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_collection: str = "corpus_legal"
    qdrant_embedding_dim: int = 384   # paraphrase-multilingual-MiniLM-L12-v2

    # Postgres
    database_url: str = "postgresql+asyncpg://justicia_user:justicia_dev_2026@localhost:5432/justicia"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Embeddings — modelo local sentence-transformers (sin costo por llamada)
    embedding_provider: str = "local"  # local | openai
    embedding_model_name: str = "paraphrase-multilingual-MiniLM-L12-v2"
    # openai_api_key solo necesario si se cambia embedding_provider a "openai"
    openai_api_key: str = ""

    # Wompi
    wompi_public_key: str = ""
    wompi_private_key: str = ""
    wompi_events_secret: str = ""
    wompi_sandbox: bool = True

    # Scraping
    scraping_timeout: int = 30
    scraping_max_retries: int = 3
    scraping_cache_ttl: int = 86400  # 24h

    # RAG
    rag_top_k: int = 10
    rag_rerank_top_k: int = 5
    rag_min_score: float = 0.75
    auditor_min_score: float = 0.85

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
