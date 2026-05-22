import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Bell, MessageSquare, Settings,
  ChevronRight, Clock, CheckCircle2, AlertCircle, XCircle,
  Download, Eye, Plus, Scale, Calendar, ArrowUpRight,
  Shield, Zap, LogOut, Menu, X, User
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import './Dashboard.css'

/* ── MOCK DATA ── */
const USER = {
  name: 'María Rodríguez',
  email: 'maria.rodriguez@gmail.com',
  plan: 'Completo',
  initials: 'MR',
}

const CASES = [
  {
    id: 1,
    tipo: 'Tutela',
    rama: 'Constitucional',
    titulo: 'Negación de cirugía por EPS SaludTotal',
    estado: 'activo',
    fecha: '2026-05-10',
    ultima_actuacion: 'Admitida por Juzgado 12 Civil Municipal',
    fecha_actuacion: 'Hace 2 días',
    despacho: 'Juzgado 12 Civil Municipal de Bogotá',
    radicado: '11001400301220260012300',
    urgencia: 'alta',
    proximo_paso: 'Respuesta de la EPS — vence 18 may 2026',
    documentos: 3,
    alertas: 1,
  },
  {
    id: 2,
    tipo: 'Derecho de Petición',
    rama: 'Administrativo',
    titulo: 'Certificado laboral — Empresa ABC S.A.S.',
    estado: 'resuelto',
    fecha: '2026-04-20',
    ultima_actuacion: 'Empresa respondió dentro del plazo legal',
    fecha_actuacion: 'Hace 12 días',
    despacho: 'Empresa ABC S.A.S.',
    radicado: 'DP-2026-04-2341',
    urgencia: 'baja',
    proximo_paso: null,
    documentos: 2,
    alertas: 0,
  },
]

const DOCUMENTS = [
  {
    id: 1,
    nombre: 'Acción de Tutela — EPS SaludTotal',
    tipo: 'tutela',
    caso_id: 1,
    fecha: '2026-05-10',
    estado: 'auditado',
    referencias: 6,
    score_auditoria: 0.96,
  },
  {
    id: 2,
    nombre: 'Constancia de Radicación — Juzgado 12',
    tipo: 'constancia',
    caso_id: 1,
    fecha: '2026-05-11',
    estado: 'firmado',
    referencias: null,
    score_auditoria: null,
  },
  {
    id: 3,
    nombre: 'Derecho de Petición — ABC S.A.S.',
    tipo: 'peticion',
    caso_id: 2,
    fecha: '2026-04-20',
    estado: 'auditado',
    referencias: 4,
    score_auditoria: 0.94,
  },
]

const ALERTS = [
  {
    id: 1,
    caso_id: 1,
    tipo: 'actuacion',
    titulo: 'Nueva actuación en tu tutela',
    descripcion: 'El Juzgado 12 Civil Municipal admitió la tutela y corrió traslado a SaludTotal.',
    fecha: 'Hace 2 días',
    leida: false,
    urgente: true,
  },
  {
    id: 2,
    caso_id: 1,
    tipo: 'plazo',
    titulo: 'Vence plazo de respuesta',
    descripcion: 'SaludTotal tiene hasta el 18 de mayo para responder. Si no responde, puedes solicitar fallo anticipado.',
    fecha: 'En 3 días',
    leida: false,
    urgente: true,
  },
  {
    id: 3,
    caso_id: 2,
    tipo: 'resolucion',
    titulo: 'Tu derecho de petición fue respondido',
    descripcion: 'La empresa ABC S.A.S. respondió dentro del plazo de 15 días hábiles.',
    fecha: 'Hace 12 días',
    leida: true,
    urgente: false,
  },
]

const CHAT_HISTORY = [
  {
    role: 'assistant',
    text: 'Hola María 👋 Soy tu asistente legal en Defiéndete. Puedo ayudarte con preguntas sobre tus casos, explicarte actuaciones judiciales, o guiarte en los próximos pasos. ¿En qué te ayudo?',
  },
]

