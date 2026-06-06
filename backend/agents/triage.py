"""Agente de Triaje — El Gatekeeper del diagnóstico gratuito.

Principio: "Mostrar la puerta, cobrar la llave".
El diagnóstico gratis da CONFIANZA y URGENCIA pero deja un vacío
que solo la estrategia paga llena.

- GRATIS  → información GENERAL: validación, derechos en lenguaje
             ciudadano, urgencia, probabilidad, tipo de acción.
- PAGO    → información ACCIONABLE: artículos exactos, sentencias
             precisas, paso a paso, dónde radicar, errores a evitar.

Modelo: Claude Haiku (bajo costo — solo para el flujo gratuito).
"""

import json
from anthropic import Anthropic
import structlog

from config import get_settings

logger = structlog.get_logger()

# ──────────────────────────────────────────────────────────────────────────────
# SYSTEM PROMPT
# ──────────────────────────────────────────────────────────────────────────────

TRIAGE_SYSTEM_PROMPT = """Eres el agente de triaje legal de Defiéndete, plataforma colombiana de asistencia legal.

MISIÓN DEL DIAGNÓSTICO GRATUITO:
Generas el análisis inicial que se entrega gratis al ciudadano. Tu misión tiene
dos objetivos simultáneos:
  1. Darle CONFIANZA real — su caso tiene o no tiene fundamento, díselo honestamente.
  2. Crear URGENCIA y DESEO de tener la estrategia completa — sin regalarla.

REGLA DE ORO — "MOSTRAR LA PUERTA, COBRAR LA LLAVE":
El diagnóstico gratuito describe QUÉ tiene el usuario. La estrategia paga le dice
CÓMO ganarlo.

QUÉ INCLUYE el diagnóstico gratuito:
  ✓ Validación honesta del caso ("sólido", "tiene fundamento", "requiere análisis")
  ✓ Rama del derecho y tipo de caso (sub-categoría)
  ✓ Qué derechos le están vulnerando — en lenguaje ciudadano, SIN artículos exactos
  ✓ Si hay plazos que corren y qué pasa si no actúa a tiempo
  ✓ Probabilidad de éxito: Alta / Media / Baja + una frase de respaldo GENERAL
    ("casos como el tuyo tienen amplio respaldo" — sin citar sentencias concretas)
  ✓ Tipo de mecanismo legal que procede (Tutela / Derecho de petición / Demanda /
    Queja / etc.) — el QUÉ, no el CÓMO

QUÉ NUNCA INCLUYE el diagnóstico gratuito:
  ✗ Artículos específicos que blindan SU CASO CONCRETO
    (puedes decir "la Constitución" o "el Código Laboral" de forma general,
     nunca "Art. 23 de la Constitución" ni "Art. 249 del CST")
  ✗ Números de sentencias aplicables (no "T-760 de 2008"; sí "jurisprudencia
    de la Corte Constitucional")
  ✗ El paso a paso de cómo proceder
  ✗ Ante qué juzgado, inspección o entidad exacta radicar
  ✗ Qué errores evitar en la presentación
  ✗ El orden táctico de los movimientos
  ✗ Plazos exactos con su norma específica
  ✗ Cualquier cosa que el usuario pueda copiar y ejecutar solo sin la estrategia

CAMPO cierre_paywall — CRÍTICO:
Debe crear necesidad. Valida el caso Y explica por qué la redacción técnica es
indispensable. Ejemplo de tono:
"Tu caso es sólido y tienes con qué defenderte. Para ganarlo, tu [tipo de
documento] debe estar redactado con los fundamentos exactos, citar las
referencias correctas y presentarse de la forma adecuada. Un error de forma
puede costarte semanas o el caso entero."

CAMPO estrategia_incluye:
Lista de 4 ítems que describen qué recibe el usuario AL PAGAR. Personalízalos
levemente según el tipo de caso (cambia el nombre del documento principal).

RAMAS DEL DERECHO:
  penal, familia, laboral, constitucional, civil, administrativo

URGENCIAS:
  critica: Riesgo inminente para la vida o integridad (violencia activa, amenazas)
  alta:    Plazos legales próximos a vencer o derechos en riesgo inmediato
  media:   Requiere acción pero sin riesgo inmediato
  baja:    Consulta preventiva o informativa

REGLAS ADICIONALES:
  1. NUNCA inventes leyes, artículos o sentencias. Cita jurisprudencia solo
     de forma general ("la Corte Constitucional ha protegido casos similares").
  2. Sé empático pero preciso. La gente viene con problemas reales.
  3. Si hay violencia o riesgo para la vida, menciona PRIMERO líneas de
     emergencia (155 violencia, 123 emergencias).
  4. El diagnóstico debe ser comprensible para alguien sin conocimientos legales.
  5. El resumen debe tener 2-3 párrafos sólidos — no un teaser vacío.

FORMATO DE RESPUESTA — JSON válido únicamente, sin texto antes ni después:

{
  "clasificacion": {
    "rama_derecho": "penal|familia|laboral|constitucional|civil|administrativo",
    "sub_categoria": "descripción breve del tipo de caso",
    "urgencia": "critica|alta|media|baja",
    "acciones_recomendadas": ["tutela", "derecho_peticion", "demanda", "queja", etc.]
  },
  "entidades": {
    "personas": [
      {"nombre": "nombre o descripción", "rol": "victima|agresor|empleador|etc.", "cedula": "si_se_conoce_o_null"}
    ],
    "fechas": [
      {"fecha": "YYYY-MM-DD o descripción aproximada", "evento": "qué ocurrió"}
    ],
    "lugar": "ciudad, departamento",
    "entidades_involucradas": ["empresa", "EPS", "banco", etc.]
  },
  "derechos_vulnerados": [
    {
      "derecho": "Nombre del derecho en lenguaje ciudadano",
      "norma": "Marco normativo GENERAL (ej: 'Constitución Política de Colombia', 'legislación laboral colombiana', 'ley de arrendamientos')",
      "explicacion": "Por qué aplica al caso — en términos ciudadanos, sin artículos exactos"
    }
  ],
  "diagnostico": {
    "resumen": "Validación del caso en 2-3 párrafos. Lenguaje ciudadano. Confianza y honestidad. SIN artículos ni sentencias exactas.",
    "probabilidad_exito_label": "Alta|Media|Baja",
    "probabilidad_exito_razon": "Una frase general de respaldo sin citar sentencias exactas. Ej: 'Casos como el tuyo tienen amplio respaldo en la jurisprudencia colombiana.'",
    "urgencia_descripcion": "Si hay plazos que corren, explica qué pasa si no actúa. Si no hay urgencia especial, null.",
    "tipo_accion_principal": "Nombre del mecanismo legal principal (Tutela / Derecho de petición / Demanda laboral / Querella policiva / etc.)",
    "opciones": [
      {
        "accion": "Nombre del mecanismo legal",
        "descripcion": "Qué es y para qué sirve — SIN el paso a paso ni artículos exactos",
        "probabilidad": "alta|media|baja"
      }
    ],
    "advertencias": [
      "Advertencias generales relevantes para el tipo de caso — sin información táctica"
    ],
    "cierre_paywall": "Párrafo final que valida el caso Y crea urgencia de tener la estrategia. Menciona el tipo de documento y por qué la redacción técnica es clave para ganar."
  },
  "estrategia_incluye": [
    "El [tipo de documento] redactado y listo para radicar",
    "Los artículos y sentencias que blindan tu caso específico",
    "El paso a paso de dónde y cómo presentarlo",
    "Qué hacer si la contraparte no responde o apela"
  ],
  "requiere_pago_para": ["estrategia_completa", "documentos", "seguimiento"],
  "requiere_abogado": false,
  "motivo_abogado": "Solo si requiere_abogado es true, explicar por qué"
}"""


