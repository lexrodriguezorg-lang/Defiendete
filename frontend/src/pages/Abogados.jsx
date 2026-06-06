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

const Abogados = () => {
  useReveal()

  return (
    <div className="inner-page">

      {/* ─── HERO ─── */}
      <section className="page-hero">
        <div className="w">
          <div className="kicker rv">Para abogados</div>
          <h1 className="rv d1">
            Multiplica tu capacidad,<br /><em>no tu jornada.</em>
          </h1>
          <p className="intro rv d1">
            Un caso que llega por Defiéndete ya llega entendido. El cliente conoce su posición,
            las referencias están verificadas y los documentos están listos. Tú entras donde tu
            criterio es irreemplazable: en la estrategia y en la defensa.
          </p>
        </div>
      </section>

      {/* ─── SEC 1 — El trabajo ya está hecho ─── */}
      <section className="sec">
        <div className="w">
          <h2 className="rv">
            El trabajo que hacías antes de litigar<br /><em>ya está hecho.</em>
          </h2>
          <div className="two-col">
            <div>
              <p className="rv d1">
                Defiéndete no compite con los abogados. Les entrega casos que ya llegan
                estructurados: con diagnóstico, con las referencias legales verificadas y con
                los documentos base redactados. El cliente que llega a ti por esta plataforma
                ya entiende su situación y ya sabe lo que está en juego.
              </p>
              <p className="rv d1">
                Eso cambia la conversación desde el primer minuto. Menos tiempo explicando,
                más tiempo construyendo la estrategia que solo tú puedes construir.
              </p>
              <p className="rv d2">
                Y si usas la plataforma directamente en tu trabajo, puedes generar escritos,
                verificar referencias y preparar expedientes en una fracción del tiempo habitual.
              </p>
            </div>
            <div className="panel rv d2">
              <div className="plabel">Lo que cambia para ti</div>
              <div className="pt"><span className="n">—</span><p>Casos con expediente, diagnóstico y referencias ya verificadas al llegar.</p></div>
              <div className="pt"><span className="n">—</span><p>Escritos y documentos base generados en minutos, sin trabajo repetitivo.</p></div>
              <div className="pt"><span className="n">—</span><p>Clientes informados que valoran lo que haces — y saben por qué te necesitan.</p></div>
              <div className="pt"><span className="n">—</span><p>Menos trabajo de fondo. Más tiempo para ganar.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEC 2 — El modelo ─── */}
      <section className="sec" style={{ borderBottom: 'none' }}>
        <div className="w">
          <h2 className="rv">El modelo <em>para abogados.</em></h2>
          <p className="rv d1" style={{ fontSize: '1rem', color: 'var(--mute)', maxWidth: '54ch', marginBottom: '.6rem', lineHeight: 1.75 }}>
            Tres niveles según el tamaño de tu práctica. Verificación obligatoria de tarjeta
            profesional ante el Consejo Superior de la Judicatura.
          </p>
          <p className="plans-note rv d1">
            Los planes de membresía están en definición — la estructura es la siguiente:
          </p>
          <div className="plans rv d1">
            <div className="plan">
              <div className="nm">Socio</div>
              <div className="pr">$150.000 / mes</div>
              <div className="com">Comisión 12%</div>
              <ul>
                <li>1 abogado</li>
                <li>CRM hasta 20 casos activos</li>
                <li>30 documentos al mes</li>
                <li>Leads de complejidad baja primero</li>
              </ul>
            </div>
            <div className="plan">
              <div className="nm">Firma</div>
              <div className="pr">$400.000 / mes</div>
              <div className="com">Comisión 10%</div>
              <ul>
                <li>5 abogados</li>
                <li>CRM ilimitado</li>
                <li>150 documentos al mes</li>
                <li>Leads de complejidad media y baja</li>
              </ul>
            </div>
            <div className="plan">
              <div className="nm">Bufete</div>
              <div className="pr">$900.000 / mes</div>
              <div className="com">Comisión 8%</div>
              <ul>
                <li>20 abogados</li>
                <li>Todo ilimitado</li>
                <li>Prioridad en todos los leads</li>
                <li>Enterprise disponible a la medida</li>
              </ul>
            </div>
          </div>
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

export default Abogados
