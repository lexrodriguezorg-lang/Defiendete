# DEFIÉNDETE — GUÍA COMPLETA FOR DUMMIES
# Todo lo que debes hacer mientras no tienes acceso a Claude
# Última actualización: Mayo 2026

===========================================================
ESTADO ACTUAL DEL PROYECTO (lo que ya está hecho)
===========================================================

✅ Frontend completo en vivo → https://defiendete-tau.vercel.app
✅ Landing page con identidad Defiéndete
✅ Formulario de diagnóstico (/caso)
✅ Dashboard de usuario (/dashboard)
✅ Portal de abogados (/abogados) — pendiente subir
✅ Backend Python con 5 agentes (en tu máquina local)
✅ Docker corriendo (Qdrant + PostgreSQL + Redis)
✅ Código en GitHub → github.com/lexrodriguezorg-lang/Defiendete
✅ Solicitud Anthropic for Startups redactada

⏳ Pendiente: API keys (Anthropic + OpenAI)
⏳ Pendiente: Dominio defiendete.co
⏳ Pendiente: Backend desplegado en Railway
⏳ Pendiente: Corpus legal indexado

===========================================================
TAREA 1 — SUBIR EL PORTAL DE ABOGADOS A VERCEL
(10 minutos, gratis, hoy mismo)
===========================================================

El portal de abogados está listo en tu máquina pero no está
en internet todavía. Así lo subes:

PASO 1: Descarga el zip más reciente que te mandé:
→ justicia-v4-abogados.tar.gz

PASO 2: Extrae el zip. Reemplaza la carpeta justicia que tienes.

PASO 3: Abre VS Code con la carpeta justicia.

PASO 4: Abre la terminal en VS Code (Ctrl + ñ) y corre:

    cd c:\Users\HP\Downloads\justicia
    git add .
    git commit -m "portal abogados y mejoras"
    git push

PASO 5: Vercel lo despliega automático en 2 minutos.
Abre https://defiendete-tau.vercel.app/abogados y ya está.

===========================================================
TAREA 2 — COMPRAR LOS $5 USD DE ANTHROPIC API
(15 minutos, necesitas tarjeta de crédito o débito)
===========================================================

PASO 1: Ve a → https://console.anthropic.com

PASO 2: Crea una cuenta con tu correo.

PASO 3: Ve a "Billing" → "Add credits"

PASO 4: Compra $5 USD mínimo.
(Con $5 USD puedes procesar aproximadamente 500 diagnósticos
de prueba — más que suficiente para arrancar y validar)

PASO 5: Ve a "API Keys" → "Create Key"

PASO 6: Copia la key. Se ve así:
    sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXX

PASO 7: Guárdala en un lugar seguro. Solo se muestra una vez.

===========================================================
TAREA 3 — COMPRAR LA API KEY DE OPENAI
(10 minutos, necesitas $5 USD más)
===========================================================

Esta es para los embeddings del corpus legal (la base de
conocimiento de los agentes).

PASO 1: Ve a → https://platform.openai.com

PASO 2: Crea cuenta o inicia sesión.

PASO 3: Ve a "Billing" → añade $5 USD.

PASO 4: Ve a "API Keys" → "Create new secret key"

PASO 5: Copia la key. Se ve así:
    sk-XXXXXXXXXXXXXXXXXXXXXXXX

===========================================================
TAREA 4 — CONFIGURAR LAS API KEYS EN EL PROYECTO
(5 minutos)
===========================================================

PASO 1: En VS Code, dentro de la carpeta justicia/backend,
busca el archivo llamado .env.example

PASO 2: Copia ese archivo y renómbralo .env
(sin el .example — solo .env)

PASO 3: Abre el .env y reemplaza los valores:

    ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXX  ← pega tu key aquí
    OPENAI_API_KEY=sk-XXXXXXXX               ← pega tu key aquí

PASO 4: Guarda el archivo.

IMPORTANTE: El archivo .env ya está en el .gitignore,
así que nunca se va a subir a GitHub. Tus keys están seguras.

===========================================================
TAREA 5 — ARRANCAR EL BACKEND EN TU MÁQUINA
(para probar que todo funciona antes de subir a Railway)
===========================================================

PASO 1: Asegúrate que Docker esté corriendo
(abre Docker Desktop y verifica que los contenedores
justicia-qdrant, justicia-postgres, justicia-redis
estén en verde)

