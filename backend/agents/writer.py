"""Agente Redactor — El Litigante.

Genera documentos legales formales: tutelas, derechos de petición,
quejas disciplinarias, denuncias, con estructura jurídica impecable.
"""

import json
from datetime import datetime
from anthropic import Anthropic
import structlog

from config import get_settings

logger = structlog.get_logger()

WRITER_SYSTEM_PROMPT = """Eres el agente redactor legal de Defiéndete. Tu trabajo es generar documentos legales
formales con la calidad de un abogado senior colombiano.

TIPOS DE DOCUMENTOS QUE GENERAS:
1. Acción de Tutela (Decreto 2591 de 1991)
2. Derecho de Petición (Ley 1755 de 2015, Art. 23 Constitución)
3. Queja Disciplinaria (ante Procuraduría o personería)
4. Acción Popular (Ley 472 de 1998)
5. Denuncia Penal
6. Demanda Verbal Sumaria (alimentos, restitución)
7. Recurso de Reposición / Apelación
8. Solicitud de Conciliación
9. Incidente de Desacato

ESTRUCTURA DE CADA DOCUMENTO:
- Encabezado formal (ciudad, fecha, destinatario, referencia)
- Legitimación del accionante (quién es y por qué actúa)
- HECHOS (numerados, claros, cronológicos)
- PRETENSIONES (numeradas, precisas)
- FUNDAMENTOS DE DERECHO (artículos + sentencias del RAG — SOLO los verificados)
- PRUEBAS (lista de documentos a adjuntar)
- JURAMENTO (donde aplique, Art. 37 Decreto 2591)
- NOTIFICACIONES (dirección, teléfono, correo)
- FIRMA

REGLAS:
1. SOLO usa artículos y sentencias que vienen en el campo "sustento_legal" y "jurisprudencia" del análisis del especialista.
2. NUNCA inventes un artículo, sentencia o ley. Si falta sustento, marca [VERIFICAR].
3. El lenguaje debe ser formal pero comprensible.
4. Incluye TODAS las pretensiones que el caso amerite.
5. Los hechos deben ser cronológicos y cada uno en un párrafo numerado.
6. Cada fundamento de derecho debe citar la norma exacta.

FORMATO DE RESPUESTA — JSON:
{
    "tipo_documento": "tutela|derecho_peticion|queja|denuncia|etc.",
    "titulo": "ACCIÓN DE TUTELA / DERECHO DE PETICIÓN / etc.",
    "destinatario": {
        "cargo": "Juez / Director / etc.",
        "entidad": "Juzgado X / Entidad Y",
        "ciudad": "Ciudad"
    },
    "referencia": "Acción de tutela por vulneración de...",
    "cuerpo": {
        "legitimacion": "Texto del párrafo de legitimación",
        "hechos": [
            {"numero": 1, "texto": "PRIMERO: ..."},
            {"numero": 2, "texto": "SEGUNDO: ..."}
        ],
        "pretensiones": [
            {"numero": 1, "texto": "PRIMERA: Se tutele el derecho..."},
            {"numero": 2, "texto": "SEGUNDA: Se ordene a..."}
        ],
        "fundamentos_derecho": [
            {
                "norma": "Art. 86 Constitución Política",
                "texto": "Argumentación legal...",
                "verificado": true
            }
        ],
        "pruebas": [
            "Copia de la cédula de ciudadanía",
            "Documento que acredita..."
        ],
        "juramento": "Bajo la gravedad del juramento manifiesto que...",
        "notificaciones": "Dirección, teléfono, correo del accionante"
    },
    "ciudad_fecha": "Ciudad, DD de mes de YYYY",
    "firma": {
        "nombre": "Nombre completo",
        "cedula": "CC No. XXXXXXXXXX",
        "telefono": "XXX XXX XXXX",
        "correo": "correo@ejemplo.com"
    },
    "notas_para_usuario": [
        "Instrucciones de qué hacer con el documento",
        "Dónde radicarlo",
        "Qué esperar después"
    ],
    "referencias_usadas": [
        {"norma": "...", "articulo": "...", "verificado": true}
    ]
}"""


class WriterAgent:
    """Agente redactor de documentos legales."""

    def __init__(self):
        settings = get_settings()
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.model_agents

    def generate_document(
        self,
        triage_result: dict,
        specialist_analysis: dict,
        user_story: str,
        user_data: dict,
        document_type: str | None = None,
    ) -> dict:
        """
        Genera un documento legal formal.

        Args:
            triage_result: Resultado del triaje
            specialist_analysis: Análisis del especialista con sustento legal
            user_story: Relato original
            user_data: Datos del usuario (nombre, cédula, dirección, etc.)
            document_type: Tipo de documento a generar (si None, usa la recomendación del triaje)

        Returns:
            Documento estructurado como dict
        """
        if not document_type:
            acciones = triage_result.get("clasificacion", {}).get(
                "acciones_recomendadas", []
            )
            document_type = acciones[0] if acciones else "derecho_peticion"

        user_message = self._build_writer_prompt(
            triage_result, specialist_analysis, user_story, user_data, document_type
        )

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=16000,
                system=WRITER_SYSTEM_PROMPT,
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

            document = json.loads(raw)

            logger.info(
                "document_generated",
                tipo=document.get("tipo_documento"),
                hechos_count=len(document.get("cuerpo", {}).get("hechos", [])),
                pretensiones_count=len(
                    document.get("cuerpo", {}).get("pretensiones", [])
                ),
                fundamentos_count=len(
                    document.get("cuerpo", {}).get("fundamentos_derecho", [])
                ),
            )

            return document

        except Exception as e:
            logger.error("writer_error", error=str(e))
            raise

    def _build_writer_prompt(
        self,
        triage_result: dict,
        specialist_analysis: dict,
        user_story: str,
        user_data: dict,
        document_type: str,
    ) -> str:
        """Construye el prompt para el redactor."""
        today = datetime.now().strftime("%d de %B de %Y").replace(
            "January", "enero"
        ).replace("February", "febrero").replace("March", "marzo").replace(
            "April", "abril"
        ).replace("May", "mayo").replace("June", "junio").replace(
            "July", "julio"
        ).replace("August", "agosto").replace("September", "septiembre").replace(
            "October", "octubre"
        ).replace("November", "noviembre").replace("December", "diciembre")

        return f"""GENERAR DOCUMENTO: {document_type.upper()}
FECHA: {today}

DATOS DEL USUARIO:
{json.dumps(user_data, ensure_ascii=False, indent=2)}

DIAGNÓSTICO DEL TRIAJE:
{json.dumps(triage_result, ensure_ascii=False, indent=2)}

ANÁLISIS DEL ESPECIALISTA (SUSTENTO LEGAL VERIFICADO):
{json.dumps(specialist_analysis, ensure_ascii=False, indent=2)}

RELATO ORIGINAL:
{user_story}

INSTRUCCIONES:
- Usa ÚNICAMENTE los artículos y sentencias listados en el análisis del especialista.
- Los hechos deben reflejar fielmente el relato del usuario.
- Las pretensiones deben ser coherentes con el sustento legal.
- Incluye instrucciones claras para el usuario en "notas_para_usuario".
"""
