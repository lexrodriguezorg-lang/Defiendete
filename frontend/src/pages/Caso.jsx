import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, CheckCircle2, DollarSign,
  Scale, Shield, Lock,
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import './Caso.css'

/* ── Ejemplos de casos ── */
const CASE_EXAMPLES = [
  'Me despidieron sin justa causa y no me pagaron la liquidación después de 3 años',
  'La EPS me negó una cirugía urgente que el médico ordenó hace 2 meses',
  'Mi ex pareja no me deja ver a mis hijos desde hace 3 meses sin ninguna razón',
  'Mi arrendador me cortó el agua y la luz para que me fuera del apartamento',
  'Me estafaron en una compra por internet, pagué y nunca recibí nada',
  'Mi jefe me acosa laboralmente, me grita y me amenaza delante de todos',
]

const URGENCY_LABELS = {
  critica: { label: '🚨 Urgencia crítica', color: '#F45B5B' },
  alta:    { label: '⚡ Urgencia alta',    color: '#F4A72B' },
  media:   { label: '📋 Urgencia media',   color: '#00B4A0' },
  baja:    { label: '✅ Urgencia baja',    color: '#22D3A0' },
}

const COMPLEXITY_CONFIG = {
  baja: {
    label: 'Complejidad baja',
    color: '#22D3A0',
    bgColor: 'rgba(34,211,160,0.08)',
    borderColor: 'rgba(34,211,160,0.25)',
    descripcion: 'Solicitud estándar que no requiere argumentación jurídica extensa.',
    precio_label: '$30.000 COP',
    precio_note: 'pago único',
  },
  media: {
    label: 'Complejidad media',
    color: '#F4A72B',
    bgColor: 'rgba(244,167,43,0.08)',
    borderColor: 'rgba(244,167,43,0.25)',
    descripcion: 'Requiere estructuración detallada de hechos y verificación de artículos legales.',
    precio_label: '$65.000 COP',
    precio_note: 'pago único',
  },
  alta: {
    label: 'Complejidad alta',
    color: '#00B4A0',
    bgColor: 'rgba(0,180,160,0.08)',
    borderColor: 'rgba(0,180,160,0.3)',
    descripcion: 'Documento de fondo con jurisprudencia de altas cortes y argumentación constitucional.',
    precio_label: '$120.000 COP',
    precio_note: 'pago único',
  },
}

const inferComplexidad = (story) => {
  const s = story.toLowerCase()
  const patronesAlta = [
    'tutela', 'custodia', 'hijo', 'cirugía', 'cirugia',
    'cortó el agua', 'cortó la luz', 'corto el agua', 'corto la luz',
    'violencia', 'amenaza', 'acción popular', 'minuta',
    'arrendador cortó', 'arrendador corto', 'contrato comercial', 'amparo',
  ]
  const patronesMedia = [
    'despido', 'despedido', 'liquidación', 'liquidacion', 'eps', 'acoso',
    'servicios públicos', 'servicios publicos', 'salario', 'prestaciones',
    'contrato indefinido', 'horas extra', 'arrendamiento', 'jefe',
    'empleador', 'empresa', 'trabajo',
  ]
  if (patronesAlta.some(p => s.includes(p))) return 'alta'
  if (patronesMedia.some(p => s.includes(p))) return 'media'
  return 'baja'
}

