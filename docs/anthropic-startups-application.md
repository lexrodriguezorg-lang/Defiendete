# ANTHROPIC FOR STARTUPS — SOLICITUD
# Defiéndete · Servicio Legal Digital
# defiendete-tau.vercel.app

===========================================================
VERSIÓN EN INGLÉS (para enviar)
===========================================================

## Company / Project Name
Defiéndete — Servicio Legal Digital

## Website
https://defiendete-tau.vercel.app

## One-line description
AI-powered legal assistance platform that gives every Colombian access to verified legal strategy, formal documents, and case monitoring — for $8 to $40 USD.

---

## What does your company do?

Defiéndete is a Colombian legal-tech platform that democratizes access to legal strategy for the 40+ million Colombians who cannot afford traditional attorney fees.

In Colombia, a single legal consultation costs between $40–$130 USD. For a country where 35% of the population lives below the poverty line, this means most people face evictions, wrongful terminations, custody disputes, and healthcare denials without any legal guidance — not because they don't have rights, but because they don't know how to use them.

Defiéndete solves this with a multi-agent AI pipeline built on Claude:

1. **Triage Agent** — Classifies the user's case from natural language input, identifies violated rights with specific constitutional articles, and delivers a free diagnosis.

2. **Specialist Agents** — Six sub-agents (criminal, family, constitutional, labor, civil, administrative) perform semantic search over a vector database (Qdrant) containing 18+ Colombian legal codes and top court rulings from the Constitutional Court, Supreme Court, and Council of State.

3. **Writer Agent** — Generates formal legal documents (tutelas, derechos de petición, complaints, criminal reports) with exact article citations and verified jurisprudence.

4. **Auditor Agent** — This is our key differentiator. Before any document reaches the user, it cross-references EVERY legal citation against the corpus. If one reference is hallucinated, the document is rejected and rewritten. Zero tolerance for invented law.

5. **Investigator Agent** — Scrapes the Colombian Rama Judicial portal in real-time to pull active case history and feed it into the context.

Users receive a free diagnosis, then pay $8–$40 USD for a complete legal strategy, formal documents, and case monitoring with judicial alerts. Cases requiring formal representation are routed to our network of allied attorneys who receive pre-built case files and charge only for their physical presence.

---

## What is the social impact of your project?

Access to justice is a fundamental right in Colombia, but in practice it is reserved for those who can pay for it. The consequences of this gap are severe and measurable:

- Over 600,000 tutelas (constitutional rights claims) are filed annually in Colombia — most by citizens representing themselves, with high rejection rates due to poor presentation.
- Approximately 65% of wrongful termination cases go unpursued because workers cannot afford legal representation.
- Domestic violence victims lose custody battles, not for lack of merit, but for lack of proper documentation.
- Thousands of citizens receive denials from health insurers (EPS) for procedures they are legally entitled to — and never appeal because they don't know how.

Defiéndete addresses all of these cases. Our pricing model (from $30,000 to $150,000 Colombian pesos — approximately $8 to $40 USD) puts legal strategy within reach of any Colombian with a smartphone.

Beyond individual impact, we are building institutional memory of Colombian legal outcomes — anonymized, structured, and searchable — that will improve the quality of legal strategy available to the most vulnerable populations over time.

---

## Why Claude?

We evaluated multiple LLMs for this use case. Claude was the clear choice for three reasons:

**1. Reasoning quality in Spanish.**
Colombian legal language is dense, formal, and highly specific. Claude's ability to reason through complex legal scenarios in Spanish — maintaining formal register while being comprehensible to non-lawyers — is unmatched.

**2. Instruction following for structured outputs.**
Our pipeline requires agents to produce strict JSON outputs with specific schemas (case classification, legal citations, document structure). Claude's instruction-following reliability is critical to pipeline integrity.

**3. Alignment with our zero-hallucination requirement.**
Our Auditor Agent uses Claude Opus to verify every legal citation. This only works if the base model is honest about uncertainty. Claude's training makes it more likely to say "I'm not sure" than to invent a plausible-sounding article number — which in legal contexts can cause serious harm to real people.

We use:
- **Claude Sonnet 4** for Triage, Specialist, and Writer agents
- **Claude Opus 4** for the Auditor agent (maximum precision for citation verification)

---

## Traction and current state

