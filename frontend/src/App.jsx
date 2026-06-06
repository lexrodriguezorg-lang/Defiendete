import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import GuestRoute from './components/auth/GuestRoute'
import SiteLayout from './components/SiteLayout'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Caso from './pages/Caso'
import Abogados from './pages/Abogados'
import DeQueSeTrata from './pages/DeQueSeTrata'
import Precios from './pages/Precios'
import DashboardUsuario from './pages/DashboardUsuario'
import DashboardAbogado from './pages/DashboardAbogado'
import Login from './pages/Login'
import Registro from './pages/Registro'
import './index.css'

/* Sube al inicio de la página en cada cambio de ruta */
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

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
        <ScrollToTop />
        <Routes>

          {/* ── Páginas públicas con SiteLayout (nav propio, dark theme) ── */}
          <Route path="/"
            element={<SiteLayout><Landing /></SiteLayout>}
          />
          <Route path="/de-que-se-trata"
            element={<SiteLayout noIntro><DeQueSeTrata /></SiteLayout>}
          />
          <Route path="/precios"
            element={<SiteLayout noIntro><Precios /></SiteLayout>}
          />
          <Route path="/abogados"
            element={<SiteLayout noIntro><Abogados /></SiteLayout>}
          />

          {/* ── Funnel — usa su propio layout ── */}
          <Route path="/caso" element={<Caso />} />

          {/* ── Auth ── */}
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/registro" element={<GuestRoute><Registro /></GuestRoute>} />

          {/* ── Dashboard ── */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route
            path="/dashboard/usuario"
            element={
              <PrivateRoute role="ciudadano">
                <><Navbar /><DashboardUsuario /></>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/abogado"
            element={
              <PrivateRoute role="abogado">
                <><Navbar /><DashboardAbogado /></>
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
