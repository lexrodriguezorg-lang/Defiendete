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

const DeQueSeTrata = () => {
  useReveal()

  return (
    <div className="inner-page">

      {/* ─── HERO ─── */}
      <section className="page-hero">
        <div className="w">
          <div className="kicker rv">De qué se trata</div>
          <h1 className="rv d1">De qué se trata <em>Defiéndete.</em></h1>
          <p className="intro rv d1">
            No es un chatbot. No es un buscador de leyes. Es un sistema construido para entender
            el derecho colombiano caso por caso — y darte una posición clara, honesta y accionable
            sobre lo que te está pasando.
          </p>
        </div>
      </section>

      {/* ─── BLOQUE 1 ─── */}
      <section className="bloque">
        <div className="w">
          <h2 className="rv">
            La diferencia entre saber que tienes la razón<br />
            y <em>saber cómo defenderla.</em>
          </h2>
          <div className="bloque-grid">
            <div>
              <p className="rv d1">
                En Colombia, miles de personas enfrentan injusticias reales todos los días —
                despidos ilegales, EPS que niegan tratamientos, arrendadores que retienen depósitos,
                entidades que no responden — y no hacen nada. No porque no tengan la razón.
                Porque no saben qué hacer con ella.
              </p>
              <p className="rv d1">
                Defiéndete existe para eso. Para que quien tiene un caso legítimo pueda entender
                su posición, conocer los derechos que lo amparan y saber exactamente qué pasos
                tomar — sin necesitar ser abogado, sin llenar formularios, sin pagar para descubrir
                si vale la pena.
              </p>
              <p className="rv d2">
                El diagnóstico es gratuito. Siempre. Antes de pedirte un peso, te decimos la
                verdad sobre tu caso: si es sólido, qué derecho te protege, qué urgencia tienes
                y qué probabilidad real de éxito tienes. Lo honesto, aunque no convenga.
              </p>
            </div>
            <div className="rv d2">
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.35rem', lineHeight: 1.5, color: 'var(--fg)', marginBottom: '2rem' }}>
                "No competimos con los abogados. Existimos para quien nunca habría contratado uno."
              </p>
              <p style={{ fontSize: '1.02rem', color: 'var(--mute)', lineHeight: 1.78 }}>
                Defiéndete amplía el mercado de la justicia. Le da acceso a quien no sabía que
                tenía con qué defenderse, y le da a los abogados casos que ya llegan entendidos
                y estructurados. No es un sustituto. Es el primer paso que muchos nunca dan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOQUE 2 ─── */}
      <section className="bloque">
        <div className="w">
          <h2 className="rv">
            Construido sobre la ley colombiana.<br />
            <em>Verificado antes de llegar a tus manos.</em>
          </h2>
          <div className="bloque-grid">
            <div>
              <p className="rv d1">
                Cuando describes tu caso, el sistema no genera una respuesta genérica. Cruza tu
                situación contra el corpus real del derecho colombiano — leyes, decretos,
                jurisprudencia de la Corte Constitucional — para identificar exactamente qué norma
                te protege y con qué fuerza.
              </p>
              <p className="rv d1">
                Y antes de que ese análisis llegue a tus manos, un proceso de verificación
                contrasta cada referencia citada contra la fuente. Si algo no resiste la
                comprobación, no entra.{' '}
                <span className="strong">Lo que recibes, lo puedes defender ante un juez.</span>
              </p>
              <p className="rv d2">
                Aquí hay rigor donde no se espera encontrarlo. Porque la confianza no se declara:
                se demuestra referencia por referencia.
              </p>
            </div>
            <div className="doc-card rv d2">
              <div className="doc-bar">
                <span className="t">Reporte de verificación</span>
                <span className="doc-ok">Aprobado</span>
              </div>
              <div className="doc-row"><span className="r">Art. 64 CST — Terminación unilateral</span><span className="s">0.97</span><span className="v">✓ Verificada</span></div>
              <div className="doc-row"><span className="r">Sentencia T-478 / 2023 — Corte Const.</span><span className="s">0.91</span><span className="v">✓ Verificada</span></div>
              <div className="doc-row"><span className="r">Ley 361 / 1997 — Estabilidad reforzada</span><span className="s">0.89</span><span className="v">✓ Verificada</span></div>
              <div className="doc-row"><span className="r">Decreto 2351 / 1965 — Art. 6</span><span className="s">0.93</span><span className="v">✓ Verificada</span></div>
              <div className="doc-foot">4 de 4 referencias verificadas · listo para radicar</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOQUE 3 — Materias ─── */}
      <section className="bloque" style={{ borderBottom: 'none' }}>
        <div className="w">
          <h2 className="rv">Tu caso <em>tiene un lugar aquí.</em></h2>
          <p className="rv d1" style={{ fontSize: '1.02rem', color: 'var(--mute)', maxWidth: '54ch', lineHeight: 1.75, marginBottom: '2.4rem' }}>
            Defiéndete cubre las materias del derecho colombiano donde más se vulneran los derechos
            de los ciudadanos. Si tu caso no está aquí, cuéntanoslo igual.
          </p>
          <div className="materias-list rv d2">
            {[
              ['Salud y EPS',        'Tutelas por negación de servicios, medicamentos o procedimientos médicos.'],
              ['Trabajo y despidos', 'Despidos sin justa causa, liquidaciones incorrectas, acoso laboral.'],
              ['Arrendamiento',      'Perturbación a la posesión, retención de depósitos, incumplimientos del arrendador.'],
              ['Familia',            'Custodia, régimen de visitas, alimentos, protección de menores.'],
              ['Consumidor',         'Garantías, incumplimientos de entrega, estafas en comercio electrónico.'],
              ['Deudas y servicios', 'Cobros injustificados, errores en extractos, deudas de servicios públicos.'],
            ].map(([title, desc]) => (
              <div className="mat" key={title}>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BAND ─── */}
      <div className="cta-band">
        <div className="w">
          <p className="rv">"Tu caso tiene nombre legal. Empieza por conocerlo."</p>
          <Link className="cta-primary rv d1" to="/caso" style={{ margin: '0 auto' }}>
            Iniciar diagnóstico gratuito →
          </Link>
        </div>
      </div>

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

export default DeQueSeTrata