/* ── Helpers ── */
const ESTADO_CONFIG = {
  activo:   { label: 'Activo',   color: 'var(--cyan)',    icon: <Zap size={12} /> },
  resuelto: { label: 'Resuelto', color: 'var(--success)', icon: <CheckCircle2 size={12} /> },
  pendiente:{ label: 'Pendiente',color: 'var(--warning)', icon: <Clock size={12} /> },
  escalado: { label: 'Escalado', color: 'var(--danger)',  icon: <AlertCircle size={12} /> },
}

const DOC_TIPO = {
  tutela:    { label: 'Tutela',             color: 'var(--cyan)' },
  peticion:  { label: 'Derecho de Petición',color: 'var(--warning)' },
  queja:     { label: 'Queja',              color: 'var(--danger)' },
  constancia:{ label: 'Constancia',         color: 'var(--text-muted)' },
  denuncia:  { label: 'Denuncia',           color: 'var(--danger)' },
}

/* ── COMPONENTE PRINCIPAL ── */
const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState(CHAT_HISTORY)
  const [chatLoading, setChatLoading] = useState(false)

  const unreadAlerts = ALERTS.filter(a => !a.leida).length

  const handleSendChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)

    // Simulación de respuesta (cuando no hay API)
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        text: `Entiendo tu consulta sobre "${userMsg}". Basado en tu caso activo (Tutela contra SaludTotal), el siguiente paso más importante es verificar si la EPS respondió antes del 18 de mayo. Si no responde, puedes presentar un escrito ante el juzgado solicitando que fallen sin esperar la respuesta. ¿Quieres que te explique cómo hacer eso?`,
      }])
      setChatLoading(false)
    }, 1400)
  }

  const navItems = [
    { id: 'overview',   label: 'Resumen',     icon: <LayoutDashboard size={18} /> },
    { id: 'cases',      label: 'Mis casos',   icon: <Scale size={18} />, badge: CASES.filter(c=>c.estado==='activo').length },
    { id: 'documents',  label: 'Documentos',  icon: <FileText size={18} /> },
    { id: 'alerts',     label: 'Alertas',     icon: <Bell size={18} />, badge: unreadAlerts },
    { id: 'chat',       label: 'Asistente',   icon: <MessageSquare size={18} /> },
  ]

  return (
    <div className="dashboard">

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <Logo size={34} showText={true} />
          <button className="sidebar__close" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'nav-item--active' : ''}`}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false) }}
            >
              <span className="nav-item__icon">{item.icon}</span>
              <span className="nav-item__label">{item.label}</span>
              {item.badge > 0 && (
                <span className="nav-item__badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar__bottom">
          <div className="user-card">
            <div className="user-avatar">{USER.initials}</div>
            <div className="user-info">
              <span className="user-name">{USER.name}</span>
              <span className="user-plan">Plan {USER.plan}</span>
            </div>
            <button className="user-logout" title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
          <Link to="/" className="new-case-btn">
            <Plus size={16} />
            Nuevo caso
          </Link>
        </div>
      </aside>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div className="sidebar__overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN ── */}
      <main className="dashboard__main">

        {/* Topbar móvil */}
        <div className="dashboard__topbar">
          <button className="topbar__burger" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <Logo size={30} showText={true} />
          {unreadAlerts > 0 && (
            <button
              className="topbar__alerts"
              onClick={() => setActiveSection('alerts')}
            >
              <Bell size={18} />
              <span>{unreadAlerts}</span>
            </button>
          )}
        </div>

        <div className="dashboard__content">

          {/* ── OVERVIEW ── */}
          {activeSection === 'overview' && (
            <div className="section animate-fade-up">
              <div className="section__header">
                <div>
                  <h1>Hola, {USER.name.split(' ')[0]} 👋</h1>
                  <p>Aquí tienes el resumen de tus casos activos.</p>
                </div>
                <Link to="/caso" className="btn-primary-sm">
                  <Plus size={14} />
                  Nuevo caso
                </Link>
              </div>

              {/* Metric cards */}
              <div className="metrics">
                <div className="metric-card">
                  <div className="metric-icon metric-icon--cyan">
                    <Scale size={20} />
                  </div>
                  <div>
                    <span className="metric-value">{CASES.length}</span>
                    <span className="metric-label">Casos totales</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon metric-icon--active">
                    <Zap size={20} />
                  </div>
                  <div>
                    <span className="metric-value">{CASES.filter(c=>c.estado==='activo').length}</span>
                    <span className="metric-label">Casos activos</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon metric-icon--docs">
                    <FileText size={20} />
                  </div>
                  <div>
                    <span className="metric-value">{DOCUMENTS.length}</span>
                    <span className="metric-label">Documentos</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon metric-icon--alert">
                    <Bell size={20} />
                  </div>
                  <div>
                    <span className="metric-value">{unreadAlerts}</span>
                    <span className="metric-label">Alertas nuevas</span>
                  </div>
                </div>
              </div>

              {/* Alertas urgentes en overview */}
              {ALERTS.filter(a => !a.leida && a.urgente).length > 0 && (
                <div className="urgent-alerts">
                  <div className="urgent-alerts__header">
                    <AlertCircle size={16} />
                    <span>Requiere tu atención</span>
                  </div>
                  {ALERTS.filter(a => !a.leida && a.urgente).map(alert => (
                    <div key={alert.id} className="urgent-alert-item">
                      <div>
                        <strong>{alert.titulo}</strong>
                        <p>{alert.descripcion}</p>
                      </div>
                      <span className="alert-time">{alert.fecha}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Casos activos preview */}
              <div className="overview-section">
                <div className="overview-section__header">
                  <h3>Casos activos</h3>
                  <button className="link-btn" onClick={() => setActiveSection('cases')}>
                    Ver todos <ChevronRight size={14} />
                  </button>
                </div>
                {CASES.filter(c => c.estado === 'activo').map(caso => (
                  <CaseCard key={caso.id} caso={caso} compact />
                ))}
              </div>
            </div>
          )}

          {/* ── CASES ── */}
          {activeSection === 'cases' && (
            <div className="section animate-fade-up">
              <div className="section__header">
                <div>
                  <h1>Mis casos</h1>
                  <p>{CASES.length} caso{CASES.length !== 1 ? 's' : ''} registrado{CASES.length !== 1 ? 's' : ''}</p>
                </div>
                <Link to="/caso" className="btn-primary-sm">
                  <Plus size={14} />
                  Nuevo caso
                </Link>
              </div>

              <div className="cases-list">
                {CASES.map(caso => (
                  <CaseCard key={caso.id} caso={caso} />
                ))}
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {activeSection === 'documents' && (
            <div className="section animate-fade-up">
              <div className="section__header">
                <div>
                  <h1>Documentos</h1>
                  <p>{DOCUMENTS.length} documentos generados</p>
                </div>
              </div>

              <div className="docs-grid">
                {DOCUMENTS.map(doc => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          )}

          {/* ── ALERTS ── */}
          {activeSection === 'alerts' && (
            <div className="section animate-fade-up">
              <div className="section__header">
                <div>
                  <h1>Alertas</h1>
                  <p>{unreadAlerts} alerta{unreadAlerts !== 1 ? 's' : ''} sin leer</p>
                </div>
              </div>

              <div className="alerts-list">
                {ALERTS.map(alert => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* ── CHAT ── */}
          {activeSection === 'chat' && (
            <div className="section section--chat animate-fade-up">
              <div className="section__header">
                <div>
                  <h1>Asistente legal</h1>
                  <p>Pregúntame sobre tus casos, plazos, o qué hacer en cada paso.</p>
                </div>
                <div className="chat-status">
                  <span className="status-dot" />
                  En línea
                </div>
              </div>

              <div className="chat-container">
                <div className="chat-messages">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`chat-bubble chat-bubble--${msg.role}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="chat-avatar">
                          <Shield size={14} />
                        </div>
                      )}
                      <div className="chat-text">{msg.text}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="chat-bubble chat-bubble--assistant">
                      <div className="chat-avatar">
                        <Shield size={14} />
                      </div>
                      <div className="chat-typing">
                        <span /><span /><span />
                      </div>
                    </div>
                  )}
                </div>

                <div className="chat-input-area">
                  <div className="chat-suggestions">
                    {['¿Cuánto tiempo tiene la EPS para responder?', '¿Qué hago si no responden?', 'Explícame la última actuación'].map((s, i) => (
                      <button
                        key={i}
                        className="suggestion-chip"
                        onClick={() => setChatInput(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="chat-input-row">
                    <textarea
                      className="chat-input"
                      placeholder="Escribe tu pregunta..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      rows={1}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendChat()
                        }
                      }}
                    />
                    <button
                      className={`chat-send ${chatInput.trim() ? 'chat-send--active' : ''}`}
                      onClick={handleSendChat}
                      disabled={!chatInput.trim() || chatLoading}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

/* ── SUB-COMPONENTES ── */

const CaseCard = ({ caso, compact = false }) => {
  const estado = ESTADO_CONFIG[caso.estado] || ESTADO_CONFIG.activo

  return (
    <div className={`case-card ${compact ? 'case-card--compact' : ''}`}>
      <div className="case-card__top">
        <div className="case-card__meta">
          <span className="case-tipo">{caso.tipo}</span>
          <span
            className="case-estado"
            style={{ color: estado.color, borderColor: estado.color }}
          >
            {estado.icon}
            {estado.label}
          </span>
        </div>
        <span className="case-date">{caso.fecha}</span>
      </div>

      <h3 className="case-title">{caso.titulo}</h3>

      {!compact && (
        <>
          <div className="case-details">
            <div className="case-detail">
              <span className="detail-label">Despacho</span>
              <span className="detail-value">{caso.despacho}</span>
            </div>
            <div className="case-detail">
              <span className="detail-label">Radicado</span>
              <span className="detail-value detail-value--mono">{caso.radicado}</span>
            </div>
          </div>
        </>
      )}

      <div className="case-card__last">
        <div className="last-actuacion">
          <Clock size={13} />
          <span>{caso.ultima_actuacion}</span>
        </div>
        <span className="actuacion-date">{caso.fecha_actuacion}</span>
      </div>

      {caso.proximo_paso && !compact && (
        <div className="case-next">
          <AlertCircle size={14} />
          <span>{caso.proximo_paso}</span>
        </div>
      )}

      {!compact && (
        <div className="case-card__footer">
          <span className="case-stat">
            <FileText size={13} /> {caso.documentos} docs
          </span>
          {caso.alertas > 0 && (
            <span className="case-stat case-stat--alert">
              <Bell size={13} /> {caso.alertas} alerta
            </span>
          )}
          <button className="case-action">
            Ver expediente <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

const DocumentCard = ({ doc }) => {
  const tipo = DOC_TIPO[doc.tipo] || { label: doc.tipo, color: 'var(--text-muted)' }

  return (
    <div className="doc-card">
      <div className="doc-card__top">
        <span className="doc-tipo" style={{ color: tipo.color }}>
          {tipo.label}
        </span>
        {doc.estado === 'auditado' && (
          <span className="doc-auditado">
            <CheckCircle2 size={12} />
            Auditado
          </span>
        )}
      </div>

      <h4 className="doc-name">{doc.nombre}</h4>

      <div className="doc-meta">
        <span>{doc.fecha}</span>
        {doc.referencias && (
          <span>{doc.referencias} referencias verificadas</span>
        )}
        {doc.score_auditoria && (
          <span className="doc-score">Score: {doc.score_auditoria}</span>
        )}
      </div>

      <div className="doc-actions">
        <button className="doc-btn">
          <Eye size={14} />
          Ver
        </button>
        <button className="doc-btn">
          <Download size={14} />
          Descargar
        </button>
      </div>
    </div>
  )
}

const AlertItem = ({ alert }) => (
  <div className={`alert-item ${!alert.leida ? 'alert-item--unread' : ''} ${alert.urgente ? 'alert-item--urgent' : ''}`}>
    <div className="alert-item__icon">
      {alert.urgente
        ? <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
        : <Bell size={18} style={{ color: 'var(--text-muted)' }} />
      }
    </div>
    <div className="alert-item__content">
      <div className="alert-item__header">
        <strong>{alert.titulo}</strong>
        {!alert.leida && <span className="unread-dot" />}
      </div>
      <p>{alert.descripcion}</p>
      <span className="alert-time">{alert.fecha}</span>
    </div>
  </div>
)

export default Dashboard
