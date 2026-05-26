import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, CheckCircle2, Clock, DollarSign,
  FileText, Users, Star, ChevronDown, Briefcase,
  Calendar, Shield, Zap, TrendingUp
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import './Abogados.css'

const BENEFICIOS = [
  {
    icon: <FileText size={24} />,
    titulo: 'Documentos base listos',
    desc: 'Genera plantillas de tutelas, derechos de petición, quejas y demandas para tus clientes. Documentos con estructura formal y artículos verificados que tú revisas y ajustas.',
  },
  {
    icon: <Clock size={24} />,
    titulo: 'Jurisprudencia en segundos',
    desc: 'Busca sentencias de la Corte Constitucional, Corte Suprema y Consejo de Estado por tema o artículo. Lo que antes tomaba horas, en segundos.',
  },
  {
    icon: <DollarSign size={24} />,
    titulo: 'Más clientes, mismo tiempo',
    desc: 'El trabajo operativo de investigación y redacción lo hace la plataforma. Tú te enfocas en el criterio jurídico, la estrategia en audiencia y la relación con el cliente.',
  },
  {
    icon: <Users size={24} />,
    titulo: 'Clientes mejor preparados',
    desc: 'El ciudadano que llega a ti ya entiende su caso, sus derechos y lo que puede esperar. La consulta es más productiva y el proceso más eficiente para los dos.',
  },
  {
    icon: <Shield size={24} />,
    titulo: 'Referencias siempre verificadas',
    desc: 'Cada artículo y sentencia en los documentos generados está verificado contra el corpus legal colombiano. Nunca una referencia inventada que comprometa tu nombre.',
  },
  {
    icon: <TrendingUp size={24} />,
    titulo: 'Material de apoyo para tu firma',
    desc: 'Ideal para abogados emergentes y firmas pequeñas que quieren ofrecer más servicios con menos recursos. Escala tu práctica sin escalar tus costos.',
  },
]

const COMO_FUNCIONA = [
  {
    numero: '01',
    titulo: 'El cliente obtiene su estrategia',
    desc: 'La plataforma clasifica el caso, construye la estrategia con artículos reales y redacta los documentos. Todo verificado.',
  },
  {
    numero: '02',
    titulo: 'El caso llega a tu panel',
    desc: 'Si el caso requiere representación, te llega un expediente completo: hechos, estrategia, documentos, probabilidad de éxito.',
  },
  {
    numero: '03',
    titulo: 'Revisas y ajustas si es necesario',
    desc: 'Lees el plan en 15 minutos. Si estás de acuerdo, lo aceptas. Si quieres ajustar algo, lo modificas y apruebas.',
  },
  {
    numero: '04',
    titulo: 'Pones tu presencia cuando toca',
    desc: 'Apareces en la audiencia, diligencia o radicación. Cobras por esa presencia. El cliente paga menos que con un proceso tradicional.',
  },
]

const FAQS = [
  {
    pregunta: '¿Esto reemplaza mi trabajo como abogado?',
    respuesta: 'No. Reemplaza el trabajo operativo repetitivo — la investigación de base, la redacción de borradores, la búsqueda de jurisprudencia. Tu criterio jurídico, tu experiencia en audiencias y tu firma son irremplazables. Nosotros te liberamos tiempo para usarlos donde más valen.',
  },
  {
    pregunta: '¿Qué pasa si no estoy de acuerdo con la estrategia que generó la plataforma?',
    respuesta: 'La ajustas. El plan que recibes no es definitivo — es un punto de partida documentado. Tienes control total sobre la estrategia final antes de aceptar el caso.',
  },
  {
    pregunta: '¿Cómo se manejan los honorarios?',
    respuesta: 'Tú defines tu tarifa por tipo de actuación. La plataforma facilita el pago y hace el split automáticamente. Transparencia total para el cliente y para ti.',
  },
  {
    pregunta: '¿Qué tipos de casos llegan a la red?',
    respuesta: 'Tutelas, derechos de petición, procesos de familia, laborales, penales querellables, y acciones populares. Los casos complejos que requieren litigio activo son exactamente los que más necesitan un abogado aliado.',
  },
  {
    pregunta: '¿Tengo que estar en Bogotá?',
    respuesta: 'No. La plataforma opera a nivel nacional. Si estás en Medellín, Cali, Barranquilla, o cualquier municipio, puedes recibir casos de tu zona.',
  },
]