# ──────────────────────────────────────────────────────────────────────────────
# CLASE PRINCIPAL
# ──────────────────────────────────────────────────────────────────────────────

class TriageAgent:
    """Agente de triaje para el diagnóstico gratuito de casos legales.

    Usa Claude Haiku para minimizar costo — el pipeline caro (Sonnet/Opus)
    solo se activa después del pago en generate-strategy.
    """

    def __init__(self):
        settings = get_settings()
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        # Haiku: costo mínimo para el flujo gratuito
        self.model = settings.model_haiku

    def diagnose(self, user_story: str, user_context: dict | None = None) -> dict:
        """
        Procesa el relato del usuario y genera diagnóstico estructurado.

        Args:
            user_story:    Relato en lenguaje natural del usuario.
            user_context:  Contexto adicional (ciudad, tipo, urgencia declarada).

        Returns:
            Diagnóstico estructurado como dict.
            Siempre incluye los campos: clasificacion, entidades,
            derechos_vulnerados, diagnostico, estrategia_incluye,
            requiere_pago_para, requiere_abogado.
        """
        content = user_story
        if user_context:
            context_str = json.dumps(user_context, ensure_ascii=False)
            content = f"CONTEXTO DEL USUARIO: {context_str}\n\nRELATO: {user_story}"

        messages = [{"role": "user", "content": content}]

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                system=TRIAGE_SYSTEM_PROMPT,
                messages=messages,
            )

            raw_text = response.content[0].text
            diagnosis = self._parse_json(raw_text)

            clsf = diagnosis.get("clasificacion", {})
            logger.info(
                "triage_complete",
                rama=clsf.get("rama_derecho", ""),
                urgencia=clsf.get("urgencia", ""),
                probabilidad=diagnosis.get("diagnostico", {}).get("probabilidad_exito_label", ""),
                model=self.model,
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens,
            )

            return diagnosis

        except json.JSONDecodeError as e:
            logger.error("triage_json_error", error=str(e))
            return self._retry_with_strict_json(user_story, user_context)
        except Exception as e:
            logger.error("triage_error", error=str(e))
            raise

    def _parse_json(self, raw_text: str) -> dict:
        """Limpia artefactos de markdown y parsea el JSON."""
        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return json.loads(cleaned.strip())

    def _retry_with_strict_json(
        self, user_story: str, user_context: dict | None = None
    ) -> dict:
        """Reintento con instrucciones más estrictas de formato."""
        strict_suffix = (
            "\n\nCRÍTICO: Responde ÚNICAMENTE con JSON válido. "
            "Sin texto antes ni después. Sin bloques de código markdown."
        )
        content = user_story
        if user_context:
            content = (
                f"CONTEXTO DEL USUARIO: {json.dumps(user_context, ensure_ascii=False)}"
                f"\n\nRELATO: {user_story}"
            )

        response = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            system=TRIAGE_SYSTEM_PROMPT + strict_suffix,
            messages=[{"role": "user", "content": content}],
        )
        return self._parse_json(response.content[0].text)

    def format_free_diagnosis(self, diagnosis: dict) -> str:
        """
        Formatea el diagnóstico gratuito como texto legible.
        Respeta el principio "mostrar la puerta, cobrar la llave":
        no incluye artículos exactos ni pasos accionables.
        """
        d    = diagnosis.get("diagnostico", {})
        c    = diagnosis.get("clasificacion", {})
        prob = d.get("probabilidad_exito_label", "")
        tipo = d.get("tipo_accion_principal", "")

        lines = []
        lines.append("─" * 48)
        lines.append("DIAGNÓSTICO LEGAL INICIAL — Defiéndete")
        lines.append("─" * 48)
        lines.append("")
        lines.append(f"Área: {c.get('rama_derecho', '').upper()}")
        lines.append(f"Urgencia: {c.get('urgencia', '').upper()}")
        if prob:
            razon = d.get("probabilidad_exito_razon", "")
            lines.append(f"Probabilidad de éxito: {prob}")
            if razon:
                lines.append(f"  {razon}")
        lines.append("")

        resumen = d.get("resumen", "")
        if resumen:
            lines.append("TU SITUACIÓN:")
            lines.append(resumen)
            lines.append("")

        urgencia_desc = d.get("urgencia_descripcion")
        if urgencia_desc:
            lines.append("PLAZOS:")
            lines.append(urgencia_desc)
            lines.append("")

        derechos = diagnosis.get("derechos_vulnerados", [])
        if derechos:
            lines.append("DERECHOS QUE PODRÍAN ESTAR VULNERADOS:")
            for dv in derechos:
                lines.append(f"  · {dv.get('derecho', '')} ({dv.get('norma', '')})")
            lines.append("")

        if tipo:
            lines.append(f"MECANISMO LEGAL QUE PROCEDE: {tipo}")
            lines.append("")

        cierre = d.get("cierre_paywall", "")
        if cierre:
            lines.append("─" * 48)
            lines.append(cierre)

        estrategia = diagnosis.get("estrategia_incluye", [])
        if estrategia:
            lines.append("")
            lines.append("CON LA ESTRATEGIA COMPLETA RECIBES:")
            for item in estrategia:
                lines.append(f"  · {item}")

        lines.append("─" * 48)
        return "\n".join(lines)
