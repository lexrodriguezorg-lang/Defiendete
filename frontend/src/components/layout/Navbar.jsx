import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import './Navbar.css'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: '/#como-funciona', label: '¿Cómo funciona?' },
    { to: '/#precios', label: 'Precios' },
    { to: '/#abogados', label: 'Para abogados' },
  ]

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          <Logo size={36} showText={true} />
        </Link>

        {/* Desktop links */}
        <nav className="navbar__links">
          {links.map(l => (
            <a key={l.to} href={l.to} className="navbar__link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link to="/login" className="btn-ghost">
            Ingresar
          </Link>
          <Link to="/caso" className="btn-primary">
            Diagnóstico gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar__burger"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="navbar__mobile">
          {links.map(l => (
            <a
              key={l.to}
              href={l.to}
              className="navbar__mobile-link"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Link to="/caso" className="btn-primary" onClick={() => setOpen(false)}>
            Diagnóstico gratis
          </Link>
        </div>
      )}
    </header>
  )
}

export default Navbar