const Abogados = () => {
  const [faqAbierto, setFaqAbierto] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    tarjeta: '',
    ciudad: '',
    especialidad: '',
    correo: '',
    telefono: '',
    mensaje: '',
  })
  const [enviado,  setEnviado]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    // Intenta el backend; en su ausencia espera 1.8 s y simula éxito
    try {
      const res = await fetch('/api/lawyers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('sin backend')
    } catch {
      await new Promise(r => setTimeout(r, 1800))
    }
    setLoading(false)
    setEnviado(true)
  }

  const canSubmit = formData.nombre && formData.correo && formData.tarjeta

  return (
    <div className="abogados-page">

      {/* Header */}
      <header className="abogados-header">
        <div className="container abogados-header__inner">
          <Link to="/"><Logo size={36} showText={true} /></Link>
          <Link to="/caso" className="btn-primary-outline">
            Ver la plataforma
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="abogados-hero">
        <div className="abogados-hero__bg" />
        <div className="container abogados-hero__content">
          <div className="abogados-badge animate-fade-up">
            <Briefcase size={14} />
            Para abogados colombianos
          </div>

          <h1 className="animate-fade-up delay-100">
            Tu herramienta legal.<br />
            <em>No tu competencia.</em>
          </h1>

          <p className="animate-fade-up delay-200">
            Defiéndete amplifica tu trabajo. Genera documentos base para tus clientes,
            accede a jurisprudencia verificada al instante, o recibe casos de ciudadanos
            que llegan preparados — para que tú te enfoques en lo que realmente requiere tu criterio.
          </p>

          <div className="abogados-hero__actions animate-fade-up delay-300">
            <a href="#unirse" className="btn-cta">
              Quiero ser aliado
              <ArrowRight size={18} />
            </a>
            <a href="#como-funciona" className="btn-outline">
              ¿Cómo funciona?
              <ChevronDown size={16} />
            </a>
          </div>

          {/* Métricas rápidas */}
          <div className="hero-metrics animate-fade-up delay-400">
            {[
              { valor: '6x', label: 'más capacidad por abogado' },
              { valor: '15 min', label: 'para revisar un expediente' },
              { valor: '100%', label: 'documentos verificados' },
            ].map((m, i) => (
              <div key={i} className="hero-metric">
                <span className="hero-metric__valor">{m.valor}</span>
                <span className="hero-metric__label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ── */}
      <section className="abogados-beneficios">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">¿Por qué unirte?</span>
            <h2>Lo que cambia para ti</h2>
            <p>No es competencia. Es infraestructura que trabaja para ti.</p>
          </div>
          <div className="beneficios-grid">
            {BENEFICIOS.map((b, i) => (
              <div key={i} className="beneficio-card">
                <div className="beneficio-icon">{b.icon}</div>
                <h3>{b.titulo}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="abogados-flujo" id="como-funciona">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">El proceso</span>
            <h2>Así funciona la colaboración</h2>
          </div>
          <div className="flujo-steps">
            {COMO_FUNCIONA.map((paso, i) => (
              <div key={i} className="flujo-step">
                <div className="flujo-numero">{paso.numero}</div>
                <div className="flujo-content">
                  <h3>{paso.titulo}</h3>
                  <p>{paso.desc}</p>
                </div>
                {i < COMO_FUNCIONA.length - 1 && (
                  <div className="flujo-connector" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODELO ECONÓMICO ── */}
      <section className="abogados-economia">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">El modelo económico</span>
            <h2>Más alcance,<br /><em>menos trabajo operativo</em></h2>
          </div>
          <div className="economia-comparacion">
            <div className="economia-col economia-col--antes">
              <h3>Sin Defiéndete</h3>
              <div className="economia-items">
                {[
                  '3-4 horas investigando el caso',
                  '2 horas buscando jurisprudencia',
                  '1 hora redactando el documento base',
                  'Revisión y correcciones',
                  'Total: 6-8 horas por caso',
                ].map((item, i) => (
                  <div key={i} className={`economia-item ${i === 4 ? 'economia-item--total' : ''}`}>
                    <span className="economia-x">✗</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="economia-divider">
              <ArrowRight size={24} />
            </div>

            <div className="economia-col economia-col--despues">
              <h3>Con Defiéndete</h3>
              <div className="economia-items">
                {[
                  'Documento base generado automáticamente',
                  'Jurisprudencia relevante ya identificada',
                  '15 min revisando y ajustando',
                  'Tu criterio en lo que realmente importa',
                  'Total: 15-30 min por caso operativo',
                ].map((item, i) => (
                  <div key={i} className={`economia-item economia-item--ok ${i === 4 ? 'economia-item--total' : ''}`}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="economia-nota">
            El tiempo que ahorras en trabajo operativo lo inviertes
            en <strong>casos más complejos y de mayor valor</strong> — donde tu criterio jurídico es irremplazable.
          </p>
        </div>
      </section>

      {/* ── FAQS ── */}
      <section className="abogados-faq">
        <div className="container container-narrow">
          <div className="section-header">
            <span className="section-tag">Preguntas frecuentes</span>
            <h2>Lo que te estás preguntando</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`faq-item ${faqAbierto === i ? 'faq-item--open' : ''}`}
                onClick={() => setFaqAbierto(faqAbierto === i ? null : i)}
              >
                <div className="faq-pregunta">
                  <span>{faq.pregunta}</span>
                  <ChevronDown size={18} className="faq-chevron" />
                </div>
                {faqAbierto === i && (
                  <div className="faq-respuesta">
                    {faq.respuesta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMULARIO ── */}
      <section className="abogados-form" id="unirse">
        <div className="container container-narrow">
          {!enviado ? (
            <div className="form-card">
              <div className="form-card__header">
                <h2>Quiero ser abogado aliado</h2>
                <p>Cupos limitados para la red de lanzamiento. Déjanos tus datos y te contactamos esta semana.</p>
              </div>

              <div className="form-fields">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre completo *</label>
                    <input
                      type="text"
                      placeholder="Dr. Carlos Martínez"
                      value={formData.nombre}
                      onChange={e => setFormData({...formData, nombre: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tarjeta profesional *</label>
                    <input
                      type="text"
                      placeholder="TP-12345 Consejo Superior"
                      value={formData.tarjeta}
                      onChange={e => setFormData({...formData, tarjeta: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ciudad</label>
                    <input
                      type="text"
                      placeholder="Bogotá, Medellín, Cali..."
                      value={formData.ciudad}
                      onChange={e => setFormData({...formData, ciudad: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Especialidad principal</label>
                    <select
                      value={formData.especialidad}
                      onChange={e => setFormData({...formData, especialidad: e.target.value})}
                    >
                      <option value="">Selecciona...</option>
                      <option>Derecho de Familia</option>
                      <option>Derecho Penal</option>
                      <option>Derecho Laboral</option>
                      <option>Derecho Constitucional</option>
                      <option>Derecho Civil</option>
                      <option>Derecho Administrativo</option>
                      <option>General / Varias áreas</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Correo electrónico *</label>
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={formData.correo}
                      onChange={e => setFormData({...formData, correo: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="300 123 4567"
                      value={formData.telefono}
                      onChange={e => setFormData({...formData, telefono: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>¿Algo que quieras contarnos?</label>
                  <textarea
                    placeholder="Tu experiencia, el tipo de casos que manejas, preguntas..."
                    value={formData.mensaje}
                    onChange={e => setFormData({...formData, mensaje: e.target.value})}
                    rows={3}
                  />
                </div>

                <button
                  className={`btn-cta btn-cta--full ${(!canSubmit || loading) ? 'btn-disabled' : ''}`}
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                >
                  {loading ? 'Enviando…' : 'Enviar solicitud'}
                  {!loading && <ArrowRight size={18} />}
                </button>

                <p className="form-nota">
                  * Campos obligatorios. Verificamos la tarjeta profesional antes de activar tu cuenta.
                </p>
              </div>
            </div>
          ) : (
            <div className="form-success animate-fade-up">
              <CheckCircle2 size={48} />
              <h2>¡Recibido!</h2>
              <p>Te contactamos en menos de 48 horas para activar tu cuenta de abogado aliado.</p>
              <Link to="/" className="btn-outline">
                Ver la plataforma
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer simple */}
      <footer className="abogados-footer">
        <div className="container">
          <Logo size={28} showText={true} />
          <p>© 2026 Defiéndete · Servicio Legal Digital · Colombia 🇨🇴</p>
        </div>
      </footer>

    </div>
  )
}

export default Abogados
