import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Caso from './pages/Caso'
import Dashboard from './pages/Dashboard'
import Abogados from './pages/Abogados'
import DashboardUsuario from './pages/DashboardUsuario'
import DashboardAbogado from './pages/DashboardAbogado'
import './index.css'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing con navbar */}
        <Route path="/" element={
          <>
            <Navbar />
            <Landing />
          </>
        } />

        {/* Flujo de caso — sin navbar principal */}
        <Route path="/caso" element={<Caso />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/abogados" element={<Abogados />} />
        <Route path="/dashboard/usuario"  element={<DashboardUsuario />} />
        <Route path="/dashboard/abogado"  element={<DashboardAbogado />} />
        <Route path="/login" element={<div style={{padding:'120px 24px',textAlign:'center',color:'var(--text-muted)'}}>Login — Próximamente</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
