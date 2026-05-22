"""Pipeline de ingesta del corpus legal colombiano.

Orquesta: Scraping → Parsing → Embedding → Indexación en Qdrant.
"""

import json
import os
from pathlib import Path
from dataclasses import asdict
import structlog

from ingestion.scrapers.senado import SenadoScraper, NormaInfo
from ingestion.parsers.ley_parser import LeyParser
from rag.embeddings import EmbeddingService
from rag.qdrant_client import CorpusLegalDB

logger = structlog.get_logger()

# Directorio para cachear textos scrapeados
CACHE_DIR = Path("data/corpus_cache")


class IngestionPipeline:
    """
    Pipeline completo de ingesta del corpus legal.

    Flujo:
    1. Scrape de la fuente (o leer de cache)
    2. Parsing en chunks por artículo
    3. Generación de embeddings
    4. Indexación en Qdrant
    """

    def __init__(self):
        self.scraper = SenadoScraper()
        self.parser = LeyParser()
        self.embeddings = EmbeddingService()
        self.db = CorpusLegalDB()

        # Crear directorio de cache
        CACHE_DIR.mkdir(parents=True, exist_ok=True)

    def init(self):
        """Inicializar la colección de Qdrant."""
        self.db.init_collection()
        logger.info("pipeline_initialized")

    def ingest_norma(self, norma: NormaInfo, use_cache: bool = True) -> int:
        """
        Ingesta completa de una norma individual.

        Returns:
            Número de chunks indexados
        """
        cache_file = CACHE_DIR / f"{norma.tipo}_{norma.numero}_{norma.año}.txt"

        # 1. Obtener texto (cache o scrape)
        if use_cache and cache_file.exists():
            logger.info("using_cache", file=str(cache_file))
            texto = cache_file.read_text(encoding="utf-8")
        else:
            texto = norma.texto
            if not texto:
                logger.warning("no_text", tipo=norma.tipo, numero=norma.numero)
                return 0
            # Guardar en cache
            cache_file.write_text(texto, encoding="utf-8")

        # 2. Parsear en chunks
        chunks = self.parser.parse_ley(
            text=texto,
            tipo=norma.tipo,
            numero=norma.numero,
            año=norma.año,
            rama=norma.rama,
            titulo_norma=norma.titulo,
        )

        if not chunks:
            logger.warning("no_chunks", tipo=norma.tipo, numero=norma.numero)
            return 0

        # 3. Generar embeddings en batch
        texts = [chunk.text for chunk in chunks]
        vectors = self.embeddings.embed_batch(texts)

        # 4. Preparar para Qdrant
        qdrant_chunks = []
        for chunk, vector in zip(chunks, vectors):
            qdrant_chunks.append(
                {
                    "id": chunk.id,
                    "vector": vector,
                    "metadata": chunk.metadata,
                    "text": chunk.text,
                }
            )

        # 5. Indexar
        self.db.upsert_chunks(qdrant_chunks)

        logger.info(
            "norma_ingested",
            tipo=norma.tipo,
            numero=norma.numero,
            chunks_count=len(qdrant_chunks),
        )

        return len(qdrant_chunks)

    def ingest_catalogo_completo(self) -> dict:
        """
        Ingesta de todo el catálogo de normas prioritarias.

        Returns:
            Resumen de la ingesta
        """
        self.init()

        normas = self.scraper.scrape_catalogo()

        total_chunks = 0
        results = []

        for norma in normas:
            count = self.ingest_norma(norma)
            total_chunks += count
            results.append(
                {
                    "norma": f"{norma.tipo} {norma.numero} de {norma.año}",
                    "titulo": norma.titulo,
                    "chunks": count,
                }
            )

        summary = {
            "total_normas": len(normas),
            "total_chunks": total_chunks,
            "normas": results,
            "stats": self.db.get_stats(),
        }

        # Guardar resumen
        summary_file = CACHE_DIR / "ingestion_summary.json"
        summary_file.write_text(
            json.dumps(summary, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

        logger.info(
            "catalogo_ingestion_complete",
            total_normas=len(normas),
            total_chunks=total_chunks,
        )

        return summary

    def ingest_from_file(
        self,
        filepath: str,
        tipo: str = "ley",
        numero: str = "",
        año: int = 0,
        rama: str = "general",
        titulo: str = "",
    ) -> int:
        """
        Ingesta desde un archivo de texto local.
        Útil para libros de derecho, doctrina, o normas descargadas manualmente.
        """
        text = Path(filepath).read_text(encoding="utf-8")

        norma = NormaInfo(
            tipo=tipo,
            numero=numero,
            año=año,
            titulo=titulo,
            rama=rama,
            url=f"file://{filepath}",
            texto=text,
        )

        return self.ingest_norma(norma, use_cache=False)

    def close(self):
        """Liberar recursos."""
        self.scraper.close()


# === CLI de ingesta ===
if __name__ == "__main__":
    import sys

    pipeline = IngestionPipeline()

    if len(sys.argv) > 1 and sys.argv[1] == "--full":
        print("🔄 Iniciando ingesta completa del catálogo legal...")
        summary = pipeline.ingest_catalogo_completo()
        print(f"\n✅ Ingesta completa:")
        print(f"   Normas procesadas: {summary['total_normas']}")
        print(f"   Chunks indexados: {summary['total_chunks']}")
        for norma in summary["normas"]:
            print(f"   → {norma['norma']}: {norma['chunks']} chunks")
    else:
        print("Uso:")
        print("  python -m ingestion.pipeline --full    Ingesta completa del catálogo")
        print("  Importar IngestionPipeline para uso programático")

    pipeline.close()
