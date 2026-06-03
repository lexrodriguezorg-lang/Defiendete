"""Script para borrar y recrear la colección de Qdrant.

Ejecutar desde el directorio backend/:

    python scripts/reset_collection.py

O directamente:

    python -m scripts.reset_collection

⚠️  Este script elimina TODOS los vectores indexados.
    Después de correrlo debes re-seedear el corpus:

    python -m ingestion.pipeline --full
"""

import sys
import os

# Asegura que el import encuentre los módulos del backend
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import get_settings
from rag.qdrant_client import CorpusLegalDB
import structlog

log = structlog.get_logger()


def main() -> None:
    settings = get_settings()

    print("=" * 60)
    print("  Defiéndete — Reset de colección Qdrant")
    print("=" * 60)
    print(f"  Host        : {settings.qdrant_host}:{settings.qdrant_port}")
    print(f"  Colección   : {settings.qdrant_collection}")
    print(f"  Dimensiones : {settings.qdrant_embedding_dim}")
    print(f"  Modelo emb. : {settings.embedding_model_name}")
    print()

    # Confirmación interactiva (se puede saltar con --yes)
    if "--yes" not in sys.argv:
        resp = input("  ⚠️  Se borrarán TODOS los vectores. Continuar? [s/N]: ").strip().lower()
        if resp not in ("s", "si", "sí", "y", "yes"):
            print("  Cancelado.")
            sys.exit(0)

    db = CorpusLegalDB()

    try:
        db.reset_collection()
        stats = db.get_stats()
        print()
        print("  ✅ Colección recreada correctamente.")
        print(f"     Vectores actuales : {stats['total_vectors']}")
        print(f"     Estado            : {stats['status']}")
        print()
        print("  Próximo paso — re-seedear el corpus:")
        print("    python -m ingestion.pipeline --full")
        print()
    except Exception as exc:
        print(f"\n  ❌ Error: {exc}")
        print("     Verifica que Qdrant esté corriendo en "
              f"{settings.qdrant_host}:{settings.qdrant_port}")
        sys.exit(1)


if __name__ == "__main__":
    main()
