"""Scraper para leyes.senado.gov.co — Textos legales oficiales de Colombia.

Este módulo descarga y parsea los textos completos de leyes, decretos
y códigos desde la página oficial del Senado de la República.
"""

import re
import time
import httpx
from bs4 import BeautifulSoup
from typing import Optional
from dataclasses import dataclass
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential

logger = structlog.get_logger()

# Base URLs
SENADO_BASE = "http://www.secretariasenado.gov.co"
LEYES_PATH = "/senado/basedoc"


@dataclass
class NormaInfo:
    """Información de una norma legal."""
    tipo: str           # ley, decreto, codigo, constitucion
    numero: str         # "906", "599", "politica"
    año: int
    titulo: str         # Nombre completo de la norma
    rama: str           # penal, civil, familia, etc.
    url: str            # URL de la fuente
    texto: str = ""     # Texto completo


# Catálogo de normas prioritarias para indexar
CATALOGO_NORMAS: list[dict] = [
    # === CONSTITUCIÓN ===
    {
        "tipo": "constitucion",
        "numero": "politica",
        "año": 1991,
        "titulo": "Constitución Política de Colombia",
        "rama": "constitucional",
        "path": "/senado/basedoc/constitucion_politica_1991.html",
    },
    # === CÓDIGOS ===
    {
        "tipo": "codigo",
        "numero": "penal-599",
        "año": 2000,
        "titulo": "Código Penal - Ley 599 de 2000",
        "rama": "penal",
        "path": "/senado/basedoc/ley_0599_2000.html",
    },
    {
        "tipo": "codigo",
        "numero": "procedimiento-penal-906",
        "año": 2004,
        "titulo": "Código de Procedimiento Penal - Ley 906 de 2004",
        "rama": "penal",
        "path": "/senado/basedoc/ley_0906_2004.html",
    },
    {
        "tipo": "codigo",
        "numero": "general-proceso-1564",
        "año": 2012,
        "titulo": "Código General del Proceso - Ley 1564 de 2012",
        "rama": "civil",
        "path": "/senado/basedoc/ley_1564_2012.html",
    },
    {
        "tipo": "codigo",
        "numero": "sustantivo-trabajo",
        "año": 1950,
        "titulo": "Código Sustantivo del Trabajo",
        "rama": "laboral",
        "path": "/senado/basedoc/codigo_sustantivo_trabajo.html",
    },
    {
        "tipo": "codigo",
        "numero": "civil",
        "año": 1873,
        "titulo": "Código Civil Colombiano",
        "rama": "civil",
        "path": "/senado/basedoc/codigo_civil.html",
    },
    {
        "tipo": "codigo",
        "numero": "infancia-1098",
        "año": 2006,
        "titulo": "Código de Infancia y Adolescencia - Ley 1098 de 2006",
        "rama": "familia",
        "path": "/senado/basedoc/ley_1098_2006.html",
    },
    {
        "tipo": "codigo",
        "numero": "cpaca-1437",
        "año": 2011,
        "titulo": "CPACA - Ley 1437 de 2011",
        "rama": "administrativo",
        "path": "/senado/basedoc/ley_1437_2011.html",
    },
    {
        "tipo": "codigo",
        "numero": "policia-1801",
        "año": 2016,
        "titulo": "Código Nacional de Policía - Ley 1801 de 2016",
        "rama": "administrativo",
        "path": "/senado/basedoc/ley_1801_2016.html",
    },
    # === LEYES ESPECIALES ===
    {
        "tipo": "decreto",
        "numero": "2591",
        "año": 1991,
        "titulo": "Decreto 2591 - Acción de Tutela",
        "rama": "constitucional",
        "path": "/senado/basedoc/decreto_2591_1991.html",
    },
    {
        "tipo": "ley",
        "numero": "1755",
        "año": 2015,
        "titulo": "Ley 1755 - Derecho de Petición",
        "rama": "constitucional",
        "path": "/senado/basedoc/ley_1755_2015.html",
    },
    {
        "tipo": "ley",
        "numero": "1010",
        "año": 2006,
        "titulo": "Ley 1010 - Acoso Laboral",
        "rama": "laboral",
        "path": "/senado/basedoc/ley_1010_2006.html",
    },
    {
        "tipo": "ley",
        "numero": "1257",
        "año": 2008,
        "titulo": "Ley 1257 - Violencia contra la Mujer",
        "rama": "familia",
        "path": "/senado/basedoc/ley_1257_2008.html",
    },
    {
        "tipo": "ley",
        "numero": "1581",
        "año": 2012,
        "titulo": "Ley 1581 - Habeas Data",
        "rama": "constitucional",
        "path": "/senado/basedoc/ley_1581_2012.html",
    },
    {
        "tipo": "ley",
        "numero": "472",
        "año": 1998,
        "titulo": "Ley 472 - Acciones Populares y de Grupo",
        "rama": "constitucional",
        "path": "/senado/basedoc/ley_0472_1998.html",
    },
    {
        "tipo": "ley",
        "numero": "640",
        "año": 2001,
        "titulo": "Ley 640 - Conciliación",
        "rama": "civil",
        "path": "/senado/basedoc/ley_0640_2001.html",
    },
    {
        "tipo": "ley",
        "numero": "1826",
        "año": 2017,
        "titulo": "Ley 1826 - Procedimiento Penal Abreviado",
        "rama": "penal",
        "path": "/senado/basedoc/ley_1826_2017.html",
    },
    {
        "tipo": "ley",
        "numero": "2213",
        "año": 2022,
        "titulo": "Ley 2213 - Virtualidad Judicial Permanente",
        "rama": "civil",
        "path": "/senado/basedoc/ley_2213_2022.html",
    },
]


