"""Agentes Especialistas — Expertos por rama del derecho.

Cada sub-agente tiene conocimiento profundo de su rama y realiza
búsqueda semántica en Qdrant para encontrar las normas y jurisprudencia
más relevantes al caso.
"""

import json
from anthropic import Anthropic
import structlog

from config import get_settings
from rag.retriever import LegalRetriever

logger = structlog.get_logger()


SPECIALIST_BASE_PROMPT = """Eres un especialista en derecho {rama} colombiano dentro de Defiéndete.

Tu trabajo es analizar un caso ya clasificado por el agente de triaje y:

1. Buscar en el corpus legal las normas EXACTAS que aplican al caso.
2. Identificar jurisprudencia relevante (sentencias de las altas cortes).
3. Construir la estrategia legal paso a paso.
4. Determinar plazos legales aplicables.
5. Evaluar la probabilidad de éxito.

CONTEXTO LEGAL DISPONIBLE:
{legal_context}

REGLAS:
1. SOLO cita normas y sentencias que aparezcan en el CONTEXTO LEGAL proporcionado arriba.
2. Si necesitas una norma que NO está en el contexto, indica "FUERA_DE_CORPUS: [descripción]".
3. Cada artículo citado debe incluir: ley, número de artículo, y texto relevante.
4. Cada sentencia citada debe incluir: identificador (T-xxx, C-xxx, SU-xxx), corte, y ratio decidendi.
5. La estrategia debe ser ejecutable por un ciudadano sin abogado.
6. Los plazos deben ser exactos (días hábiles/calendario según la norma).

FORMATO DE RESPUESTA — JSON:
{{
    "sustento_legal": [
        {{
            "norma": "Ley/Decreto/Código",
            "articulo": "Número",
            "texto_relevante": "Texto exacto del artículo según el corpus",
            "aplicacion_al_caso": "Cómo aplica este artículo al caso específico",
            "verificado_en_corpus": true
        }}
    ],
    "jurisprudencia": [
        {{
            "sentencia": "Identificador (T-xxx, C-xxx)",
            "corte": "Corte Constitucional/Suprema/Consejo de Estado",
            "año": 2020,
            "ratio_decidendi": "Regla jurídica extraída",
            "aplicacion_al_caso": "Relevancia para este caso",
            "verificado_en_corpus": true
        }}
    ],
    "estrategia": {{
        "resumen": "Estrategia en 2-3 párrafos",
        "pasos": [
            {{
                "orden": 1,
                "accion": "Descripción de la acción",
                "detalle": "Instrucciones específicas",
                "plazo": "Días/fecha límite",
                "documentos": ["Doc 1", "Doc 2"],
                "ante_quien": "Entidad o despacho"
            }}
        ]
    }},
    "plazos_legales": [
        {{
            "accion": "Nombre de la acción",
            "plazo": "X días hábiles/calendario",
            "norma": "Fuente del plazo",
            "desde_cuando": "A partir de qué evento"
        }}
    ],
    "probabilidad_exito": "alta|media-alta|media|media-baja|baja",
    "justificacion_probabilidad": "Por qué se asigna esta probabilidad",
    "referencias_fuera_de_corpus": ["Si hay normas necesarias no encontradas"]
}}"""


class SpecialistAgent:
    """Agente especialista genérico configurable por rama."""

    def __init__(self, rama: str):
        settings = get_settings()
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.model_agents
        self.rama = rama
        self.retriever = LegalRetriever()

    def analyze(self, triage_result: dict, user_story: str) -> dict:
        """
        Analiza un caso con sustento legal del RAG.

        Args:
            triage_result: Resultado del agente de triaje
            user_story: Relato original del usuario

        Returns:
            Análisis especializado con sustento legal verificado
        """
        # 1. Buscar contexto legal relevante en Qdrant
        search_query = self._build_search_query(triage_result, user_story)
        legal_context = self.retriever.get_context_for_case(
            case_description=search_query,
            rama=self.rama,
            max_chunks=15,
        )

        # 2. Construir prompt con contexto inyectado
        system_prompt = SPECIALIST_BASE_PROMPT.format(
            rama=self.rama.upper(),
            legal_context=legal_context,
        )

        # 3. Construir mensaje con el caso
        case_summary = json.dumps(triage_result, ensure_ascii=False, indent=2)
        user_message = (
            f"CASO CLASIFICADO POR TRIAJE:\n{case_summary}\n\n"
            f"RELATO ORIGINAL DEL USUARIO:\n{user_story}\n\n"
            f"Analiza este caso con el sustento legal del corpus proporcionado."
        )

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}],
            )

            raw = response.content[0].text.strip()
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]

            analysis = json.loads(raw.strip())

            logger.info(
                "specialist_analysis_complete",
                rama=self.rama,
                sustento_count=len(analysis.get("sustento_legal", [])),
                juris_count=len(analysis.get("jurisprudencia", [])),
                probabilidad=analysis.get("probabilidad_exito"),
            )

            return analysis

        except json.JSONDecodeError as e:
            logger.error("specialist_json_error", rama=self.rama, error=str(e))
            raise
        except Exception as e:
            logger.error("specialist_error", rama=self.rama, error=str(e))
            raise

    def _build_search_query(self, triage_result: dict, user_story: str) -> str:
        """Construye la query óptima para búsqueda en RAG."""
        parts = []

        # Subcategoría del triaje
        sub = triage_result.get("clasificacion", {}).get("sub_categoria", "")
        if sub:
            parts.append(sub)

        # Derechos vulnerados
        for dv in triage_result.get("derechos_vulnerados", []):
            parts.append(dv.get("derecho", ""))

        # Acciones recomendadas
        acciones = triage_result.get("clasificacion", {}).get(
            "acciones_recomendadas", []
        )
        parts.extend(acciones)

        # Si no hay suficiente contexto, usar el relato (primeras 500 chars)
        if len(parts) < 2:
            parts.append(user_story[:500])

        return " ".join(parts)


# Instancias pre-configuradas por rama
class PenalSpecialist(SpecialistAgent):
    def __init__(self):
        super().__init__(rama="penal")


class FamiliaSpecialist(SpecialistAgent):
    def __init__(self):
        super().__init__(rama="familia")


class ConstitucionalSpecialist(SpecialistAgent):
    def __init__(self):
        super().__init__(rama="constitucional")


class LaboralSpecialist(SpecialistAgent):
    def __init__(self):
        super().__init__(rama="laboral")


class CivilSpecialist(SpecialistAgent):
    def __init__(self):
        super().__init__(rama="civil")


class AdministrativoSpecialist(SpecialistAgent):
    def __init__(self):
        super().__init__(rama="administrativo")


# Mapa de rama → especialista
SPECIALIST_MAP = {
    "penal": PenalSpecialist,
    "familia": FamiliaSpecialist,
    "constitucional": ConstitucionalSpecialist,
    "laboral": LaboralSpecialist,
    "civil": CivilSpecialist,
    "administrativo": AdministrativoSpecialist,
}


def get_specialist(rama: str) -> SpecialistAgent:
    """Factory para obtener el especialista correcto."""
    cls = SPECIALIST_MAP.get(rama)
    if not cls:
        logger.warning("unknown_rama_fallback", rama=rama)
        return SpecialistAgent(rama=rama)
    return cls()
