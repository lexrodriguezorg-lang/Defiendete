import { useEffect } from 'react'
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

const Precios = () => {
  useReveal()

  return (
    <div className="inner-page">

      <section className="phero">
        <div className="glow" aria-hidden="true" />
        <div className="w phero-in">
          <div className="kick">Precios</div>
          <h1>Saber si tienes la razón <em>no debería costarte nada.</em></h1>
          <p className="intro">
            Por eso el diagnóstico es siempre gratuito. Solo pagas cuando ya sabes que tu caso
            vale la pena pelearlo — y cuánto cuesta lo decide tu caso, no nosotros.
          </p>
        </div>
      </section>

      {/* ─── La puerta es gratis ─── */}
      <section className="inner-sec">
        <div className="w">
          <h2 className="rv">La puerta es <em>gratis.</em> La llave es lo que pagas.</h2>
          <p className="lead rv">
            Antes de pedirte un peso, sabes si tienes la razón y qué te ampara. Solo si
            decides avanzar, pagas por la estrategia que te dice cómo ganar.
          </p>
          <div className="door-key rv">
            <div className="dk door">
              <div className="lab">La puerta — siempre gratis</div>
              <div className="ti">El diagnóstico</div>
              <div className="pr">$0 · sin registro</div>
              <ul>
                <li><span className="m">→</span>Si tu caso es sólido o no</li>
                <li><span className="m">→</span>La rama del derecho que aplica</li>
                <li><span className="m">→</span>El derecho que te vulneran</li>
                <li><span className="m">→</span>La urgencia y los plazos</li>
                <li><span className="m">→</span>Tu probabilidad de éxito</li>
              </ul>
            </div>
            <div className="dk key">
              <div className="lab">La llave — lo que pagas</div>
              <div className="ti">La estrategia</div>
              <div className="pr">desde $30.000 COP</div>
              <ul>
                <li><span className="m">●</span>Los artículos exactos que te blindan</li>
                <li><span className="m">●</span>Las sentencias que lo respaldan</li>
                <li><span className="m">●</span>El paso a paso del cómo</li>
                <li><span className="m">●</span>Dónde radicar, exacto</li>
                <li><span className="m">●</span>Los documentos redactados</li>
              </ul>
            </div>
          </div>
          <p className="cost rv">
            Una tutela fuera de término se pierde.{' '}
            <em>La estrategia correcta cuesta mucho menos que el error.</em>
          </p>
        </div>
      </section>

      {/* ─── Complejidad ─── */}
      <section className="inner-sec">
        <div className="w">
          <h2 className="rv">Tu inversión depende <em>de la complejidad.</em></h2>
          <p className="lead rv">
            El diagnóstico evalúa tu caso y te cotiza exacto antes de cobrarte. Rangos de referencia:
          </p>
          <div className="tiers">
            <div className="tier rv">
              <div className="niv">Baja</div>
              <div className="price">$30.000<small>COP · pago único</small></div>
              <ul className="ej">
                <li>Derechos de petición</li>
                <li>Solicitudes a entidades</li>
                <li>Garantías comerciales</li>
                <li>Quejas ante la SIC</li>
              </ul>
              <Link className="pick" to="/caso">Empezar gratis</Link>
            </div>
            <div className="tier feat rv d1">
              <div className="niv">Media</div>
              <div className="price">$50–80.000<small>COP · pago único</small></div>
              <ul className="ej">
                <li>Despidos sin justa causa</li>
                <li>Liquidaciones</li>
                <li>Cobros injustificados</li>
                <li>Acoso laboral</li>
              </ul>
              <Link className="pick" to="/caso">Empezar gratis</Link>
            </div>
            <div className="tier rv d2">
              <div className="niv">Alta</div>
              <div className="price">$100–150.000<small>COP · pago único</small></div>
              <ul className="ej">
                <li>Tutelas en salud o familia</li>
                <li>Custodia y menores</li>
                <li>Contratos y minutas</li>
                <li>Amparo constitucional</li>
              </ul>
              <Link className="pick" to="/caso">Empezar gratis</Link>
            </div>
          </div>
          <p className="fine rv">
            El diagnóstico gratuito determina en qué nivel cae tu caso. No pagas hasta saberlo.
          </p>
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

export default Precios
