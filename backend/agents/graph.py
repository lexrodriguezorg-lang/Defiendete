"""Grafo principal de agentes — LangGraph.

Orquesta el flujo completo:
Triaje → Especialista → Redactor → Auditor (con loop de reescritura)
"""

from typing import TypedDict, Literal, Annotated
from langgraph.graph import StateGraph, END
import structlog

from agents.triage import TriageAgent
from agents.specialists import get_specialist
from agents.writer import WriterAgent
from agents.auditor import AuditorAgent

logger = structlog.get_logger()

MAX_REWRITE_CYCLES = 3


# === Estado del grafo ===

class CaseState(TypedDict):
    """Estado compartido entre todos los nodos del grafo."""

    # Input
    user_story: str
    user_data: dict          # nombre, cédula, dirección, etc.
    requested_document: str  # tipo de documento solicitado (o auto)

    # Triaje
    triage_result: dict
    triage_formatted: str    # Diagnóstico formateado para el usuario

    # Especialista
    specialist_analysis: dict
    rama: str

    # Redactor
    document: dict
    document_type: str

    # Auditor
    audit_result: dict
    audit_decision: str      # APROBADO | APROBADO_CON_OBSERVACIONES | RECHAZADO

    # Control
    rewrite_count: int
    error: str
    pipeline_stage: str      # triage | specialist | writer | auditor | complete | error
    is_paid: bool            # Si el usuario pagó (para desbloquear después del triaje)


# === Nodos del grafo ===

def triage_node(state: CaseState) -> CaseState:
    """Nodo 1: Triaje — clasifica el caso."""
    logger.info("node_triage_start")

    agent = TriageAgent()

    try:
        result = agent.diagnose(
            user_story=state["user_story"],
            user_context=state.get("user_data"),
        )

        formatted = agent.format_free_diagnosis(result)
        rama = result.get("clasificacion", {}).get("rama_derecho", "constitucional")

        return {
            **state,
            "triage_result": result,
            "triage_formatted": formatted,
            "rama": rama,
            "pipeline_stage": "triage_complete",
        }

    except Exception as e:
        logger.error("triage_node_error", error=str(e))
        return {**state, "error": str(e), "pipeline_stage": "error"}


def check_payment(state: CaseState) -> CaseState:
    """Nodo de control: verifica si el usuario pagó para continuar."""
    if not state.get("is_paid", False):
        return {**state, "pipeline_stage": "awaiting_payment"}
    return state


def specialist_node(state: CaseState) -> CaseState:
    """Nodo 2: Especialista — analiza con sustento legal del RAG."""
    logger.info("node_specialist_start", rama=state.get("rama"))

    rama = state.get("rama", "constitucional")
    specialist = get_specialist(rama)

    try:
        analysis = specialist.analyze(
            triage_result=state["triage_result"],
            user_story=state["user_story"],
        )

        return {
            **state,
            "specialist_analysis": analysis,
            "pipeline_stage": "specialist_complete",
        }

    except Exception as e:
        logger.error("specialist_node_error", error=str(e))
        return {**state, "error": str(e), "pipeline_stage": "error"}


def writer_node(state: CaseState) -> CaseState:
    """Nodo 3: Redactor — genera el documento legal."""
    logger.info(
        "node_writer_start",
        rewrite_count=state.get("rewrite_count", 0),
    )

    writer = WriterAgent()

    try:
        # Si es reescritura, incluir las instrucciones del auditor
        extra_context = ""
        if state.get("rewrite_count", 0) > 0 and state.get("audit_result"):
            instructions = state["audit_result"].get(
                "instrucciones_reescritura", []
            )
            extra_context = (
                "\n\nINSTRUCCIONES DE CORRECCIÓN DEL AUDITOR:\n"
                + "\n".join(f"- {i}" for i in instructions)
                + "\n\nCORRIGE los errores señalados. NO inventes nuevas referencias."
            )

        document = writer.generate_document(
            triage_result=state["triage_result"],
            specialist_analysis=state["specialist_analysis"],
            user_story=state["user_story"] + extra_context,
            user_data=state.get("user_data", {}),
            document_type=state.get("requested_document"),
        )

        return {
            **state,
            "document": document,
            "document_type": document.get("tipo_documento", ""),
            "pipeline_stage": "writer_complete",
        }

    except Exception as e:
        logger.error("writer_node_error", error=str(e))
        return {**state, "error": str(e), "pipeline_stage": "error"}


def auditor_node(state: CaseState) -> CaseState:
    """Nodo 4: Auditor — verifica el documento contra el RAG."""
    logger.info(
        "node_auditor_start",
        cycle=state.get("rewrite_count", 0) + 1,
    )

    auditor = AuditorAgent()

    try:
        result = auditor.audit(
            document=state["document"],
            specialist_analysis=state["specialist_analysis"],
        )

        decision = result.get("decision", "RECHAZADO")
        rewrite_count = state.get("rewrite_count", 0)

        # Si rechazado, incrementar contador de reescritura
        if decision == "RECHAZADO":
            rewrite_count += 1

        return {
            **state,
            "audit_result": result,
            "audit_decision": decision,
            "rewrite_count": rewrite_count,
            "pipeline_stage": "auditor_complete",
        }

    except Exception as e:
        logger.error("auditor_node_error", error=str(e))
        return {**state, "error": str(e), "pipeline_stage": "error"}


