import { useEffect, useState } from 'react'
import logoSrc from '../assets/logo.png'
import './InnerPage.css'
import './Abogados.css'

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

const ROLES = [
  {
    n: 'Recién graduado',
    wound: '"Nadie me dio la primera oportunidad."',
    gives: 'Defiéndete es <b>tu primer bufete</b>: ejerces con red de seguridad, el sistema te corrige y te forma, y te valida experiencia certificable.',
    pays: 'Entras por comisión. Produces con respaldo del sistema.',
  },
  {
    n: 'Abogado independiente',
    wound: '"Trabajo todo el día y no levanto cabeza."',
    gives: 'Defiéndete es <b>tu multiplicador</b>: atiendes a más personas con la fuerza de un bufete detrás, generas documentos en minutos y gestionas tus clientes en un solo lugar.',
    pays: 'Mensualidad + tope de documentos.',
  },
  {
    n: 'Especialista de nicho',
    wound: '"Mi experiencia no escala, atiendo de a uno."',
    gives: 'Te llegan <b>casos calificados de tu materia</b> y te volvemos validador premium de tu área. Cobras por tu criterio.',
    pays: 'Comisión + validaciones premium.',
  },
  {
    n: 'Senior establecido',
    wound: '"El día solo tiene 24 horas, no me puedo clonar."',
    gives: 'Defiéndete es <b>tu CRM, tu asistente y tu sala de juniors calificados</b> a quienes delegas. Escalas sin contratar nómina.',
    pays: 'Membresía por la herramienta — atiendes el triple.',
  },
  {
    n: 'Bufete o firma',
    wound: '"Cada abogado reinventa la rueda y no controlo la calidad."',
    gives: 'Defiéndete es <b>el sistema operativo de toda tu firma</b>: gestión de equipo y control de calidad.',
    pays: 'Plan enterprise para toda la estructura.',
  },
  {
    n: 'Tarjeta sin usar',
    wound: '"Invertí años en un título que hoy no uso."',
    gives: 'Ingreso con tu tarjeta <b>sin montar oficina</b>: pones tu criterio sobre documentos que el sistema produce y verifica, y cobras.',
    pays: 'Ingreso por validación, a demanda.',
  },
  {
    n: 'Formador o académico',
    wound: '"Mi conocimiento se queda en un aula de 30."',
    gives: 'Plataforma para <b>formar, evaluar y certificar</b> a los abogados que están empezando. Tu conocimiento escala.',
    pays: 'Cobras por mentoría. Elevas la red.',
  },
]

const RULES = [
  {
    q: '¿La IA me reemplaza?',
    a: 'No. La IA redacta y analiza, pero no se para ante un juez, no asume responsabilidad y no tiene tarjeta. <b>Tu criterio y tu firma son irreemplazables.</b> El sistema aprende de ti para servirte mejor.',
  },
  {
    q: '¿Quién responde si una cita está mal?',
    a: 'Tú, porque la firma es tuya — y por eso el sistema <b>no te pide firmar a ciegas.</b> Cada norma y sentencia viene verificada contra su fuente, con el enlace, para que la audites en segundos.',
  },
  {
    q: '¿El sistema le cree a todo lo que le digo?',
    a: 'No. <b>La IA debate.</b> Contrasta lo que afirmas contra lo que conoce. Si tienes razón, aprende de ti. Si tu argumento no se sostiene y el del sistema es sólido, te lo dice.',
  },
  {
    q: '¿Defiéndete ejerce el derecho?',
    a: 'No. Defiéndete entrega <b>información legal estructurada</b> y te conecta con el ciudadano. La asesoría, la firma y la representación son exclusivamente tuyas.',
  },
  {
    q: '¿De dónde salen los casos que me llegan?',
    a: 'De ciudadanos que hicieron su diagnóstico y pagaron su estrategia (llegan entendidos y con expediente), y de leads de tu zona y materia donde tienes prioridad según tu nivel. Tú eliges cuáles tomas.',
  },
  {
    q: '¿Y el secreto profesional de mi cliente?',
    a: 'El tratamiento de datos se hace conforme a la <b>Ley 1581 de 2012</b>, con autorización del cliente y confidencialidad en toda la cadena.',
  },
]