PASO 2: Abre terminal en VS Code y corre:

    cd c:\Users\HP\Downloads\justicia\backend
    pip install -r requirements.txt

Espera que instale todo (puede tomar 3-5 minutos la primera vez).

PASO 3: Corre el servidor:

    uvicorn main:app --reload --port 8000

PASO 4: Abre en el navegador:
    http://localhost:8000/docs

Si ves una página con la documentación de la API = funcionó.

===========================================================
TAREA 6 — INDEXAR EL CORPUS LEGAL
(el cerebro del agente — requiere las API keys)
===========================================================

Este es el paso más importante. Sin esto el agente
responde pero sin sustento legal verificado.

PASO 1: Con el backend corriendo, abre OTRA terminal y corre:

    cd c:\Users\HP\Downloads\justicia
    python scripts/seed_corpus.py --scrape

Esto hace dos cosas:
- Descarga las 18 leyes colombianas del Senado
- Las indexa en Qdrant (la base de conocimiento)

Demora entre 20-40 minutos. Déjalo correr.

PASO 2: Cuando termine, prueba que funciona:

    python scripts/seed_corpus.py --test

Deberías ver queries de RAG respondiendo con artículos reales.

PASO 3: Prueba el agente de triaje:

    python scripts/seed_corpus.py --triage

Escribe un caso de prueba y ve si el agente lo clasifica bien.

===========================================================
TAREA 7 — CONECTAR EL FRONTEND CON EL BACKEND
(para que el formulario responda de verdad)
===========================================================

Ahora mismo el formulario usa datos demo. Esto lo conecta
con el agente real.

PASO 1: En VS Code abre el archivo:
    justicia/frontend/src/pages/Caso.jsx

PASO 2: Busca esta línea (alrededor de la línea 50):

    } catch (err) {
      // Demo mode mientras no hay API
      setResult(DEMO_RESULT)
      setStep('result')
    }

PASO 3: Reemplaza ese bloque por:

    } catch (err) {
      console.error('Error:', err)
      setError('Error conectando con el servidor. Intenta de nuevo.')
      setStep('form')
    }

PASO 4: Guarda y el formulario ya usará el backend real.

===========================================================
TAREA 8 — DESPLEGAR EL BACKEND EN RAILWAY
(para que el mundo pueda usarlo, no solo tu máquina)
===========================================================

PASO 1: Ve a → https://railway.app

PASO 2: Clic en "New Project"

PASO 3: Clic en "Deploy from GitHub repo"

PASO 4: Selecciona el repositorio "Defiendete"

PASO 5: Railway te pregunta qué carpeta. Escribe: backend

PASO 6: Antes de hacer deploy, ve a "Variables" y agrega:

    ANTHROPIC_API_KEY = [tu key de Anthropic]
    OPENAI_API_KEY = [tu key de OpenAI]
    QDRANT_HOST = [la URL de Qdrant Cloud — ver Tarea 9]
    POSTGRES_URL = [Railway te da esta automáticamente]

PASO 7: Clic en Deploy.

Railway te da una URL tipo:
    https://defiendete-backend.railway.app

PASO 8: Copia esa URL. La necesitas para la Tarea 10.

===========================================================
TAREA 9 — CREAR LA BASE VECTORIAL EN QDRANT CLOUD
(gratis hasta 1GB — más que suficiente para empezar)
===========================================================

PASO 1: Ve a → https://cloud.qdrant.io

PASO 2: Crea cuenta gratis.

PASO 3: Crea un nuevo cluster. Nombre: defiendete

PASO 4: Espera 2 minutos que se cree.

PASO 5: Copia la URL del cluster. Se ve así:
    https://xxxx-xxxx.qdrant.io:6333

PASO 6: Crea una API key en Qdrant Cloud.

PASO 7: Agrega estos valores en Railway (Tarea 8, Paso 6):
    QDRANT_HOST = xxxx-xxxx.qdrant.io
    QDRANT_PORT = 6333
    QDRANT_API_KEY = [tu key de Qdrant]

===========================================================
TAREA 10 — CONECTAR VERCEL CON EL BACKEND DE RAILWAY
===========================================================

PASO 1: Ve a → https://vercel.com
        Abre tu proyecto "defiendete"

PASO 2: Ve a "Settings" → "Environment Variables"

PASO 3: Agrega esta variable:

    Nombre: VITE_API_URL
    Valor: https://defiendete-backend.railway.app

PASO 4: Redeploy el proyecto (botón "Redeploy" en Deployments)