const MOCK_BY_COMPLEXITY = {
  alta: {
    rama: 'constitucional',
    urgencia: 'alta',
    triage_result: {
      clasificacion: {
        rama_derecho: 'constitucional',
        sub_categoria: 'Acción de tutela por vulneración de derechos fundamentales',
        urgencia: 'alta',
      },
      derechos_vulnerados: [
        {
          derecho: 'Derecho a la salud y la vida digna',
          norma: 'Art. 49 y 11 — Constitución Política',
          explicacion: 'La negación injustificada de un procedimiento médico ordenado vulnera directamente el derecho fundamental a la salud.',
        },
        {
          derecho: 'Derecho de petición y respuesta oportuna',
          norma: 'Art. 23 Const. + Ley 1755/2015',
          explicacion: 'Las entidades de salud tienen la obligación de responder solicitudes médicas dentro de los plazos legales establecidos.',
        },
      ],
      diagnostico: {
        resumen: 'Tienes un caso sólido para interponer una Acción de Tutela. Cuando una EPS niega un procedimiento médico ordenado por un profesional de la salud, vulnera directamente el derecho fundamental a la salud protegido por la Constitución Política.\n\nLa tutela es el mecanismo constitucional más efectivo para estos casos — el juez tiene un plazo máximo de 10 días hábiles para fallar. En casos de urgencia médica comprobada, la tasa de éxito es superior al 90% según jurisprudencia de la Corte Constitucional.',
        opciones: [
          { accion: 'Acción de Tutela ante juzgado civil', descripcion: 'Mecanismo constitucional para proteger derechos fundamentales como la salud. Respuesta obligatoria en 10 días hábiles. Puedes presentarla sin abogado.' },
          { accion: 'Queja ante Superintendencia de Salud', descripcion: 'Proceso paralelo que genera presión institucional sobre la EPS y puede lograr una autorización antes del fallo de la tutela.' },
        ],
      },
    },
  },
  media: {
    rama: 'laboral',
    urgencia: 'alta',
    triage_result: {
      clasificacion: { rama_derecho: 'laboral', sub_categoria: 'Despido sin justa causa — liquidación pendiente', urgencia: 'alta' },
      derechos_vulnerados: [
        { derecho: 'Derecho al trabajo y estabilidad laboral', norma: 'Art. 25 — Constitución Política', explicacion: 'El despido sin justa causa sin pago oportuno de la liquidación vulnera el derecho fundamental al trabajo.' },
        { derecho: 'Prestaciones sociales obligatorias', norma: 'Art. 249-252 — Código Sustantivo del Trabajo', explicacion: 'Cesantías, intereses sobre cesantías, prima de servicios y vacaciones deben pagarse al terminar el contrato.' },
      ],
      diagnostico: {
        resumen: 'Tienes un caso claro de despido sin justa causa con incumplimiento en el pago de la liquidación. En Colombia, cuando un empleador termina un contrato sin justa causa tiene la obligación legal de pagar la liquidación completa más una indemnización proporcional al tiempo de servicio.\n\nEl empleador tiene 15 días hábiles para pagar la liquidación desde la terminación. Después de ese plazo corren intereses moratorios. Con 3 o más años de antigüedad, tienes derecho a cesantías, intereses sobre cesantías, prima, vacaciones e indemnización por despido.',
        opciones: [
          { accion: 'Carta de cobro + Queja ante Ministerio de Trabajo', descripcion: 'Carta formal exigiendo el pago en plazo determinado y, en paralelo, radicación de queja en MinTrabajo para generar presión institucional.' },
          { accion: 'Demanda verbal sumaria ante juzgado laboral', descripcion: 'Para montos menores a 20 SMLMV puedes demandar directamente sin necesidad de abogado. El juzgado convoca a audiencia.' },
        ],
      },
    },
  },
  baja: {
    rama: 'administrativo',
    urgencia: 'media',
    triage_result: {
      clasificacion: { rama_derecho: 'administrativo', sub_categoria: 'Derecho de petición — reclamación por incumplimiento', urgencia: 'media' },
      derechos_vulnerados: [
        { derecho: 'Derecho de petición', norma: 'Art. 23 Const. + Ley 1755/2015', explicacion: 'Toda persona puede presentar solicitudes ante entidades y debe recibir respuesta dentro de los plazos establecidos (15 días hábiles).' },
        { derecho: 'Protección al consumidor', norma: 'Ley 1480/2011 — Estatuto del Consumidor, Art. 7', explicacion: 'El incumplimiento de garantía o entrega de productos genera responsabilidad legal para el vendedor o proveedor.' },
      ],
      diagnostico: {
        resumen: 'Tienes fundamentos sólidos para exigir el cumplimiento de la obligación. La ley colombiana protege al consumidor y establece plazos claros para que los vendedores respondan a reclamaciones por incumplimiento en garantías o entregas.\n\nEl primer paso es un Derecho de Petición formal que obliga legalmente a responder en 15 días hábiles. Si no responden o niegan la reclamación sin fundamento, puedes acudir a la Superintendencia de Industria y Comercio (SIC), que tiene facultades sancionatorias.',
        opciones: [
          { accion: 'Derecho de petición formal', descripcion: 'Documento legal que obliga a la empresa a responder en 15 días hábiles. Primer paso necesario antes de cualquier otro recurso.' },
          { accion: 'Queja ante la Superintendencia de Industria y Comercio', descripcion: 'Si no responden, la SIC puede imponer sanciones económicas y ordenar la devolución del dinero o entrega del producto.' },
        ],
      },
    },
  },
}

