/**
 * SiteLayout v2 — Nav, menú overlay, login modal, fondo y partículas.
 *
 * Props:
 *   noIntro (bool)   — el nav-logo aparece de inmediato (páginas internas)
 *   innerWidth (bool) — usa max-width:1100px en lugar de 1240px
 */
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ParticleField from './ParticleField'
import logoSrc from '../assets/logo.png'
import '../styles/site.css'

const SiteLayout = ({ children, noIntro = false, innerWidth = false }) => {
  const [navStuck,  setNavStuck]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const location = useLocation()

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const h = () => setNavStuck(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') { setLoginOpen(false); setMenuOpen(false) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

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

  const rootClass = [
    'site-root',
    noIntro    ? 'no-intro'    : '',
    innerWidth ? 'inner-width' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      <ParticleField />
      <div className="bg-grid" aria-hidden="true" />
      <div className="site-grain" aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className={`s-nav${navStuck ? ' on' : ''}`}>
        <div className="nav-in">
          <Link className="nav-logo" to="/">
            <img src={logoSrc} alt="Defiéndete" />
          </Link>
          <div className="nav-actions">
            <button className="login-btn" onClick={() => setLoginOpen(true)}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="8" cy="5" r="2.5" />
                <path d="M2.5 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
              </svg>
              <span className="txt">Iniciar sesión</span>
            </button>
            <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
              <span className="mtxt">Menú</span>
              <span className="bars"><i /><i /></span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Menú overlay ── */}
      <div className={`s-menu${menuOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
        <button className="menu-x" onClick={() => setMenuOpen(false)}>
          Cerrar <b>×</b>
        </button>
        <div className="ml">
          {navItems.map(({ to, idx, label }) => (
            <Link key={to} className="mi" to={to} onClick={() => setMenuOpen(false)}>
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
        <div className="lbox">
          <button className="x" onClick={() => setLoginOpen(false)} aria-label="Cerrar">×</button>
          <h2>Bienvenido de nuevo.</h2>
          <p className="sub">Elige cómo ingresar a tu cuenta.</p>
          <div className="lopts">
            <a className="lopt" href="/login?role=user">
              <span className="ico">
                <svg viewBox="0 0 20 20" strokeWidth="1.4">
                  <circle cx="10" cy="6.5" r="3" />
                  <path d="M3.5 17c0-3.6 3-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
                </svg>
              </span>
              <h3>Soy usuario</h3>
              <p>Mis casos y diagnósticos</p>
            </a>
            <a className="lopt" href="/login?role=lawyer">
              <span className="ico">
                <svg viewBox="0 0 20 20" strokeWidth="1.4">
                  <path d="M10 2v16M4 7h12M5.5 7l-2.5 5h5zM14.5 7l-2.5 5h5z" />
                </svg>
              </span>
              <h3>Soy abogado</h3>
              <p>CRM y casos asignados</p>
            </a>
          </div>
          <p className="lfoot">
            ¿No tienes cuenta? <a href="/registro">Regístrate gratis</a>
          </p>
        </div>
      </div>

      {children}
    </div>
  )
}

export default SiteLayout
