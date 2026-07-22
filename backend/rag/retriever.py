"""Retriever: búsqueda semántica sobre el corpus legal."""

from typing import Optional
import structlog

from config import get_settings
from rag.qdrant_client import CorpusLegalDB
from rag.embeddings import EmbeddingService

logger = structlog.get_logger()


class LegalRetriever:
    """
    Retriever principal para consultas legales.
    Combina embedding de la query + búsqueda en Qdrant + re-ranking.
    """

    def __init__(self):
        self.db = CorpusLegalDB()
        self.embeddings = EmbeddingService()
        self.settings = get_settings()

    def search(
        self,
        query: str,
        rama: Optional[str] = None,
        tipo: Optional[str] = None,
        numero: Optional[str] = None,
        top_k: Optional[int] = None,
    ) -> list[dict]:
        """
        Búsqueda semántica en el corpus legal.

        Args:
            query: Consulta en lenguaje natural
            rama: Filtrar por rama (penal, civil, familia, constitucional, etc.)
            tipo: Filtrar por tipo (ley, decreto, sentencia, doctrina)
            numero: Filtrar por número de ley/decreto
            top_k: Cantidad de resultados

        Returns:
            Lista de chunks relevantes con score
        """
        if top_k is None:
            top_k = self.settings.rag_top_k

        try:
            # 1. Generar embedding de la consulta
            query_vector = self.embeddings.embed_text(query)

            # 2. Buscar en Qdrant
            results = self.db.search(
                query_vector=query_vector,
                rama=rama,
                tipo=tipo,
                numero=numero,
                top_k=top_k,
                min_score=self.settings.rag_min_score,
            )

            logger.info(
                "retrieval_complete",
                query=query[:100],
                rama=rama,
                results_count=len(results),
            )

            return results

        except Exception as e:
            logger.warning(
                "retrieval_qdrant_unavailable",
                error=str(e),
                query=query[:100],
            )
            return []

    def verify_legal_reference(
        self,
        reference_text: str,
        norma: str,
        articulo: Optional[int] = None,
    ) -> dict:
        """
        Verificación para el Agente Auditor.

        Confirma que una referencia legal (ley + artículo) existe
        en el corpus y coincide con el texto citado.

        Returns:
            {"verified": bool, "score": float, "match": dict | None}
        """
        try:
            query_vector = self.embeddings.embed_text(reference_text)
            result = self.db.verify_reference(
                query_vector=query_vector,
                norma=norma,
                articulo=articulo,
            )

            logger.info(
                "reference_verified",
                norma=norma,
                articulo=articulo,
                verified=result["verified"],
                score=result["score"],
            )

            return result

        except Exception as e:
            logger.warning(
                "verify_reference_qdrant_unavailable",
                norma=norma,
                error=str(e),
            )
            return {"verified": False, "score": 0.0, "match": None}

    def get_context_for_case(
        self,
        case_description: str,
        rama: str,
        max_chunks: int = 15,
    ) -> str:
        """
        Genera un bloque de contexto legal formateado para inyectar
        en el prompt de los agentes especialistas.

        Returns:
            String formateado con las normas y jurisprudencia relevantes
        """
        results = self.search(
            query=case_description,
            rama=rama,
            top_k=max_chunks,
        )

        if not results:
            return "No se encontraron normas relevantes en el corpus legal."

        context_parts = []
        for i, r in enumerate(results, 1):
            meta = r["metadata"]
            header = f"[{i}] {meta.get('tipo', 'norma').upper()}"
            if meta.get("numero"):
                header += f" {meta['numero']}"
            if meta.get("año"):
                header += f" de {meta['año']}"
            if meta.get("articulo"):
                header += f" — Art. {meta['articulo']}"
            if meta.get("titulo"):
                header += f": {meta['titulo']}"

            context_parts.append(
                f"{header}\n"
                f"Score: {r['score']:.2f}\n"
                f"{r['text']}\n"
            )

        return "\n---\n".join(context_parts)