/* ── Mensajes del loader de autoridad ── */
const LOADER_MSGS = [
  'Analizando marco constitucional colombiano...',
  'Evaluando precedentes judiciales aplicables...',
  'Estructurando fundamentos jurídicos...',
]

/* ── Componente principal ── */
const Caso = () => {
  const [step, setStep]       = useState('form')
  const [story, setStory]     = useState('')
  const [result, setResult]   = useState(null)
  const [leadData, setLeadData] = useState({ nombre: '', contacto: '' })
  const [loadingMsg, setLoadingMsg] = useState(0)

  const canSubmit    = story.trim().length >= 30
  const canSubmitLead = leadData.nombre.trim().length >= 2 && leadData.contacto.trim().length >= 5

  /* Cicla los mensajes del loader mientras está en carga */
  useEffect(() => {
    if (step !== 'loading') return
    setLoadingMsg(0)
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADER_MSGS.length
      setLoadingMsg(idx)
    }, 1250)
    return () => clearInterval(interval)
  }, [step])

  const handleSubmit = async () => {
    if (!canSubmit) return
    setStep('loading')

    /* Timer mínimo de 3.8s (efecto consultoría) corriendo en paralelo con la API */
    const timerPromise = new Promise(r => setTimeout(r, 3800))

    let apiResult
    try {
      const res = await fetch('/api/cases/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story }),
      })
      if (!res.ok) throw new Error('API no disponible')
      const data = await res.json()
      apiResult = { ...data, complejidad: data.complejidad || inferComplexidad(story) }
    } catch {
      const complejidad = inferComplexidad(story)
      const mock = MOCK_BY_COMPLEXITY[complejidad]
      apiResult = {
        success: true,
        complejidad,
        rama: mock.rama,
        urgencia: mock.urgencia,
        triage_result: mock.triage_result,
        payment_required_for: ['estrategia_completa', 'documentos', 'seguimiento'],
      }
    }

    await timerPromise  /* Garantiza mínimo 3.8s de loader */
    setResult(apiResult)
    setStep('capture')
  }

  const handleLeadSubmit = (e) => {
    e.preventDefault()
    if (!canSubmitLead) return
    setStep('result')
  }

  /* ── Indicador de progreso (4 pasos) ── */
  const STEPS_ORDER = ['form', 'loading', 'capture', 'result']
  const currentIdx  = STEPS_ORDER.indexOf(step)
  const stepDot = (idx) => {
    if (idx < currentIdx) return 'step-dot--done'
    if (idx === currentIdx) return 'step-dot--active'
    return ''
  }

  return (
    <div className="caso-page">

      {/* Header */}
      <header className="caso-header">
        <div className="container caso-header__inner">
          <Link to="/"><Logo size={32} showText={true} /></Link>
          <div className="caso-steps-indicator">
            <span className={`step-dot ${stepDot(0)}`} />
            <span className="step-line" />
            <span className={`step-dot ${stepDot(1)}`} />
            <span className="step-line" />
            <span className={`step-dot ${stepDot(2)}`} />
            <span className="step-line" />
            <span className={`step-dot ${stepDot(3)}`} />
          </div>
        </div>
      </header>

      <main className="caso-main">

        {/* ── FORMULARIO ── */}
        {step === 'form' && (
          <div className="caso-form container-narrow animate-fade-up">
            <div className="caso-form__header">
              <span className="section-tag">Diagnóstico gratuito</span>
              <h1>Cuéntanos qué pasó</h1>
              <p>Sin términos técnicos. Como si se lo contaras a un amigo. El sistema entiende lenguaje natural.</p>
            </div>

            <div className="caso-textarea-wrap">
              <textarea
                className="caso-textarea"
                placeholder="Ej: Me despidieron hace 2 semanas sin darme ninguna explicación. Llevaba 4 años en la empresa con contrato indefinido. Solo me dijeron que ya no me necesitaban. Todavía no me han pagado la liquidación ni las vacaciones pendientes..."
                value={story}
                onChange={e => setStory(e.target.value)}
                rows={8}
              />
              <div className="caso-textarea-footer">
                <span className={`char-count ${story.length >= 30 ? 'char-count--ok' : ''}`}>
                  {story.length < 30
                    ? `Mínimo ${30 - story.length} caracteres más`
                    : `${story.length} caracteres ✓`
                  }
                </span>
              </div>
            </div>

            <div className="caso-examples">
              <span className="examples-label">O elige un caso similar:</span>
              <div className="examples-list">
                {CASE_EXAMPLES.map((ex, i) => (
                  <button key={i} className="example-chip" onClick={() => setStory(ex)}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <button
              className={`btn-cta btn-cta--full ${!canSubmit ? 'btn-cta--disabled' : ''}`}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              Obtener diagnóstico gratuito
              <ArrowRight size={18} />
            </button>

            <p className="caso-disclaimer">
              🔒 Tu información es confidencial y está protegida por la Ley 1581 de 2012.
              Este diagnóstico es informativo y no constituye asesoría jurídica.
            </p>
          </div>
        )}

        {/* ── LOADER DE AUTORIDAD ── */}
        {step === 'loading' && (
          <div className="caso-loading container-narrow">
            <div className="loading-card animate-fade-in">
              <div className="loading-icon">
                <Scale size={36} className="loading-scale-spin" />
              </div>
              <h2>Analizando tu caso</h2>
              <p className="loading-subtitle">Consultando el corpus legal colombiano vigente</p>

              <div className="loader-msg-wrap">
                {LOADER_MSGS.map((msg, i) => (
                  <div
                    key={i}
                    className={`loader-msg ${loadingMsg === i ? 'loader-msg--active' : loadingMsg > i ? 'loader-msg--done' : ''}`}
                  >
                    <span className="loader-msg-dot" />
                    <span>{msg}</span>
                  </div>
                ))}
              </div>

              <div className="loader-bar-wrap">
                <div className="loader-bar" />
              </div>
            </div>
          </div>
        )}

        {/* ── CAPTURA DE LEAD (gate antes del resultado) ── */}
        {step === 'capture' && (
          <div className="caso-capture container-narrow animate-fade-up">
            <div className="capture-card">

              <div className="capture-header">
                <div className="capture-icon">
                  <CheckCircle2 size={28} style={{ color: '#00B4A0' }} />
                </div>
                <h2>Tu diagnóstico está listo</h2>
                <p className="capture-subtitle">
                  Ingresa tus datos para ver tu diagnóstico gratuito y congelar tu tarifa preferencial
                </p>
              </div>

              <form className="capture-form" onSubmit={handleLeadSubmit}>
                <div className="capture-field">
                  <label htmlFor="cap-nombre">Tu nombre</label>
                  <input
                    id="cap-nombre"
                    type="text"
                    placeholder="ej. María Rodríguez"
                    value={leadData.nombre}
                    onChange={e => setLeadData(d => ({ ...d, nombre: e.target.value }))}
                    autoComplete="name"
                    autoFocus
                  />
                </div>

                <div className="capture-field">
                  <label htmlFor="cap-contacto">WhatsApp o correo electrónico</label>
                  <input
                    id="cap-contacto"
                    type="text"
                    placeholder="ej. 3001234567 o tu@correo.com"
                    value={leadData.contacto}
                    onChange={e => setLeadData(d => ({ ...d, contacto: e.target.value }))}
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  className={`btn-cta btn-cta--full ${!canSubmitLead ? 'btn-cta--disabled' : ''}`}
                  disabled={!canSubmitLead}
                >
                  Ver mi diagnóstico gratuito
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="capture-privacy">
                <Lock size={13} />
                <span>Datos protegidos bajo la Ley 1581 de 2012. No compartimos tu información.</span>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTADO ── */}
        {step === 'result' && result && (() => {
          const compConfig = COMPLEXITY_CONFIG[result.complejidad] || COMPLEXITY_CONFIG.media
          const urgConfig  = URGENCY_LABELS[result.urgencia]

          return (
            <div className="caso-result container-narrow animate-fade-up">

              <div className="result-header">
                <CheckCircle2 size={32} className="result-check" />
                <div>
                  <h2>Tu diagnóstico está listo</h2>
                  <p>Basado en la legislación colombiana vigente · preparado para {leadData.nombre || 'ti'}</p>
                </div>
              </div>

              {/* Cotización dinámica */}
              <div className="result-cotizacion">
                <div className="cotizacion-top">
                  <span
                    className="cotizacion-complexity-badge"
                    style={{ background: compConfig.bgColor, borderColor: compConfig.borderColor, color: compConfig.color }}
                  >
                    {compConfig.label}
                  </span>
                  <p className="cotizacion-descripcion">{compConfig.descripcion}</p>
                </div>
                <div className="cotizacion-price-row">
                  <div className="cotizacion-price-info">
                    <span className="cotizacion-label">Estrategia completa + Documentos</span>
                    <div className="cotizacion-amount-row">
                      <DollarSign size={18} className="cotizacion-dollar" />
                      <span className="cotizacion-amount">{compConfig.precio_label}</span>
                      <span className="cotizacion-note">· {compConfig.precio_note}</span>
                    </div>
                  </div>
                  <div className="cotizacion-tag"><span>Cotización de tu caso</span></div>
                </div>
              </div>

              {/* Clasificación */}
              <div className="result-card">
                <div className="result-meta">
                  <div className="result-meta-item">
                    <span className="meta-label">Rama del derecho</span>
                    <span className="meta-value meta-value--rama">{result.rama?.toUpperCase()}</span>
                  </div>
                  <div className="result-meta-item">
                    <span className="meta-label">Urgencia</span>
                    <span className="meta-value" style={{ color: urgConfig?.color }}>
                      {urgConfig?.label || result.urgencia}
                    </span>
                  </div>
                </div>
              </div>

              {/* Derechos vulnerados */}
              {result.triage_result?.derechos_vulnerados?.length > 0 && (
                <div className="result-section">
                  <h3>Derechos que podrían estar vulnerados</h3>
                  <div className="rights-list">
                    {result.triage_result.derechos_vulnerados.map((d, i) => (
                      <div key={i} className="right-item">
                        <span className="right-norm">{d.norma}</span>
                        <span className="right-name">{d.derecho}</span>
                        <span className="right-why">{d.explicacion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Situación legal */}
              <div className="result-section">
                <h3>Tu situación legal</h3>
                <div className="result-text">{result.triage_result?.diagnostico?.resumen}</div>
              </div>

              {/* Opciones bloqueadas */}
              <div className="result-section result-section--locked">
                <div className="locked-header">
                  <h3>Opciones legales disponibles</h3>
                  <span className="locked-badge">Estrategia completa</span>
                </div>
                <div className="locked-preview">
                  {result.triage_result?.diagnostico?.opciones?.slice(0, 2).map((op, i) => (
                    <div key={i} className="option-preview option-preview--blurred">
                      <strong>{op.accion}</strong>
                      <span>{op.descripcion?.slice(0, 60)}...</span>
                    </div>
                  ))}
                  <div className="locked-overlay"><span>Desbloquea el plan de acción completo</span></div>
                </div>
              </div>

              {/* CTA con precio dinámico */}
              <div className="result-cta">
                <div className="result-cta__info">
                  <h3>Estrategia completa + Documentos listos para radicar</h3>
                  <p>Plan de acción paso a paso, artículos y sentencias verificadas, plazos exactos y documentos listos para radicar.</p>
                  <div className="result-cta__price">
                    <span className="price-amount">{compConfig.precio_label}</span>
                    <span className="price-note">· {compConfig.precio_note} · sin abogado requerido</span>
                  </div>
                </div>
                <div className="result-cta__actions">
                  <button className="btn-cta">
                    Obtener estrategia completa
                    <ArrowRight size={18} />
                  </button>
                  <button
                    className="btn-ghost-sm"
                    onClick={() => { setStep('form'); setResult(null); setLeadData({ nombre: '', contacto: '' }) }}
                  >
                    <ArrowLeft size={14} />
                    Volver a editar
                  </button>
                </div>
              </div>

            </div>
          )
        })()}

      </main>
    </div>
  )
}

export default Caso
