import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scale, UserRound, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'
import './Auth.css'

const Login = () => {
  const { login } = useAuth()
  const navigate   = useNavigate()

  const [role,     setRole]     = useState('ciudadano')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Completa todos los campos.'); return }
    setError('')
    setLoading(true)

    const result = await login(email, password, role)
    setLoading(false)

    if (result.ok) {
      navigate(result.role === 'abogado' ? '/dashboard/abogado' : '/dashboard/usuario', { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <Link to="/"><Logo size={36} showText /></Link>
      </div>

      <div className="auth-card animate-fade-up">

        <div className="auth-heading">
          <h1>Bienvenido de nuevo</h1>
          <p>Ingresa a tu cuenta para ver tu diagnóstico y documentos</p>
        </div>

        {/* Selector de rol */}
        <div className="auth-role-selector">
          <button
            type="button"
            className={`auth-role-btn ${role === 'ciudadano' ? 'auth-role-btn--active' : ''}`}
            onClick={() => setRole('ciudadano')}
          >
            <span className="auth-role-icon"><UserRound size={22} /></span>
            <span className="auth-role-label">Ciudadano</span>
            <span className="auth-role-sub">Accede a tus casos</span>
          </button>
          <button
            type="button"
            className={`auth-role-btn ${role === 'abogado' ? 'auth-role-btn--active' : ''}`}
            onClick={() => setRole('abogado')}
          >
            <span className="auth-role-icon"><Scale size={22} /></span>
            <span className="auth-role-label">Abogado Socio</span>
            <span className="auth-role-sub">CRM y leads</span>
          </button>
        </div>

        {/* Formulario */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="auth-submit">
            <button
              type="submit"
              className={`btn-cta btn-cta--full ${loading ? 'btn-cta--disabled' : ''}`}
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </div>
        </form>

        {/* Cuentas demo */}
        <div className="auth-demo">
          <div className="auth-demo-title">Cuentas de prueba</div>
          <div className="auth-demo-row">
            <span>Ciudadano</span>
            <code>ciudadano@demo.com / demo123</code>
          </div>
          <div className="auth-demo-row">
            <span>Abogado</span>
            <code>abogado@demo.com / demo123</code>
          </div>
        </div>

        <div className="auth-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/registro">Regístrate gratis</Link>
        </div>

      </div>
    </div>
  )
}

export default Login