class SenadoScraper:
    """Scraper para secretariasenado.gov.co."""

    def __init__(self):
        self.client = httpx.Client(
            timeout=60,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/125.0.0.0 Safari/537.36"
                ),
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "es-CO,es;q=0.9",
            },
            follow_redirects=True,
        )
        self.delay = 2  # Segundos entre requests (ser respetuoso)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=4, max=30),
    )
    def fetch_norma(self, path: str) -> str:
        """Descarga el HTML de una norma."""
        url = f"{SENADO_BASE}{path}"
        logger.info("fetching_norma", url=url)

        response = self.client.get(url)
        response.raise_for_status()

        time.sleep(self.delay)
        return response.text

    def extract_text(self, html: str) -> str:
        """Extrae el texto limpio de la norma desde el HTML."""
        soup = BeautifulSoup(html, "lxml")

        # El contenido legal suele estar en un div específico
        # Intentar múltiples selectores según la estructura del Senado
        content = None

        # Selector principal
        for selector in [
            "div.WordSection1",
            "div.Section1",
            "div#TextoFinal",
            "div.texto-norma",
            "div.MsoNormal",
            "body",
        ]:
            content = soup.select_one(selector)
            if content and len(content.get_text(strip=True)) > 500:
                break

        if not content:
            content = soup.body or soup

        # Extraer texto preservando estructura
        text = self._extract_structured_text(content)

        # Limpiar
        text = self._clean_legal_text(text)

        return text

    def _extract_structured_text(self, element) -> str:
        """Extrae texto preservando saltos de línea entre bloques."""
        parts = []
        for child in element.descendants:
            if child.name in ("p", "div", "br", "h1", "h2", "h3", "h4", "h5", "h6"):
                parts.append("\n")
            if child.string:
                parts.append(child.string.strip())
        return " ".join(parts)

    def _clean_legal_text(self, text: str) -> str:
        """Limpieza específica para textos legales colombianos."""
        # Remover notas de vigencia del editor
        text = re.sub(
            r"<Nota[^>]*>.*?</Nota>",
            "",
            text,
            flags=re.DOTALL | re.IGNORECASE,
        )

        # Normalizar artículos
        text = re.sub(r"ARTÍCULO\s+", "ARTÍCULO ", text)
        text = re.sub(r"Artículo\s+", "ARTÍCULO ", text)

        # Normalizar espacios
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)

        # Remover caracteres especiales de Word/HTML
        text = text.replace("\xa0", " ")  # non-breaking space
        text = text.replace("\u200b", "")  # zero-width space

        return text.strip()

    def scrape_catalogo(self) -> list[NormaInfo]:
        """
        Descarga todas las normas del catálogo prioritario.

        Returns:
            Lista de NormaInfo con el texto completo de cada norma
        """
        normas = []

        for item in CATALOGO_NORMAS:
            try:
                html = self.fetch_norma(item["path"])
                texto = self.extract_text(html)

                if len(texto) < 100:
                    logger.warning(
                        "norma_too_short",
                        tipo=item["tipo"],
                        numero=item["numero"],
                        text_length=len(texto),
                    )
                    continue

                norma = NormaInfo(
                    tipo=item["tipo"],
                    numero=item["numero"],
                    año=item["año"],
                    titulo=item["titulo"],
                    rama=item["rama"],
                    url=f"{SENADO_BASE}{item['path']}",
                    texto=texto,
                )
                normas.append(norma)

                logger.info(
                    "norma_scraped",
                    tipo=item["tipo"],
                    numero=item["numero"],
                    text_length=len(texto),
                )

            except Exception as e:
                logger.error(
                    "scrape_failed",
                    tipo=item["tipo"],
                    numero=item["numero"],
                    error=str(e),
                )
                continue

        logger.info("catalogo_complete", total_normas=len(normas))
        return normas

    def scrape_single(self, path: str, **kwargs) -> Optional[NormaInfo]:
        """Scrape de una norma individual por path."""
        try:
            html = self.fetch_norma(path)
            texto = self.extract_text(html)

            return NormaInfo(
                tipo=kwargs.get("tipo", "ley"),
                numero=kwargs.get("numero", ""),
                año=kwargs.get("año", 0),
                titulo=kwargs.get("titulo", ""),
                rama=kwargs.get("rama", "general"),
                url=f"{SENADO_BASE}{path}",
                texto=texto,
            )
        except Exception as e:
            logger.error("single_scrape_failed", path=path, error=str(e))
            return None

    def close(self):
        """Cerrar el cliente HTTP."""
        self.client.close()
