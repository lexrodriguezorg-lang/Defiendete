/**
 * Landing.jsx — Página principal de Defiéndete.
 *
 * Incluye:
 *   · Intro cinemática (línea teal → logo → wipe-up → reveal nav-logo)
 *   · Hero con artifact card
 *   · Sección 02 "El método"
 *   · Sección Lawyers (fondo verde oscuro)
 *   · Cierre con textarea → /caso
 *   · Footer
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoSrc from '../assets/logo.png'
import './Landing.css'

/* ── Reveal al hacer scroll ── */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.rv')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }),
      { threshold: 0.08 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ── Caja del chat (cierre) ── */
const ChatBox = () => {
  const [text, setText] = useState('')
  const navigate = useNavigate()

  const handleSend = () => {
    const t = text.trim()
    if (!t) return
    navigate('/caso', { state: { initialText: t } })
  }

  return (
    <div className="cierre-chat rv d1">
      <div className="cp">
        <div className="cp-glow" />
        <div className="cp-card">
          <textarea
            placeholder="Escribe aquí lo que estás viviendo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
          />
          <div className="cp-bottom">
            <div className="cp-trust">
              <span className="row">
                <span className="cp-ping"><i /><b /></span>
                En línea
              </span>
            </div>
            <button className="cp-send" aria-label="Enviar" onClick={handleSend}>
              <svg viewBox="0 0 20 20" strokeWidth="2" fill="none" stroke="currentColor">
                <path d="M4 10h12M11 5l5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Componente principal ── */
const Landing = () => {
  useReveal()

  /* Estado de la intro */
  const [ilineW,    setIlineW]    = useState('0')
  const [ilineOp,   setIlineOp]   = useState(1)
  const [ilogoVis,  setIlogoVis]  = useState(false)
  const [mainVis,   setMainVis]   = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const [introGone, setIntroGone] = useState(false)

  useEffect(() => {
    const ts = [
      setTimeout(() => setIlineW('100%'),   200),
      setTimeout(() => setIlogoVis(true),   650),
      setTimeout(() => setIlineOp(0),      1100),
      setTimeout(() => setMainVis(true),   1400),
      setTimeout(() => setIntroDone(true), 1500),
      setTimeout(() => setIntroGone(true), 2200),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  return (
    <>
      {/* ── Intro overlay ── */}
      {!introGone && (
        <div className={`s-intro${introDone ? ' out' : ''}`}>
          <div
            className="iline"
            style={{
              width:      ilineW,
              opacity:    ilineOp,
              transition: ilineW === '100%'
                ? 'width .42s cubic-bezier(.22,1,.36,1)'
                : 'opacity .3s',
            }}
          />
          <div
            className="ilogo"
            style={{
              opacity:    ilogoVis ? 1 : 0,
              transform:  ilogoVis ? 'scale(1)' : 'scale(1.18)',
              transition: 'opacity .5s ease, transform .5s cubic-bezier(.22,1,.36,1)',
            }}
          >
            <img src={logoSrc} alt="Defiéndete" />
          </div>
        </div>
      )}

      {/* ── Contenido principal ── */}
      <div className={`landing-main${mainVis ? ' revealed' : ''}`}>

        {/* ─── HERO ─── */}
        <section className="hero">
          <div className="w">
            <div className="hero-grid">

              {/* LEFT — copy */}
              <div>
                <div className="hero-meta">
                  <span className="ac">(01)</span>
                  <span>Información legal estructurada</span>
                </div>

                <h1>
                  En Colombia, tener<br />la razón no basta.
                  <span className="it">Hay que saber defenderla.</span>
                </h1>

                <p className="hero-sub">
                  Sin tecnicismos, sin miedo. Voy a leer tu caso, entender tu situación
                  y decirte exactamente qué puedes hacer y cómo.
                </p>

                <div className="hero-ctas">
                  <Link className="cta-primary" to="/caso">
                    Iniciar diagnóstico gratuito →
                  </Link>
                  <Link className="cta-secondary" to="/abogados">
                    ¿Eres abogado? Conoce el modelo <span className="arr">→</span>
                  </Link>
                </div>

                <div className="trust">
                  <span className="live">
                    <span className="pdot" />
                    Sistema activo
                  </span>
                  <span className="sep">·</span>
                  <span>Diagnóstico gratuito</span>
                  <span className="sep">·</span>
                  <span>Derecho colombiano verificado</span>
                </div>
              </div>

              {/* RIGHT — artifact */}
              <div className="artifact">
                <div className="artifact-glow" />
                <div className="art-card">
                  <div className="art-header">
                    <span className="art-title">Reporte de análisis</span>
                    <span className="art-badge">Verificado</span>
                  </div>
                  <div className="art-case">
                    <div className="label">Caso analizado</div>
                    <p>"Me despidieron sin justa causa y no me pagaron la liquidación completa."</p>
                  </div>
                  <div className="art-refs">
                    <div className="art-ref">
                      <span className="rname">Art. 64 CST — Terminación unilateral</span>
                      <span className="rscore">0.97</span>
                      <span className="rok">✓</span>
                    </div>
                    <div className="art-ref">
                      <span className="rname">Sentencia T-478/2023 — Corte Const.</span>
                      <span className="rscore">0.91</span>
                      <span className="rok">✓</span>
                    </div>
                    <div className="art-ref">
                      <span className="rname">Ley 361/1997 — Estabilidad reforzada</span>
                      <span className="rscore">0.89</span>
                      <span className="rok">✓</span>
                    </div>
                  </div>
                  <div className="art-footer">
                    <span className="fl">3/3 referencias verificadas</span>
                    <span className="fr">Estrategia lista →</span>
                  </div>
                </div>
                <div className="art-mini">
                  <div className="label">Probabilidad de éxito</div>
                  <div className="val">Alta</div>
                  <div className="sub">Caso sólido · Actúa pronto</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── SECCIÓN 02 ─── */}
        <section className="s02">
          <div className="w">
            <div className="s-meta rv"><span className="ac">(02)</span><span>El método</span></div>
            <h2 className="rv d1">
              No hay una respuesta automática esperándote.{' '}
              <span className="it">Hay un análisis de tu caso.</span>
            </h2>
            <p className="s02-desc rv d2">
              Cuando describes lo que pasó, el sistema cruza tu situación contra el cuerpo real
              del derecho colombiano — leyes, decretos y sentencias de la Corte Constitucional —
              y construye una estrategia verificada, ajustada a los hechos exactos de tu caso.
            </p>
            <div className="pquote rv d2">
              <p>
                "Tener la razón y no saber defenderla es,{' '}
                <span className="it">exactamente,</span> lo mismo que no tenerla."
              </p>
            </div>
            <div className="techpoints rv d3">
              <div className="tp">
                <span className="tpn">01</span>
                <div className="tp-body">
                  <h3>Corpus legal verificado</h3>
                  <p>
                    <span className="hi">1.683+ normas indexadas</span> del derecho colombiano.
                    Cada referencia que citamos es cruzada con su fuente antes de llegar a tus
                    manos. Nada inventado. Nada que no resista ante un juez.
                  </p>
                </div>
              </div>
              <div className="tp">
                <span className="tpn">02</span>
                <div className="tp-body">
                  <h3>Análisis de posición</h3>
                  <p>
                    El sistema mide la{' '}
                    <span className="hi">fortaleza real de tu caso</span>: qué artículos te
                    protegen, qué tan urgente es actuar y cuál es tu probabilidad de éxito —
                    antes de pedirte un peso.
                  </p>
                </div>
              </div>
              <div className="tp">
                <span className="tpn">03</span>
                <div className="tp-body">
                  <h3>Estrategia accionable</h3>
                  <p>
                    No un diagnóstico genérico.{' '}
                    <span className="hi">El artículo exacto, el documento listo para radicar</span>{' '}
                    y el paso a paso del cómo. Lo que recibes, lo puedes llevar a un juzgado.
                  </p>
                </div>
              </div>
            </div>
            <Link className="cta-big rv d4" to="/de-que-se-trata">
              Conoce en detalle cómo funciona <span className="arr">→</span>
            </Link>
          </div>
        </section>

        {/* ─── ABOGADOS ─── */}
        <section className="lawyers">
          <div className="w l-in">
            <div className="l-tag rv">Para abogados</div>
            <h2 className="l-head rv d1">
              Multiplica tu capacidad, <span className="it">no tu jornada.</span>
            </h2>
            <p className="l-intro rv d1">
              Un caso que llega por Defiéndete ya llega entendido. El cliente conoce su posición,
              las referencias están verificadas y los documentos están listos. Tú entras donde tu
              criterio es irreemplazable.
            </p>
            <div className="l-cards rv d2">
              <div className="lcard">
                <h3>Casos pre-analizados</h3>
                <p>Cada caso llega con diagnóstico, expediente estructurado y referencias verificadas. Sin investigación preliminar de tu parte.</p>
              </div>
              <div className="lcard">
                <h3>Tu expertise donde importa</h3>
                <p>Tú entras en la estrategia y en la defensa — no en la investigación de fondo. Menos tiempo de preparación, más tiempo para ganar.</p>
              </div>
            </div>
            <div className="lchecks rv d3">
              <div className="lcheck"><span className="ck">—</span><p><span className="hi">Expediente completo</span> con análisis de posición y referencias legales verificadas listas antes de que abras el caso.</p></div>
              <div className="lcheck"><span className="ck">—</span><p>El cliente llega sabiendo <span className="hi">exactamente qué tiene</span> — y sabiendo por qué te necesita.</p></div>
              <div className="lcheck"><span className="ck">—</span><p><span className="hi">Documentos base redactados</span> y listos para radicar o para que los tomes como punto de partida.</p></div>
              <div className="lcheck"><span className="ck">—</span><p>Menos trabajo de fondo. <span className="hi">Más tiempo para la estrategia que gana.</span></p></div>
            </div>
            <Link className="cta-big teal rv d4" to="/abogados">
              Conoce el modelo para abogados <span className="arr">→</span>
            </Link>
          </div>
        </section>

        {/* ─── CIERRE ─── */}
        <section className="cierre">
          <div className="w">
            <h2 className="cierre-title rv">
              Miles no hacen nada porque no saben qué hacer.{' '}
              <span className="it">Tú ya no eres uno.</span>
            </h2>
            <ChatBox />
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="site-footer">
          <div className="w">
            <div className="foot">
              <img src={logoSrc} alt="Defiéndete" />
              <p className="foot-disc">
                Información legal estructurada con respaldo en la ley colombiana.
                Para representación formal ante estrados, te conectamos con un abogado aliado.
              </p>
              <div className="foot-copy">© 2026 · Hecho en Colombia</div>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}

export default Landing
