"""Agente Auditor — Quality Assurance.

El agente más importante del pipeline. Verifica que CADA referencia
legal en el documento generado existe en el corpus de Qdrant.

REGLA DE HIERRO: Si UNA sola referencia no se verifica → RECHAZAR TODO.
"""

import json
import re
from anthropic import Anthropic
import structlog

from config import get_settings
from rag.retriever import LegalRetriever

logger = structlog.get_logger()

MAX_REWRITE_CYCLES = 3

AUDITOR_SYSTEM_PROMPT = """Eres el auditor legal de Defiéndete. Tu trabajo es VERIFICAR la precisión
de documentos legales generados por IA.

PROCESO DE AUDITORÍA:
1. Extraer TODAS las referencias legales del documento (artículos, leyes, sentencias).
2. Para cada referencia, verificar si coincide con los resultados de búsqueda del corpus.
3. Clasificar cada referencia como VERIFICADA, SOSPECHOSA o FALSA.
4. Evaluar la coherencia general del documento.

CRITERIOS DE VERIFICACIÓN:
- VERIFICADA: La norma, artículo y contenido coinciden con el corpus (score >= 0.85).
- SOSPECHOSA: Existe la norma pero el contenido no coincide exactamente (score 0.60-0.84).
- FALSA: No se encontró la referencia en el corpus o el contenido es inventado (score < 0.60 o sin resultado).

DECISIÓN:
- Si TODAS las referencias están VERIFICADAS → APROBAR
- Si hay SOSPECHOSAS pero ninguna FALSA → APROBAR CON OBSERVACIONES
- Si hay UNA o más FALSAS → RECHAZAR

FORMATO DE RESPUESTA — JSON:
{
    "decision": "APROBADO|APROBADO_CON_OBSERVACIONES|RECHAZADO",
    "verificaciones": [
        {
            "referencia": "Art. X de Ley Y",
            "texto_citado": "Lo que dice el documento",
            "texto_corpus": "Lo que dice el corpus (o null si no se encontró)",
            "score": 0.92,
            "estado": "VERIFICADA|SOSPECHOSA|FALSA",
            "observacion": "Detalle si hay discrepancia"
        }
    ],
    "coherencia_general": {
        "estructura_correcta": true,
        "hechos_coherentes": true,
        "pretensiones_fundamentadas": true,
        "observaciones": ["Lista de observaciones si hay"]
    },
    "resumen_auditoria": "Resumen ejecutivo de la auditoría",
    "instrucciones_reescritura": [
        "Si RECHAZADO: instrucciones precisas de qué corregir"
    ],
    "total_referencias": 10,
    "verificadas": 8,
    "sospechosas": 1,
    "falsas": 1
}"""


