/**
 * Landing.jsx v2
 *
 * Cambios vs v1:
 * · Hero con entry box inline (textarea + botón → /caso con router state)
 * · H1 animado línea a línea (lnUp keyframe)
 * · Artifact rediseñado: transformación antes/después
 * · Sección de método simplificada
 * · Sección lawyers con l-checks
 * · Cierre con entry box compacto
 */

import { useState, useEffect, useRef } from 'react'
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
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ── Caja de entrada reutilizable ── */
const EntryBox = ({ trustText = 'El diagnóstico es gratuito', btnText = 'Analizar mi caso →', style }) => {
  const [text, setText] = useState('')
  const navigate = useNavigate()

  const send = () => {
    const t = text.trim()
    if (!t) return
    navigate('/caso', { state: { initialText: t } })
  }

  return (
    <div className="entry" style={style}>
      <textarea
        rows={2}
        placeholder="Escribe aquí lo que estás viviendo..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
      />
      <div className="entry-row">
        <span className="entry-trust"><span className="d" />{trustText}</span>
        <button className="entry-btn" onClick={send}>{btnText}</button>
      </div>
    </div>
  )
}

/* ── Componente principal ── */
const Landing = () => {
  useReveal()

  /* Refs para la animación de líneas del h1 */
  const ln1Ref = useRef(null)
  const ln2Ref = useRef(null)
  const ln3Ref = useRef(null)
  const hsubRef  = useRef(null)
  const hentryRef = useRef(null)
  const hbifurRef = useRef(null)
  const hartRef   = useRef(null)
  const tc1Ref    = useRef(null)
  const tc2Ref    = useRef(null)

  /* Estado de la intro */
  const [ilineW,    setIlineW]    = useState('0')
  const [ilineOp,   setIlineOp]   = useState(1)
  const [ilogoVis,  setIlogoVis]  = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const [introGone, setIntroGone] = useState(false)
  const [mainVis,   setMainVis]   = useState(false)

  useEffect(() => {
    const E = 'cubic-bezier(.22,1,.36,1)'
    const anim = (el, css) => { if (el?.current) el.current.style.animation = css }

    const ts = [
      setTimeout(() => setIlineW('100%'),   200),
      setTimeout(() => setIlogoVis(true),   600),
      setTimeout(() => setIlineOp(0),      1050),
      setTimeout(() => {
        setMainVis(true)
        // H1 lines stagger
        anim(ln1Ref, `lnUp .8s ${E} .15s forwards`)
        anim(ln2Ref, `lnUp .8s ${E} .27s forwards`)
        anim(ln3Ref, `lnUp .8s ${E} .39s forwards`)
        // sub-elements
        setTimeout(() => anim(hsubRef,   `fadeUp .7s ${E} forwards`),  450)
        setTimeout(() => anim(hentryRef, `fadeUp .7s ${E} forwards`),  600)
        setTimeout(() => anim(hbifurRef, `fadeUp .7s ${E} forwards`),  720)
        setTimeout(() => {
          anim(hartRef, `fadeUp .7s ${E} forwards`)
          if (tc1Ref.current) tc1Ref.current.classList.add('in')
          setTimeout(() => { if (tc2Ref.current) tc2Ref.current.classList.add('in') }, 500)
        }, 900)
      }, 1300),
      setTimeout(() => setIntroDone(true), 1400),
      setTimeout(() => setIntroGone(true), 2100),
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
                ? 'width .4s cubic-bezier(.22,1,.36,1)'
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
          <div className="glow" aria-hidden="true" />
          <div className="w hero-in">

            <div className="hero-meta">
              <span className="ac">(01)</span>
              <span>Información legal estructurada</span>
            </div>

            <h1>
              <span className="ln"><span ref={ln1Ref}>En Colombia, tener</span></span>
              <span className="ln"><span ref={ln2Ref}>la razón no basta.</span></span>
              <span className="ln"><span ref={ln3Ref} className="it">Hay que saber defenderla.</span></span>
            </h1>

            <p className="hero-sub" ref={hsubRef}>
              Cuéntame qué te pasó. Sin tecnicismos, sin miedo. Voy a leer tu caso,
              entender tu situación y decirte exactamente qué puedes hacer y cómo.
            </p>

            <div ref={hentryRef} style={{ opacity: 0 }}>
              <EntryBox />
            </div>

            <Link className="bifur" ref={hbifurRef} to="/abogados">
              ¿Eres abogado? Conoce el modelo →
            </Link>

            {/* Artifact: transformación */}
            <div className="artifact" ref={hartRef} style={{ opacity: 0 }}>
              <div className="art-label">Así se ve por dentro</div>
              <div className="transform">
                <div className="t-card before" ref={tc1Ref}>
                  <div className="tl">Lo que escribes</div>
                  <p className="raw">"Me echaron del trabajo sin avisar y no me pagaron lo que me debían."</p>
                </div>
                <div className="t-arrow">
                  <span className="l" />análisis<span className="l" />
                </div>
                <div className="t-card after" ref={tc2Ref}>
                  <div className="tl">Lo que recibes</div>
                  <div className="t-out">
                    <div className="oi"><span className="k">Rama</span>Derecho laboral · despido sin justa causa</div>
                    <div className="oi"><span className="k">Norma</span>Art. 64 CST + estabilidad reforzada</div>
                    <div className="oi"><span className="k">Urgencia</span>Alta · plazos corriendo</div>
                    <div className="oi"><span className="k">Éxito</span>Probabilidad alta</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─── MÉTODO ─── */}
        <section className="sec-method">
          <div className="w">
            <div className="s-meta rv"><span className="ac">(02)</span><span>El método</span></div>
            <h2 className="rv">
              No hay una respuesta automática esperándote.{' '}
              <span className="it">Hay un análisis de tu caso.</span>
            </h2>
            <p className="method-desc rv">
              Cuando describes lo que pasó, el sistema cruza tu situación contra el cuerpo real
              del derecho colombiano y construye una estrategia verificada, ajustada a los hechos
              exactos de tu caso.
            </p>
            <div className="pquote rv">
              <p>
                "Tener la razón y no saber defenderla es,{' '}
                <span className="it">exactamente,</span> lo mismo que no tenerla."
              </p>
            </div>
            <div className="tps rv">
              <div className="tp">
                <span className="tpn">01</span>
                <div>
                  <h3>Corpus legal verificado</h3>
                  <p><span className="hi">1.683+ normas indexadas.</span> Cada referencia se cruza con su fuente. Nada inventado.</p>
                </div>
              </div>
              <div className="tp">
                <span className="tpn">02</span>
                <div>
                  <h3>Análisis de posición</h3>
                  <p>Mide la <span className="hi">fortaleza real de tu caso</span>, la urgencia y tu probabilidad de éxito — gratis.</p>
                </div>
              </div>
              <div className="tp">
                <span className="tpn">03</span>
                <div>
                  <h3>Estrategia accionable</h3>
                  <p>El artículo exacto, el documento <span className="hi">listo para radicar</span> y el paso a paso.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ABOGADOS ─── */}
        <section className="lawyers">
          <div className="w l-in">
            <div className="l-tag rv">Para abogados</div>
            <h2 className="l-head rv">
              Multiplica tu capacidad, <span className="it">no tu jornada.</span>
            </h2>
            <p className="l-intro rv">
              Un caso que llega por Defiéndete ya llega entendido. Tú entras donde tu criterio
              es irreemplazable: en la estrategia y en la defensa.
            </p>
            <div className="l-checks rv">
              <div className="l-check"><span className="c">—</span><p><span className="hi">Expediente completo</span> con análisis y referencias verificadas al llegar.</p></div>
              <div className="l-check"><span className="c">—</span><p>El cliente llega sabiendo <span className="hi">qué tiene</span> y por qué te necesita.</p></div>
              <div className="l-check"><span className="c">—</span><p><span className="hi">Documentos base redactados</span>, listos para radicar.</p></div>
            </div>
            <Link className="cta-solid rv" to="/abogados">
              Conoce el modelo para abogados →
            </Link>
          </div>
        </section>

        {/* ─── CIERRE ─── */}
        <section className="closing">
          <div className="w">
            <h2 className="rv">
              Miles no hacen nada porque no saben qué hacer.{' '}
              <span className="it">Tú ya no eres uno.</span>
            </h2>
            <div className="c-entry rv">
              <EntryBox
                trustText="Gratis · sin registro"
                btnText="Empezar →"
                style={{ opacity: 1 }}
              />
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="site-footer">
          <div className="w">
            <div className="foot">
              <img src={logoSrc} alt="Defiéndete" />
              <p className="d">
                Información legal estructurada con respaldo en la ley colombiana.
                Para representación formal ante estrados, te conectamos con un abogado aliado.
              </p>
              <span className="c">© 2026 · Hecho en Colombia</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}

export default Landing
