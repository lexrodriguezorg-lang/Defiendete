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

const PRICING_TIERS = [
  {
    nivel: 'Baja',
    precio: '$30.000',
    sub: 'COP · pago único',
    icono: '📋',
    color: '#22D3A0',
    ejemplos: [
      'Derechos de petición simples',
      'Solicitudes de información a entidades',
      'Reclamaciones de garantía comercial',
      'Quejas ante la SIC',
    ],
  },
  {
    nivel: 'Media',
    precio: '$50.000 – $80.000',
    sub: 'COP · pago único',
    icono: '⚖️',
    color: '#F4A72B',
    highlight: true,
    ejemplos: [
      'Despidos sin justa causa y liquidaciones',
      'Derechos de petición laborales',
      'Cobros injustificados de servicios públicos',
      'Acoso laboral y solicitudes de liquidación',
    ],
  },
  {
    nivel: 'Alta',
    precio: '$100.000 – $150.000',
    sub: 'COP · pago único',
    icono: '🛡️',
    color: '#00B4A0',
    ejemplos: [
      'Acciones de tutela por salud o familia',
      'Custodia y restitución de menores',
      'Contratos y minutas comerciales',
      'Acciones de amparo constitucional',
    ],
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
    text: 'Me despidieron sin pagarme liquidación. Defiéndete me explicó exactamente qué documentos presentar y con qué artículos. Recuperé todo lo que me debían.',
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
            <span className="section-tag">Cotización automática</span>
            <h2>El precio lo determina<br /><em>tu caso, no nosotros</em></h2>
            <p>Antes de pagar, el diagnóstico gratuito evalúa la complejidad de tu situación y te cotiza exactamente cuánto cuesta.</p>
          </div>

          {/* Flujo de cotización */}
          <div className="pricing-flow">
            {[
              { n: '1', label: 'Cuéntanos tu caso',     sub: 'Gratis · sin registro' },
              { n: '2', label: 'Diagnóstico inmediato', sub: 'Rama del derecho y derechos vulnerados' },
              { n: '3', label: 'Cotización exacta',     sub: 'El sistema evalúa la complejidad' },
              { n: '4', label: 'Pagas y recibes',       sub: 'Documentos listos para radicar' },
            ].map((item, i) => (
              <div key={i} className="pricing-flow-step">
                <div className="pf-number">{item.n}</div>
                <div className="pf-content">
                  <strong>{item.label}</strong>
                  <span>{item.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tiers de referencia */}
          <p className="tiers-label">Precios de referencia según complejidad del caso</p>
          <div className="tiers">
            {PRICING_TIERS.map((tier, i) => (
              <div key={i} className={`tier-card ${tier.highlight ? 'tier-card--mid' : ''}`}>
                <span className="tier-icon">{tier.icono}</span>
                <div className="tier-nivel" style={{ color: tier.color }}>
                  Complejidad {tier.nivel}
                </div>
                <div className="tier-precio">
                  <span className="tier-amount">{tier.precio}</span>
                  <span className="tier-sub">{tier.sub}</span>
                </div>
                <ul className="tier-ejemplos">
                  {tier.ejemplos.map((ej, j) => (
                    <li key={j} className="tier-ejemplo">
                      <CheckCircle2 size={13} />
                      <span>{ej}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pricing-cta">
            <p className="pricing-cta-note">
              El diagnóstico determina exactamente en qué nivel está tu caso
            </p>
            <Link to="/caso" className="btn-cta btn-cta--lg">
              Comenzar diagnóstico gratis
              <ArrowRight size={20} />
            </Link>
            <p className="pricing-cta-sub">Sin registro · Sin tarjeta · Sin compromisos</p>
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
            <h2>¿Eres abogado?<br /><em>Esta es tu herramienta.</em></h2>
            <p>Defiéndete no compite contigo — trabaja para ti. Úsala para generar documentos base para tus clientes, o recibe casos de ciudadanos que llegaron preparados, con su expediente completo y su estrategia documentada.</p>
            <Link to="/abogados" className="btn-cta">
              Ver el modelo de colaboración
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="lawyers__card">
            <Users size={28} className="lawyers-icon" />
            <h3>Dos formas de usar Defiéndete</h3>
            <div className="lawyers-steps">
              {[
                'Genera plantillas y documentos base para tus clientes',
                'Accede a jurisprudencia verificada en segundos',
                'Recibe casos con expediente completo ya preparado',
                'El cliente llega informado — tú te enfocas en lo estratégico',
                'Más casos atendidos, menos horas operativas',
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
