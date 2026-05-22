"""Agente de Triaje — El Gatekeeper.

Recibe el relato del usuario en lenguaje natural y extrae:
- Clasificación del caso (rama del derecho, urgencia)
- Entidades (nombres, cédulas, fechas, lugares)
- Derechos vulnerados (con artículos específicos)
- Diagnóstico inicial gratuito
"""

import json
from anthropic import Anthropic
import structlog

from config import get_settings

logger = structlog.get_logger()

TRIAGE_SYSTEM_PROMPT = """Eres el agente de triaje legal de Defiéndete, una plataforma colombiana de asistencia legal.

TU TRABAJO:
1. Escuchar con empatía el relato del usuario.
2. Extraer datos estructurados: nombres, cédulas, fechas, lugares, relaciones.
3. Clasificar el caso según la rama del derecho colombiano.
4. Identificar los derechos fundamentales vulnerados con artículos específicos de la Constitución y leyes aplicables.
5. Determinar la urgencia del caso.
6. Generar un diagnóstico inicial claro, honesto y comprensible.
7. Recomendar las acciones legales posibles.

RAMAS DEL DERECHO:
- penal: Delitos, denuncias, violencia, hurto, estafa, lesiones
- familia: Custodia, alimentos, divorcio, violencia intrafamiliar, adopción
- laboral: Despido, acoso laboral, prestaciones, liquidación, contrato
- constitucional: Tutelas, derechos de petición, acciones populares
- civil: Contratos, arrendamiento, deudas, sucesiones, propiedad
- administrativo: Quejas contra entidades del estado, disciplinarias

URGENCIAS:
- critica: Riesgo inminente para la vida o integridad (violencia activa, amenazas)
- alta: Plazos legales próximos a vencer o derechos en riesgo inmediato
- media: Situación que requiere acción pero sin riesgo inmediato
- baja: Consulta preventiva o informativa

REGLAS INQUEBRANTABLES:
1. NUNCA inventes leyes, artículos o sentencias. Si no estás 100% seguro del número exacto, di "requiere verificación especializada".
2. NUNCA des asesoría jurídica. Das INFORMACIÓN LEGAL ESTRUCTURADA.
3. Sé empático pero preciso. La gente viene con problemas reales.
4. Si el caso involucra violencia o riesgo para la vida, SIEMPRE menciona primero las líneas de emergencia (155, 123).
5. El diagnóstico debe ser comprensible para alguien sin conocimientos legales.

FORMATO DE RESPUESTA:
Responde SIEMPRE en JSON válido con esta estructura exacta:
{
    "clasificacion": {
        "rama_derecho": "penal|familia|laboral|constitucional|civil|administrativo",
        "sub_categoria": "descripción breve",
        "urgencia": "critica|alta|media|baja",
        "acciones_recomendadas": ["tutela", "derecho_peticion", "denuncia", etc.]
    },
    "entidades": {
        "personas": [
            {"nombre": "...", "rol": "victima|agresor|demandante|demandado|empleador|etc.", "cedula": "si_se_proporciona"}
        ],
        "fechas": [{"fecha": "YYYY-MM-DD", "evento": "descripción"}],
        "lugar": "ciudad, departamento",
        "entidades_involucradas": ["empresa", "EPS", "banco", etc.]
    },
    "derechos_vulnerados": [
        {
            "derecho": "Nombre del derecho",
            "norma": "Art. X de la Constitución / Ley Y",
            "explicacion": "Por qué aplica al caso"
        }
    ],
    "diagnostico": {
        "resumen": "Explicación clara del caso en 2-3 párrafos, en lenguaje ciudadano",
        "situacion_legal": "En qué posición legal se encuentra la persona",
        "opciones": [
            {
                "accion": "Nombre de la acción legal",
                "descripcion": "Qué es y para qué sirve",
                "plazo": "Plazo legal si aplica",
                "probabilidad": "alta|media|baja",
                "costo_aproximado": "Gratis / $30K-$50K / etc."
            }
        ],
        "advertencias": ["Lo que debe saber o tener cuidado"],
        "documentos_necesarios": ["Cédula", "Pruebas", etc.]
    },
    "requiere_pago_para": ["estrategia_completa", "documentos", "seguimiento"],
    "requiere_abogado": false,
    "motivo_abogado": "Solo si requiere_abogado es true"
}"""


