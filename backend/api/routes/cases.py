"""Rutas de la API para gestión de casos legales."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional
import io
import base64
import structlog

from agents.graph import run_free_diagnosis, run_full_pipeline
from config import get_settings

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


class GenerateStrategyRequest(BaseModel):
    """Solicitud del flujo completo hasta PDF."""
    story: str = Field(..., min_length=20, max_length=10000)
    user_data: dict = Field(
        ...,
        description="Datos del usuario: nombre, cedula, direccion, telefono, correo, ciudad",
        json_schema_extra={
            "examples": [{
                "nombre": "Maria Lopez Garcia",
                "cedula": "1234567890",
                "direccion": "Calle 45 #23-10, Bogota",
                "telefono": "310 234 5678",
                "correo": "maria@correo.com",
                "ciudad": "Bogota",
            }]
        },
    )
    document_type: Optional[str] = Field(
        None,
        description="Tipo de documento (tutela, derecho_peticion, queja, denuncia...)",
    )
    payment_reference: Optional[str] = Field(
        None, description="Referencia del pago en Wompi"
    )
    test_mode: bool = Field(
        False,
        description="Si es True, omite la verificacion de pago (solo para testing)",
    )


class StrategyNextStep(BaseModel):
    orden: int
    accion: str
    detalle: Optional[str] = None
    plazo: Optional[str] = None
    ante_quien: Optional[str] = None
    documentos: Optional[list[str]] = None


class PlazoLegal(BaseModel):
    accion: str
    plazo: str
    norma: Optional[str] = None
    desde_cuando: Optional[str] = None


class GenerateStrategyResponse(BaseModel):
    """Respuesta completa del pipeline con PDF adjunto."""
    success: bool
    stage: str

    # Documento generado
    document: Optional[dict] = None
    document_pdf_b64: Optional[str] = None   # PDF codificado en Base64

    # Análisis de agentes
    triage_result: Optional[dict] = None
    specialist_analysis: Optional[dict] = None
    opposing_counsel_analysis: Optional[dict] = None
    audit_result: Optional[dict] = None
    audit_decision: Optional[str] = None

    # Resumen ejecutivo para el usuario
    calificacion_caso: Optional[str] = None  # solido | riesgoso | debil
    next_steps: Optional[list[StrategyNextStep]] = None
    plazos_criticos: Optional[list[PlazoLegal]] = None
    probabilidad_exito: Optional[str] = None

    error: Optional[str] = None


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
        description="Historial completo de mensajes (incluye el saludo inicial del asistente)",
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


# === Rate limiting (Redis) ===

async def _check_rate_limit(request: Request) -> tuple[bool, str]:
    """
    1 conversación gratuita por IP cada 24h.
    Usa Redis con SET NX (atómico). Falla silenciosamente si Redis no está disponible.
    """
    try:
        import redis.asyncio as aioredis
        settings = get_settings()
        client_ip = getattr(request.client, "host", "unknown")
        key = f"diag_limit:{client_ip}"

        async with aioredis.from_url(settings.redis_url, decode_responses=True) as r:
            # SET key value EX 86400 NX — atómico, solo setea si no existe
            set_ok = await r.set(key, "1", ex=86400, nx=True)
            if set_ok:
                logger.info("rate_limit_new", ip=client_ip)
                return True, ""

            ttl = await r.ttl(key)
            horas = max(1, ttl // 3600)
            logger.info("rate_limit_blocked", ip=client_ip, ttl_seconds=ttl)
            return False, (
                f"Ya iniciaste un diagnóstico hoy. "
                f"Continúa con tu caso anterior o vuelve en {horas} hora(s)."
            )
    except Exception as e:
        # Redis no disponible — permitir siempre (falla silenciosa)
        logger.warning("rate_limit_redis_error", error=str(e))
        return True, ""


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


@router.post("/conversar", response_model=ConversarResponse)
async def conversar(http_request: Request, payload: ConversarRequest):
    """
    Agente conversacional de recolección de información legal.

    Recibe el historial de mensajes y devuelve la siguiente respuesta
    del asistente. Cuando info_completa=True, ejecuta automáticamente
    el triaje legal y devuelve el diagnóstico inicial.

    Límites:
    - Máximo 5 turnos de usuario (costo-eficiente)
    - 1 conversación gratuita por IP cada 24h (requiere Redis)
    """
    from agents.assistant import AssistantAgent
    from agents.triage import TriageAgent

    messages = [{"role": m.role, "content": m.content} for m in payload.messages]
    user_turns = sum(1 for m in messages if m["role"] == "user")

    # Rate limit — solo en el primer turno del usuario
    if user_turns == 1:
        allowed, limit_msg = await _check_rate_limit(http_request)
        if not allowed:
            raise HTTPException(status_code=429, detail=limit_msg)

    # Paso 1 — Asistente recolecta información
    try:
        assistant = AssistantAgent()
        result = assistant.converse(messages)
    except Exception as e:
        logger.error("conversar_assistant_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Error en asistente: {str(e)}")

    # Paso 2 — Información incompleta → devolver siguiente pregunta
    if not result.get("info_completa"):
        logger.info(
            "conversar_turn",
            ip=getattr(http_request.client, "host", "?"),
            turn=user_turns,
            info_completa=False,
        )
        return ConversarResponse(
            info_completa=False,
            siguiente_pregunta=result.get(
                "siguiente_pregunta",
                "¿Podrías contarme un poco más sobre tu situación?"
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
            "conversar_complete",
            ip=getattr(http_request.client, "host", "?"),
            turns=user_turns,
            rama=clasificacion.get("rama_derecho", ""),
            urgencia=clasificacion.get("urgencia", ""),
            with_documents=any(m.get("role") == "document" for m in messages if isinstance(m, dict)),
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
        # Devolver info del asistente aunque el triaje falle
        return ConversarResponse(
            info_completa=True,
            mensaje_usuario=result.get("mensaje_usuario", ""),
            caso_estructurado=caso,
        )


@router.post("/upload-document")
async def upload_document(http_request: Request, file: UploadFile = File(...)):
    """
    Procesa un documento (PDF/imagen) con Claude y extrae su contenido relevante.

    Plan gratuito:
    - Tipos aceptados: PDF, JPG, PNG
    - Tamaño máximo: 5 MB
    - Límite: 3 páginas (PDF). Si supera, devuelve mensaje informativo en vez de error.
    - Los documentos NO se almacenan — solo se procesan en memoria.
    """
    settings = get_settings()

    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}
    MAX_SIZE     = 5 * 1024 * 1024  # 5 MB
    MAX_PAGES    = 3

    # Validar tipo
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Tipo de archivo no soportado. Sube un PDF, JPG o PNG.",
        )

    # Leer y validar tamaño
    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail="El archivo supera el límite de 5 MB.",
        )

    page_count   = 1
    extracted_text = None

    # PDF → contar páginas y extraer texto
    if content_type == "application/pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(data))
            page_count = len(reader.pages)

            if page_count > MAX_PAGES:
                logger.info(
                    "document_upload_limit",
                    filename=file.filename,
                    pages=page_count,
                )
                return {
                    "success": False,
                    "limit_reached": True,
                    "message": (
                        f"Tu documento tiene {page_count} páginas. "
                        f"Para procesar documentos más extensos necesitas el plan completo. "
                        f"Continúa con el diagnóstico gratuito y luego podrás adjuntarlo."
                    ),
                }

            # Extraer texto de las páginas permitidas
            extracted_text = "\n\n".join(
                page.extract_text() or "" for page in reader.pages
            ).strip()

        except ImportError:
            logger.warning("pypdf_not_installed")
        except Exception as e:
            logger.warning("pdf_extract_error", error=str(e))

    # Procesar con Claude
    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=settings.anthropic_api_key)

        extraction_prompt = (
            "Este documento fue subido por un usuario que necesita asistencia legal en Colombia. "
            "Extrae y resume el contenido más relevante para el caso: fechas, partes involucradas, "
            "montos, incumplimientos, condiciones, cláusulas o cualquier dato jurídicamente relevante. "
            "Sé conciso y directo. Responde en español colombiano."
        )

        if content_type in ("image/jpeg", "image/jpg", "image/png"):
            # Vision API
            media_type = "image/png" if content_type == "image/png" else "image/jpeg"
            b64 = base64.standard_b64encode(data).decode("utf-8")
            messages = [{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": b64,
                        },
                    },
                    {"type": "text", "text": extraction_prompt},
                ],
            }]
        else:
            # PDF — usar texto extraído
            if extracted_text:
                messages = [{
                    "role": "user",
                    "content": (
                        f"CONTENIDO DEL DOCUMENTO PDF:\n\n{extracted_text[:8000]}\n\n"
                        f"{extraction_prompt}"
                    ),
                }]
            else:
                return {
                    "success": False,
                    "limit_reached": False,
                    "message": (
                        "No pude extraer el texto del PDF. "
                        "Por favor describe el contenido manualmente y continuamos."
                    ),
                }

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=800,
            messages=messages,
        )
        summary = response.content[0].text.strip()

        logger.info(
            "document_processed",
            ip=getattr(http_request.client, "host", "?"),
            filename=file.filename,
            content_type=content_type,
            size_kb=len(data) // 1024,
            pages=page_count,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
        )

        return {
            "success": True,
            "filename": file.filename,
            "pages": page_count,
            "summary": summary,
        }

    except Exception as e:
        logger.error("document_process_error", error=str(e), filename=file.filename)
        raise HTTPException(
            status_code=500,
            detail="Error al procesar el documento. Intenta nuevamente.",
        )


@router.post("/generate-strategy", response_model=GenerateStrategyResponse)
async def generate_strategy(request: GenerateStrategyRequest):
    """
    Pipeline completo con PDF:
    Triaje → Especialista → Abogado Contrario → [refuerzo si débil]
    → Redactor → Auditor (max 3 ciclos) → PDF descargable.

    Flags:
    - test_mode=True: omite verificación de pago (para testing)
    - payment_reference: referencia de Wompi (en producción)

    Devuelve:
    - document: JSON estructurado del documento legal
    - document_pdf_b64: PDF en Base64 (decodificar en frontend)
    - opposing_counsel_analysis: análisis adversarial
    - next_steps: pasos concretos para el ciudadano
    - plazos_criticos: fechas límite importantes
    - calificacion_caso: solido | riesgoso | debil
    """
    # ── 1. Verificación de pago (o modo prueba) ───────────────────────────────
    if not request.test_mode:
        if not request.payment_reference:
            raise HTTPException(
                status_code=402,
                detail="Se requiere referencia de pago. Usa test_mode=true para pruebas.",
            )
        # TODO: Verificar pago real con Wompi API
        # payment_valid = await verify_wompi_payment(request.payment_reference)
        # if not payment_valid:
        #     raise HTTPException(status_code=402, detail="Pago no verificado en Wompi")
        logger.info(
            "generate_strategy_payment_bypassed",
            payment_reference=request.payment_reference,
            note="Wompi verification pending implementation",
        )
    else:
        logger.info("generate_strategy_test_mode")

    # ── 2. Ejecutar pipeline completo ────────────────────────────────────────
    try:
        result = run_full_pipeline(
            user_story=request.story,
            user_data=request.user_data,
            document_type=request.document_type or "",
        )
    except Exception as e:
        logger.error("generate_strategy_pipeline_error", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error en el pipeline legal: {str(e)}",
        )

    stage = result.get("pipeline_stage", "unknown")

    # ── 3. Si el pipeline falló antes de generar documento ───────────────────
    if stage not in ("complete", "escalated") and result.get("error"):
        return GenerateStrategyResponse(
            success=False,
            stage=stage,
            triage_result=result.get("triage_result"),
            error=result.get("error", "Error desconocido en el pipeline"),
        )

    # ── 4. Extraer datos clave ────────────────────────────────────────────────
    document             = result.get("document", {})
    triage_result        = result.get("triage_result", {})
    specialist_analysis  = result.get("specialist_analysis", {})
    opposing_counsel     = result.get("opposing_counsel_analysis", {})
    audit_result         = result.get("audit_result", {})
    audit_decision       = result.get("audit_decision", "")

    calificacion_caso = opposing_counsel.get("calificacion_caso")

    # next_steps — desde los pasos de la estrategia del especialista
    next_steps: list[StrategyNextStep] = []
    estrategia = specialist_analysis.get("estrategia", {})
    if isinstance(estrategia, dict):
        pasos = estrategia.get("pasos", [])
    else:
        pasos = []
    for paso in pasos:
        if isinstance(paso, dict):
            next_steps.append(
                StrategyNextStep(
                    orden=paso.get("orden", len(next_steps) + 1),
                    accion=paso.get("accion", ""),
                    detalle=paso.get("detalle"),
                    plazo=paso.get("plazo"),
                    ante_quien=paso.get("ante_quien"),
                    documentos=paso.get("documentos"),
                )
            )

    # plazos_criticos — desde el especialista
    plazos_criticos: list[PlazoLegal] = []
    for p in specialist_analysis.get("plazos_legales", []):
        if isinstance(p, dict):
            plazos_criticos.append(
                PlazoLegal(
                    accion=p.get("accion", ""),
                    plazo=p.get("plazo", ""),
                    norma=p.get("norma"),
                    desde_cuando=p.get("desde_cuando"),
                )
            )

    probabilidad_exito = specialist_analysis.get("probabilidad_exito")

    # ── 5. Generar PDF ────────────────────────────────────────────────────────
    document_pdf_b64: str | None = None
    if document:
        try:
            from documents.pdf_generator import generate_pdf
            pdf_bytes = generate_pdf(
                document=document,
                opposing_counsel=opposing_counsel if opposing_counsel else None,
                triage_result=triage_result,
                specialist_analysis=specialist_analysis,
            )
            document_pdf_b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")
            logger.info(
                "generate_strategy_pdf_ok",
                size_kb=len(pdf_bytes) // 1024,
                stage=stage,
            )
        except Exception as e:
            logger.error("generate_strategy_pdf_error", error=str(e))
            # No bloqueamos la respuesta si falla el PDF
            document_pdf_b64 = None

    # ── 6. Log de tokens del pipeline completo ────────────────────────────────
    logger.info(
        "generate_strategy_complete",
        stage=stage,
        calificacion_oc=calificacion_caso,
        audit_decision=audit_decision,
        rewrite_cycles=result.get("rewrite_count", 0),
        rama=result.get("rama", ""),
        test_mode=request.test_mode,
    )

    return GenerateStrategyResponse(
        success=(stage in ("complete", "escalated")),
        stage=stage,
        document=document if document else None,
        document_pdf_b64=document_pdf_b64,
        triage_result=triage_result,
        specialist_analysis=specialist_analysis,
        opposing_counsel_analysis=opposing_counsel if opposing_counsel else None,
        audit_result=audit_result if audit_result else None,
        audit_decision=audit_decision or None,
        calificacion_caso=calificacion_caso,
        next_steps=next_steps if next_steps else None,
        plazos_criticos=plazos_criticos if plazos_criticos else None,
        probabilidad_exito=probabilidad_exito,
        error=result.get("error") or None,
    )


@router.get("/generate-strategy/{case_id}/pdf")
async def download_strategy_pdf(case_id: str):
    """
    Endpoint auxiliar: devuelve el PDF directamente como archivo descargable.

    Uso: GET /api/cases/generate-strategy/{reference}/pdf
    El frontend puede abrir esta URL en una nueva pestaña o hacer fetch + blob.

    NOTA: En producción se generaría desde un store (S3/Redis) identificado por
    case_id. Por ahora solo documenta el contrato del endpoint.
    """
    raise HTTPException(
        status_code=501,
        detail=(
            "Este endpoint requiere persistencia de sesión. "
            "Usa POST /generate-strategy y decodifica el campo 'document_pdf_b64'."
        ),
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
