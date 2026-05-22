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