class TriageAgent:
    """Agente de triaje para clasificación de casos legales."""

    def __init__(self):
        settings = get_settings()
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.model_agents

    def diagnose(self, user_story: str, user_context: dict | None = None) -> dict:
        """
        Procesa el relato del usuario y genera diagnóstico estructurado.

        Args:
            user_story: Relato en lenguaje natural del usuario
            user_context: Contexto adicional (ubicación, datos previos)

        Returns:
            Diagnóstico estructurado como dict
        """
        messages = [{"role": "user", "content": user_story}]

        if user_context:
            context_str = json.dumps(user_context, ensure_ascii=False)
            messages[0]["content"] = (
                f"CONTEXTO DEL USUARIO: {context_str}\n\n"
                f"RELATO: {user_story}"
            )

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=TRIAGE_SYSTEM_PROMPT,
                messages=messages,
            )

            raw_text = response.content[0].text

            # Limpiar posibles artefactos de markdown
            cleaned = raw_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]

            diagnosis = json.loads(cleaned.strip())

            logger.info(
                "triage_complete",
                rama=diagnosis["clasificacion"]["rama_derecho"],
                urgencia=diagnosis["clasificacion"]["urgencia"],
                acciones=len(diagnosis["clasificacion"]["acciones_recomendadas"]),
            )

            return diagnosis

        except json.JSONDecodeError as e:
            logger.error("triage_json_error", error=str(e), raw=raw_text[:500])
            # Retry con instrucción más estricta
            return self._retry_with_strict_json(user_story)
        except Exception as e:
            logger.error("triage_error", error=str(e))
            raise

    def _retry_with_strict_json(self, user_story: str) -> dict:
        """Reintento con instrucciones más estrictas de formato."""
        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=TRIAGE_SYSTEM_PROMPT + "\n\nCRÍTICO: Responde ÚNICAMENTE con JSON válido. Sin texto antes ni después. Sin bloques de código markdown.",
            messages=[{"role": "user", "content": user_story}],
        )

        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]

        return json.loads(raw.strip())

    def format_free_diagnosis(self, diagnosis: dict) -> str:
        """
        Formatea el diagnóstico gratuito para mostrar al usuario
        ANTES del paywall.
        """
        d = diagnosis["diagnostico"]
        c = diagnosis["clasificacion"]

        lines = []
        lines.append("═" * 50)
        lines.append("📋 DIAGNÓSTICO LEGAL INICIAL")
        lines.append("═" * 50)
        lines.append("")
        lines.append(f"📌 Área del derecho: {c['rama_derecho'].upper()}")
        lines.append(f"⚡ Urgencia: {c['urgencia'].upper()}")
        lines.append("")
        lines.append("📖 RESUMEN DE SU CASO:")
        lines.append(d["resumen"])
        lines.append("")
        lines.append("⚖️ SU SITUACIÓN LEGAL:")
        lines.append(d["situacion_legal"])
        lines.append("")

        if diagnosis.get("derechos_vulnerados"):
            lines.append("🛡️ DERECHOS QUE PODRÍAN ESTAR VULNERADOS:")
            for dv in diagnosis["derechos_vulnerados"]:
                lines.append(f"  • {dv['derecho']} — {dv['norma']}")
            lines.append("")

        lines.append("📋 OPCIONES DISPONIBLES:")
        for i, op in enumerate(d["opciones"], 1):
            lines.append(f"  {i}. {op['accion']}: {op['descripcion']}")
            if op.get("plazo"):
                lines.append(f"     ⏰ Plazo: {op['plazo']}")
        lines.append("")

        if d.get("advertencias"):
            lines.append("⚠️ IMPORTANTE:")
            for adv in d["advertencias"]:
                lines.append(f"  • {adv}")
            lines.append("")

        lines.append("═" * 50)
        lines.append("💡 Para obtener la estrategia legal completa,")
        lines.append("   documentos listos para radicar y seguimiento")
        lines.append("   de su caso, active el plan completo.")
        lines.append("═" * 50)

        return "\n".join(lines)