# === Edges condicionales ===

def should_continue_after_payment(state: CaseState) -> str:
    """Decide si continuar o esperar pago."""
    if state.get("is_paid", False):
        return "specialist"
    return "awaiting_payment"


def should_rewrite_or_finish(state: CaseState) -> str:
    """Decide si el documento necesita reescritura o está listo."""
    decision = state.get("audit_decision", "RECHAZADO")
    rewrite_count = state.get("rewrite_count", 0)

    if decision in ("APROBADO", "APROBADO_CON_OBSERVACIONES"):
        logger.info("document_approved", decision=decision)
        return "complete"

    if rewrite_count >= MAX_REWRITE_CYCLES:
        logger.warning(
            "max_rewrites_reached",
            cycles=rewrite_count,
        )
        return "escalate"

    logger.info(
        "document_rejected_rewriting",
        cycle=rewrite_count,
        max_cycles=MAX_REWRITE_CYCLES,
    )
    return "rewrite"


def complete_node(state: CaseState) -> CaseState:
    """Nodo final: documento aprobado."""
    logger.info(
        "pipeline_complete",
        document_type=state.get("document_type"),
        audit_decision=state.get("audit_decision"),
        rewrite_cycles=state.get("rewrite_count", 0),
    )
    return {**state, "pipeline_stage": "complete"}


def escalate_node(state: CaseState) -> CaseState:
    """Nodo de escalamiento: el documento no pasó auditoría después de N intentos."""
    logger.warning(
        "pipeline_escalated",
        rewrite_count=state.get("rewrite_count", 0),
    )
    return {
        **state,
        "pipeline_stage": "escalated",
        "error": (
            f"El documento no pasó la auditoría después de "
            f"{state.get('rewrite_count', 0)} intentos. "
            f"Se requiere revisión humana."
        ),
    }


# === Construcción del grafo ===

def build_legal_pipeline() -> StateGraph:
    """
    Construye el pipeline completo de agentes legales.

    Flujo:
    triage → [payment check] → specialist → writer → auditor
                                                ↑          ↓
                                                └── rewrite ←┘ (max 3 ciclos)
    """
    graph = StateGraph(CaseState)

    # Agregar nodos
    graph.add_node("triage", triage_node)
    graph.add_node("payment_check", check_payment)
    graph.add_node("specialist", specialist_node)
    graph.add_node("writer", writer_node)
    graph.add_node("auditor", auditor_node)
    graph.add_node("complete", complete_node)
    graph.add_node("escalate", escalate_node)

    # Definir flujo
    graph.set_entry_point("triage")

    # Triaje → Payment check
    graph.add_edge("triage", "payment_check")

    # Payment check → Specialist (si pagó) | END (si no)
    graph.add_conditional_edges(
        "payment_check",
        should_continue_after_payment,
        {
            "specialist": "specialist",
            "awaiting_payment": END,
        },
    )

    # Specialist → Writer
    graph.add_edge("specialist", "writer")

    # Writer → Auditor
    graph.add_edge("writer", "auditor")

    # Auditor → Complete | Rewrite (→ Writer) | Escalate
    graph.add_conditional_edges(
        "auditor",
        should_rewrite_or_finish,
        {
            "complete": "complete",
            "rewrite": "writer",
            "escalate": "escalate",
        },
    )

    # Nodos terminales
    graph.add_edge("complete", END)
    graph.add_edge("escalate", END)

    return graph


def create_pipeline():
    """Crea y compila el pipeline."""
    graph = build_legal_pipeline()
    return graph.compile()


# === Funciones de uso directo ===

def run_free_diagnosis(user_story: str) -> dict:
    """
    Ejecuta solo el diagnóstico gratuito (sin pago).

    Returns:
        {"triage_result": dict, "formatted": str}
    """
    pipeline = create_pipeline()

    initial_state: CaseState = {
        "user_story": user_story,
        "user_data": {},
        "requested_document": "",
        "triage_result": {},
        "triage_formatted": "",
        "specialist_analysis": {},
        "rama": "",
        "document": {},
        "document_type": "",
        "audit_result": {},
        "audit_decision": "",
        "rewrite_count": 0,
        "error": "",
        "pipeline_stage": "start",
        "is_paid": False,  # Sin pago → se detiene después del triaje
    }

    result = pipeline.invoke(initial_state)

    return {
        "triage_result": result["triage_result"],
        "formatted": result["triage_formatted"],
        "rama": result["rama"],
    }


def run_full_pipeline(
    user_story: str,
    user_data: dict,
    document_type: str = "",
) -> dict:
    """
    Ejecuta el pipeline completo (post-pago).

    Returns:
        Estado final con documento + auditoría
    """
    pipeline = create_pipeline()

    initial_state: CaseState = {
        "user_story": user_story,
        "user_data": user_data,
        "requested_document": document_type,
        "triage_result": {},
        "triage_formatted": "",
        "specialist_analysis": {},
        "rama": "",
        "document": {},
        "document_type": "",
        "audit_result": {},
        "audit_decision": "",
        "rewrite_count": 0,
        "error": "",
        "pipeline_stage": "start",
        "is_paid": True,  # Con pago → pipeline completo
    }

    result = pipeline.invoke(initial_state)

    return result
