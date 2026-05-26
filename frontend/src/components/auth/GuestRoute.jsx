import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * GuestRoute — rutas solo para usuarios NO autenticados.
 * Si ya hay sesión activa, redirige al panel correcto según rol.
 */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0E1117', color: '#22D3A0', fontSize: 14,
      fontFamily: 'sans-serif', letterSpacing: 1,
    }}>
      Cargando…
    </div>
  )

  if (isAuthenticated) {
    const dest = user?.role === 'abogado' ? '/dashboard/abogado' : '/dashboard/usuario'
    return <Navigate to={dest} replace />
  }

  return children
}

export default GuestRoute
