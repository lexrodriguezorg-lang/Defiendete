"""Generación de embeddings para el corpus legal."""

from typing import Optional
import httpx
import structlog

from config import get_settings

logger = structlog.get_logger()


class EmbeddingService:
    """Servicio de embeddings con soporte multi-provider."""

    def __init__(self, provider: Optional[str] = None):
        settings = get_settings()
        self.provider = provider or settings.embedding_provider
        self.openai_key = settings.openai_api_key
        self._client = httpx.Client(timeout=30)

    def embed_text(self, text: str) -> list[float]:
        """Genera embedding para un texto."""
        if self.provider == "openai":
            return self._embed_openai(text)
        else:
            raise ValueError(f"Provider no soportado: {self.provider}")

    def embed_batch(self, texts: list[str], batch_size: int = 100) -> list[list[float]]:
        """Genera embeddings en batch."""
        all_embeddings = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            if self.provider == "openai":
                embeddings = self._embed_openai_batch(batch)
            else:
                raise ValueError(f"Provider no soportado: {self.provider}")
            all_embeddings.extend(embeddings)

            logger.info(
                "batch_embedded",
                batch_num=i // batch_size + 1,
                total_batches=(len(texts) + batch_size - 1) // batch_size,
                texts_in_batch=len(batch),
            )

        return all_embeddings

    def _embed_openai(self, text: str) -> list[float]:
        """Embedding individual via OpenAI."""
        response = self._client.post(
            "https://api.openai.com/v1/embeddings",
            headers={"Authorization": f"Bearer {self.openai_key}"},
            json={
                "model": "text-embedding-3-small",
                "input": text,
            },
        )
        response.raise_for_status()
        return response.json()["data"][0]["embedding"]

    def _embed_openai_batch(self, texts: list[str]) -> list[list[float]]:
        """Embeddings en batch via OpenAI."""
        response = self._client.post(
            "https://api.openai.com/v1/embeddings",
            headers={"Authorization": f"Bearer {self.openai_key}"},
            json={
                "model": "text-embedding-3-small",
                "input": texts,
            },
        )
        response.raise_for_status()
        data = response.json()["data"]
        # OpenAI devuelve en orden pero mejor asegurarse
        sorted_data = sorted(data, key=lambda x: x["index"])
        return [d["embedding"] for d in sorted_data]
