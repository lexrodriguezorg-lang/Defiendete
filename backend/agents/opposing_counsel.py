"""Agente Abogado Contrario — Devil's Advocate Legal.

Antes de entregar la estrategia final al usuario, simula ser el abogado
de la otra parte y busca huecos en el argumento del Especialista.

Objetivo: fortalecer el documento antes de entregarlo al ciudadano.
Modelo: Claude Sonnet 4 (mismo del Especialista).
"""

import json
from anthropic import Anthropic
import structlog

from config import get_settings

logger = structlog.get_logger()

OPPOSING_COUNSEL_PROMPT = """Eres un abogado litigante experimentado en Colombia con 20 años de experiencia. \
Tu trabajo es DESTRUIR el argumento que recibes encontrando todas las debilidades posibles.

NO eres amable. NO ayudas al ciudadano. Defiendes a la otra parte: \
la EPS, el empleador, el banco, el arrendador, la entidad pública.

ANALIZA el argumento del Especialista y encuentra:

1. ARGUMENTOS DÉBILES: razonamientos que un juez o contraparte fácilmente desvirtúa.
2. EXCEPCIONES APLICABLES: defensas procesales o sustanciales que la contraparte puede plantear \
   (caducidad, prescripción, falta de legitimación, cosa juzgada, etc.).
3. PRUEBAS FALTANTES O INSUFICIENTES: qué le falta al ciudadano para sostener el caso \
   (documentos, testimonios, peritazgos).
4. ERRORES PROCESALES: vicios que dejarían sin efecto la acción \
   (juez incompetente, término vencido, formalidades omitidas).
5. JURISPRUDENCIA CONTRARIA: sentencias que favorecen a la otra parte.
6. CUANTÍA O JURISDICCIÓN MAL CALCULADA: si el monto o el juez competente no cuadra.

REGLAS CRÍTICAS:
- Si NO encuentras debilidades reales, dilo con claridad. NO inventes.
- Si el caso es sólido: di "No encuentro huecos significativos. El argumento es defendible."
- No ataques al ciudadano, ataca el ARGUMENTO JURÍDICO.
- Sé específico: cita el defecto exacto, no generalidades.
- Si identificas una debilidad subsanable, indica cómo corregirla.

CALIFICACIONES:
- "solido": El argumento resiste bien. Pocas o ninguna debilidad real.
- "riesgoso": Hay debilidades importantes pero el caso puede sostenerse con correcciones.
- "debil": Debilidades estructurales que comprometen gravemente el éxito.

RESPONDE ÚNICAMENTE con JSON válido, sin texto antes ni después:
{
  "debilidades": [
    {
      "tipo": "argumento|prueba|proceso|jurisdiccion|prescripcion|otro",
      "descripcion": "Descripción precisa del hueco",
      "gravedad": "critica|alta|media|baja",
      "subsanable": true,
      "como_subsanar": "Instrucción concreta si es subsanable, null si no"
    }
  ],
  "excepciones_aplicables": [
    {
      "excepcion": "Nombre legal de la excepción",
      "fundamento": "Norma o principio que la sustenta",
      "probabilidad_exito": "alta|media|baja"
    }
  ],
  "pruebas_faltantes": [
    {
      "prueba": "Qué falta",
      "importancia": "Por qué es necesaria",
      "como_conseguirla": "Dónde o cómo obtenerla"
    }
  ],
  "errores_procesales": [
    {
      "error": "Descripción del vicio",
      "norma_infringida": "Norma aplicable",
      "consecuencia": "Qué puede pasar si no se corrige"
    }
  ],
  "jurisprudencia_contraria": [
    {
      "sentencia": "Identificador si lo conoces, o descripción de la línea",
      "argumento_contra": "Cómo se usaría en contra"
    }
  ],
  "cuantia_jurisdiccion": {
    "correcta": true,
    "observacion": "null si está bien, o la corrección necesaria"
  },
  "calificacion_caso": "solido|riesgoso|debil",
  "resumen_evaluacion": "Párrafo breve con la valoración global del caso",
  "recomendacion_al_especialista": "Qué debe reforzar o corregir en la estrategia"
}"""


class OpposingCounselAgent:
    """
    Agente que simula al abogado de la contraparte para identificar
    debilidades antes de entregar la estrategia al ciudadano.

    Integración en el grafo:
        Especialista → OpposingCounsel → [si riesgoso/débil: refuerzo] → Redactor
    """

    def __init__(self) -> None:
        settings = get_settings()
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.model_agents  # Sonnet — mismo nivel que Especialista

    def challenge(
        self,
        specialist_analysis: dict,
        triage_result: dict,
        user_story: str,
    ) -> dict:
        """
        Analiza la estrategia del Especialista buscando debilidades.

        Args:
            specialist_analysis: Output del SpecialistAgent
            triage_result:        Output del TriageAgent
            user_story:           Relato original del usuario

        Returns:
            dict con calificacion_caso, debilidades, excepciones, etc.
        """
        user_message = self._build_prompt(
            specialist_analysis, triage_result, user_story
        )

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                system=OPPOSING_COUNSEL_PROMPT,
                messages=[{"role": "user", "content": user_message}],
            )

            raw = response.content[0].text.strip()
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]

            result = json.loads(raw.strip())

            calificacion = result.get("calificacion_caso", "riesgoso")
            debilidades   = len(result.get("debilidades", []))
            pruebas_falt  = len(result.get("pruebas_faltantes", []))
            errores_proc  = len(result.get("errores_procesales", []))

            logger.info(
                "opposing_counsel_complete",
                calificacion=calificacion,
                debilidades=debilidades,
                pruebas_faltantes=pruebas_falt,
                errores_procesales=errores_proc,
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens,
            )

            return result

        except json.JSONDecodeError as e:
            logger.error("opposing_counsel_json_error", error=str(e))
            # Fallback conservador: tratamos el caso como riesgoso para que
            # el Especialista refuerce, pero sin bloquear el pipeline.
            return self._fallback_result()
        except Exception as e:
            logger.error("opposing_counsel_error", error=str(e))
            raise

    def _build_prompt(
        self,
        specialist_analysis: dict,
        triage_result: dict,
        user_story: str,
    ) -> str:
        rama    = triage_result.get("clasificacion", {}).get("rama_derecho", "")
        urgencia = triage_result.get("clasificacion", {}).get("urgencia", "")

        return (
            f"RAMA DEL DERECHO: {rama.upper()}\n"
            f"URGENCIA: {urgencia}\n\n"
            f"RELATO ORIGINAL DEL CIUDADANO:\n{user_story[:1500]}\n\n"
            f"ESTRATEGIA DEL ESPECIALISTA (lo que vas a DESTRUIR):\n"
            f"{json.dumps(specialist_analysis, ensure_ascii=False, indent=2)[:6000]}\n\n"
            f"Busca todos los huecos posibles. Si el caso es sólido, dilo."
        )

    @staticmethod
    def _fallback_result() -> dict:
        """Resultado conservador cuando falla el parsing JSON."""
        return {
            "debilidades": [],
            "excepciones_aplicables": [],
            "pruebas_faltantes": [],
            "errores_procesales": [],
            "jurisprudencia_contraria": [],
            "cuantia_jurisdiccion": {"correcta": True, "observacion": None},
            "calificacion_caso": "riesgoso",
            "resumen_evaluacion": (
                "No se pudo completar la evaluación adversarial. "
                "Se recomienda revisión manual antes de entregar."
            ),
            "recomendacion_al_especialista": (
                "Verificar manualmente las referencias y plazos del caso."
            ),
        }
