"""Generación de embeddings para el corpus legal.

Usa sentence-transformers de forma local (sin costo por llamada ni dependencia de red).
Modelo: paraphrase-multilingual-MiniLM-L12-v2 — 384 dimensiones, multilingüe,
óptimo para textos legales en español.
"""

from __future__ import annotations

import os
# Force offline mode — model is cached locally; prevents httpx SSL errors from
# huggingface_hub trying to check for updates on every load.
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

from typing import Optional
import numpy as np
import structlog

from config import get_settings

logger = structlog.get_logger()

# ── Singleton del modelo ──────────────────────────────────────────────────────
# Se carga una sola vez por proceso (pesado: ~400 MB en disco, ~100 ms de carga).
# En multi-worker cada worker carga su propia copia en RAM — aceptable.
_model = None


def _get_model():
    """Devuelve el modelo, cargándolo si es la primera llamada."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer  # import diferido

        settings = get_settings()
        model_name = settings.embedding_model_name
        logger.info("loading_embedding_model", model=model_name)
        _model = SentenceTransformer(model_name)
        logger.info("embedding_model_loaded", model=model_name, dim=_model.get_sentence_embedding_dimension())
    return _model


# ── Clase de servicio ─────────────────────────────────────────────────────────

class EmbeddingService:
    """Servicio de embeddings con sentence-transformers local.

    API compatible con la versión anterior (embed_text / embed_batch)
    para que pipeline.py, retriever.py y auditor.py no necesiten cambios.
    """

    def __init__(self, provider: Optional[str] = None):
        settings = get_settings()
        self.provider = provider or settings.embedding_provider
        # El modelo se carga lazy en la primera llamada
        self._dim = settings.qdrant_embedding_dim

    # ── Interfaz pública ──────────────────────────────────────────────────────

    def embed_text(self, text: str) -> list[float]:
        """Genera embedding para un texto individual.

        Returns:
            Lista de floats de longitud `embedding_dim` (384).
        """
        if self.provider == "local":
            return self._embed_local(text)
        elif self.provider == "openai":
            return self._embed_openai(text)
        raise ValueError(f"Provider no soportado: {self.provider}")

    def embed_batch(self, texts: list[str], batch_size: int = 64) -> list[list[float]]:
        """Genera embeddings en batch.

        sentence-transformers gestiona el batching internamente;
        `batch_size` controla cuántos textos se procesan en paralelo en GPU/CPU.

        Returns:
            Lista de listas de floats, mismo orden que `texts`.
        """
        if not texts:
            return []

        if self.provider == "local":
            return self._embed_local_batch(texts, batch_size)
        elif self.provider == "openai":
            return self._embed_openai_batch(texts, batch_size)
        raise ValueError(f"Provider no soportado: {self.provider}")

    # ── Implementaciones ──────────────────────────────────────────────────────

    def _embed_local(self, text: str) -> list[float]:
        """Embedding individual — sentence-transformers."""
        model = _get_model()
        vector: np.ndarray = model.encode(
            text,
            normalize_embeddings=True,  # cosine similarity → producto punto
            show_progress_bar=False,
        )
        return vector.tolist()

    def _embed_local_batch(self, texts: list[str], batch_size: int) -> list[list[float]]:
        """Embeddings en batch — sentence-transformers.

        Procesa todo de una vez; el modelo gestiona los mini-batches internamente.
        """
        model = _get_model()
        vectors: np.ndarray = model.encode(
            texts,
            batch_size=batch_size,
            normalize_embeddings=True,
            show_progress_bar=len(texts) > 50,  # muestra barra solo si hay muchos textos
            convert_to_numpy=True,
        )
        logger.info(
            "batch_embedded_local",
            total_texts=len(texts),
            dim=vectors.shape[1] if vectors.ndim == 2 else "?",
        )
        return vectors.tolist()

    # ── Fallback OpenAI (solo si se cambia provider en .env) ─────────────────

    def _embed_openai(self, text: str) -> list[float]:
        """Embedding individual via OpenAI (requiere openai en requirements y API key)."""
        import httpx  # noqa: PLC0415

        settings = get_settings()
        resp = httpx.post(
            "https://api.openai.com/v1/embeddings",
            headers={"Authorization": f"Bearer {settings.openai_api_key}"},
            json={"model": "text-embedding-3-small", "input": text},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["data"][0]["embedding"]

    def _embed_openai_batch(self, texts: list[str], batch_size: int) -> list[list[float]]:
        """Embeddings en batch via OpenAI."""
        import httpx  # noqa: PLC0415

        settings = get_settings()
        all_embeddings: list[list[float]] = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            resp = httpx.post(
                "https://api.openai.com/v1/embeddings",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                json={"model": "text-embedding-3-small", "input": batch},
                timeout=30,
            )
            resp.raise_for_status()
            data = sorted(resp.json()["data"], key=lambda x: x["index"])
            all_embeddings.extend(d["embedding"] for d in data)
            logger.info("batch_embedded_openai", batch=i // batch_size + 1, size=len(batch))

        return all_embeddings
