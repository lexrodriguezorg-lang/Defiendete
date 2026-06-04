"""Agente Asistente — Primer punto de contacto del ciudadano.

Utiliza Claude Haiku para minimizar costos. Conduce una conversación
empática para recolectar la información necesaria antes de pasarla
al agente de Triaje.

Máximo MAX_TURNS turnos; después fuerza la conclusión con lo recopilado.
"""

import json
from anthropic import Anthropic
import structlog

from config import get_settings

logger = structlog.get_logger()

MAX_TURNS = 8

FIRST_MESSAGE = (
    "Hola, cuéntame tu situación con tus propias palabras. "
    "No te preocupes por el orden ni los términos técnicos — "
    "yo voy a ayudarte a estructurarlo."
)

SYSTEM_PROMPT = """Eres la asistente de Defiéndete, una plataforma legal colombiana.
Tu único trabajo es recolectar información completa del caso del usuario para que los agentes especialistas puedan analizarlo correctamente.

DEBES OBTENER OBLIGATORIAMENTE:
- Tipo de problema (laboral, familia, consumidor, penal, salud, arrendamiento, etc.)
- Fechas relevantes (cuándo ocurrió, plazos vencidos)
- Lugar/ciudad donde ocurrió
- Cuantía o monto involucrado (si aplica)
- Personas o entidades involucradas
- Documentos que tiene el usuario
- Qué busca lograr (devolución, indemnización, protección, custodia, etc.)
- Si hay urgencia real (violencia activa, niños en riesgo, salud crítica, privación de libertad)

REGLAS INQUEBRANTABLES:
- Lee primero TODO lo que escribió el usuario antes de preguntar
- NO repitas preguntas sobre información que ya te dio
- Haz máximo 2-3 preguntas por turno, escogiendo las más importantes
- Sé concisa — no des explicaciones largas ni consejos
- NUNCA opines sobre el caso ni des consejos legales
- Si el usuario insiste en pedir consejo, dile: "El análisis legal completo lo hará el especialista una vez tenga toda la información de tu caso."
- Si detectas violencia activa, niños en riesgo o salud crítica: menciona primero la línea 155 (violencia) o 123 (emergencias) antes de continuar

PERSONALIDAD:
- Empática pero profesional (no condescendiente)
- Español colombiano natural y cálido
- Directa: no des rodeos, ve al grano después del saludo inicial
- Seria cuando el caso lo amerita (no uses emojis en casos de violencia)

FORMATO DE RESPUESTA — Siempre JSON válido, sin texto antes ni después:

Cuando necesitas más información:
{
  "info_completa": false,
  "siguiente_pregunta": "<tu respuesta empática + las 1-3 preguntas más importantes>",
  "info_recolectada_hasta_ahora": {
    "tipo": "<tipo de problema o null>",
    "hechos": "<resumen de los hechos conocidos o null>",
    "fechas": [],
    "ciudad": "<ciudad o null>",
    "cuantia": "<monto aproximado o null>",
    "personas": [],
    "documentos": [],
    "objetivo": "<qué quiere lograr o null>",
    "urgencia": "<alta|media|baja|null>"
  }
}

Cuando tienes suficiente información (mínimo: tipo + ciudad + objetivo):
{
  "info_completa": true,
  "mensaje_usuario": "<mensaje cálido y breve confirmando que vas a analizar el caso>",
  "caso_estructurado": {
    "tipo": "<tipo de problema>",
    "hechos": "<relato completo y claro en 4-6 oraciones con todos los datos recopilados, listo para análisis jurídico>",
    "fechas": ["<fecha relevante>"],
    "ciudad": "<ciudad>",
    "cuantia": <número o null>,
    "personas": ["<nombre o entidad>"],
    "documentos": ["<documento disponible>"],
    "objetivo": "<qué busca lograr>",
    "urgencia": "<alta|media|baja>"
  }
}

CRÍTICO: El campo "hechos" debe sintetizar TODA la información compartida durante la conversación,
de forma coherente y completa, listo para ser procesado por el sistema de triaje legal."""


class AssistantAgent:
    """Agente conversacional de recolección de información legal."""

    first_message: str = FIRST_MESSAGE

    def __init__(self) -> None:
        settings = get_settings()
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        # Haiku para minimizar costos — es suficiente para recolección de info
        self.model = "claude-haiku-4-5-20251001"

    def converse(self, messages: list[dict]) -> dict:
        """
        Procesa el historial y genera la siguiente respuesta.

        Args:
            messages: Historial completo [{role: "user"|"assistant", content: "..."}]
                      Debe incluir el primer mensaje del asistente si ya se envió.

        Returns:
            dict con info_completa + (siguiente_pregunta | caso_estructurado)
        """
        turn_count = sum(1 for m in messages if m["role"] == "user")
        force_close = turn_count >= MAX_TURNS

        system = SYSTEM_PROMPT
        if force_close:
            system += (
                "\n\nINSTRUCCIÓN FINAL CRÍTICA: Has alcanzado el límite de turnos de la conversación. "
                "DEBES responder AHORA con info_completa: true. "
                "Compila toda la información que el usuario ha compartido hasta este momento, "
                "aunque esté incompleta. El campo 'hechos' debe incluir todo lo mencionado. "
                "NO hagas más preguntas."
            )

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                system=system,
                messages=messages,
            )

            raw = response.content[0].text.strip()

            # Limpiar posibles artefactos de markdown
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]

            result = json.loads(raw.strip())

            logger.info(
                "assistant_turn",
                turn=turn_count,
                info_completa=result.get("info_completa", False),
                forced=force_close,
            )
            return result

        except json.JSONDecodeError as e:
            logger.error("assistant_json_error", error=str(e), raw=raw[:300])
            return self._fallback_response(turn_count, messages)
        except Exception as e:
            logger.error("assistant_error", error=str(e))
            raise

    def _fallback_response(self, turn_count: int, messages: list[dict]) -> dict:
        """Respuesta de emergencia cuando el JSON falla."""
        if turn_count >= MAX_TURNS - 1:
            # Compilar los textos del usuario como relato de emergencia
            user_text = " ".join(
                m["content"] for m in messages if m["role"] == "user"
            )
            return {
                "info_completa": True,
                "mensaje_usuario": "Entendido. Voy a analizar tu caso con la información que me compartiste.",
                "caso_estructurado": {
                    "tipo": "Sin clasificar",
                    "hechos": user_text[:2000],
                    "fechas": [],
                    "ciudad": "No especificada",
                    "cuantia": None,
                    "personas": [],
                    "documentos": [],
                    "objetivo": "Por determinar",
                    "urgencia": "media",
                },
            }
        return {
            "info_completa": False,
            "siguiente_pregunta": (
                "¿Podrías contarme un poco más sobre lo que pasó? "
                "Específicamente: ¿en qué ciudad ocurrió esto y qué quieres lograr?"
            ),
            "info_recolectada_hasta_ahora": {},
        }
