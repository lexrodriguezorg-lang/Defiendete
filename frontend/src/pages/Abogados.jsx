import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  ArrowRight, CheckCircle2, Clock, DollarSign,
  FileText, Users, ChevronDown, Briefcase,
  Shield, Zap, TrendingUp, X, Building2, UserCheck,
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import './Abogados.css'

/* ── Planes para abogados ── */
const PLANES = [
  {
    id: 'aliado',
    nombre: 'Aliado',
    subtitulo: 'Para abogados que empiezan',
    precio: '$149.000',
    periodo: '/ mes · IVA incluido',
    highlight: false,
    color: '#22D3A0',
    comision: '8% por lead aceptado',
    incluye: [
      'Acceso a bolsa de leads premasticados',
      'Hasta 8 leads disponibles al mes',
      'Generador de documentos base (tutelas, peticiones)',
      'Búsqueda de jurisprudencia por tema',
      'Alertas de vencimientos procesales',
      'Soporte por correo electrónico',
    ],
    noIncluye: [
      'Leads prioritarios',
      'Múltiples usuarios',
      'CRM integrado',
    ],
  },
  {
    id: 'socio',
    nombre: 'Socio Activo',
    subtitulo: 'Para abogados con práctica establecida',
    precio: '$299.000',
    periodo: '/ mes · IVA incluido',
    highlight: true,
    color: '#00B4A0',
    badge: 'Más popular',
    comision: '5% por lead aceptado',
    incluye: [
      'Todo lo de Aliado',
      'Leads ilimitados + acceso prioritario',
      'Comisión reducida (5% vs 8%)',
      'CRM básico integrado en el panel',
      'Historial completo de casos y clientes',
      'Generador de minutas y contratos',
      'Soporte directo por WhatsApp',
    ],
    noIncluye: [
      'Múltiples usuarios (solo 1 perfil)',
      'Onboarding personalizado',
    ],
  },
  {
    id: 'firma',
    nombre: 'Firma Aliada',
    subtitulo: 'Para bufetes y firmas de abogados',
    precio: '$699.000',
    periodo: '/ mes · IVA incluido',
    highlight: false,
    color: '#F4A72B',
    comision: 'Sin comisión por lead',
    incluye: [
      'Todo lo de Socio Activo',
      'Sin comisión por leads aceptados',
      'Hasta 8 perfiles de abogado',
      'Panel de administración de firma',
      'Asignación interna de leads por área',
      'Reportes de productividad del equipo',
      'Onboarding y capacitación personalizada',
      'Soporte prioritario 24/7',
    ],
    noIncluye: [],
  },
]

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
  const [faqAbierto,   setFaqAbierto]   = useState(null)
  const [planSelecto,  setPlanSelecto]  = useState(null)   // plan clickeado → abre modal
  const [formData, setFormData] = useState({
    nombre: '', tarjeta: '', nit: '', firma: '', num_abogados: '',
    ciudad: '', especialidad: '', correo: '', telefono: '', tipo: 'independiente',
  })
  const [enviado,  setEnviado]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  const esFirma  = formData.tipo === 'bufete'
  const canSubmit = esFirma
    ? (formData.firma && formData.correo && formData.nit)
    : (formData.nombre && formData.correo && formData.tarjeta)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/lawyers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, plan: planSelecto?.id }),
      })
      if (!res.ok) throw new Error('sin backend')
    } catch {
      await new Promise(r => setTimeout(r, 1800))
    }
    setLoading(false)
    setEnviado(true)
    setPlanSelecto(null)
  }

  const abrirPlan = (plan) => { setEnviado(false); setFormData(f => ({ ...f, tipo: 'independiente' })); setPlanSelecto(plan) }

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

      {/* ── PRECIOS ── */}
      <section className="abogados-precios" id="unirse">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Planes y precios</span>
            <h2>Elige el plan que<br /><em>se ajusta a tu práctica</em></h2>
            <p>Sin contratos de permanencia. Cancela cuando quieras. Todos los planes incluyen acceso completo desde el primer día.</p>
          </div>

          <div className="precios-grid">
            {PLANES.map(plan => (
              <div key={plan.id} className={`precio-card ${plan.highlight ? 'precio-card--highlight' : ''}`}>
                {plan.badge && (
                  <div className="precio-badge">{plan.badge}</div>
                )}
                <div className="precio-header">
                  <h3 className="precio-nombre" style={{ color: plan.color }}>{plan.nombre}</h3>
                  <p className="precio-subtitulo">{plan.subtitulo}</p>
                  <div className="precio-monto">
                    <span className="precio-valor">{plan.precio}</span>
                    <span className="precio-periodo">{plan.periodo}</span>
                  </div>
                  <div className="precio-comision">
                    <Zap size={13} style={{ color: plan.color }} />
                    <span>{plan.comision}</span>
                  </div>
                </div>

                <ul className="precio-incluye">
                  {plan.incluye.map((item, i) => (
                    <li key={i} className="precio-item precio-item--ok">
                      <CheckCircle2 size={14} style={{ color: plan.color, flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                  {plan.noIncluye.map((item, i) => (
                    <li key={i} className="precio-item precio-item--no">
                      <X size={14} style={{ flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`precio-cta ${plan.highlight ? 'precio-cta--highlight' : ''}`}
                  style={plan.highlight ? {} : { borderColor: plan.color, color: plan.color }}
                  onClick={() => abrirPlan(plan)}
                >
                  Contratar {plan.nombre}
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>

          <p className="precios-nota">
            * Precios expresados en COP con IVA incluido. La comisión aplica sobre el valor cobrado al ciudadano cuando aceptas un lead.
            Para facturación anual con descuento del 20%, contáctanos directamente.
          </p>
        </div>
      </section>

      {/* Modal de contratación */}
      {planSelecto && createPortal(
        <ModalContratacion
          plan={planSelecto}
          formData={formData}
          setFormData={setFormData}
          canSubmit={canSubmit}
          loading={loading}
          enviado={enviado}
          onSubmit={handleSubmit}
          onClose={() => setPlanSelecto(null)}
        />,
        document.body
      )}

      {/* Éxito global (si cerraron el modal luego de enviar) */}
      {enviado && !planSelecto && (
        <div className="container" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div className="form-success animate-fade-up">
            <CheckCircle2 size={48} />
            <h2>¡Solicitud enviada!</h2>
            <p>Te contactamos en menos de 48 horas para activar tu cuenta.</p>
            <Link to="/" className="btn-outline">Volver al inicio</Link>
          </div>
        </div>
      )}

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

/* ── Modal de contratación ── */
function ModalContratacion({ plan, formData, setFormData, canSubmit, loading, enviado, onSubmit, onClose }) {
  const esFirma = formData.tipo === 'bufete'

  // Cierra con Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const set = (field) => (e) => setFormData(f => ({ ...f, [field]: e.target.value }))

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
      onClick={onClose}
    >
      <div
        className="modal-contratacion animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderColor: plan.color + '44' }}>
          <div>
            <p className="modal-plan-tag" style={{ color: plan.color }}>Plan {plan.nombre}</p>
            <h2 className="modal-title">Activa tu cuenta de abogado</h2>
            <p className="modal-subtitle">{plan.precio} {plan.periodo}</p>
          </div>
          <button onClick={onClose} className="modal-close"><X size={20} /></button>
        </div>

        {enviado ? (
          <div className="modal-success">
            <CheckCircle2 size={44} style={{ color: plan.color }} />
            <h3>¡Solicitud enviada!</h3>
            <p>Te contactamos en menos de 48 horas para activar tu cuenta de <strong>{plan.nombre}</strong>.</p>
            <button className="btn-cta" onClick={onClose} style={{ marginTop: 8 }}>Cerrar</button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={onSubmit}>

            {/* Tipo de cliente */}
            <div className="modal-tipo-selector">
              <button
                type="button"
                className={`modal-tipo-btn ${!esFirma ? 'modal-tipo-btn--active' : ''}`}
                style={!esFirma ? { borderColor: plan.color, color: plan.color, background: plan.color + '14' } : {}}
                onClick={() => setFormData(f => ({ ...f, tipo: 'independiente' }))}
              >
                <UserCheck size={18} />
                <span>Abogado independiente</span>
              </button>
              <button
                type="button"
                className={`modal-tipo-btn ${esFirma ? 'modal-tipo-btn--active' : ''}`}
                style={esFirma ? { borderColor: plan.color, color: plan.color, background: plan.color + '14' } : {}}
                onClick={() => setFormData(f => ({ ...f, tipo: 'bufete' }))}
              >
                <Building2 size={18} />
                <span>Bufete / Firma</span>
              </button>
            </div>

            {/* Campos según tipo */}
            {!esFirma ? (
              <>
                <div className="modal-row">
                  <div className="modal-field">
                    <label>Nombre completo *</label>
                    <input type="text" placeholder="Dr. Carlos Martínez" value={formData.nombre} onChange={set('nombre')} required />
                  </div>
                  <div className="modal-field">
                    <label>Tarjeta profesional *</label>
                    <input type="text" placeholder="TP-12345" value={formData.tarjeta} onChange={set('tarjeta')} required />
                  </div>
                </div>
                <div className="modal-row">
                  <div className="modal-field">
                    <label>Especialidad principal</label>
                    <select value={formData.especialidad} onChange={set('especialidad')}>
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
                  <div className="modal-field">
                    <label>Ciudad</label>
                    <input type="text" placeholder="Bogotá, Medellín..." value={formData.ciudad} onChange={set('ciudad')} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="modal-row">
                  <div className="modal-field">
                    <label>Nombre de la firma *</label>
                    <input type="text" placeholder="Martínez & Asociados" value={formData.firma} onChange={set('firma')} required />
                  </div>
                  <div className="modal-field">
                    <label>NIT de la firma *</label>
                    <input type="text" placeholder="900.123.456-7" value={formData.nit} onChange={set('nit')} required />
                  </div>
                </div>
                <div className="modal-row">
                  <div className="modal-field">
                    <label>Nombre del contacto principal</label>
                    <input type="text" placeholder="Dr. Jorge Martínez" value={formData.nombre} onChange={set('nombre')} />
                  </div>
                  <div className="modal-field">
                    <label>N.º de abogados en la firma</label>
                    <select value={formData.num_abogados} onChange={set('num_abogados')}>
                      <option value="">Selecciona...</option>
                      <option>2 – 3</option>
                      <option>4 – 6</option>
                      <option>7 – 10</option>
                      <option>Más de 10</option>
                    </select>
                  </div>
                </div>
                <div className="modal-row">
                  <div className="modal-field">
                    <label>Ciudad</label>
                    <input type="text" placeholder="Bogotá, Medellín..." value={formData.ciudad} onChange={set('ciudad')} />
                  </div>
                </div>
              </>
            )}

            {/* Campos comunes */}
            <div className="modal-row">
              <div className="modal-field">
                <label>Correo electrónico *</label>
                <input type="email" placeholder="correo@firma.com" value={formData.correo} onChange={set('correo')} required />
              </div>
              <div className="modal-field">
                <label>WhatsApp</label>
                <input type="tel" placeholder="300 123 4567" value={formData.telefono} onChange={set('telefono')} />
              </div>
            </div>

            <button
              type="submit"
              className={`btn-cta btn-cta--full ${(!canSubmit || loading) ? 'btn-cta--disabled' : ''}`}
              disabled={!canSubmit || loading}
            >
              {loading ? 'Enviando solicitud…' : `Activar plan ${plan.nombre}`}
              {!loading && <ArrowRight size={18} />}
            </button>
            <p className="modal-nota">* Campos obligatorios. Verificamos la tarjeta profesional o el NIT antes de activar tu cuenta.</p>
          </form>
        )}
      </div>
    </div>
  )
}

export default Abogados
