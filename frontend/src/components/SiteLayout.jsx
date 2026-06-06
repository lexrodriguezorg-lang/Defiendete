/**
 * SiteLayout — envoltorio de todas las páginas públicas.
 *
 * Provee:
 *   · ParticleField (canvas constelación)
 *   · bg-grid y bg-aura
 *   · Grain overlay
 *   · Nav (con scroll-sticky) + Burger
 *   · Menu overlay (fullscreen)
 *   · Login modal (rutas /login?role=user y /login?role=lawyer)
 *
 * Uso:
 *   <SiteLayout>  ← en App.jsx alrededor de cada ruta pública
 *     <MiPagina />
 *   </SiteLayout>
 *
 * Props:
 *   noIntro (bool, default false) — si es true, la nav-logo
 *     aparece de inmediato (páginas distintas a Landing).
 */

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ParticleField from './ParticleField'
import logoSrc from '../assets/logo.png'
import '../styles/site.css'

const SiteLayout = ({ children, noIntro = false }) => {
  const [navStuck,  setNavStuck]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const location = useLocation()

  /* Cerrar menú en cambio de ruta */
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  /* Scroll → nav sticky */
  useEffect(() => {
    const handler = () => setNavStuck(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  /* Escape → cerrar modal */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setLoginOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  /* Bloquear scroll del body cuando el menú está abierto */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navItems = [
    { to: '/',                idx: '01', label: 'Inicio'          },
    { to: '/de-que-se-trata', idx: '02', label: 'De qué se trata' },
    { to: '/precios',         idx: '03', label: 'Precios'         },
    { to: '/abogados',        idx: '04', label: 'Para abogados'   },
  ]

  return (
    <div className={`site-root${noIntro ? ' no-intro' : ''}`}>
      {/* Fondo */}
      <ParticleField />
      <div className="bg-grid"   aria-hidden="true" />
      <div className="bg-aura"   aria-hidden="true" />
      <div className="site-grain" aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className={`s-nav${navStuck ? ' on' : ''}`}>
        <div className="nav-in">
          <Link className="nav-logo" to="/">
            <img src={logoSrc} alt="Defiéndete" />
          </Link>
          <div className="nav-right">
            <button className="nav-login" onClick={() => setLoginOpen(true)}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="5" r="2.5" />
                <path d="M2.5 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
              </svg>
              <span className="txt">Iniciar sesión</span>
            </button>
            <button className="burger" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
              Menú
              <span className="bb"><i /><i /></span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Menu overlay ── */}
      <div className={`s-menu${menuOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
        <button className="mx" onClick={() => setMenuOpen(false)}>
          Cerrar <span>×</span>
        </button>
        <div className="ml">
          {navItems.map(({ to, idx, label }) => (
            <Link
              key={to}
              className="mi"
              to={to}
              onClick={() => setMenuOpen(false)}
            >
              <span className="ix">{idx}</span>
              <span className="nm">{label}</span>
            </Link>
          ))}
          <button
            className="mi login-item"
            onClick={() => { setMenuOpen(false); setLoginOpen(true) }}
          >
            <span className="ix">→</span>
            <span className="nm">Iniciar sesión</span>
          </button>
        </div>
      </div>

      {/* ── Login modal ── */}
      <div
        className={`lmodal${loginOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Iniciar sesión"
      >
        <div className="lmodal-bg" onClick={() => setLoginOpen(false)} />
        <div className="lmodal-box">
          <button className="lm-close" onClick={() => setLoginOpen(false)} aria-label="Cerrar">×</button>
          <h2 className="lm-title">Bienvenido de nuevo.</h2>
          <p className="lm-sub">Elige cómo ingresar a tu cuenta.</p>
          <div className="lm-opts">
            <a className="lm-opt" href="/login?role=user">
              <div className="opt-icon">⚖️</div>
              <h3>Soy usuario</h3>
              <p>Accedo a mis casos y diagnósticos</p>
            </a>
            <a className="lm-opt" href="/login?role=lawyer">
              <div className="opt-icon">👔</div>
              <h3>Soy abogado</h3>
              <p>Accedo al CRM y mis casos asignados</p>
            </a>
          </div>
          <p className="lm-foot">
            ¿No tienes cuenta? <a href="/registro">Regístrate gratis</a>
          </p>
        </div>
      </div>

      {/* ── Contenido de la página ── */}
      {children}
    </div>
  )
}

export default SiteLayout
