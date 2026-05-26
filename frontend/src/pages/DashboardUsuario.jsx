import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Scale, FileText, Bell, Plus, ArrowRight,
  Download, Eye, CheckCircle2, AlertCircle, Clock, Zap,
  LogOut, Menu, X, Shield, ChevronRight, Lock, ExternalLink,
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import { useAuth } from '../context/AuthContext'

/* ── Fecha base del sistema ── */
const HOY = new Date('2026-05-24')

/* ── Mock data ── */
const USUARIO = {
  nombre: 'Lex Rodríguez',
  email: 'lexrodriguezorg@gmail.com',
  plan: 'Completo',
  initials: 'LR',
}

const CASOS = [
  {
    id: 'caso-001',
    tipo: 'Tutela',
    rama: 'Constitucional',
    titulo: 'Negación de cirugía — EPS SaludTotal',
    complejidad: 'alta',
    urgencia: 'alta',
    estado: 'activo',
    fecha_creacion: '2026-05-10',
    ultima_actuacion: 'Admitida por Juzgado 12 Civil Municipal',
    fecha_actuacion: 'Hace 2 días',
    proximo_paso: 'EPS debe responder — vence 28 may 2026',
    docs_count: 3,
    alertas: 1,
    expediente: {
      radicado: '11001400301220260012300',
      despacho: 'Juzgado 12 Civil Municipal de Bogotá',
      resumen: 'La EPS SaludTotal negó la cirugía ordenada por el médico tratante alegando que no está incluida en el plan de beneficios. Esto vulnera directamente el derecho fundamental a la salud. La acción de tutela fue admitida el 12 de mayo de 2026 y corre traslado a la EPS.',
      derechos: [
        { norma: 'Art. 49 Const.', texto: 'Derecho a la salud y la vida digna' },
        { norma: 'Art. 11 Const.', texto: 'Derecho a la vida — negación de tratamiento urgente' },
        { norma: 'Sentencia T-760/2008', texto: 'Marco general de protección al derecho a la salud' },
      ],
      estrategia: [
        { paso: '1', accion: 'Tutela ante Juzgado 12 Civil Municipal', estado: 'done', desc: 'Admitida el 12 may 2026. Traslado corrido a SaludTotal.' },
        { paso: '2', accion: 'EPS debe responder (plazo: 28 may 2026)', estado: 'pending', desc: 'Si no responde, puedes solicitar fallo anticipado por silencio.' },
        { paso: '3', accion: 'Queja simultánea ante Superintendencia de Salud', estado: 'pending', desc: 'Proceso paralelo que genera presión institucional sobre la EPS.' },
      ],
    },
  },
  {
    id: 'caso-002',
    tipo: 'Derecho de Petición',
    rama: 'Administrativo',
    titulo: 'Certificado laboral — Empresa ABC S.A.S.',
    complejidad: 'baja',
    urgencia: 'baja',
    estado: 'resuelto',
    fecha_creacion: '2026-04-20',
    ultima_actuacion: 'Empresa respondió dentro del plazo legal',
    fecha_actuacion: 'Hace 12 días',
    proximo_paso: null,
    docs_count: 2,
    alertas: 0,
    expediente: {
      radicado: 'DP-2026-04-2341',
      despacho: 'Empresa ABC S.A.S. — Recursos Humanos',
      resumen: 'Se radicó derecho de petición solicitando certificado laboral con fechas de ingreso y salida, cargo y salario. La empresa respondió dentro de los 15 días hábiles legales, entregando el documento completo. Caso cerrado exitosamente.',
      derechos: [
        { norma: 'Art. 23 Const.', texto: 'Derecho de petición — respuesta obligatoria en 15 días hábiles' },
        { norma: 'Ley 1755/2015', texto: 'Regula el derecho de petición ante particulares y entidades privadas' },
      ],
      estrategia: [
        { paso: '1', accion: 'Derecho de petición radicado ante ABC S.A.S.', estado: 'done', desc: 'Radicado el 20 abr 2026 ante el departamento de RRHH.' },
        { paso: '2', accion: 'Respuesta de la empresa recibida', estado: 'done', desc: 'Respondieron el 5 may 2026, dentro del plazo de 15 días hábiles.' },
      ],
    },
  },
]

