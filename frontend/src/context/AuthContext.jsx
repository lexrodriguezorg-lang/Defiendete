import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

/* ── Cuentas demo para cuando el backend no está disponible ── */
const DEMO_USERS = [
  {
    email:    'ciudadano@demo.com',
    password: 'demo123',
    role:     'ciudadano',
    nombre:   'Carmen Rodríguez',
  },
  {
    email:    'abogado@demo.com',
    password: 'demo123',
    role:     'abogado',
    nombre:   'Dr. Andrés Morales',
    tp:       'TP-48291',
  },
]

const makeToken = (email, role) =>
  btoa(JSON.stringify({ sub: email, role, exp: Date.now() + 86_400_000 }))

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  /* Restaurar sesión desde localStorage al iniciar */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('df_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {
      localStorage.removeItem('df_user')
    } finally {
      setLoading(false)
    }
  }, [])

  const persist = (userData) => {
    setUser(userData)
    localStorage.setItem('df_user', JSON.stringify(userData))
  }

  /* ── LOGIN ── */
  const login = async (email, password, role) => {
    // 1. Intenta el backend real
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })
      if (res.ok) {
        const data = await res.json()
        persist({ ...data.user, token: data.access_token })
        return { ok: true, role: data.user.role }
      }
      if (res.status === 401) return { ok: false, error: 'Correo o contraseña incorrectos.' }
    } catch { /* backend no disponible — fallback mock */ }

    // 2. Fallback demo
    const match = DEMO_USERS.find(
      u => u.email === email && u.password === password && u.role === role
    )
    if (match) {
      const { password: _, ...safe } = match
      persist({ ...safe, token: makeToken(email, role) })
      return { ok: true, role: match.role }
    }
    return { ok: false, error: 'Credenciales incorrectas. Usa las cuentas demo si el backend no está activo.' }
  }

  /* ── REGISTRO ── */
  const register = async (formData) => {
    // 1. Intenta el backend real
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const data = await res.json()
        persist({ ...data.user, token: data.access_token })
        return { ok: true, role: data.user.role }
      }
      const err = await res.json().catch(() => ({}))
      return { ok: false, error: err.detail || 'Error en el registro.' }
    } catch { /* backend no disponible — fallback mock */ }

    // 2. Fallback: guarda en localStorage (demo sin persistencia real)
    const userData = {
      nombre: formData.nombre,
      email:  formData.email,
      role:   formData.role,
      ...(formData.tp ? { tp: formData.tp } : {}),
      token:  makeToken(formData.email, formData.role),
    }
    persist(userData)
    return { ok: true, role: formData.role }
  }

  /* ── LOGOUT ── */
  const logout = () => {
    setUser(null)
    localStorage.removeItem('df_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