const Abogados = () => {
  useReveal()
  const [openRole, setOpenRole] = useState(null)
  const [openRule, setOpenRule] = useState(null)

  const toggleRole = (i) => setOpenRole(openRole === i ? null : i)
  const toggleRule = (i) => setOpenRule(openRule === i ? null : i)

  return (
    <div className="inner-page abogados-page">

      {/* ── HERO ── */}
      <section className="ab-hero">
        <div className="glow" aria-hidden="true" />
        <div className="w ab-hero-in">
          <div className="ab-k">Para abogados</div>
          <h1>Cada abogado tiene <em>un lugar aquí.</em></h1>
          <p>
            Defiéndete no es una herramienta para un solo tipo de abogado. Es una red donde cada uno
            —desde el que apenas se gradúa hasta el que ya tiene su firma— encuentra lo que necesita,
            y todos se necesitan entre sí. Encuentra el tuyo.
          </p>
        </div>
      </section>

      {/* ── LOS 7 PERFILES ── */}
      <section className="ab-s">
        <div className="w">
          <div className="ab-sk rv">Encuentra el tuyo</div>
          <h2 className="rv">Siete formas de ejercer. <em>Una red.</em></h2>
          <p className="ab-lead rv">Toca el que más se parece a tu momento actual.</p>
          <div className="ab-roles rv">
            {ROLES.map((r, i) => (
              <button
                key={r.n}
                className={`ab-role${openRole === i ? ' open' : ''}`}
                onClick={() => toggleRole(i)}
              >
                <div className="ab-role-h">
                  <span className="rn">{r.n}</span>
                  <span className="arr">›</span>
                </div>
                <div className="ab-role-body">
                  <div className="ab-role-body-in">
                    <div className="wound">{r.wound}</div>
                    <div className="gives" dangerouslySetInnerHTML={{ __html: r.gives }} />
                    <div className="pays">{r.pays}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── COREOGRAFÍA ── */}
      <section className="ab-s">
        <div className="w">
          <div className="ab-sk rv">Por qué funciona</div>
          <h2 className="rv">No compites por casos. <em>Los casos circulan.</em></h2>
          <p className="ab-lead rv">
            Cada perfil necesita a otro, y cada uno paga por lo que recibe y le genera ingreso a
            alguien más. Eso no es un directorio — es una red que se sostiene sola.
          </p>
          <div className="ab-flow rv">
            <div className="ab-flow-in">
              <p>
                El <b>formador</b> eleva al <b>graduado</b>. El graduado produce con respaldo del
                sistema. El <b>especialista</b> valida lo que produce. El <b>senior</b> delega lo
                operativo y paga por ello. El <b>validador</b> pone el sello cuando falta firma.
                El <b>independiente</b> atiende el volumen de la base. La <b>firma</b> consume
                todo a escala.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="ab-s">
        <div className="w">
          <div className="ab-sk rv">Sin letra menuda</div>
          <h2 className="rv">Lo que vas a preguntar.</h2>
          <div className="rv">
            {RULES.map((r, i) => (
              <div key={i} className={`ab-qa${openRule === i ? ' open' : ''}`}>
                <div className="ab-qa-q" onClick={() => toggleRule(i)}>
                  <span className="qi">P.</span>
                  <span className="qt">{r.q}</span>
                  <span className="arr">›</span>
                </div>
                <div className="ab-qa-a">
                  <div className="ab-qa-a-in" dangerouslySetInnerHTML={{ __html: r.a }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FUNDADOR ── */}
      <section className="ab-final">
        <div className="w">
          <div className="ab-sk ab-sk-c rv">El siguiente paso</div>
          <h2 className="rv">Tu ciudad tiene <em>un solo primer Fundador.</em></h2>
          <p className="rv">
            El Programa Fundador es la entrada con prioridad, precio congelado y referidos.
            Conoce cómo funciona y cuánto puedes ganar.
          </p>
          <a className="ab-btn rv" href="/programa-fundador">Conocer el Programa Fundador →</a>
          <div className="ab-note rv">Precio congelado de por vida · cupos por ciudad</div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="w">
          <div className="foot">
            <img src={logoSrc} alt="Defiéndete" />
            <p className="d">
              La asesoría, la firma y la representación son responsabilidad exclusiva del abogado.
              Defiéndete provee infraestructura e información legal estructurada, no ejerce el
              derecho. Tratamiento de datos conforme a la Ley 1581 de 2012.
            </p>
            <span className="c">© 2026 · Hecho en Colombia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Abogados
