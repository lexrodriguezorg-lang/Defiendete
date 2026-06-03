"""Cliente Qdrant para el corpus legal colombiano."""

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    PayloadSchemaType,
)
from typing import Optional
import structlog

from config import get_settings

logger = structlog.get_logger()


class CorpusLegalDB:
    """Wrapper sobre Qdrant para manejo del corpus legal."""

    def __init__(self):
        settings = get_settings()
        self.client = QdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port,
        )
        self.collection = settings.qdrant_collection
        self.embedding_dim = settings.qdrant_embedding_dim

    def init_collection(self):
        """Crear la colección si no existe.

        Si ya existe pero tiene dimensiones distintas a las configuradas,
        lanza un error claro indicando que hay que correr reset_collection().
        """
        existing = [c.name for c in self.client.get_collections().collections]

        if self.collection in existing:
            # Verificar que las dimensiones coincidan
            info = self.client.get_collection(self.collection)
            current_dim = info.config.params.vectors.size  # type: ignore[union-attr]
            if current_dim != self.embedding_dim:
                raise RuntimeError(
                    f"La colección '{self.collection}' existe con dim={current_dim} "
                    f"pero la config espera dim={self.embedding_dim}. "
                    f"Corre: python scripts/reset_collection.py"
                )
            logger.info("collection_exists", name=self.collection, dim=current_dim)
            return

        self._create_collection()

    def reset_collection(self):
        """Borrar la colección existente y recrearla con las dimensiones actuales.

        Úsalo cuando cambies el modelo de embeddings (ej. OpenAI → local).
        ⚠️  Elimina TODOS los vectores indexados — hay que re-seedear el corpus.
        """
        existing = [c.name for c in self.client.get_collections().collections]

        if self.collection in existing:
            logger.warning(
                "dropping_collection",
                name=self.collection,
                reason="reset solicitado por cambio de modelo de embeddings",
            )
            self.client.delete_collection(self.collection)
            logger.info("collection_dropped", name=self.collection)

        self._create_collection()
        logger.info("collection_reset_complete", name=self.collection, dim=self.embedding_dim)

    def _create_collection(self):
        """Crea la colección e índices de payload desde cero."""
        self.client.create_collection(
            collection_name=self.collection,
            vectors_config=VectorParams(
                size=self.embedding_dim,
                distance=Distance.COSINE,
            ),
        )

        # Índices para filtrado rápido por metadatos
        for field, schema in [
            ("tipo",    PayloadSchemaType.KEYWORD),
            ("rama",    PayloadSchemaType.KEYWORD),
            ("numero",  PayloadSchemaType.KEYWORD),
            ("vigente", PayloadSchemaType.BOOL),
        ]:
            self.client.create_payload_index(
                collection_name=self.collection,
                field_name=field,
                field_schema=schema,
            )

        logger.info("collection_created", name=self.collection, dim=self.embedding_dim)

    def upsert_chunks(self, chunks: list[dict]):
        """
        Insertar/actualizar chunks en Qdrant.

        Cada chunk debe tener:
        - id: str
        - vector: list[float]
        - metadata: dict (tipo, rama, numero, año, articulo, etc.)
        - text: str
        """
        points = []
        for chunk in chunks:
            payload = {**chunk["metadata"], "text": chunk["text"]}
            points.append(
                PointStruct(
                    id=hash(chunk["id"]) % (2**63),  # Qdrant necesita int ID
                    vector=chunk["vector"],
                    payload=payload,
                )
            )

        self.client.upsert(
            collection_name=self.collection,
            points=points,
            wait=True,
        )
        logger.info("chunks_upserted", count=len(points))

    def search(
        self,
        query_vector: list[float],
        rama: Optional[str] = None,
        tipo: Optional[str] = None,
        numero: Optional[str] = None,
        top_k: int = 10,
        min_score: float = 0.75,
    ) -> list[dict]:
        """
        Búsqueda semántica con filtros por metadatos.

        Args:
            query_vector: Embedding de la consulta
            rama: Filtrar por rama del derecho (penal, civil, familia, etc.)
            tipo: Filtrar por tipo de norma (ley, decreto, sentencia, etc.)
            numero: Filtrar por número de ley/decreto
            top_k: Cantidad de resultados
            min_score: Score mínimo de similitud

        Returns:
            Lista de resultados con score y payload
        """
        conditions = []
        if rama:
            conditions.append(
                FieldCondition(field_name="rama", match=MatchValue(value=rama))
            )
        if tipo:
            conditions.append(
                FieldCondition(field_name="tipo", match=MatchValue(value=tipo))
            )
        if numero:
            conditions.append(
                FieldCondition(field_name="numero", match=MatchValue(value=numero))
            )

        query_filter = Filter(must=conditions) if conditions else None

        results = self.client.search(
            collection_name=self.collection,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=top_k,
            score_threshold=min_score,
        )

        return [
            {
                "id": hit.id,
                "score": hit.score,
                "text": hit.payload.get("text", ""),
                "metadata": {
                    k: v for k, v in hit.payload.items() if k != "text"
                },
            }
            for hit in results
        ]

    def verify_reference(
        self,
        query_vector: list[float],
        norma: str,
        articulo: Optional[int] = None,
    ) -> dict:
        """
        Verificación del Auditor: confirma que una referencia legal existe.

        Returns:
            {"verified": bool, "score": float, "match": dict | None}
        """
        conditions = [
            FieldCondition(field_name="numero", match=MatchValue(value=norma))
        ]
        if articulo is not None:
            conditions.append(
                FieldCondition(
                    field_name="articulo", match=MatchValue(value=str(articulo))
                )
            )

        results = self.client.search(
            collection_name=self.collection,
            query_vector=query_vector,
            query_filter=Filter(must=conditions),
            limit=1,
            score_threshold=0.0,
        )

        if not results:
            return {"verified": False, "score": 0.0, "match": None}

        hit = results[0]
        settings = get_settings()
        return {
            "verified": hit.score >= settings.auditor_min_score,
            "score": hit.score,
            "match": {
                "text": hit.payload.get("text", ""),
                "metadata": {k: v for k, v in hit.payload.items() if k != "text"},
            },
        }

    def get_stats(self) -> dict:
        """Estadísticas de la colección."""
        info = self.client.get_collection(self.collection)
        return {
            "total_vectors": info.points_count,
            "status": info.status.value,
            "optimizer_status": str(info.optimizer_status),
        }
