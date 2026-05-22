# ⚖️ Defiéndete — Servicio Legal Digital

**Plataforma de asistencia legal inteligente para Colombia.**

Democratiza el acceso a la estrategia legal. Por $30K-$150K COP, cualquier colombiano recibe un diagnóstico legal preciso, una estrategia documentada con artículos reales y sentencias verificadas, y documentos listos para radicar.

## 🏗️ Stack Técnico

| Componente | Tecnología |
|-----------|-----------|
| Orquestación | LangGraph (Python) |
| LLM Agentes | Claude Sonnet 4 (Anthropic) |
| LLM Auditor | Claude Opus 4 (Anthropic) |
| Base Vectorial | Qdrant |
| Embeddings | OpenAI text-embedding-3-small |
| Backend | FastAPI |
| Frontend | React SPA |
| DB | PostgreSQL |
| Cola | Celery + Redis |
| Pagos | Wompi |

## 🚀 Setup Rápido

### 1. Clonar y configurar

```bash
cp .env.example .env
# Editar .env con tus API keys
```

### 2. Levantar servicios (Qdrant + PostgreSQL + Redis)

```bash
docker-compose up -d
```

### 3. Instalar dependencias Python

```bash
cd backend
pip install -r requirements.txt
playwright install chromium  # Para el scraper de Rama Judicial
```

### 4. Cargar el corpus legal

```bash
# Scrape e indexar todo el catálogo de leyes
python scripts/seed_corpus.py --scrape

# Probar que las queries RAG funcionen
python scripts/seed_corpus.py --test

# Demo del agente de triaje
python scripts/seed_corpus.py --triage
```

### 5. Arrancar el servidor

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 6. Probar

- API Docs: http://localhost:8000/docs
- Diagnóstico: `POST /api/cases/diagnose`
- Pipeline completo: `POST /api/cases/process`

## 📁 Estructura del Proyecto

```
justicia/
├── docker-compose.yml
├── backend/
│   ├── main.py              # FastAPI
│   ├── config.py             # Settings
│   ├── agents/
│   │   ├── graph.py          # LangGraph pipeline
│   │   ├── triage.py         # Agente Triaje
│   │   ├── specialists/      # Agentes por rama del derecho
│   │   ├── writer.py         # Agente Redactor
│   │   └── auditor.py        # Agente Auditor (QA)
│   ├── rag/
│   │   ├── qdrant_client.py  # Cliente Qdrant
│   │   ├── embeddings.py     # Servicio de embeddings
│   │   └── retriever.py      # Búsqueda semántica
│   ├── ingestion/
│   │   ├── scrapers/         # Scrapers de fuentes legales
│   │   ├── parsers/          # Parser de leyes por artículo
│   │   └── pipeline.py       # Pipeline de ingesta
│   └── api/routes/           # Endpoints REST
└── scripts/
    └── seed_corpus.py        # Carga y test del corpus
```

## 🔄 Pipeline de Agentes

```
Usuario → Triaje → [Pago] → Especialista → Redactor → Auditor
                                              ↑           ↓
                                              └─ Rewrite ←┘ (max 3 ciclos)
```

## ⚖️ Disclaimer

Esta herramienta proporciona INFORMACIÓN LEGAL ESTRUCTURADA, NO constituye asesoría jurídica profesional. Los documentos generados son plantillas basadas en legislación vigente verificada que usted debe revisar antes de presentar.

---

Hecho con 🔥 a las 4 AM desde La Dorada, Caldas 🇨🇴
