import { Link } from 'react-router-dom'
import {
  ArrowRight, CheckCircle2, Shield, FileText, Bell,
  Users, Star, ChevronDown, Zap, Lock, Scale,
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import './Landing.css'

/* ── Datos ── */
const STATS = [
  { value: '93%', label: 'Tasa de éxito en tutelas' },
  { value: '< 5 min', label: 'Para tu diagnóstico' },
  { value: '$0', label: 'Para saber en qué estás' },
  { value: '18+', label: 'Leyes colombianas en el corpus' },
]

const STEPS = [
  {
    number: '01',
    title: 'Cuéntanos tu caso',
    description: 'En tus propias palabras. Sin términos técnicos. El sistema entiende lenguaje natural.',
    icon: <FileText size={22} />,
  },
  {
    number: '02',
    title: 'Diagnóstico gratis',
    description: 'En segundos sabes tu rama del derecho, qué leyes aplican, urgencia y opciones disponibles.',
    icon: <Zap size={22} />,
  },
  {
    number: '03',
    title: 'Estrategia completa',
    description: 'Pasos exactos, artículos verificados, plazos reales. Documentos listos para radicar.',
    icon: <Shield size={22} />,
  },
  {
    number: '04',
    title: 'Seguimiento activo',
    description: 'Panel con alertas de la Rama Judicial. Sabe cuándo hay cambios en tu proceso.',
    icon: <Bell size={22} />,
  },
]

const PLANS = [
  {
    name: 'Diagnóstico',
    price: 'Gratis',
    sub: 'Siempre',
    features: [
      'Clasificación del caso',
      'Derechos vulnerados',
      'Opciones legales disponibles',
      'Urgencia del caso',
    ],
    cta: 'Comenzar gratis',
    href: '/caso',
    highlight: false,
  },
  {
    name: 'Estrategia',
    price: '$80.000',
    sub: 'COP · pago único',
    features: [
      'Todo del plan Diagnóstico',
      'Plan de acción paso a paso',
      'Artículos y sentencias verificadas',
      'Plazos legales exactos',
      'Probabilidad de éxito',
      'Chat con asistente IA',
    ],
    cta: 'Obtener estrategia',
    href: '/caso?plan=estrategia',
    highlight: true,
    badge: 'Más popular',
  },
  {
    name: 'Documentos + Seguimiento',
    price: '$150.000',
    sub: 'COP · pago único',
    features: [
      'Todo del plan Estrategia',
      'Documentos listos para radicar',
      'Panel de seguimiento Rama Judicial',
      'Alertas de cambios en tu proceso',
      '6 meses de monitoreo activo',
      'Abogado on-demand disponible',
    ],
    cta: 'Activar plan completo',
    href: '/caso?plan=completo',
    highlight: false,
  },
]

const TESTIMONIALS = [
  {
    name: 'Carmen Rodríguez',
    location: 'Cali, Valle',
    case: 'Tutela por negación de servicio médico',
    text: 'La EPS me negó una cirugía urgente. Defiéndete me explicó en 3 minutos qué tenía que hacer. Radiqué la tutela sola, me la fallaron en 10 días.',
    stars: 5,
  },
  {
    name: 'Héctor Vargas',
    location: 'Medellín, Antioquia',
    case: 'Derecho de petición laboral',
    text: 'Me despidieron sin pagarme liquidación. Con el documento que generó la plataforma y sin pagar un abogado recuperé todo lo que me debían.',
    stars: 5,
  },
  {
    name: 'Yulieth Ospina',
    location: 'Bogotá, Cundinamarca',
    case: 'Custodia de hijos',
    text: 'El papá de mis hijos los tenía retenidos. Con Defiéndete entendí mis derechos y la estrategia que me dieron fue exactamente lo que funcionó.',
    stars: 5,
  },
]

const LEGAL_AREAS = [
  { icon: '👨‍👩‍👧', label: 'Familia', desc: 'Custodia, alimentos, violencia intrafamiliar' },
  { icon: '⚖️', label: 'Penal', desc: 'Denuncias, defensa, delitos' },
  { icon: '💼', label: 'Laboral', desc: 'Despidos, liquidaciones, acoso' },
  { icon: '📋', label: 'Tutelas', desc: 'Derechos fundamentales, EPS, educación' },
  { icon: '🏠', label: 'Civil', desc: 'Contratos, arrendamiento, deudas' },
  { icon: '🏛️', label: 'Administrativo', desc: 'Quejas contra el estado' },
]

/* ── Componente ── */
const Landing = () => {
  return (
    <main className="landing">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__grid" />
          <div className="hero__glow" />
        </div>

        <div className="container hero__content">
          <div className="hero__badge animate-fade-up">
            <span className="badge-dot" />
            Diagnóstico legal gratuito para todos los colombianos
          </div>

          <h1 className="hero__title animate-fade-up delay-100">
            Conócela. Úsala. <br />
            <em>inteligente y al alcance</em><br />
            de tu bolsillo.
          </h1>

          <p className="hero__subtitle animate-fade-up delay-200">
            Tutelas, derechos de petición, custodia, despidos, denuncias.
            Estrategia real con artículos y sentencias verificadas.
            Desde <strong>$30.000 COP</strong>.
          </p>

          <div className="hero__actions animate-fade-up delay-300">
            <Link to="/caso" className="btn-cta">
              Cuéntame tu caso — es gratis
              <ArrowRight size={18} />
            </Link>
            <a href="#como-funciona" className="btn-outline">
              ¿Cómo funciona?
              <ChevronDown size={16} />
            </a>
          </div>

          <div className="hero__trust animate-fade-up delay-400">
            <div className="trust-item">
              <CheckCircle2 size={14} />
              <span>Cero alucinaciones — todo verificado</span>
            </div>
            <div className="trust-item">
              <Lock size={14} />
              <span>Tus datos protegidos (Ley 1581)</span>
            </div>
            <div className="trust-item">
              <Scale size={14} />
              <span>Abogados aliados disponibles</span>
            </div>
          </div>
        </div>

        {/* Tarjeta flotante de diagnóstico */}
        <div className="container">
          <div className="hero__card animate-fade-up delay-500">
            <div className="hero__card-header">
              <div className="card-status">
                <span className="status-dot" />
                Diagnóstico en curso
              </div>
              <span className="card-tag">Derecho de Familia</span>
            </div>
            <div className="hero__card-body">
              <div className="diagnosis-line">
                <CheckCircle2 size={16} className="check-verified" />
                <span>Art. 86 Const. — Acción de tutela aplicable</span>
              </div>
              <div className="diagnosis-line">
                <CheckCircle2 size={16} className="check-verified" />
                <span>Ley 1098/2006 Art. 22 — Interés superior del menor</span>
              </div>
              <div className="diagnosis-line">
                <CheckCircle2 size={16} className="check-verified" />
                <span>Sentencia T-502/11 — Custodia y restitución urgente</span>
              </div>
              <div className="diagnosis-bar">
                <span className="bar-label">Verificando corpus legal...</span>
                <div className="progress-bar">
                  <div className="progress-fill" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats">
        <div className="container stats__grid">
          {STATS.map((s, i) => (
            <div key={i} className="stat-card">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ÁREAS LEGALES ── */}
      <section className="areas">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Cobertura legal</span>
            <h2>Manejamos tu tipo de caso</h2>
            <p>Desde una tutela por negación médica hasta un despido injusto. Todos los colombianos merecen conocer sus derechos.</p>
          </div>
          <div className="areas__grid">
            {LEGAL_AREAS.map((a, i) => (
              <Link to="/caso" key={i} className="area-card">
                <span className="area-icon">{a.icon}</span>
                <strong className="area-label">{a.label}</strong>
                <span className="area-desc">{a.desc}</span>
                <span className="area-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="how-it-works" id="como-funciona">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">El proceso</span>
            <h2>De tu relato al documento<br /><em>en minutos</em></h2>
            <p>No necesitas saber de leyes. Cuéntanos qué pasó y el sistema hace el resto.</p>
          </div>

          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={i} className="step">
                <div className="step__number">{s.number}</div>
                <div className="step__icon">{s.icon}</div>
                <div className="step__content">
                  <h3 className="step__title">{s.title}</h3>
                  <p className="step__desc">{s.description}</p>
                </div>
                {i < STEPS.length - 1 && <div className="step__connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GARANTÍA DE CALIDAD ── */}
      <section className="quality">
        <div className="container quality__inner">
          <div className="quality__text">
            <span className="section-tag">Cero alucinaciones</span>
            <h2>El Agente Auditor verifica<br /><em>cada artículo</em></h2>
            <p>Nuestro sistema tiene una capa de control de calidad que verifica automáticamente que cada artículo y sentencia citada en tu documento existe realmente en el corpus legal colombiano.</p>
            <p>Si el sistema inventa una ley — algo que los LLMs hacen frecuentemente — el documento se destruye y se reescribe. Puedes mostrarle tu documento a cualquier juez o abogado.</p>
            <div className="quality__checks">
              {[
                'Verificado contra 18+ normas colombianas',
                'Jurisprudencia de las altas cortes',
                'Artículos exactos, no resúmenes',
                'Plazos legales precisos',
              ].map((c, i) => (
                <div key={i} className="quality-check">
                  <CheckCircle2 size={16} />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="quality__visual">
            <div className="audit-card">
              <div className="audit-header">
                <Shield size={18} />
                <span>Reporte de Auditoría</span>
                <span className="audit-status approved">APROBADO</span>
              </div>
              <div className="audit-items">
                {[
                  { ref: 'Art. 86 Const. 1991', score: 0.97, status: 'VERIFICADA' },
                  { ref: 'Decreto 2591/1991 Art. 8', score: 0.94, status: 'VERIFICADA' },
                  { ref: 'Ley 1755/2015 Art. 14', score: 0.91, status: 'VERIFICADA' },
                  { ref: 'Sentencia T-760/2008', score: 0.89, status: 'VERIFICADA' },
                ].map((item, i) => (
                  <div key={i} className="audit-item">
                    <span className="audit-ref">{item.ref}</span>
                    <span className="audit-score">{item.score}</span>
                    <span className="audit-verified">{item.status}</span>
                  </div>
                ))}
              </div>
              <div className="audit-footer">
                <CheckCircle2 size={14} />
                <span>4/4 referencias verificadas — Documento listo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section className="pricing" id="precios">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Precios</span>
            <h2>Lo que un abogado cobra por hora,<br /><em>nosotros lo hacemos por menos</em></h2>
            <p>En Colombia, una consulta con abogado cuesta entre $150.000 y $500.000. Nosotros hacemos más, por menos.</p>
          </div>

          <div className="plans">
            {PLANS.map((plan, i) => (
              <div key={i} className={`plan-card ${plan.highlight ? 'plan-card--highlight' : ''}`}>
                {plan.badge && (
                  <div className="plan-badge">{plan.badge}</div>
                )}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">
                  <span className="plan-amount">{plan.price}</span>
                  <span className="plan-period">{plan.sub}</span>
                </div>
                <ul className="plan-features">
                  {plan.features.map((f, j) => (
                    <li key={j} className="plan-feature">
                      <CheckCircle2 size={15} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.href}
                  className={plan.highlight ? 'btn-cta' : 'btn-outline'}
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonios</span>
            <h2>Colombianos que conocieron<br /><em>sus derechos</em></h2>
          </div>
          <div className="testimonials__grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <Star key={j} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.location} · {t.case}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RED DE ABOGADOS ── */}
      <section className="lawyers" id="abogados">
        <div className="container lawyers__inner">
          <div className="lawyers__text">
            <span className="section-tag">Para abogados</span>
            <h2>¿Eres abogado?<br /><em>Únete a la red.</em></h2>
            <p>Recibe casos ya estrategizados y documentados. Tu trabajo: revisar, ajustar si necesario, y poner tu presencia el día que toca. Menos trabajo de base, más casos al mes.</p>
            <Link to="/abogados" className="btn-cta">
              Quiero ser aliado
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="lawyers__card">
            <Users size={28} className="lawyers-icon" />
            <h3>Modelo de colaboración</h3>
            <div className="lawyers-steps">
              {[
                'El cliente obtiene el diagnóstico y la estrategia',
                'Si necesita representación, el caso llega a ti documentado',
                'Revisas el plan, ajustas si es necesario',
                'Apareces el día de la diligencia',
                'Cobras por presencia, no por horas de investigación',
              ].map((s, i) => (
                <div key={i} className="lawyers-step">
                  <span className="lawyers-num">{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="final-cta">
        <div className="container">
          <div className="final-cta__inner">
            <div className="final-cta__glow" />
            <h2>¿Tienes un problema legal?<br /><em>Empieza gratis hoy.</em></h2>
            <p>Miles de colombianos no hacen nada porque no saben qué hacer ni pueden pagar un abogado. Tú no tienes que ser uno de ellos.</p>
            <Link to="/caso" className="btn-cta btn-cta--lg">
              Cuéntame tu caso — es gratis
              <ArrowRight size={20} />
            </Link>
            <p className="final-cta__note">Sin registro. Sin tarjeta. Sin compromisos.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container footer__inner">
          <Logo size={32} showText={true} />
          <p className="footer__disclaimer">
            Defiéndete proporciona información legal estructurada, no asesoría jurídica profesional.
            Para representación legal formal, consulta con un abogado licenciado.
          </p>
          <p className="footer__copy">© 2026 Defiéndete · Hecho en Colombia 🇨🇴</p>
        </div>
      </footer>

    </main>
  )
}

export default Landing