- Live product: defiendete-tau.vercel.app
- Complete backend: FastAPI + LangGraph pipeline + Qdrant RAG
- Legal corpus: 18 Colombian legal codes indexed, top court rulings in progress
- Allied attorney network: recruiting (5 confirmed interest)
- Stage: Pre-launch, building waitlist

---

## Founding team

**Alex Rodríguez** — Founder & CEO
15+ years digital marketing strategist. Former digital strategy lead for Cruz Verde (150,000+ pandemic crisis requests processed), Sony Colombia, Avianca/LifeMiles, Claro, and Enel/Codensa. Founded Mind Media Digital Hub (2017–2023). Based in La Dorada, Caldas, Colombia. Deep understanding of the Colombian market and the real cost of legal inaccessibility at the municipal level.

---

## What would you use the credits for?

API credits would fund three specific workstreams:

**1. Corpus validation (40% of usage)**
Running the full legal corpus through the Auditor Agent to verify indexing quality and retrieval accuracy before launch. Each validation cycle runs Opus-level verification on thousands of document chunks.

**2. Beta user pipeline (40% of usage)**
Processing the first 500 real cases through the complete agent pipeline — Triage → Specialist → Writer → Auditor. This gives us the quality metrics we need to iterate before public launch.

**3. Jurisprudence expansion (20% of usage)**
Indexing and validating the top 1,000 Constitutional Court rulings (T-, C-, SU- series) that form the backbone of Colombian constitutional rights litigation.

---

## Links
- Live product: https://defiendete-tau.vercel.app
- GitHub: https://github.com/lexrodriguezorg-lang/Defiendete
- Portal for attorneys: https://defiendete-tau.vercel.app/abogados

---

===========================================================
VERSIÓN EN ESPAÑOL (para que entiendas cada sección)
===========================================================

## ¿Qué hace el proyecto?

Defiéndete es una plataforma colombiana de asistencia legal que democratiza el acceso a la estrategia jurídica para los 40+ millones de colombianos que no pueden pagar honorarios de abogado tradicional.

En Colombia, una consulta legal cuesta entre $160,000 y $500,000 COP. Para el 35% de la población que vive bajo la línea de pobreza, eso significa que enfrentan desalojos, despidos injustos, disputas de custodia y negaciones de servicios médicos sin ninguna orientación legal — no porque no tengan derechos, sino porque no saben cómo usarlos.

[El resto explica el pipeline de 5 agentes que ya construimos]

## ¿Cuál es el impacto social?

- Más de 600,000 tutelas se presentan al año en Colombia — la mayoría por ciudadanos que se representan solos, con altas tasas de rechazo por mala presentación.
- El 65% de los despidos injustos no se demandan porque los trabajadores no pueden pagar abogado.
- Víctimas de violencia doméstica pierden batallas de custodia no por falta de razón sino por falta de documentación.
- Miles de colombianos reciben negaciones de la EPS para procedimientos a los que tienen derecho legal — y nunca apelan porque no saben cómo.

## ¿Por qué Claude?

Evaluamos varios LLMs. Claude ganó por tres razones:
1. Calidad de razonamiento en español legal formal
2. Seguimiento de instrucciones para outputs JSON estructurados
3. Alineación con nuestro requisito de cero alucinaciones

## Tracción actual

- Producto en vivo: defiendete-tau.vercel.app
- Backend completo con pipeline LangGraph + RAG Qdrant
- 18 códigos legales colombianos indexados
- Red de abogados aliados: reclutando (5 confirmados)
- Etapa: Pre-lanzamiento, construyendo lista de espera

## ¿Para qué usarías los créditos?

1. Validación del corpus legal (40%)
2. Pipeline de usuarios beta — primeros 500 casos reales (40%)
3. Expansión de jurisprudencia — top 1,000 sentencias (20%)

===========================================================
DÓNDE APLICAR
===========================================================

URL: https://www.anthropic.com/startups

Lo que necesitas tener listo antes de enviar:
1. ✅ Sitio en vivo — ya lo tienes
2. ✅ GitHub con el código — ya lo tienes
3. □  Correo corporativo preferiblemente (usa el tuyo)
4. □  Descripción del proyecto (usa el texto de arriba)
5. □  Número de empleados: 1 (founder)
6. □  Etapa: Pre-seed / Pre-launch
7. □  País: Colombia

IMPORTANTE: En el campo "How are you using Claude?"
copia y pega el párrafo de "Why Claude?" de arriba.
Es el más importante para que aprueben.
