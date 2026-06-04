"""Agente Asistente — Primer punto de contacto del ciudadano.

Utiliza Claude Haiku para minimizar costos. Conduce una conversación
empática que agrupa preguntas por turno para recolectar la información
necesaria antes de pasarla al agente de Triaje.

Máximo MAX_TURNS turnos; después fuerza la conclusión con lo recopilado.
"""

import json
from anthropic import Anthropic
import structlog

from config import get_settings

logger = structlog.get_logger()

MAX_TURNS = 5

FIRST_MESSAGE = (
    "Hola, cuéntame tu situación con tus propias palabras. "
    "No te preocupes por el orden ni los términos técnicos — "
    "yo voy a ayudarte a estructurarlo."
)

SYSTEM_PROMPT = """Eres la asistente de Defiéndete, una plataforma legal colombiana.
Tu único trabajo es recolectar información completa del caso del usuario para que los agentes especialistas puedan analizarlo correctamente.

PROCESO EN CADA TURNO — SIGUE ESTE ORDEN:
1. Lee PRIMERO todo lo que el usuario ha escrito en TODOS sus mensajes anteriores
2. Extrae mentalmente lo que ya sabes: tipo de problema, ciudad, fechas, personas, monto, objetivo
3. Identifica los campos más importantes que TODAVÍA faltan
4. Agrupa 2-3 de esas preguntas pendientes en UN solo mensaje coherente y natural
5. Si ya tienes suficiente info, pasa directamente al cierre (ver abajo)

INFORMACIÓN A RECOLECTAR:
- Tipo de problema (laboral, familia, consumidor, penal, salud, arrendamiento, etc.)
- Fechas relevantes (cuándo ocurrió, plazos vencidos)
- Ciudad/lugar donde ocurrió
- Cuantía o monto involucrado (si aplica)
- Personas o entidades involucradas
- Documentos que tiene el usuario
- Qué busca lograr (devolución, indemnización, protección, custodia, etc.)
- Si hay urgencia real (violencia activa, niños en riesgo, salud crítica, privación de libertad)

REGLAS CRÍTICAS:
- NO repitas preguntas sobre info que el usuario ya dio — lee todo antes de preguntar
- AGRUPA siempre 2-3 preguntas relacionadas en el mismo turno. Nunca hagas una sola pregunta si puedes aprovechar el turno para obtener más
- Sé concisa. Una oración de empatía + las preguntas agrupadas. Sin rodeos ni explicaciones largas
- NUNCA opines sobre el caso ni des consejos legales
- Si el usuario insiste en pedir consejo: "El análisis lo hará el especialista — primero déjame completar la información"
- Si detectas violencia activa, niños en riesgo o salud crítica: menciona la línea 155 (violencia) o 123 (emergencias) ANTES de continuar

CUÁNDO TIENES SUFICIENTE INFORMACIÓN:
Tienes suficiente cuando conoces: tipo de problema + ciudad + qué busca lograr.
En ese momento NO sigas preguntando. Cierra con un resumen humano del caso.

CIERRE OBLIGATORIO cuando info_completa = true:
El campo "mensaje_usuario" DEBE ser un resumen cálido en 2-3 líneas, como:
"Perfecto, entonces tu caso es: [resumen en las propias palabras del usuario — tipo de problema, quién está involucrado, qué busca]. Voy a analizarlo ahora con detalle."

Este cierre humaniza el momento antes del análisis técnico.

PERSONALIDAD:
- Empática pero profesional — no condescendiente, no infantil
- Español colombiano natural y cálido
- Directa: después del primer turno, ve al grano
- Seria en casos de violencia o urgencia (sin emojis)

FORMATO DE RESPUESTA — SIEMPRE JSON válido, sin texto antes ni después:

Cuando necesitas más información:
{
  "info_completa": false,
  "siguiente_pregunta": "<una oración de empatía o reconocimiento + las 2-3 preguntas agrupadas más importantes>",
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

Cuando tienes suficiente información:
{
  "info_completa": true,
  "mensaje_usuario": "Perfecto, entonces tu caso es: [resumen en 2-3 líneas]. Voy a analizarlo ahora con detalle.",
  "caso_estructurado": {
    "tipo": "<tipo de problema>",
    "hechos": "<relato completo en 4-6 oraciones con TODOS los datos recopilados — listo para análisis jurídico>",
    "fechas": ["<fecha>"],
    "ciudad": "<ciudad>",
    "cuantia": <número o null>,
    "personas": ["<nombre o entidad>"],
    "documentos": ["<documento disponible>"],
    "objetivo": "<qué busca lograr>",
    "urgencia": "<alta|media|baja>"
  }
}

CRÍTICO: El campo "hechos" debe sintetizar TODA la información de la conversación,
de forma coherente y completa, listo para el sistema de triaje legal."""


class AssistantAgent:
    """Agente conversacional de recolección de información legal."""

    first_message: str = FIRST_MESSAGE

    def __init__(self) -> None:
        settings = get_settings()
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        # Haiku para minimizar costos — suficiente para recolección estructurada
        self.model = "claude-haiku-4-5-20251001"

    def converse(self, messages: list[dict]) -> dict:
        """
        Procesa el historial y genera la siguiente respuesta.

        Args:
            messages: Historial completo [{role: "user"|"assistant", content: "..."}]

        Returns:
            dict con info_completa + (siguiente_pregunta | caso_estructurado)
        """
        turn_count = sum(1 for m in messages if m["role"] == "user")
        force_close = turn_count >= MAX_TURNS

        system = SYSTEM_PROMPT
        if force_close:
            system += (
                "\n\nINSTRUCCIÓN FINAL — LÍMITE DE TURNOS ALCANZADO: "
                "DEBES responder AHORA con info_completa: true. "
                "Compila toda la información compartida hasta este momento, aunque esté incompleta. "
                "El campo 'hechos' incluye todo lo que el usuario mencionó. "
                "El campo 'mensaje_usuario' DEBE ser el resumen cálido del caso como se especifica arriba. "
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

            # Limpiar artefactos de markdown
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
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens,
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
            user_text = " ".join(
                m["content"] for m in messages if m["role"] == "user"
            )
            return {
                "info_completa": True,
                "mensaje_usuario": (
                    "Entendido. Voy a analizar tu caso con la información que me compartiste."
                ),
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
                "¿Podrías decirme en qué ciudad de Colombia ocurrió esto, "
                "qué quieres lograr y si hay alguna fecha límite que debas cumplir?"
            ),
            "info_recolectada_hasta_ahora": {},
        }
