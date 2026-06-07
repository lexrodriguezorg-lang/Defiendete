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

const Abogados = () => {
  useReveal()

  return (
    <div className="inner-page">

      <section className="phero">
        <div className="glow" aria-hidden="true" />
        <div className="w phero-in">
          <div className="kick">Para abogados</div>
          <h1>Multiplica tu capacidad,<br /><em>no tu jornada.</em></h1>
          <p className="intro">
            Un caso que llega por Defiéndete ya llega entendido. El cliente conoce su posición,
            las referencias están verificadas y los documentos están listos. Tú entras donde tu
            criterio es irreemplazable.
          </p>
        </div>
      </section>

      {/* ─── El trabajo ya está hecho ─── */}
      <section className="inner-sec">
        <div className="w">
          <h2 className="rv">El trabajo que hacías antes de litigar <em>ya está hecho.</em></h2>
          <div className="cards rv">
            <div className="lcard">
              <h3>Casos pre-analizados</h3>
              <p>Cada caso llega con diagnóstico, expediente estructurado y referencias verificadas. Sin investigación preliminar de tu parte.</p>
            </div>
            <div className="lcard">
              <h3>Tu expertise donde importa</h3>
              <p>Entras en la estrategia y en la defensa, no en el trabajo de fondo. Menos preparación, más tiempo para ganar.</p>
            </div>
          </div>
          <div className="checks rv">
            <div className="chk"><span className="c">—</span><p><span className="hi">Expediente completo</span> con análisis y referencias verificadas al llegar.</p></div>
            <div className="chk"><span className="c">—</span><p>El cliente llega sabiendo <span className="hi">qué tiene</span> y por qué te necesita.</p></div>
            <div className="chk"><span className="c">—</span><p><span className="hi">Documentos base redactados</span>, listos para radicar.</p></div>
          </div>
        </div>
      </section>

      {/* ─── El modelo ─── */}
      <section className="inner-sec">
        <div className="w">
          <h2 className="rv">El modelo <em>para abogados.</em></h2>
          <p className="lead rv">
            Tres niveles según tu práctica. Verificación obligatoria de tarjeta profesional
            ante el Consejo Superior de la Judicatura.
          </p>
          <p className="note rv">
            Los textos de esta sección están en definición — la estructura de membresías es la siguiente:
          </p>
          <div className="plans rv">
            <div className="plan">
              <div className="nm">Socio</div>
              <div className="pr">$150.000 / mes</div>
              <div className="com">Comisión 12%</div>
              <ul>
                <li>1 abogado</li><li>CRM hasta 20 casos</li>
                <li>30 documentos/mes</li><li>Leads de complejidad baja primero</li>
              </ul>
            </div>
            <div className="plan">
              <div className="nm">Firma</div>
              <div className="pr">$400.000 / mes</div>
              <div className="com">Comisión 10%</div>
              <ul>
                <li>5 abogados</li><li>CRM ilimitado</li>
                <li>150 documentos/mes</li><li>Leads media y baja</li>
              </ul>
            </div>
            <div className="plan">
              <div className="nm">Bufete</div>
              <div className="pr">$900.000 / mes</div>
              <div className="com">Comisión 8%</div>
              <ul>
                <li>20 abogados</li><li>Todo ilimitado</li>
                <li>Prioridad en leads</li><li>Enterprise a la medida</li>
              </ul>
            </div>
          </div>
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

export default Abogados
