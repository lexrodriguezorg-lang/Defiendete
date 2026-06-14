import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import logoSrc from '../assets/logo.png'
import './InnerPage.css'

const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.rv')
    const io = new IntersectionObserver(
      (e) => e.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target) } }),
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ── Animación de contador ── */
const CountUp = ({ target, duration = 1200 }) => {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1)
          setVal(Math.floor(t * target))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])

  return <span ref={ref}>{val.toLocaleString('es-CO')}</span>
}

/* ── Panel de verificación en vivo ── */
const VERIFY_REFS = [
  { name: 'Art. 64 CST — Terminación unilateral',  src: 'Código Sustantivo del Trabajo', score: 0.97 },
  { name: 'Sentencia T-478 / 2023',                src: 'Corte Constitucional',          score: 0.91 },
  { name: 'Ley 361 / 1997 — Estabilidad reforzada', src: 'Congreso de la República',     score: 0.89 },
  { name: 'Decreto 2351 / 1965, Art. 6',           src: 'Diario Oficial',                score: 0.93 },
]

const VerifyPanel = () => {
  const panelRef = useRef(null)
  const started  = useRef(false)
  const timers   = useRef([])

  const [rows, setRows] = useState(
    VERIFY_REFS.map(() => ({ status: 'idle', srcState: null, tag: null, barPct: 0, num: 0 }))
  )
  const [doneCount,   setDoneCount]   = useState(0)
  const [scanDone,    setScanDone]    = useState(false)
  const [footerShow,  setFooterShow]  = useState(false)

  const patchRow = (i, patch) =>
    setRows((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], ...patch }
      return next
    })

  useEffect(() => {
    const el = panelRef.current
    if (!el) return

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return
      started.current = true

      VERIFY_REFS.forEach((r, i) => {
        const base = i * 1300

        /* paso 1 — activar fila, estado "verificando" (amber) */
        timers.current.push(setTimeout(() => {
          patchRow(i, { status: 'active', srcState: 'checking', tag: 'checking' })
        }, base + 200))

        /* paso 2 — barra de progreso + contador de score */
        timers.current.push(setTimeout(() => {
          patchRow(i, { barPct: r.score * 100 })
          let v = 0
          const iv = setInterval(() => {
            v = Math.min(v + 0.05, r.score)
            patchRow(i, { num: v })
            if (v >= r.score) clearInterval(iv)
          }, 30)
          timers.current.push(iv)
        }, base + 600))

        /* paso 3 — marcar como verificada (teal) */
        timers.current.push(setTimeout(() => {
          patchRow(i, { status: 'done', srcState: 'done', tag: 'ok' })
          setDoneCount((prev) => prev + 1)
          if (i === VERIFY_REFS.length - 1) {
            setScanDone(true)
            setFooterShow(true)
          }
        }, base + 1400))
      })
    }, { threshold: 0.35 })

    io.observe(el)
    return () => {
      io.disconnect()
      timers.current.forEach((id) => { clearTimeout(id); clearInterval(id) })
    }
  }, [])

  return (
    <div className="verify" ref={panelRef}>
      <div className="vh">
        <span className="t">Verificación de referencias</span>
        <span className="scan">
          {!scanDone && <span className="sp" />}
          <span>{scanDone ? 'Completo' : 'Analizando…'}</span>
        </span>
      </div>
      <div className="vb">
        {VERIFY_REFS.map((r, i) => {
          const row = rows[i]
          return (
            <div key={r.name} className={`vr${row.status !== 'idle' ? ` ${row.status}` : ''}`}>
              <div>
                <div className="name">{r.name}</div>
                <div className="src">
                  {row.srcState === 'checking' && (
                    <>Consultando fuente <span className="dots">···</span></>
                  )}
                  {row.srcState === 'done' && `${r.src} · contrastado`}
                </div>
                <div className="vbar"><i style={{ width: `${row.barPct}%` }} /></div>
              </div>
              <div className="vsc">
                <span className="num">
                  {row.status === 'idle' ? '—' : row.num.toFixed(2)}
                </span>
                <span className={`tag${row.tag ? ` ${row.tag}` : ''}`}>
                  {row.tag === 'checking' && 'verificando'}
                  {row.tag === 'ok'       && '✓ verificada'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="vf">
        <span className="fl">{doneCount} / {VERIFY_REFS.length} verificadas</span>
        <span className={`fr${footerShow ? ' show' : ''}`}>
          <span className="ck">✓</span>Listo para radicar
        </span>
      </div>
    </div>
  )
}

const DeQueSeTrata = () => {
  useReveal()
  const tc1 = useRef(null)
  const tc2 = useRef(null)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        tc1.current?.classList.add('in')
        setTimeout(() => tc2.current?.classList.add('in'), 500)
        io.disconnect()
      }
    }, { threshold: 0.3 })
    if (tc1.current) io.observe(tc1.current)
    return () => io.disconnect()
  }, [])

  return (
    <div className="inner-page">

      <section className="phero">
        <div className="glow" aria-hidden="true" />
        <div className="w phero-in">
          <div className="kick">De qué se trata</div>
          <h1>No es un chatbot.<br /><em>Es un análisis real de tu caso.</em></h1>
          <p className="intro">
            Cuéntanos qué pasó y un sistema construido sobre la ley colombiana te dice si tienes
            la razón, qué te protege y cómo defenderlo — con cada referencia verificada.
          </p>
          <div className="metrics">
            <div className="metric">
              <div className="n"><CountUp target={1683} /></div>
              <div className="l">Normas en el corpus</div>
            </div>
            <div className="metric">
              <div className="n">Minutos</div>
              <div className="l">No semanas</div>
            </div>
            <div className="metric">
              <div className="n">$0</div>
              <div className="l">Para empezar</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── De tu relato a una estrategia ─── */}
      <section className="inner-sec">
        <div className="w">
          <h2 className="rv">De tu relato <em>a una estrategia.</em></h2>
          <p className="lead rv">Escribes lo que pasó en lenguaje normal. El sistema lo convierte en una posición legal concreta.</p>
          <div className="transform">
            <div className="tc before" ref={tc1}>
              <div className="tl">Lo que escribes</div>
              <p className="raw">"Me echaron del trabajo sin avisar y no me pagaron lo que me debían."</p>
            </div>
            <div className="tar">
              <span className="l" />análisis<span className="l" />
            </div>
            <div className="tc after" ref={tc2}>
              <div className="tl">Lo que recibes</div>
              <div className="tout">
                <div className="oi"><span className="k">Rama</span>Derecho laboral · despido sin justa causa</div>
                <div className="oi"><span className="k">Norma</span>Art. 64 CST + estabilidad reforzada</div>
                <div className="oi"><span className="k">Urgencia</span>Alta · plazos corriendo</div>
                <div className="oi"><span className="k">Éxito</span>Probabilidad alta</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Lo que firmamos lo respaldamos ─── */}
      <section className="inner-sec">
        <div className="w">
          <h2 className="rv">Lo que firmamos, <em>lo respaldamos.</em></h2>
          <p className="lead rv">
            Los sistemas de IA a veces inventan leyes. El nuestro no: cada referencia se contrasta
            contra la fuente real. <span className="hi">Lo que recibes, lo puedes defender ante un juez.</span>
          </p>
          <VerifyPanel />
        </div>
      </section>

      {/* ─── Tu caso tiene un lugar aquí ─── */}
      <section className="inner-sec">
        <div className="w">
          <h2 className="rv">Tu caso <em>tiene un lugar aquí.</em></h2>
          <p className="lead rv">Las situaciones más frecuentes de Colombia. Y si la tuya no aparece, el sistema la clasifica igual.</p>
          <div className="materias rv">
            {[
              ['Salud y EPS',  'Servicios negados, tutelas, autorizaciones'],
              ['Trabajo',      'Despidos, liquidación, acoso laboral'],
              ['Familia',      'Custodia, alimentos, menores'],
              ['Vivienda',     'Arriendo, lanzamiento, depósito'],
              ['Consumo',      'Garantías, SIC, reversa de pagos'],
              ['Deudas',       'Cobros, reportes, servicios'],
            ].map(([t, d]) => (
              <div className="chip" key={t}>
                <h3>{t}</h3><p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="ctab">
        <div className="w">
          <p className="rv">"Gratis. Sin registro. Solo la verdad sobre tu caso."</p>
          <Link className="site-btn rv" to="/caso">Empezar mi diagnóstico →</Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="w">
          <div className="foot">
            <img src={logoSrc} alt="Defiéndete" />
            <p className="d">Información legal estructurada con respaldo en la ley colombiana. Para representación formal ante estrados, te conectamos con un abogado aliado.</p>
            <span className="c">© 2026 · Hecho en Colombia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DeQueSeTrata