const ALERTAS = [
  {
    id: 'alerta-001',
    caso_id: 'caso-001',
    tipo: 'plazo',
    titulo: 'Vence plazo de respuesta EPS',
    desc: 'SaludTotal tiene hasta el 28 de mayo para responder la tutela. Si no responde, puedes solicitar fallo anticipado.',
    fecha: 'En 4 días',
    urgente: true,
    leida: false,
  },
  {
    id: 'alerta-002',
    caso_id: 'caso-001',
    tipo: 'actuacion',
    titulo: 'Nueva actuación en tu tutela',
    desc: 'El Juzgado 12 Civil Municipal admitió la tutela y corrió traslado a SaludTotal.',
    fecha: 'Hace 2 días',
    urgente: false,
    leida: true,
  },
  {
    id: 'alerta-003',
    caso_id: 'caso-002',
    tipo: 'resolucion',
    titulo: 'Tu derecho de petición fue respondido',
    desc: 'La empresa ABC S.A.S. respondió dentro del plazo de 15 días hábiles. Caso cerrado exitosamente.',
    fecha: 'Hace 12 días',
    urgente: false,
    leida: true,
  },
]

const BOVEDA = [
  {
    id: 'doc-001',
    nombre: 'Acción de Tutela — EPS SaludTotal',
    tipo: 'tutela',
    caso_id: 'caso-001',
    fecha: '10 may 2026',
    refs: 6,
    score: 0.96,
    size: '84 KB',
    auditado: true,
  },
  {
    id: 'doc-002',
    nombre: 'Constancia de Radicación — Juzgado 12',
    tipo: 'constancia',
    caso_id: 'caso-001',
    fecha: '11 may 2026',
    refs: null,
    score: null,
    size: '32 KB',
    auditado: false,
  },
  {
    id: 'doc-003',
    nombre: 'Derecho de Petición — ABC S.A.S.',
    tipo: 'peticion',
    caso_id: 'caso-002',
    fecha: '20 abr 2026',
    refs: 4,
    score: 0.94,
    size: '56 KB',
    auditado: true,
  },
  {
    id: 'doc-004',
    nombre: 'Respuesta de ABC S.A.S. (recibida)',
    tipo: 'respuesta',
    caso_id: 'caso-002',
    fecha: '05 may 2026',
    refs: null,
    score: null,
    size: '128 KB',
    auditado: false,
  },
]

const TIPO_LABEL = {
  tutela:     { label: 'Tutela',              color: 'text-brand' },
  peticion:   { label: 'Derecho de Petición', color: 'text-warn' },
  constancia: { label: 'Constancia',          color: 'text-d-muted' },
  respuesta:  { label: 'Respuesta recibida',  color: 'text-d-secondary' },
  queja:      { label: 'Queja',               color: 'text-bad' },
}

const ESTADO_CONFIG = {
  activo:   { label: 'Activo',   color: 'text-brand',  icon: <Zap size={12} /> },
  resuelto: { label: 'Resuelto', color: 'text-ok',     icon: <CheckCircle2 size={12} /> },
  pendiente:{ label: 'Pendiente',color: 'text-warn',   icon: <Clock size={12} /> },
}

const COMPLEJIDAD_COLOR = {
  baja:  'text-ok',
  media: 'text-warn',
  alta:  'text-brand',
}

const PROGRESO_STAGES = ['Recibido', 'Evaluado', 'Doc. Generado', 'Radicado']
const PROGRESO_BY_ESTADO = { pendiente: 0, activo: 2, resuelto: 3 }

