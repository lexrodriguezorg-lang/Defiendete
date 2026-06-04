"""Defiéndete — API principal."""

import sys
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from config import get_settings
from api.routes import auth, cases, payments, documents, chat

settings = get_settings()


def _configure_logging(debug: bool) -> None:
    """
    Configura structlog integrado con el stdlib logging de Python.

    Usa stdlib.LoggerFactory() — compatible con uvicorn/Railway porque
    stdlib Logger tiene los atributos .disabled e .isEnabledFor() que
    algunos procesadores de structlog necesitan.

    - debug=True  → salida coloreada en consola (desarrollo)
    - debug=False → JSON por línea (Railway, Datadog, CloudWatch)
    """
    shared_processors: list = [
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]

    renderer = (
        structlog.dev.ConsoleRenderer()
        if debug
        else structlog.processors.JSONRenderer()
    )

    structlog.configure(
        processors=shared_processors + [renderer],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        # stdlib.LoggerFactory() → devuelve un logging.Logger estándar;
        # PrintLoggerFactory() devuelve PrintLogger que NO tiene .disabled
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Configurar stdlib logging para capturar también los logs de
    # uvicorn, httpx, sqlalchemy, etc.
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.DEBUG if debug else logging.INFO,
        force=True,
    )


_configure_logging(debug=settings.debug)

app = FastAPI(
    title=settings.app_name,
    description="Plataforma de asistencia legal inteligente para Colombia",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else ["https://defiendete.co"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(cases.router, prefix="/api/cases", tags=["Casos"])
app.include_router(payments.router, prefix="/api/payments", tags=["Pagos"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documentos"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "status": "running",
        "message": "Plataforma de asistencia legal inteligente para Colombia",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
