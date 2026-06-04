import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Landing.css'

/* ── Áreas legales ── */
const AREAS = [
  'Salud y EPS',
  'Trabajo y despidos',
  'Familia y custodia',
  'Vivienda y arriendo',
  'Consumo y garantías',
  'Deudas y servicios',
]

/* ── Componente de caja de entrada reutilizable ── */
const EntradaBox = ({ id, label }) => {
  const [text, setText] = useState('')
  const navigate = useNavigate()

  const handleSubmit = () => {
    const t = text.trim()
    if (!t) return
    navigate('/caso', { state: { initialText: t } })
  }

  return (
    <div className="entrada-box">
      <textarea
        id={id}
        className="entrada-textarea"
        placeholder="Escribe aquí lo que estás viviendo..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
        }}
        rows={4}
        aria-label={label}
      />
      <button
        className={`btn-cta entrada-btn ${!text.trim() ? 'btn-cta--disabled' : ''}`}
        onClick={handleSubmit}
        disabled={!text.trim()}
      >
        Continuar
      </button>
      <p className="entrada-hint">El diagnóstico es gratuito. Tu información, protegida.</p>
    </div>
  )
}

/* ── Componente principal ── */
const Landing = () => {

  /* Animación de scroll con IntersectionObserver */
  useEffect(() => {
    const els = document.querySelectorAll('[data-animate]')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <main className="landing">

      {/* ─────────────────────────────────────────
          SECCIÓN 1 — HERO
      ───────────────────────────────────────── */}
      <section className="hero-sec">
        <div className="container hero-sec__inner">

          <h1 className="hero-sec__title">
            En Colombia, tener la razón no basta.<br />
            <em>Hay que saber defenderla.</em>
          </h1>

          <p className="hero-sec__sub">
            Cuéntame qué te pasó. Sin tecnicismos, sin miedo.
            Voy a leer tu caso, entender tu situación y decirte
            exactamente qué puedes hacer.
          </p>

          <EntradaBox id="hero-input" label="Describe tu situación legal" />

        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECCIÓN 2 — QUÉ HACE
      ───────────────────────────────────────── */}
      <section className="que-hace-sec">
        <div className="container container--text" data-animate>

          <h2 className="que-hace-sec__title">
            No reemplazamos a tu abogado.<br />
            <em>Te damos en minutos lo que tomaría semanas.</em>
          </h2>

          <p className="que-hace-sec__body">
            Defiéndete estudia tu caso contra las leyes y sentencias de Colombia,
            construye tu estrategia y redacta los documentos listos para radicar.
            Cada artículo que citamos, lo verificamos. Nada inventado.
            Nada que no resista ante un juez.
          </p>

        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECCIÓN 3 — LAS MATERIAS
      ───────────────────────────────────────── */}
      <section className="materias-sec">
        <div className="container" data-animate>

          <h2 className="materias-sec__title">Tu caso tiene un lugar aquí.</h2>

          <div className="materias-grid">
            {AREAS.map(area => (
              <Link key={area} to="/caso" className="materia-link">
                <span className="materia-link__label">{area}</span>
                <span className="materia-link__arrow">→</span>
              </Link>
            ))}
          </div>

          <p className="materias-sec__cierre">
            Y todo lo demás. Si tienes un problema, empieza por contárnoslo.
          </p>

        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECCIÓN 4 — CÓMO FUNCIONA
      ───────────────────────────────────────── */}
      <section className="como-sec">
        <div className="container container--text" data-animate>

          <span className="como-sec__label">El proceso</span>
          <h2 className="como-sec__title">Tres pasos. Ninguna complicación.</h2>

          <div className="como-prose">
            <p>
              Primero, nos cuentas qué pasó con tus palabras.
            </p>
            <p>
              Después, en segundos, sabes en qué terreno legal estás parado,
              qué derechos te amparan y qué tan urgente es actuar.
            </p>
            <p>
              Por último, si decides avanzar, recibes tu estrategia completa
              y tus documentos listos para presentar.
            </p>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECCIÓN 5 — LA GARANTÍA
      ───────────────────────────────────────── */}
      <section className="garantia-sec">
        <div className="container container--text" data-animate>

          <h2 className="garantia-sec__title">Lo que firmamos, lo respaldamos.</h2>

          <div className="garantia-prose">
            <p>
              Los sistemas de inteligencia artificial a veces inventan leyes que no existen.
              El nuestro no.
            </p>
            <p>
              Cada referencia legal de tu documento se verifica contra el cuerpo real
              de la ley colombiana antes de llegar a tus manos. Si algo no resiste, se rehace.
              Lo que recibes, lo puedes defender.
            </p>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECCIÓN 6 — PARA ABOGADOS
      ───────────────────────────────────────── */}
      <section className="abogados-sec">
        <div className="container abogados-sec__inner" data-animate>

          <div className="abogados-sec__text">
            <h2 className="abogados-sec__title">
              ¿Eres abogado?<br />
              <em>Multiplica tu capacidad, no tu jornada.</em>
            </h2>
            <p className="abogados-sec__body">
              Recibe casos con el expediente ya armado y la estrategia documentada.
              Genera escritos en minutos. Dedica tu tiempo a lo que solo tú puedes hacer.
            </p>
            <Link to="/abogados" className="btn-outline">
              Conoce el modelo
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECCIÓN 7 — CIERRE
      ───────────────────────────────────────── */}
      <section className="cierre-sec">
        <div className="container container--text" data-animate>

          <h2 className="cierre-sec__title">
            Miles de colombianos no hacen nada porque no saben qué hacer.
            <em> Tú ya no eres uno.</em>
          </h2>

          <EntradaBox id="cierre-input" label="Cuéntanos tu caso para empezar" />

        </div>
      </section>

      {/* ─────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────── */}
      <footer className="footer">
        <div className="container footer__inner">
          <p className="footer__brand">DEFIÉNDETE</p>
          <p className="footer__disclaimer">
            Información legal estructurada con respaldo en la ley colombiana.
            Para representación formal ante estrados, te conectamos con un abogado aliado.
          </p>
          <p className="footer__copy">© 2026 · Hecho en Colombia</p>
        </div>
      </footer>

    </main>
  )
}

export default Landing