PASO 5: Abre el archivo en VS Code:
    justicia/frontend/src/pages/Caso.jsx

PASO 6: Busca esta línea:
    const response = await fetch('/api/cases/diagnose', {

PASO 7: Reemplaza por:
    const apiUrl = import.meta.env.VITE_API_URL || ''
    const response = await fetch(`${apiUrl}/api/cases/diagnose`, {

PASO 8: Guarda, haz git push, y el sitio en vivo ya usa
el backend real en Railway.

===========================================================
TAREA 11 — REGISTRAR EL DOMINIO defiendete.co
(en Hostinger — urgente antes que alguien más lo tome)
===========================================================

PASO 1: Ve a → https://hpanel.hostinger.com

PASO 2: Ve a "Dominios" → "Registrar nuevo dominio"

PASO 3: Busca: defiendete.co

PASO 4: Si está disponible, cómpralo. Vale ~$15-20 USD/año.

PASO 5: Para conectarlo con Vercel:
    - En Vercel → Settings → Domains → Add domain
    - Escribe: defiendete.co
    - Vercel te da dos registros DNS

PASO 6: En Hostinger → Dominios → defiendete.co → DNS
    - Agrega los dos registros que te dio Vercel
    - Espera 10-30 minutos que propague

PASO 7: Listo. defiendete.co apunta a tu sitio.

===========================================================
TAREA 12 — ENVIAR LA SOLICITUD A ANTHROPIC FOR STARTUPS
===========================================================

PASO 1: Ve a → https://www.anthropic.com/startups

PASO 2: Llena el formulario con estos datos:

    Company name: Defiéndete
    Website: https://defiendete-tau.vercel.app
    Country: Colombia
    Stage: Pre-launch
    Employees: 1

PASO 3: En "Describe your product" copia este texto:

"Defiéndete is a Colombian legal-tech platform that 
democratizes access to legal strategy for the 40+ million 
Colombians who cannot afford traditional attorney fees. 
We use a multi-agent AI pipeline built on Claude that 
classifies cases, retrieves verified legal articles from 
Colombian law, generates formal legal documents, and 
audits every citation for accuracy before delivery. 
Price: $8–$40 USD vs $40–$130 USD for a traditional 
attorney consultation."

PASO 4: En "How are you using Claude?" copia este texto:

"We use Claude Sonnet 4 for five specialized legal agents 
(triage, criminal law, family law, constitutional, writer) 
and Claude Opus 4 for our Auditor Agent that verifies 
every legal citation against a RAG corpus of 18+ Colombian 
legal codes. If one citation is hallucinated, the document 
is rejected and rewritten. This zero-hallucination 
requirement is why Claude is the only viable option for 
our use case — accuracy in legal contexts directly 
affects real people's lives."

PASO 5: Adjunta el link del GitHub:
    https://github.com/lexrodriguezorg-lang/Defiendete

PASO 6: Envía y espera. Responden en 3-10 días hábiles.

===========================================================
TRABAJAR CON GEMINI MIENTRAS TANTO
===========================================================

Si necesitas continuar el desarrollo sin Claude, aquí está
el contexto completo para pasarle a Gemini:

--- PEGA ESTO AL INICIO DE CADA CONVERSACIÓN CON GEMINI ---

"Estoy construyendo Defiéndete, una plataforma colombiana 
de asistencia legal con IA. El stack técnico es:
- Frontend: React + Vite en Vercel (defiendete-tau.vercel.app)
- Backend: FastAPI + Python en Railway
- Agentes: LangGraph con 5 agentes (triage, especialistas, 
  redactor, auditor, investigador)
- RAG: Qdrant + OpenAI embeddings
- LLM: Anthropic Claude (Sonnet 4 para agentes, Opus 4 para auditor)
- DB: PostgreSQL + Redis
- Pagos: Wompi (gateway colombiano)
- Repositorio: github.com/lexrodriguezorg-lang/Defiendete

El proyecto está estructurado con:
- backend/agents/ → los 5 agentes
- backend/rag/ → embeddings y retriever
- backend/ingestion/ → scrapers y parsers legales
- frontend/src/pages/ → Landing, Caso, Dashboard, Abogados

Lo que necesito ahora es: [DESCRIBE TU TAREA]"

--- FIN DEL CONTEXTO ---

Cosas que puedes pedirle a Gemini:
✓ Completar rutas del backend que faltan (auth, payments)
✓ Arreglar errores de compilación
✓ Mejorar componentes del frontend
✓ Explicar errores que aparezcan en la terminal
✓ Conectar Wompi al backend

Cosas que debes hacer solo o esperar a Claude:
✗ Diseño de nuevas funcionalidades grandes
✗ Arquitectura del pipeline de agentes
✗ Estrategia del producto

===========================================================
ORDEN DE PRIORIDAD ESTA SEMANA
===========================================================

DÍA 1 (HOY):
  □ Subir portal de abogados (Tarea 1) — 10 min
  □ Registrar defiendete.co (Tarea 11) — 5 min
  □ Enviar solicitud Anthropic (Tarea 12) — 15 min

DÍA 2:
  □ Comprar API keys Anthropic + OpenAI (Tareas 2 y 3)
  □ Configurar .env (Tarea 4)
  □ Arrancar backend local y probar (Tarea 5)

DÍA 3:
  □ Indexar el corpus legal (Tarea 6) — dejar corriendo
  □ Crear cuenta Qdrant Cloud (Tarea 9)

DÍA 4-5:
  □ Desplegar backend en Railway (Tarea 8)
  □ Conectar Vercel con Railway (Tarea 10)
  □ Prueba end-to-end completa

===========================================================
LINKS IMPORTANTES
===========================================================

Tu sitio en vivo:
  https://defiendete-tau.vercel.app

Tu código:
  https://github.com/lexrodriguezorg-lang/Defiendete

Anthropic Console (API keys):
  https://console.anthropic.com

Anthropic for Startups:
  https://www.anthropic.com/startups

OpenAI Platform (embeddings):
  https://platform.openai.com

Railway (backend hosting):
  https://railway.app

Qdrant Cloud (vector DB):
  https://cloud.qdrant.io

Vercel (frontend hosting):
  https://vercel.com

Wompi (pagos Colombia):
  https://wompi.com/developers

Rama Judicial Colombia (scraper target):
  https://consultaprocesos.ramajudicial.gov.co

Leyes Senado Colombia (corpus):
  http://www.secretariasenado.gov.co/senado/basedoc

===========================================================
QUÉ HACE CADA ARCHIVO DEL PROYECTO
===========================================================

backend/
  main.py              → Punto de entrada del servidor
  config.py            → Variables de configuración
  agents/
    graph.py           → El orquestador principal (LangGraph)
    triage.py          → Agente que clasifica el caso
    specialists/       → 6 agentes expertos por rama legal
    writer.py          → Agente que redacta documentos
    auditor.py         → Agente que verifica referencias
  rag/
    qdrant_client.py   → Conexión con la base vectorial
    embeddings.py      → Genera los vectores del texto
    retriever.py       → Busca en la base de conocimiento
  ingestion/
    scrapers/senado.py → Descarga leyes del Senado
    parsers/ley_parser.py → Divide leyes en artículos
    pipeline.py        → Orquesta toda la ingesta
  api/routes/
    cases.py           → Endpoint del diagnóstico

frontend/src/
  pages/
    Landing.jsx        → La página de inicio
    Caso.jsx           → El formulario de diagnóstico
    Dashboard.jsx      → Panel del usuario
    Abogados.jsx       → Portal para abogados aliados
  components/
    ui/Logo.jsx        → El logo de Defiéndete
    layout/Navbar.jsx  → La barra de navegación
  index.css            → Todo el sistema de diseño

scripts/
  seed_corpus.py       → Carga y prueba el corpus legal

===========================================================
CUANDO VUELVAS CON CLAUDE EL SÁBADO
===========================================================

Lo que quedará pendiente para continuar:
1. Integración completa de Wompi (pagos)
2. Sistema de autenticación (login/registro)
3. Alertas en tiempo real de la Rama Judicial
4. Agente Investigador (scraper judicial)
5. Portal de administración para abogados aliados
6. Métricas y analytics del producto
7. PWA / App móvil

Para retomar rápido, dile a Claude:
"Hola, continúa con el proyecto Defiéndete.
El sitio está en defiendete-tau.vercel.app,
el código en github.com/lexrodriguezorg-lang/Defiendete,
ya tenemos las API keys configuradas y el corpus indexado.
El siguiente paso es [LO QUE NECESITES]."

===========================================================
FIN DE LA GUÍA
Hecha con todo el amor desde esta sesión de trabajo.
Tú puedes con esto, Alex. El proyecto es sólido.
===========================================================
