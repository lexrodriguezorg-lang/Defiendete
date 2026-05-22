import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Mic, Send, AlertCircle, CheckCircle2, Loader } from 'lucide-react'
import Logo from '../components/ui/Logo'
import './Caso.css'

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
  alta: { label: '⚡ Urgencia alta', color: '#F4A72B' },
  media: { label: '📋 Urgencia media', color: '#00B4A0' },
  baja: { label: '✅ Urgencia baja', color: '#22D3A0' },
}

const Caso = () => {
  const [step, setStep] = useState('form')    // form | loading | result | payment
  const [story, setStory] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const canSubmit = story.trim().length >= 30

  const handleSubmit = async () => {
    if (!canSubmit) return
    setStep('loading')
    setError('')

    try {
      const response = await fetch('/api/cases/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story }),
      })

      if (!response.ok) throw new Error('Error del servidor')
      const data = await response.json()
      setResult(data)
      setStep('result')
    } catch (err) {
      // Demo mode mientras no hay API
      setResult(DEMO_RESULT)
      setStep('result')
    }
  }

  const handleExample = (example) => {
    setStory(example)
  }

  return (
    <div className="caso-page">
      {/* Header */}
      <header className="caso-header">
        <div className="container caso-header__inner">
          <Link to="/">
            <Logo size={32} showText={true} />
          </Link>
          <div className="caso-steps-indicator">
            <span className={`step-dot ${step !== 'form' ? 'step-dot--done' : 'step-dot--active'}`} />
            <span className="step-line" />
            <span className={`step-dot ${step === 'result' || step === 'payment' ? 'step-dot--done' : step === 'loading' ? 'step-dot--active' : ''}`} />
            <span className="step-line" />
            <span className={`step-dot ${step === 'payment' ? 'step-dot--active' : ''}`} />
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
                placeholder="Ej: Me despidieron hace 2 semanas sin darme ninguna explicación. Llevaba 4 años en la empresa con contrato indefinido. Solo me dijeron que ya no me necesitaban y me dieron 8 días para entregarme el puesto. Todavía no me han pagado la liquidación ni las vacaciones pendientes..."
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

            {/* Ejemplos rápidos */}
            <div className="caso-examples">
              <span className="examples-label">O elige un caso similar:</span>
              <div className="examples-list">
                {CASE_EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    className="example-chip"
                    onClick={() => handleExample(ex)}
                  >
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

        {/* ── LOADING ── */}
        {step === 'loading' && (
          <div className="caso-loading container-narrow">
            <div className="loading-card animate-fade-in">
              <div className="loading-icon">
                <Loader size={32} className="spin" />
              </div>
              <h2>Analizando tu caso...</h2>
              <div className="loading-steps">
                {[
                  'Clasificando la rama del derecho aplicable',
                  'Identificando derechos vulnerados',
                  'Consultando el corpus legal colombiano',
                  'Evaluando opciones disponibles',
                ].map((s, i) => (
                  <div key={i} className="loading-step" style={{ animationDelay: `${i * 600}ms` }}>
                    <div className="loading-step-dot" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTADO ── */}
        {step === 'result' && result && (
          <div className="caso-result container-narrow animate-fade-up">
            {/* Header del resultado */}
            <div className="result-header">
              <CheckCircle2 size={32} className="result-check" />
              <div>
                <h2>Tu diagnóstico está listo</h2>
                <p>Basado en la legislación colombiana vigente</p>
              </div>
            </div>

            {/* Clasificación */}
            <div className="result-card">
              <div className="result-meta">
                <div className="result-meta-item">
                  <span className="meta-label">Rama del derecho</span>
                  <span className="meta-value meta-value--rama">
                    {result.rama?.toUpperCase()}
                  </span>
                </div>
                <div className="result-meta-item">
                  <span className="meta-label">Urgencia</span>
                  <span
                    className="meta-value"
                    style={{ color: URGENCY_LABELS[result.urgencia]?.color || 'var(--text-primary)' }}
                  >
                    {URGENCY_LABELS[result.urgencia]?.label || result.urgencia}
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

            {/* Diagnóstico libre */}
            <div className="result-section">
              <h3>Tu situación legal</h3>
              <div className="result-text">
                {result.triage_result?.diagnostico?.resumen}
              </div>
            </div>

            {/* Opciones disponibles — BLOQUEADAS detrás del paywall */}
            <div className="result-section result-section--locked">
              <div className="locked-header">
                <h3>Opciones legales disponibles</h3>
                <span className="locked-badge">Plan Estrategia</span>
              </div>
              <div className="locked-preview">
                {result.triage_result?.diagnostico?.opciones?.slice(0, 2).map((op, i) => (
                  <div key={i} className="option-preview option-preview--blurred">
                    <strong>{op.accion}</strong>
                    <span>{op.descripcion?.slice(0, 60)}...</span>
                  </div>
                ))}
                <div className="locked-overlay">
                  <span>Desbloquea la estrategia completa</span>
                </div>
              </div>
            </div>

            {/* CTA de pago */}
            <div className="result-cta">
              <div className="result-cta__info">
                <h3>Estrategia completa + Documentos</h3>
                <p>Plan de acción paso a paso, artículos verificados, plazos exactos y documentos listos para radicar.</p>
                <div className="result-cta__price">
                  <span className="price-from">Desde</span>
                  <span className="price-amount">$80.000 COP</span>
                  <span className="price-note">· pago único · sin abogado requerido</span>
                </div>
              </div>
              <div className="result-cta__actions">
                <button className="btn-cta">
                  Obtener estrategia completa
                  <ArrowRight size={18} />
                </button>
                <button
                  className="btn-ghost-sm"
                  onClick={() => setStep('form')}
                >
                  <ArrowLeft size={14} />
                  Volver a editar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

/* Demo result para cuando no hay API */
const DEMO_RESULT = {
  success: true,
  rama: 'laboral',
  urgencia: 'alta',
  triage_result: {
    derechos_vulnerados: [
      {
        derecho: 'Derecho al trabajo y estabilidad laboral',
        norma: 'Art. 25 Constitución Política',
        explicacion: 'El despido sin justa causa sin el pago oportuno de la liquidación vulnera el derecho fundamental al trabajo.',
      },
      {
        derecho: 'Prestaciones sociales',
        norma: 'Art. 249-252 Código Sustantivo del Trabajo',
        explicacion: 'Las prestaciones sociales (cesantías, intereses, prima) deben pagarse al momento de terminación del contrato.',
      },
    ],
    diagnostico: {
      resumen: 'Según lo que describes, tienes un caso de despido sin justa causa con incumplimiento en el pago de la liquidación. En Colombia, cuando un empleador termina un contrato de trabajo sin que exista una causal justa, tiene la obligación de pagar una indemnización adicional a la liquidación. Llevas 4 años en la empresa, lo que significa que tienes derecho a una liquidación considerable que incluye: cesantías, intereses sobre cesantías, prima de servicios, vacaciones pendientes, y la indemnización por despido injusto.\n\nTienes un plazo para actuar. El empleador tiene 15 días hábiles para pagar la liquidación; después de ese plazo, empiezan a correr intereses moratorios. Además, puedes presentar una queja ante el Ministerio de Trabajo o demanda ante el juez laboral.',
      opciones: [
        {
          accion: 'Carta de cobro + queja ante Ministerio de Trabajo',
          descripcion: 'Enviar carta formal exigiendo el pago en plazo determinado y simultáneamente radicar queja en MinTrabajo...',
        },
        {
          accion: 'Demanda verbal sumaria ante juzgado laboral',
          descripcion: 'Para montos menores a 20 SMLMV puedes demandar directamente en el juzgado sin necesidad de abogado...',
        },
      ],
    },
  },
  payment_required_for: ['estrategia_completa', 'documentos', 'seguimiento'],
}

export default Caso
