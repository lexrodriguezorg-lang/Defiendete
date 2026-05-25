import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * PrivateRoute — protege rutas que requieren sesión activa.
 * @param {string} role  — 'ciudadano' | 'abogado' | undefined (cualquiera)
 */
const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />

  /* Si la ruta exige un rol específico y el usuario tiene otro, redirige a su dashboard */
  if (role && user?.role !== role) {
    return <Navigate to={user.role === 'abogado' ? '/dashboard/abogado' : '/dashboard/usuario'} replace />
  }

  return children
}

export default PrivateRoute
