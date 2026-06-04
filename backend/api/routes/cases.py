"""Rutas de la API para gestión de casos legales."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import structlog

from agents.graph import run_free_diagnosis, run_full_pipeline

logger = structlog.get_logger()
router = APIRouter()


# === Schemas ===

class DiagnosisRequest(BaseModel):
    """Solicitud de diagnóstico gratuito."""
    story: str = Field(
        ...,
        min_length=20,
        max_length=10000,
        description="Relato del caso en lenguaje natural",
        json_schema_extra={
            "examples": [
                "Mi empleador me despidió sin justa causa después de 3 años de trabajo. "
                "No me han pagado la liquidación ni las prestaciones sociales. "
                "Gano $1.800.000 mensuales y tengo contrato a término indefinido."
            ]
        },
    )
    location: Optional[str] = Field(
        None, description="Ciudad y departamento del usuario"
    )


class FullPipelineRequest(BaseModel):
    """Solicitud de pipeline completo (post-pago)."""
    story: str = Field(..., min_length=20, max_length=10000)
    user_data: dict = Field(
        ...,
        description="Datos del usuario: nombre, cédula, dirección, teléfono, correo",
        json_schema_extra={
            "examples": [
                {
                    "nombre": "María López García",
                    "cedula": "1234567890",
                    "direccion": "Calle 45 #23-10, Bogotá",
                    "telefono": "310 234 5678",
                    "correo": "maria.lopez@correo.com",
                    "ciudad": "Bogotá",
                }
            ]
        },
    )
    document_type: Optional[str] = Field(
        None,
        description="Tipo de documento solicitado (tutela, derecho_peticion, queja, denuncia, etc.)",
    )
    payment_reference: str = Field(
        ..., description="Referencia del pago en Wompi"
    )


class DiagnosisResponse(BaseModel):
    """Respuesta del diagnóstico gratuito."""
    success: bool
    rama: str
    urgencia: str
    diagnosis_formatted: str
    triage_result: dict
    payment_required_for: list[str]


class PipelineResponse(BaseModel):
    """Respuesta del pipeline completo."""
    success: bool
    stage: str
    document: Optional[dict] = None
    audit_decision: Optional[str] = None
    audit_result: Optional[dict] = None
    error: Optional[str] = None


# === Endpoints ===

@router.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose_case(request: DiagnosisRequest):
    """
    Diagnóstico gratuito de un caso legal.

    Recibe el relato en lenguaje natural y devuelve:
    - Clasificación del caso (rama del derecho, urgencia)
    - Derechos vulnerados con artículos específicos
    - Opciones legales disponibles
    - Diagnóstico formateado para el usuario

    Este endpoint es GRATUITO y sirve como lead magnet.
    """
    try:
        result = run_free_diagnosis(request.story)

        triage = result["triage_result"]
        clasificacion = triage.get("clasificacion", {})

        return DiagnosisResponse(
            success=True,
            rama=clasificacion.get("rama_derecho", ""),
            urgencia=clasificacion.get("urgencia", ""),
            diagnosis_formatted=result["formatted"],
            triage_result=triage,
            payment_required_for=triage.get("requiere_pago_para", []),
        )

    except Exception as e:
        logger.error("diagnose_endpoint_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Error en diagnóstico: {str(e)}")


@router.post("/process", response_model=PipelineResponse)
async def process_case(request: FullPipelineRequest):
    """
    Pipeline completo: diagnóstico + estrategia + documento + auditoría.

    Requiere pago previo (referencia de Wompi).
    Genera el documento legal completo, verificado contra el corpus.
    """
    # TODO: Verificar pago con Wompi API
    # payment_valid = await verify_wompi_payment(request.payment_reference)
    # if not payment_valid:
    #     raise HTTPException(status_code=402, detail="Pago no verificado")

    try:
        result = run_full_pipeline(
            user_story=request.story,
            user_data=request.user_data,
            document_type=request.document_type or "",
        )

        stage = result.get("pipeline_stage", "unknown")

        if stage == "complete":
            return PipelineResponse(
                success=True,
                stage=stage,
                document=result.get("document"),
                audit_decision=result.get("audit_decision"),
                audit_result=result.get("audit_result"),
            )
        elif stage == "escalated":
            return PipelineResponse(
                success=False,
                stage=stage,
                error=result.get("error", "Requiere revisión humana"),
                audit_result=result.get("audit_result"),
            )
        else:
            return PipelineResponse(
                success=False,
                stage=stage,
                error=result.get("error", "Error desconocido en el pipeline"),
            )

    except Exception as e:
        logger.error("process_endpoint_error", error=str(e))
        raise HTTPException(
            status_code=500, detail=f"Error en procesamiento: {str(e)}"
        )


# === Schemas del Asistente ===

class MessageItem(BaseModel):
    """Un mensaje del historial de conversación."""
    role: str = Field(..., description="'user' o 'assistant'")
    content: str = Field(..., min_length=1)


class ConversarRequest(BaseModel):
    """Solicitud al agente asistente conversacional."""
    messages: list[MessageItem] = Field(
        ...,
        min_length=1,
        description="Historial completo de mensajes (incluye el primer saludo del asistente)",
    )


class ConversarResponse(BaseModel):
    """Respuesta del agente asistente."""
    info_completa: bool
    # Cuando info_completa = False
    siguiente_pregunta: Optional[str] = None
    info_recolectada_hasta_ahora: Optional[dict] = None
    # Cuando info_completa = True
    mensaje_usuario: Optional[str] = None
    caso_estructurado: Optional[dict] = None
    # Resultado del triaje (solo cuando info_completa = True y el triaje tuvo éxito)
    triage_result: Optional[dict] = None
    rama: Optional[str] = None
    urgencia: Optional[str] = None
    diagnosis_formatted: Optional[str] = None
    payment_required_for: Optional[list[str]] = None


# === Endpoint conversacional ===

@router.post("/conversar", response_model=ConversarResponse)
async def conversar(request: ConversarRequest):
    """
    Agente conversacional de recolección de información legal.

    Recibe el historial de mensajes y devuelve la siguiente respuesta
    del asistente. Cuando info_completa=True, ejecuta automáticamente
    el triaje legal y devuelve el diagnóstico inicial.

    Máximo 8 turnos de usuario para controlar costos.
    """
    from agents.assistant import AssistantAgent
    from agents.triage import TriageAgent

    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    # Paso 1 — Asistente recolecta información
    try:
        assistant = AssistantAgent()
        result = assistant.converse(messages)
    except Exception as e:
        logger.error("conversar_assistant_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Error en asistente: {str(e)}")

    # Paso 2 — Si la info está incompleta, devolver siguiente pregunta
    if not result.get("info_completa"):
        return ConversarResponse(
            info_completa=False,
            siguiente_pregunta=result.get(
                "siguiente_pregunta",
                "¿Podrías contarme un poco más sobre lo que pasó?"
            ),
            info_recolectada_hasta_ahora=result.get("info_recolectada_hasta_ahora", {}),
        )

    # Paso 3 — info_completa=True → ejecutar triaje automáticamente
    caso = result.get("caso_estructurado", {})
    relato = caso.get("hechos") or " ".join(
        m["content"] for m in messages if m["role"] == "user"
    )

    try:
        triage_agent = TriageAgent()
        triage = triage_agent.diagnose(
            user_story=relato,
            user_context={
                "ciudad": caso.get("ciudad", ""),
                "tipo": caso.get("tipo", ""),
                "urgencia_declarada": caso.get("urgencia", ""),
            },
        )
        clasificacion = triage.get("clasificacion", {})
        formatted = triage_agent.format_free_diagnosis(triage)

        logger.info(
            "conversar_triage_complete",
            rama=clasificacion.get("rama_derecho", ""),
            urgencia=clasificacion.get("urgencia", ""),
        )

        return ConversarResponse(
            info_completa=True,
            mensaje_usuario=result.get("mensaje_usuario", ""),
            caso_estructurado=caso,
            triage_result=triage,
            rama=clasificacion.get("rama_derecho", ""),
            urgencia=clasificacion.get("urgencia", ""),
            diagnosis_formatted=formatted,
            payment_required_for=triage.get("requiere_pago_para", []),
        )

    except Exception as e:
        logger.error("conversar_triage_error", error=str(e))
        # Devolvemos la info del asistente aunque el triaje falle
        return ConversarResponse(
            info_completa=True,
            mensaje_usuario=result.get("mensaje_usuario", ""),
            caso_estructurado=caso,
        )


@router.get("/stats")
async def get_stats():
    """Estadísticas del corpus legal y pipeline."""
    try:
        from rag.qdrant_client import CorpusLegalDB

        db = CorpusLegalDB()
        stats = db.get_stats()
        return {"corpus": stats}
    except Exception as e:
        return {"error": str(e)}
