import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scale, UserRound, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'
import './Auth.css'

const Registro = () => {
  const { register } = useAuth()
  const navigate      = useNavigate()

  const [role,     setRole]     = useState('ciudadano')
  const [nombre,   setNombre]   = useState('')
  const [email,    setEmail]    = useState('')
  const [tp,       setTp]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const validate = () => {
    if (!nombre.trim())           return 'Ingresa tu nombre completo.'
    if (!email.includes('@'))     return 'Ingresa un correo válido.'
    if (role === 'abogado' && !tp.trim()) return 'Ingresa tu número de Tarjeta Profesional.'
    if (password.length < 6)     return 'La contraseña debe tener mínimo 6 caracteres.'
    if (password !== confirm)     return 'Las contraseñas no coinciden.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError('')
    setLoading(true)

    const result = await register({ nombre, email, password, role, ...(tp ? { tp } : {}) })
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
          <h1>Crea tu cuenta</h1>
          <p>Diagnóstico gratuito + acceso a tus documentos desde cualquier dispositivo</p>
        </div>

        {/* Selector de rol */}
        <div className="auth-role-selector">
          <button
            type="button"
            className={`auth-role-btn ${role === 'ciudadano' ? 'auth-role-btn--active' : ''}`}
            onClick={() => setRole('ciudadano')}
          >
            <span className="auth-role-icon"><UserRound size={22} /></span>
            <span className="auth-role-label">Soy Ciudadano</span>
            <span className="auth-role-sub">Quiero proteger mis derechos</span>
          </button>
          <button
            type="button"
            className={`auth-role-btn ${role === 'abogado' ? 'auth-role-btn--active' : ''}`}
            onClick={() => setRole('abogado')}
          >
            <span className="auth-role-icon"><Scale size={22} /></span>
            <span className="auth-role-label">Soy Abogado</span>
            <span className="auth-role-sub">Quiero acceder a leads</span>
          </button>
        </div>

        {/* Formulario */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              placeholder={role === 'abogado' ? 'Dr. Juan Pérez' : 'María Rodríguez'}
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email">Correo electrónico</label>
            <input
              id="reg-email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {/* Campo exclusivo para abogados */}
          {role === 'abogado' && (
            <div className="auth-field">
              <label htmlFor="tp">Tarjeta Profesional</label>
              <input
                id="tp"
                type="text"
                placeholder="TP-12345"
                value={tp}
                onChange={e => setTp(e.target.value)}
              />
              <span className="auth-field-hint">
                Número expedido por el Consejo Superior de la Judicatura.
              </span>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm">Confirmar contraseña</label>
            <input
              id="confirm"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
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
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta gratis'}
            </button>
          </div>
        </form>

        {/* Beneficios rápidos */}
        <div className="auth-demo">
          <div className="auth-demo-title">
            {role === 'ciudadano' ? 'Incluye con tu cuenta' : 'Beneficios para socios'}
          </div>
          {role === 'ciudadano' ? (
            <>
              <div className="auth-demo-row"><CheckCircle2 size={12} color="#22D3A0" /> <span>Diagnóstico legal gratuito</span></div>
              <div className="auth-demo-row"><CheckCircle2 size={12} color="#22D3A0" /> <span>Bóveda de documentos cifrada</span></div>
              <div className="auth-demo-row"><CheckCircle2 size={12} color="#22D3A0" /> <span>Seguimiento de tus casos</span></div>
            </>
          ) : (
            <>
              <div className="auth-demo-row"><CheckCircle2 size={12} color="#22D3A0" /> <span>Leads pre-analizados por IA</span></div>
              <div className="auth-demo-row"><CheckCircle2 size={12} color="#22D3A0" /> <span>Alertas de vencimientos legales</span></div>
              <div className="auth-demo-row"><CheckCircle2 size={12} color="#22D3A0" /> <span>Generador de minutas y formatos</span></div>
            </>
          )}
        </div>

        <div className="auth-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </div>

      </div>
    </div>
  )
}

export default Registro
