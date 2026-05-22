"""Parser de textos legales colombianos.

Divide leyes, decretos y códigos en chunks a nivel de artículo,
preservando contexto y metadatos estructurados para Qdrant.
"""

import re
from typing import Optional
from dataclasses import dataclass, field, asdict
import structlog

logger = structlog.get_logger()


@dataclass
class ArticuloChunk:
    """Un chunk = un artículo o sección de norma legal."""

    id: str
    text: str
    metadata: dict = field(default_factory=dict)


class LeyParser:
    """
    Parser para textos legales colombianos.

    Estrategia de chunking:
    - Cada artículo es un chunk independiente
    - Se incluye contexto del título/capítulo al que pertenece
    - Artículos adyacentes se incluyen como contexto parcial
    """

    # Patrones comunes en leyes colombianas
    ARTICULO_PATTERN = re.compile(
        r"(?:^|\n)\s*(ART[ÍI]CULO\.?\s+(\d+[A-Z]?)[\.\-\s]*°?\.?\s*[-—.]?\s*)"
        r"(.*?)(?=\n\s*ART[ÍI]CULO\.?\s+\d|\Z)",
        re.DOTALL | re.IGNORECASE,
    )

    TITULO_PATTERN = re.compile(
        r"(?:^|\n)\s*(T[ÍI]TULO\.?\s+([IVXLCDM]+|\d+)[\.\-\s]*[-—.]?\s*)(.*?)(?=\n)",
        re.IGNORECASE,
    )

    CAPITULO_PATTERN = re.compile(
        r"(?:^|\n)\s*(CAP[ÍI]TULO\.?\s+([IVXLCDM]+|\d+)[\.\-\s]*[-—.]?\s*)(.*?)(?=\n)",
        re.IGNORECASE,
    )

    PARAGRAFO_PATTERN = re.compile(
        r"(PAR[ÁA]GRAFO\.?\s*\d*\.?\s*[-—.]?\s*)(.*?)(?=\n\s*PAR[ÁA]GRAFO|\n\s*ART[ÍI]CULO|\Z)",
        re.DOTALL | re.IGNORECASE,
    )

    def parse_ley(
        self,
        text: str,
        tipo: str = "ley",
        numero: str = "",
        año: int = 0,
        rama: str = "general",
        titulo_norma: str = "",
    ) -> list[ArticuloChunk]:
        """
        Parsea el texto completo de una ley/decreto en chunks por artículo.

        Args:
            text: Texto completo de la norma
            tipo: ley | decreto | codigo | acto_legislativo
            numero: Número de la norma (ej: "906", "599")
            año: Año de expedición
            rama: Rama del derecho (penal, civil, familia, etc.)
            titulo_norma: Nombre/título de la norma

        Returns:
            Lista de ArticuloChunk listos para indexar
        """
        chunks = []

        # Extraer estructura de títulos y capítulos para contexto
        titulos = self._extract_structure(text)

        # Encontrar todos los artículos
        articles = list(self.ARTICULO_PATTERN.finditer(text))

        if not articles:
            # Si no se encuentran artículos con el patrón estándar,
            # hacer chunking por párrafos grandes
            logger.warning(
                "no_articles_found",
                tipo=tipo,
                numero=numero,
                text_length=len(text),
            )
            return self._fallback_chunk(text, tipo, numero, año, rama, titulo_norma)

        logger.info(
            "articles_found",
            count=len(articles),
            tipo=tipo,
            numero=numero,
        )

        for i, match in enumerate(articles):
            art_num = match.group(2).strip()
            art_text = match.group(3).strip()

            # Limpiar texto
            art_text = self._clean_text(art_text)

            if not art_text or len(art_text) < 20:
                continue

            # Encontrar título/capítulo padre
            art_position = match.start()
            parent_titulo, parent_capitulo = self._find_parent_structure(
                titulos, art_position
            )

            # Construir contexto enriquecido
            context_prefix = ""
            if titulo_norma:
                context_prefix += f"{tipo.upper()} {numero} DE {año} — {titulo_norma}\n"
            if parent_titulo:
                context_prefix += f"TÍTULO: {parent_titulo}\n"
            if parent_capitulo:
                context_prefix += f"CAPÍTULO: {parent_capitulo}\n"

            full_text = f"{context_prefix}ARTÍCULO {art_num}. {art_text}"

            # Extraer título/resumen del artículo (primera oración o frase en mayúsculas)
            art_title = self._extract_article_title(art_text)

            chunk_id = f"{tipo}-{numero}-{año}-art-{art_num}".lower().replace(" ", "-")

            chunks.append(
                ArticuloChunk(
                    id=chunk_id,
                    text=full_text,
                    metadata={
                        "tipo": tipo,
                        "rama": rama,
                        "numero": numero,
                        "año": año,
                        "articulo": art_num,
                        "titulo": art_title,
                        "titulo_norma": titulo_norma,
                        "titulo_seccion": parent_titulo or "",
                        "capitulo": parent_capitulo or "",
                        "vigente": True,
                        "fuente": f"leyes.senado.gov.co",
                    },
                )
            )

        logger.info(
            "parsing_complete",
            tipo=tipo,
            numero=numero,
            chunks_generated=len(chunks),
        )

        return chunks

    def _extract_structure(self, text: str) -> list[dict]:
        """Extrae la estructura jerárquica (títulos y capítulos)."""
        structure = []

        for match in self.TITULO_PATTERN.finditer(text):
            structure.append(
                {
                    "type": "titulo",
                    "number": match.group(2),
                    "name": match.group(3).strip(),
                    "position": match.start(),
                }
            )

        for match in self.CAPITULO_PATTERN.finditer(text):
            structure.append(
                {
                    "type": "capitulo",
                    "number": match.group(2),
                    "name": match.group(3).strip(),
                    "position": match.start(),
                }
            )

        structure.sort(key=lambda x: x["position"])
        return structure

    def _find_parent_structure(
        self, structure: list[dict], position: int
    ) -> tuple[str, str]:
        """Encuentra el título y capítulo padre de una posición."""
        current_titulo = ""
        current_capitulo = ""

        for item in structure:
            if item["position"] > position:
                break
            if item["type"] == "titulo":
                current_titulo = f"{item['number']}. {item['name']}"
                current_capitulo = ""  # Reset capítulo al cambiar título
            elif item["type"] == "capitulo":
                current_capitulo = f"{item['number']}. {item['name']}"

        return current_titulo, current_capitulo

    def _extract_article_title(self, text: str) -> str:
        """Extrae un título descriptivo del artículo."""
        # Muchos artículos colombianos empiezan con el título en mayúsculas
        # Ej: "HOMICIDIO. El que matare a otro..."
        first_line = text.split("\n")[0].strip()

        # Si la primera línea parece un título (mayúsculas, corta)
        title_match = re.match(r"^([A-ZÁÉÍÓÚÑ\s,]+)\.", first_line)
        if title_match and len(title_match.group(1)) < 100:
            return title_match.group(1).strip().title()

        # Fallback: primeras palabras
        words = first_line.split()[:8]
        return " ".join(words) + ("..." if len(first_line.split()) > 8 else "")

    def _clean_text(self, text: str) -> str:
        """Limpia el texto de artefactos de scraping."""
        # Normalizar espacios
        text = re.sub(r"\s+", " ", text)
        # Remover caracteres de control
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
        # Normalizar guiones
        text = text.replace("–", "—").replace("−", "-")
        return text.strip()

    def _fallback_chunk(
        self, text: str, tipo: str, numero: str, año: int, rama: str, titulo_norma: str
    ) -> list[ArticuloChunk]:
        """Chunking por párrafos cuando no se detectan artículos."""
        chunks = []
        paragraphs = text.split("\n\n")

        current_chunk = ""
        chunk_num = 0

        for para in paragraphs:
            para = self._clean_text(para)
            if not para or len(para) < 30:
                continue

            current_chunk += para + "\n\n"

            # Chunk cada ~1500 caracteres
            if len(current_chunk) > 1500:
                chunk_num += 1
                chunk_id = f"{tipo}-{numero}-{año}-chunk-{chunk_num}".lower()
                chunks.append(
                    ArticuloChunk(
                        id=chunk_id,
                        text=current_chunk.strip(),
                        metadata={
                            "tipo": tipo,
                            "rama": rama,
                            "numero": numero,
                            "año": año,
                            "articulo": f"chunk-{chunk_num}",
                            "titulo": titulo_norma,
                            "titulo_norma": titulo_norma,
                            "vigente": True,
                            "fuente": "leyes.senado.gov.co",
                        },
                    )
                )
                current_chunk = ""

        # Último chunk
        if current_chunk.strip():
            chunk_num += 1
            chunk_id = f"{tipo}-{numero}-{año}-chunk-{chunk_num}".lower()
            chunks.append(
                ArticuloChunk(
                    id=chunk_id,
                    text=current_chunk.strip(),
                    metadata={
                        "tipo": tipo,
                        "rama": rama,
                        "numero": numero,
                        "año": año,
                        "articulo": f"chunk-{chunk_num}",
                        "titulo": titulo_norma,
                        "titulo_norma": titulo_norma,
                        "vigente": True,
                        "fuente": "leyes.senado.gov.co",
                    },
                )
            )

        return chunks