/* ── Componente ── */
export default function DashboardUsuario() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [section,      setSection]      = useState('resumen')
  const [sidebar,      setSidebar]      = useState(false)
  const [selectedCaso, setSelectedCaso] = useState(null)

  // Fuerza sidebar cerrado al montar (evita el overlay que bloquea tras login)
  useEffect(() => { setSidebar(false) }, [])

  const alertasNoLeidas = ALERTAS.filter(a => !a.leida).length

  // Usa el nombre real del usuario logueado, con fallback al mock
  const nombreUsuario = user?.nombre || USUARIO.nombre
  const inicialesUsuario = nombreUsuario.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = () => { logout(); navigate('/', { replace: true }) }

  const nav = [
    { id: 'resumen',  label: 'Resumen',       icon: <LayoutDashboard size={17} /> },
    { id: 'casos',    label: 'Mis casos',      icon: <Scale size={17} />, badge: CASOS.filter(c => c.estado === 'activo').length },
    { id: 'boveda',   label: 'Bóveda de PDFs', icon: <FileText size={17} />, badge: BOVEDA.length },
    { id: 'alertas',  label: 'Alertas',        icon: <Bell size={17} />, badge: alertasNoLeidas || null },
  ]

  return (
    <div className="flex h-screen bg-d-base overflow-hidden font-body">

      {/* ── SIDEBAR ── */}
      <aside
        style={{ background: '#141720' }}
        className={`
          flex flex-col border-r border-d-border w-64 shrink-0
          fixed top-0 bottom-0 left-0 z-50
          transition-transform duration-300
          lg:static lg:top-auto lg:bottom-auto lg:z-auto lg:translate-x-0
          ${sidebar ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-d-border shrink-0">
          <Logo size={32} showText={true} />
          <button
            className="lg:hidden p-1.5 rounded-lg text-d-muted hover:text-d-primary transition-colors"
            onClick={() => setSidebar(false)}
            style={{ background: 'transparent', cursor: 'pointer', border: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setSidebar(false) }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${section === item.id
                  ? 'bg-brand-dim text-brand border border-brand-ring'
                  : 'text-d-secondary hover:bg-d-elevated hover:text-d-primary border border-transparent'
                }
              `}
            >
              <span className={section === item.id ? 'text-brand' : 'text-d-muted'}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && (
                <span className="bg-brand text-d-base text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Nuevo caso CTA */}
        <div className="px-3 pb-3">
          <Link
            to="/caso"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl
                       bg-brand text-d-base text-sm font-bold
                       hover:bg-brand-light transition-colors duration-150"
          >
            <Plus size={16} />
            Nuevo diagnóstico
          </Link>
        </div>

        {/* User card */}
        <div className="px-3 pb-4 border-t border-d-border pt-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-brand-dim border border-brand-ring flex items-center justify-center text-sm font-bold text-brand shrink-0">
              {inicialesUsuario}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-d-primary truncate">{nombreUsuario}</p>
              <p className="text-xs text-d-muted">Plan {USUARIO.plan}</p>
            </div>
            <button onClick={handleLogout} className="text-d-muted hover:text-bad transition-colors" title="Cerrar sesión">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebar && (
        <div
          onClick={() => setSidebar(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 49,
            background: 'rgba(0,0,0,0.7)',
            cursor: 'pointer',
          }}
        />
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar mobile */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-d-border shrink-0" style={{ background: '#0E1117' }}>
          <button
            onClick={() => setSidebar(true)}
            className="p-1.5 rounded-lg text-d-muted hover:text-d-primary transition-colors"
          >
            <Menu size={20} />
          </button>
          <Logo size={28} showText={true} />
          {alertasNoLeidas > 0 ? (
            <button onClick={() => setSection('alertas')} className="relative p-1.5 rounded-lg text-d-muted hover:text-brand transition-colors">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 bg-bad text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {alertasNoLeidas}
              </span>
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Modal expediente */}
        {selectedCaso && (
          <ExpedienteModal
            caso={selectedCaso}
            docs={BOVEDA.filter(d => d.caso_id === selectedCaso.id)}
            alertas={ALERTAS.filter(a => a.caso_id === selectedCaso.id)}
            onClose={() => setSelectedCaso(null)}
          />
        )}

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">

          {/* ── RESUMEN ── */}
          {section === 'resumen' && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl text-d-primary">
                    Hola, {nombreUsuario.split(' ')[0]} 👋
                  </h1>
                  <p className="text-d-muted text-sm mt-1">Aquí tienes el estado de tus casos.</p>
                </div>
                <Link to="/caso" className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-d-base text-sm font-bold hover:bg-brand-light transition-colors">
                  <Plus size={15} /> Nuevo caso
                </Link>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: <Scale size={18} />, value: CASOS.length,                              label: 'Casos totales',   accent: 'text-brand' },
                  { icon: <Zap size={18} />,   value: CASOS.filter(c=>c.estado==='activo').length, label: 'Casos activos',  accent: 'text-warn' },
                  { icon: <FileText size={18} />, value: BOVEDA.length,                          label: 'Documentos',     accent: 'text-d-secondary' },
                  { icon: <Bell size={18} />,  value: alertasNoLeidas,                           label: 'Alertas nuevas', accent: 'text-bad' },
                ].map((m, i) => (
                  <div key={i} className="bg-d-card border border-d-border rounded-2xl p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-d-elevated flex items-center justify-center ${m.accent}`}>
                      {m.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-display text-d-primary">{m.value}</p>
                      <p className="text-xs text-d-muted">{m.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA diagnóstico destacado */}
              <div className="relative rounded-2xl bg-d-elevated border border-brand-ring overflow-hidden p-6">
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse 60% 80% at 100% 50%, rgba(0,180,160,0.07) 0%, transparent 70%)' }}
                />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={16} className="text-brand" />
                      <span className="text-xs font-bold text-brand uppercase tracking-widest">Nuevo diagnóstico</span>
                    </div>
                    <h2 className="font-display text-xl text-d-primary mb-1">¿Tienes otro problema legal?</h2>
                    <p className="text-sm text-d-secondary">
                      Cuéntanos tu caso en lenguaje natural — el sistema lo clasifica, cotiza y genera la estrategia.
                    </p>
                  </div>
                  <Link
                    to="/caso"
                    className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-d-base font-bold text-sm hover:bg-brand-light transition-colors shadow-brand-sm"
                  >
                    Comenzar gratis <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Alertas urgentes */}
              {ALERTAS.filter(a => !a.leida && a.urgente).length > 0 && (
                <div className="bg-bad-bg border border-bad-ring rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-bad" />
                    <span className="text-sm font-bold text-bad">Requiere tu atención</span>
                  </div>
                  {ALERTAS.filter(a => !a.leida && a.urgente).map(a => (
                    <div key={a.id} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-d-primary">{a.titulo}</p>
                        <p className="text-xs text-d-secondary mt-0.5">{a.desc}</p>
                      </div>
                      <span className="text-xs text-d-muted whitespace-nowrap">{a.fecha}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Casos activos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-body font-bold text-d-primary">Casos activos</h3>
                  <button className="text-xs text-brand flex items-center gap-1 hover:text-brand-light" onClick={() => setSection('casos')}>
                    Ver todos <ChevronRight size={13} />
                  </button>
                </div>
                <div className="space-y-3">
                  {CASOS.filter(c => c.estado === 'activo').map(c => (
                    <CaseCard key={c.id} caso={c} compact onVerExpediente={setSelectedCaso} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── MIS CASOS ── */}
          {section === 'casos' && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display text-2xl text-d-primary">Mis casos</h1>
                  <p className="text-d-muted text-sm mt-0.5">{CASOS.length} casos registrados</p>
                </div>
                <Link to="/caso" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-d-base text-sm font-bold hover:bg-brand-light transition-colors">
                  <Plus size={15} /> Nuevo caso
                </Link>
              </div>
              <div className="space-y-3">
                {CASOS.map(c => <CaseCard key={c.id} caso={c} onVerExpediente={setSelectedCaso} />)}
              </div>
            </div>
          )}

          {/* ── BÓVEDA DE PDFs ── */}
          {section === 'boveda' && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <h1 className="font-display text-2xl text-d-primary">Bóveda de PDFs</h1>
                <p className="text-d-muted text-sm mt-0.5">
                  {BOVEDA.length} documentos · {BOVEDA.filter(d => d.auditado).length} verificados por el Agente Auditor
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BOVEDA.map(doc => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>

              {/* Nota de la bóveda */}
              <div className="flex items-start gap-3 bg-d-elevated border border-d-border rounded-xl p-4">
                <Lock size={15} className="text-d-muted mt-0.5 shrink-0" />
                <p className="text-xs text-d-muted leading-relaxed">
                  Tus documentos están cifrados y solo son accesibles con tu cuenta.
                  Los documentos marcados como <span className="text-ok font-semibold">Auditado</span> fueron
                  verificados por el Agente Auditor contra el corpus legal colombiano — puedes presentarlos ante cualquier entidad.
                </p>
              </div>
            </div>
          )}

          {/* ── ALERTAS ── */}
          {section === 'alertas' && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <h1 className="font-display text-2xl text-d-primary">Alertas</h1>
                <p className="text-d-muted text-sm mt-0.5">
                  {alertasNoLeidas} alerta{alertasNoLeidas !== 1 ? 's' : ''} sin leer
                </p>
              </div>
              <div className="space-y-2">
                {ALERTAS.map(a => (
                  <div
                    key={a.id}
                    className={`
                      flex items-start gap-4 p-4 rounded-xl border transition-colors
                      ${!a.leida
                        ? a.urgente
                          ? 'bg-bad-bg border-bad-ring'
                          : 'bg-d-elevated border-d-border'
                        : 'bg-d-card border-d-border opacity-60'
                      }
                    `}
                  >
                    <div className={`mt-0.5 shrink-0 ${a.urgente ? 'text-bad' : 'text-d-muted'}`}>
                      {a.urgente ? <AlertCircle size={18} /> : <Bell size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-d-primary">{a.titulo}</p>
                        {!a.leida && <span className="w-2 h-2 rounded-full bg-brand shrink-0" />}
                      </div>
                      <p className="text-xs text-d-secondary leading-relaxed">{a.desc}</p>
                      <p className="text-xs text-d-muted mt-1.5">{a.fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

/* ── Sub-componentes ── */

function ProgressBar({ progreso }) {
  return (
    <div className="mt-3 mb-1">
      <div className="flex items-center justify-between mb-1.5">
        {PROGRESO_STAGES.map((label, i) => (
          <span
            key={i}
            className={`text-[10px] font-semibold ${
              i <= progreso ? 'text-brand' : 'text-d-muted'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-0.5">
        {PROGRESO_STAGES.map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <div
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= progreso ? 'bg-brand' : 'bg-d-elevated'
              }`}
            />
            {i < PROGRESO_STAGES.length - 1 && (
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                i < progreso ? 'bg-brand' : 'bg-d-elevated'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CaseCard({ caso, compact = false, onVerExpediente }) {
  const estado = ESTADO_CONFIG[caso.estado] || ESTADO_CONFIG.activo
  const compColor = COMPLEJIDAD_COLOR[caso.complejidad] || 'text-d-secondary'
  const progreso = PROGRESO_BY_ESTADO[caso.estado] ?? 1

  return (
    <div className="bg-d-card border border-d-border rounded-2xl p-4 hover:border-d-line transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-d-muted bg-d-elevated px-2 py-0.5 rounded-full border border-d-border">
            {caso.tipo}
          </span>
          <span className={`flex items-center gap-1 text-xs font-semibold ${estado.color}`}>
            {estado.icon} {estado.label}
          </span>
        </div>
        <span className="text-xs text-d-muted whitespace-nowrap shrink-0">{caso.fecha_creacion}</span>
      </div>

      <h3 className="font-body font-bold text-d-primary text-sm mb-1 leading-snug">{caso.titulo}</h3>

      <ProgressBar progreso={progreso} />

      {!compact && (
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs text-d-muted">Complejidad:</span>
          <span className={`text-xs font-bold uppercase tracking-wide ${compColor}`}>{caso.complejidad}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-d-muted mb-3">
        <Clock size={12} />
        <span className="truncate">{caso.ultima_actuacion}</span>
        <span className="shrink-0 text-d-border">·</span>
        <span className="shrink-0">{caso.fecha_actuacion}</span>
      </div>

      {caso.proximo_paso && !compact && (
        <div className="flex items-start gap-2 bg-warn-bg border border-warn-ring rounded-lg px-3 py-2 mb-3">
          <AlertCircle size={13} className="text-warn mt-0.5 shrink-0" />
          <span className="text-xs text-warn">{caso.proximo_paso}</span>
        </div>
      )}

      {!compact && (
        <div className="flex items-center gap-3 pt-2 border-t border-d-line">
          <span className="flex items-center gap-1 text-xs text-d-muted">
            <FileText size={12} /> {caso.docs_count} docs
          </span>
          {caso.alertas > 0 && (
            <span className="flex items-center gap-1 text-xs text-bad">
              <Bell size={12} /> {caso.alertas} alerta
            </span>
          )}
          <button
            className="ml-auto flex items-center gap-1 text-xs text-brand hover:text-brand-light transition-colors font-semibold"
            onClick={() => onVerExpediente?.(caso)}
          >
            Ver expediente <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

function DocumentCard({ doc, compact = false }) {
  const tipo = TIPO_LABEL[doc.tipo] || { label: doc.tipo, color: 'text-d-secondary' }

  const handleDescargar = () => {
    // Placeholder — cuando el backend esté activo, generará y descargará el PDF real
    alert(`PDF "${doc.nombre}" estará disponible en el lanzamiento.`)
  }

  return (
    <div className="bg-d-card border border-d-border rounded-2xl p-5 flex flex-col gap-3 hover:border-brand-ring transition-colors">
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${tipo.color}`}>{tipo.label}</span>
        {doc.auditado && (
          <span className="flex items-center gap-1 text-xs font-semibold text-ok bg-ok-bg border border-ok-ring px-2 py-0.5 rounded-full">
            <CheckCircle2 size={11} /> Auditado
          </span>
        )}
      </div>

      <h4 className="font-body font-semibold text-d-primary text-sm leading-snug">{doc.nombre}</h4>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-d-muted">
        <span>{doc.fecha}</span>
        {doc.refs && <span>{doc.refs} refs verificadas</span>}
        {doc.score && <span className="text-ok font-semibold">Score {doc.score}</span>}
        <span>{doc.size}</span>
      </div>

      {!compact && (
        <div className="flex items-center gap-2 pt-1 border-t border-d-line">
          <button
            className="flex items-center gap-1.5 text-xs text-d-secondary hover:text-d-primary bg-d-elevated hover:bg-d-border px-3 py-1.5 rounded-lg transition-colors font-medium"
            onClick={handleDescargar}
          >
            <Eye size={13} /> Ver
          </button>
          <button
            className="flex items-center gap-1.5 text-xs text-brand hover:text-brand-light bg-brand-dim hover:bg-brand-ring px-3 py-1.5 rounded-lg transition-colors font-semibold"
            onClick={handleDescargar}
          >
            <Download size={13} /> Descargar PDF
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Modal de expediente completo ── */
function ExpedienteModal({ caso, docs, alertas, onClose }) {
  const estado   = ESTADO_CONFIG[caso.estado]  || ESTADO_CONFIG.activo
  const compColor = COMPLEJIDAD_COLOR[caso.complejidad] || 'text-d-secondary'

  // Cierra con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const modal = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-d-card border border-d-border rounded-2xl overflow-hidden animate-fade-up"
        style={{ margin: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-d-border" style={{ background: '#141720' }}>
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold text-d-muted bg-d-elevated px-2 py-0.5 rounded-full border border-d-border">
                {caso.tipo}
              </span>
              <span className={`flex items-center gap-1 text-xs font-semibold ${estado.color}`}>
                {estado.icon} {estado.label}
              </span>
              <span className={`text-xs font-bold uppercase tracking-wide ${compColor}`}>
                · {caso.complejidad}
              </span>
            </div>
            <h2 className="font-display text-lg text-d-primary leading-snug">{caso.titulo}</h2>
            <p className="text-xs text-d-muted mt-1">Radicado: {caso.expediente?.radicado} · {caso.expediente?.despacho}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-d-muted hover:text-d-primary hover:bg-d-elevated transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>

          {/* Resumen */}
          <div>
            <p className="text-xs font-bold text-d-muted uppercase tracking-wider mb-2">Situación legal</p>
            <p className="text-sm text-d-secondary leading-relaxed">{caso.expediente?.resumen}</p>
          </div>

          {/* Progreso */}
          <div>
            <p className="text-xs font-bold text-d-muted uppercase tracking-wider mb-3">Progreso del caso</p>
            <div className="space-y-2">
              {caso.expediente?.estrategia?.map((s, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                  s.estado === 'done' ? 'bg-ok-bg border-ok-ring' : 'bg-d-elevated border-d-border'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    s.estado === 'done' ? 'bg-ok text-d-base' : 'bg-d-border text-d-muted'
                  }`}>
                    {s.estado === 'done' ? <CheckCircle2 size={14} /> : s.paso}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${s.estado === 'done' ? 'text-ok' : 'text-d-primary'}`}>
                      {s.accion}
                    </p>
                    <p className="text-xs text-d-muted mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Derechos vulnerados */}
          {caso.expediente?.derechos?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-d-muted uppercase tracking-wider mb-2">Fundamentos legales</p>
              <div className="space-y-1.5">
                {caso.expediente.derechos.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-d-secondary">
                    <CheckCircle2 size={12} className="text-brand shrink-0" />
                    <span className="font-semibold text-brand whitespace-nowrap">{d.norma}</span>
                    <span>— {d.texto}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertas del caso */}
          {alertas.length > 0 && (
            <div>
              <p className="text-xs font-bold text-d-muted uppercase tracking-wider mb-2">Alertas</p>
              <div className="space-y-2">
                {alertas.map(a => (
                  <div key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    a.urgente ? 'bg-bad-bg border-bad-ring' : 'bg-d-elevated border-d-border'
                  }`}>
                    {a.urgente ? <AlertCircle size={14} className="text-bad mt-0.5 shrink-0" /> : <Bell size={14} className="text-d-muted mt-0.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-d-primary">{a.titulo}</p>
                      <p className="text-xs text-d-secondary mt-0.5">{a.desc}</p>
                      <p className="text-xs text-d-muted mt-1">{a.fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documentos del caso */}
          {docs.length > 0 && (
            <div>
              <p className="text-xs font-bold text-d-muted uppercase tracking-wider mb-2">Documentos ({docs.length})</p>
              <div className="space-y-2">
                {docs.map(doc => <DocumentCard key={doc.id} doc={doc} compact />)}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-d-border flex items-center justify-between gap-3" style={{ background: '#141720' }}>
          <p className="text-xs text-d-muted">Creado {caso.fecha_creacion}</p>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-d-elevated text-d-secondary text-sm font-medium hover:text-d-primary hover:bg-d-border transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
