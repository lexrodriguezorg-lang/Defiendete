import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import Logo from '../ui/Logo'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const links = [
    { to: '/#como-funciona', label: '¿Cómo funciona?' },
    { to: '/#precios', label: 'Precios' },
    { to: '/abogados', label: 'Para abogados' },
  ]

  const dashboardPath = user?.role === 'abogado' ? '/dashboard/abogado' : '/dashboard/usuario'

  const initials = user?.nombre
    ? user.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/login', { replace: true })
  }

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

        {/* Desktop actions */}
        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className="btn-ghost">
                Mi panel
              </Link>
            </>
          ) : (
            <Link to="/login" className="btn-ghost">
              Ingresar
            </Link>
          )}
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
          {/* Nav links */}
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

          {/* CTA diagnóstico */}
          <Link to="/caso" className="btn-primary" onClick={() => setOpen(false)}
            style={{ justifyContent: 'center', marginTop: 4 }}>
            Diagnóstico gratis
          </Link>

          {/* Separador */}
          <div className="navbar__mobile-divider" />

          {/* Auth section */}
          {isAuthenticated ? (
            <div className="navbar__mobile-user">
              <div className="navbar__mobile-user-info">
                <div className="navbar__mobile-avatar">{initials}</div>
                <div>
                  <p className="navbar__mobile-user-name">{user?.nombre}</p>
                  <p className="navbar__mobile-user-role">
                    {user?.role === 'abogado' ? 'Abogado socio' : 'Ciudadano'}
                  </p>
                </div>
              </div>
              <Link
                to={dashboardPath}
                className="navbar__mobile-dash-btn"
                onClick={() => setOpen(false)}
              >
                Ir a mi panel
              </Link>
              <button className="navbar__mobile-logout-btn" onClick={handleLogout}>
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="navbar__mobile-auth">
              <Link to="/login" className="navbar__mobile-login-btn" onClick={() => setOpen(false)}>
                Iniciar sesión
              </Link>
              <Link to="/registro" className="navbar__mobile-register-btn" onClick={() => setOpen(false)}>
                Crear cuenta gratis
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
