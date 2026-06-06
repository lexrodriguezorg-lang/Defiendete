import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import logoSrc from '../assets/logo.png'
import './InnerPage.css'

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

const Precios = () => {
  useReveal()

  return (
    <div className="inner-page">

      {/* ─── HERO ─── */}
      <section className="page-hero">
        <div className="w">
          <div className="kicker rv">Precios</div>
          <h1 className="rv d1">
            Saber si tienes la razón <em>no debería costarte nada.</em>
          </h1>
          <p className="intro rv d1">
            Por eso el diagnóstico es siempre gratuito. Solo pagas cuando ya sabes que tu caso
            vale la pena pelearlo — y cuánto cuesta lo decide tu caso, no nosotros.
          </p>
        </div>
      </section>

      {/* ─── SEC 1 — La puerta es gratis ─── */}
      <section className="sec">
        <div className="w">
          <h2 className="rv">La puerta es <em>gratis.</em> La llave es lo que pagas.</h2>
          <p className="rv d1" style={{ fontSize: '1rem', color: 'var(--mute)', maxWidth: '54ch', marginBottom: '2rem', lineHeight: 1.75 }}>
            Antes de pedirte un peso, te decimos si tienes la razón, qué derecho te ampara y
            qué urgencia real tienes. Solo si decides avanzar, pagas por la estrategia que te
            dice exactamente cómo ganar.
          </p>

          <div className="door-key rv d1">
            <div className="dk-col door">
              <div className="dk-label">La puerta — siempre gratis</div>
              <div className="dk-title">El diagnóstico</div>
              <div className="dk-sub">$0 · sin registro · sin compromiso</div>
              <ul className="dk-list">
                <li><span className="mk">→</span>Si tu caso es sólido o no</li>
                <li><span className="mk">→</span>La rama del derecho que aplica</li>
                <li><span className="mk">→</span>El derecho que te están vulnerando</li>
                <li><span className="mk">→</span>La urgencia y los plazos que corren</li>
                <li><span className="mk">→</span>Tu probabilidad real de éxito</li>
                <li><span className="mk">→</span>El tipo de acción que procede</li>
              </ul>
            </div>
            <div className="dk-col key">
              <div className="dk-label">La llave — lo que pagas</div>
              <div className="dk-title">La estrategia</div>
              <div className="dk-sub">desde $30.000 COP · según complejidad</div>
              <ul className="dk-list">
                <li><span className="mk">●</span>Los artículos exactos que blindan tu caso</li>
                <li><span className="mk">●</span>Las sentencias específicas que lo respaldan</li>
                <li><span className="mk">●</span>El paso a paso del cómo</li>
                <li><span className="mk">●</span>Dónde radicar, exactamente</li>
                <li><span className="mk">●</span>Los documentos redactados</li>
                <li><span className="mk">●</span>El orden táctico para ganar</li>
              </ul>
            </div>
          </div>

          <p className="cost-line rv d2">
            Una tutela fuera de término se pierde. Un derecho de petición mal hecho se queda
            sin respuesta. <em>La estrategia correcta cuesta mucho menos que el error.</em>
          </p>
        </div>
      </section>

      {/* ─── SEC 2 — Complejidad ─── */}
      <section className="sec" style={{ borderBottom: 'none' }}>
        <div className="w">
          <h2 className="rv">Tu inversión depende <em>de la complejidad.</em></h2>
          <p className="rv d1" style={{ fontSize: '1rem', color: 'var(--mute)', maxWidth: '54ch', lineHeight: 1.75 }}>
            El diagnóstico evalúa tu caso y te cotiza exacto antes de cobrarte.
            Estos son los rangos de referencia.
          </p>

          <div className="tiers">
            <div className="tier rv d1">
              <div className="niv">Baja</div>
              <div className="price">$30.000<small>COP · pago único</small></div>
              <ul className="ej">
                <li>Derechos de petición</li>
                <li>Solicitudes de información a entidades</li>
                <li>Reclamaciones de garantía comercial</li>
                <li>Quejas ante la SIC</li>
              </ul>
              <Link className="pick" to="/caso">Empezar gratis</Link>
            </div>

            <div className="tier feat rv d2">
              <div className="niv">Media</div>
              <div className="price">$50.000–80.000<small>COP · pago único</small></div>
              <ul className="ej">
                <li>Despidos sin justa causa</li>
                <li>Liquidaciones incorrectas</li>
                <li>Cobros injustificados</li>
                <li>Acoso laboral</li>
              </ul>
              <Link className="pick" to="/caso">Empezar gratis</Link>
            </div>

            <div className="tier rv d3">
              <div className="niv">Alta</div>
              <div className="price">$100.000–150.000<small>COP · pago único</small></div>
              <ul className="ej">
                <li>Tutelas por salud o familia</li>
                <li>Custodia y restitución de menores</li>
                <li>Contratos y minutas comerciales</li>
                <li>Amparo constitucional</li>
              </ul>
              <Link className="pick" to="/caso">Empezar gratis</Link>
            </div>
          </div>

          <p className="fine rv">
            El diagnóstico gratuito determina exactamente en qué nivel cae tu caso.
            No pagas hasta saberlo.
          </p>
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
  )
}

export default Precios
