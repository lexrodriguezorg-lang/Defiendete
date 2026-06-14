import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logoSrc from '../assets/logo.png'
import './PreguntasFrecuentes.css'

const G1 = [
  {
    q: '¿Qué es Defiéndete exactamente?',
    a: 'Es una plataforma que te ayuda a entender tu situación legal en lenguaje claro. Le cuentas qué te pasó, y un sistema construido sobre la ley colombiana te explica si tienes la razón, qué derecho te protege y qué puedes hacer. <b>No es un abogado, es la información que necesitas para saber cómo actuar</b> — y si tu caso requiere un abogado, te conectamos con uno.',
  },
  {
    q: '¿Esto reemplaza a un abogado?',
    a: 'No. Defiéndete te da <b>información legal estructurada</b> para que entiendas tu caso y sepas qué pasos seguir. Muchos trámites los puedes hacer tú mismo (como una tutela o un derecho de petición). Pero cuando tu caso necesita que alguien te represente formalmente ante un juez, <b>te conectamos con un abogado aliado</b> — ahí sí entra un profesional con tarjeta.',
  },
  {
    q: '¿Es un robot o una inteligencia artificial cualquiera?',
    a: 'Es un sistema especializado en derecho colombiano, no un chat genérico. Antes de darte una respuesta, <b>contrasta cada ley y cada sentencia que menciona contra su fuente oficial</b>, para no inventarse nada. Lo que te entrega está respaldado en normas reales que puedes verificar.',
  },
  {
    q: '¿Qué tipo de casos atiende?',
    a: 'Los problemas más comunes de la gente: salud y EPS, trabajo y despidos, familia y alimentos, vivienda y arriendos, consumo y garantías, deudas y reportes. <b>Y si tu caso no encaja en una categoría, el sistema igual lo analiza</b> y te orienta.',
  },
]

const G2 = [
  {
    q: '¿De verdad es gratis?',
    a: 'El diagnóstico es <b>gratis y sin compromiso.</b> Te decimos si tu caso es sólido, qué te protege y qué tan urgente es — sin cobrarte nada y sin pedirte registrarte para empezar. Solo si decides que quieres la estrategia completa (el paso a paso exacto, los documentos listos), eso tiene un costo.',
  },
  {
    q: '¿Cuánto cuesta la estrategia si decido seguir?',
    a: 'Depende de qué tan complejo sea tu caso, y <b>el diagnóstico gratis te lo dice antes de cobrarte un peso.</b> Los casos sencillos cuestan desde $30.000; los más complejos llegan hasta $150.000. Nunca pagas sin saber primero cuánto y por qué.',
  },
  {
    q: '¿Por qué el diagnóstico es gratis y la estrategia se paga?',
    a: 'Porque creemos que <b>saber si tienes la razón no debería costarte nada.</b> Esa parte siempre es gratis. Lo que tiene valor —y por eso se paga— es la estrategia accionable: los artículos exactos, los documentos redactados y el paso a paso para ganar tu caso.',
  },
]

const G3 = [
  {
    q: '¿Qué hacen con mi información?',
    a: 'Tu información se usa únicamente para analizar tu caso y darte tu respuesta. El tratamiento de tus datos se hace <b>conforme a la Ley 1581 de 2012</b>, la ley colombiana de protección de datos personales, y solo con tu autorización. No vendemos tu información.',
  },
  {
    q: '¿Tengo que registrarme para empezar?',
    a: 'No. Puedes contarnos tu caso y recibir tu diagnóstico <b>sin registrarte.</b> Solo te pediremos algunos datos básicos si decides avanzar con tu caso, para poder ayudarte mejor.',
  },
  {
    q: '¿Mi caso es confidencial?',
    a: 'Sí. Lo que nos cuentas se maneja con confidencialidad. Tú decides qué información compartes, y si tu caso pasa a un abogado aliado, esa conexión también se hace protegiendo tus datos.',
  },
  {
    q: '¿Esto tiene validez legal?',
    a: 'Defiéndete te entrega información legal <b>estructurada y respaldada en la ley colombiana</b>, útil para entender y actuar sobre tu caso. La representación formal ante un juez —cuando se necesita— la realiza un abogado con tarjeta profesional, no la plataforma.',
  },
]

const GROUPS = [
  { id: 'g1', title: 'Qué es y cómo funciona',      items: G1 },
  { id: 'g2', title: 'El diagnóstico y el costo',    items: G2 },
  { id: 'g3', title: 'Tu información y tu seguridad', items: G3 },
]

/* ── Reveal al hacer scroll ── */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.faq-page .rv')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }),
      { threshold: 0.1 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

const PreguntasFrecuentes = () => {
  useReveal()
  const [open, setOpen] = useState(new Set())

  const toggle = (key) => {
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div className="faq-page inner-page">

      <section className="faq-head">
        <div className="glow" aria-hidden="true" />
        <div className="faq-w faq-head-in">
          <div className="faq-kick">Preguntas frecuentes</div>
          <h1>Lo que necesitas saber <em>antes de contarnos tu caso.</em></h1>
          <p>Sin letra menuda. Aquí te explicamos qué es Defiéndete, qué hace con tu caso y qué pasa con tu información.</p>
        </div>
      </section>

      <div className="faq-w">
        {GROUPS.map(({ id, title, items }) => (
          <div className="faq-group" key={id}>
            <div className="faq-group-t rv">{title}</div>
            {items.map((item, i) => {
              const key = `${id}-${i}`
              const isOpen = open.has(key)
              return (
                <div className={`qa${isOpen ? ' open' : ''}`} key={key}>
                  <button className="qa-q" onClick={() => toggle(key)}>
                    <span className="qi">P.</span>
                    <span className="qt">{item.q}</span>
                    <span className="arr" aria-hidden="true">›</span>
                  </button>
                  <div className="qa-a" style={{ maxHeight: isOpen ? '400px' : '0' }}>
                    <div
                      className="qa-a-in"
                      dangerouslySetInnerHTML={{ __html: item.a }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <section className="faq-cta">
        <div className="faq-w">
          <h2 className="rv">Tu caso merece <em>una respuesta clara.</em></h2>
          <Link className="faq-btn rv" to="/caso">Empezar mi diagnóstico gratis →</Link>
          <p className="faq-note rv">Gratis · sin registro para empezar · tus datos protegidos</p>
        </div>
      </section>

      <footer className="site-footer">
        <div className="faq-w">
          <div className="foot">
            <img src={logoSrc} alt="Defiéndete" />
            <p className="d">
              Información legal estructurada con respaldo en la ley colombiana.
              Para representación formal ante estrados, te conectamos con un abogado aliado.
              Tratamiento de datos conforme a la Ley 1581 de 2012.
            </p>
            <span className="c">© 2026 · Hecho en Colombia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PreguntasFrecuentes
