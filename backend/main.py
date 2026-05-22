"""Defiéndete — API principal."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from config import get_settings
from api.routes import auth, cases, payments, documents, chat

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
)

settings = get_settings()

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
