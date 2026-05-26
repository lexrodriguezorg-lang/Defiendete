import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Caso from './pages/Caso'
import Abogados from './pages/Abogados'
import DashboardUsuario from './pages/DashboardUsuario'
import DashboardAbogado from './pages/DashboardAbogado'
import Login from './pages/Login'
import Registro from './pages/Registro'
import './index.css'

/* Redirige /dashboard al panel correcto según rol, o a login si no hay sesión */
const DashboardRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={user?.role === 'abogado' ? '/dashboard/abogado' : '/dashboard/usuario'} replace />
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Rutas públicas ── */}
          <Route path="/" element={<><Navbar /><Landing /></>} />
          <Route path="/caso"     element={<Caso />} />
          <Route path="/abogados" element={<><Navbar /><Abogados /></>} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* ── Rutas protegidas — redirigen a /login si no hay sesión ── */}
          <Route
            path="/dashboard/usuario"
            element={
              <PrivateRoute role="ciudadano">
                <DashboardUsuario />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/abogado"
            element={
              <PrivateRoute role="abogado">
                <DashboardAbogado />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
