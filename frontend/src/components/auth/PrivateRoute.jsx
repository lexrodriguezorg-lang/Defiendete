import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * PrivateRoute — protege rutas que requieren sesión activa.
 * @param {string} role  — 'ciudadano' | 'abogado' | undefined (cualquiera)
 */
const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth()

  // Muestra un loader mínimo mientras AuthContext hidrata desde localStorage
  // (evita la pantalla completamente oscura/bloqueada)
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0E1117', color: '#22D3A0', fontSize: 14,
      fontFamily: 'sans-serif', letterSpacing: 1,
    }}>
      Cargando…
    </div>
  )

  if (!isAuthenticated) return <Navigate to="/login" replace />

  /* Si la ruta exige un rol específico y el usuario tiene otro, redirige a su dashboard */
  if (role && user?.role !== role) {
    return <Navigate to={user.role === 'abogado' ? '/dashboard/abogado' : '/dashboard/usuario'} replace />
  }

  return children
}

export default PrivateRoute