class AuditorAgent:
    """Agente auditor de calidad legal. Cero tolerancia a alucinaciones."""

    def __init__(self):
        settings = get_settings()
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.model_auditor  # Usa Opus para máxima precisión
        self.retriever = LegalRetriever()

    def audit(self, document: dict, specialist_analysis: dict) -> dict:
        """
        Audita un documento legal generado.

        Proceso:
        1. Extrae todas las referencias legales del documento
        2. Verifica cada una contra Qdrant
        3. Usa Claude Opus para evaluar coherencia
        4. Emite decisión final

        Args:
            document: Documento generado por el WriterAgent
            specialist_analysis: Análisis del especialista (para cross-reference)

        Returns:
            Resultado de auditoría con decisión y detalles
        """
        # Paso 1: Extraer y verificar referencias contra Qdrant
        rag_verifications = self._verify_references_in_rag(document)

        # Paso 2: Enviar a Claude Opus para análisis completo
        audit_result = self._run_opus_audit(
            document, specialist_analysis, rag_verifications
        )

        # Paso 3: Enriquecer con los scores de RAG
        audit_result["rag_verifications"] = rag_verifications

        # Log decisión
        logger.info(
            "audit_complete",
            decision=audit_result["decision"],
            total=audit_result.get("total_referencias", 0),
            verificadas=audit_result.get("verificadas", 0),
            sospechosas=audit_result.get("sospechosas", 0),
            falsas=audit_result.get("falsas", 0),
        )

        return audit_result

    def _verify_references_in_rag(self, document: dict) -> list[dict]:
        """Verifica cada referencia legal directamente contra Qdrant."""
        verifications = []

        # Extraer fundamentos de derecho del documento
        fundamentos = document.get("cuerpo", {}).get("fundamentos_derecho", [])

        for fund in fundamentos:
            norma_str = fund.get("norma", "")
            texto = fund.get("texto", "")

            # Parsear la norma (ej: "Art. 86 Constitución Política" → norma="constitucion", art=86)
            parsed = self._parse_norma_reference(norma_str)

            if parsed:
                result = self.retriever.verify_legal_reference(
                    reference_text=f"{norma_str} {texto}",
                    norma=parsed["numero"],
                    articulo=parsed.get("articulo"),
                )

                verifications.append(
                    {
                        "referencia": norma_str,
                        "texto_citado": texto[:200],
                        "rag_score": result["score"],
                        "rag_verified": result["verified"],
                        "rag_match": result["match"],
                    }
                )
            else:
                verifications.append(
                    {
                        "referencia": norma_str,
                        "texto_citado": texto[:200],
                        "rag_score": 0.0,
                        "rag_verified": False,
                        "rag_match": None,
                        "parse_error": True,
                    }
                )

        # También verificar las referencias usadas
        for ref in document.get("referencias_usadas", []):
            norma = ref.get("norma", "")
            art = ref.get("articulo", "")

            parsed = self._parse_norma_reference(f"{norma} Art. {art}")
            if parsed:
                result = self.retriever.verify_legal_reference(
                    reference_text=f"{norma} artículo {art}",
                    norma=parsed["numero"],
                    articulo=parsed.get("articulo"),
                )
                verifications.append(
                    {
                        "referencia": f"{norma} Art. {art}",
                        "rag_score": result["score"],
                        "rag_verified": result["verified"],
                    }
                )

        return verifications

    def _parse_norma_reference(self, reference: str) -> dict | None:
        """Parsea una referencia legal en sus componentes."""
        ref = reference.lower()

        # Patrones comunes
        patterns = [
            # "Art. 86 Constitución Política"
            r"art[íi]culo?\s+(\d+)\s+(?:de la\s+)?constituci[óo]n",
            # "Art. 350 Ley 906 de 2004"
            r"art[íi]culo?\s+(\d+)\s+(?:de la\s+)?ley\s+(\d+)\s+de\s+(\d{4})",
            # "Ley 1755 de 2015"
            r"ley\s+(\d+)\s+de\s+(\d{4})",
            # "Decreto 2591 de 1991"
            r"decreto\s+(\d+)\s+de\s+(\d{4})",
            # Sentencias: "T-760 de 2008"
            r"([tcsu]+[\-]\d+)\s+de\s+(\d{4})",
        ]

        # Constitución
        m = re.search(r"art[íi]culo?\s+(\d+).*constituci[óo]n", ref)
        if m:
            return {"numero": "politica", "articulo": int(m.group(1))}

        # Ley con artículo
        m = re.search(r"art[íi]culo?\s+(\d+).*ley\s+(\d+)", ref)
        if m:
            return {"numero": m.group(2), "articulo": int(m.group(1))}

        # Decreto con artículo
        m = re.search(r"art[íi]culo?\s+(\d+).*decreto\s+(\d+)", ref)
        if m:
            return {"numero": m.group(2), "articulo": int(m.group(1))}

        # Ley sola
        m = re.search(r"ley\s+(\d+)", ref)
        if m:
            return {"numero": m.group(1)}

        # Decreto solo
        m = re.search(r"decreto\s+(\d+)", ref)
        if m:
            return {"numero": m.group(1)}

        return None

    def _run_opus_audit(
        self,
        document: dict,
        specialist_analysis: dict,
        rag_verifications: list[dict],
    ) -> dict:
        """Ejecuta la auditoría completa con Claude Opus."""
        user_message = f"""DOCUMENTO A AUDITAR:
{json.dumps(document, ensure_ascii=False, indent=2)}

ANÁLISIS DEL ESPECIALISTA (REFERENCIA):
{json.dumps(specialist_analysis, ensure_ascii=False, indent=2)}

RESULTADOS DE VERIFICACIÓN RAG (cada referencia contra el corpus):
{json.dumps(rag_verifications, ensure_ascii=False, indent=2)}

Realiza la auditoría completa. Verifica que cada referencia legal sea real
y que el documento tenga coherencia jurídica."""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=8192,
                system=AUDITOR_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_message}],
            )

            raw = response.content[0].text.strip()
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()
            brace_start = raw.find("{")
            if brace_start > 0:
                raw = raw[brace_start:]
            depth = 0
            end_idx = -1
            for i, ch in enumerate(raw):
                if ch == "{":
                    depth += 1
                elif ch == "}":
                    depth -= 1
                    if depth == 0:
                        end_idx = i + 1
                        break
            if end_idx > 0:
                raw = raw[:end_idx]

            return json.loads(raw)

        except Exception as e:
            logger.error("opus_audit_error", error=str(e))
            # Si falla Opus, decisión conservadora: RECHAZAR
            return {
                "decision": "RECHAZADO",
                "resumen_auditoria": f"Error en auditoría Opus: {str(e)}. Rechazado por precaución.",
                "instrucciones_reescritura": [
                    "Reintente la generación del documento."
                ],
            }
