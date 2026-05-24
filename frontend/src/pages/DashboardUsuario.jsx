import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Scale, FileText, Bell, Plus, ArrowRight,
  Download, Eye, CheckCircle2, AlertCircle, Clock, Zap,
  LogOut, Menu, X, Shield, ChevronRight, Lock,
} from 'lucide-react'
import Logo from '../components/ui/Logo'

/* ── Fecha base del sistema ── */
const HOY = new Date('2026-05-24')

/* ── Mock data ── */
const USUARIO = {
  nombre: 'Carmen Rodríguez',
  email: 'carmen.r@gmail.com',
  plan: 'Completo',
  initials: 'CR',
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
  const [section, setSection] = useState('resumen')
  const [sidebar, setSidebar] = useState(false)

  const alertasNoLeidas = ALERTAS.filter(a => !a.leida).length

  const nav = [
    { id: 'resumen',  label: 'Resumen',       icon: <LayoutDashboard size={17} /> },
    { id: 'casos',    label: 'Mis casos',      icon: <Scale size={17} />, badge: CASOS.filter(c => c.estado === 'activo').length },
    { id: 'boveda',   label: 'Bóveda de PDFs', icon: <FileText size={17} />, badge: BOVEDA.length },
    { id: 'alertas',  label: 'Alertas',        icon: <Bell size={17} />, badge: alertasNoLeidas || null },
  ]

  return (
    <div className="flex h-screen bg-d-base overflow-hidden font-body">

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-d-surface border-r border-d-border flex flex-col
        transition-transform duration-250 lg:translate-x-0 lg:static lg:z-auto
        ${sidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-d-border shrink-0">
          <Logo size={32} showText={true} />
          <button className="lg:hidden text-d-muted" onClick={() => setSidebar(false)}>
            <X size={18} />
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
              {USUARIO.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-d-primary truncate">{USUARIO.nombre}</p>
              <p className="text-xs text-d-muted">Plan {USUARIO.plan}</p>
            </div>
            <button className="text-d-muted hover:text-bad transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebar && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebar(false)} />
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar mobile */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 bg-d-surface border-b border-d-border shrink-0">
          <button className="text-d-muted" onClick={() => setSidebar(true)}><Menu size={20} /></button>
          <Logo size={28} showText={true} />
          {alertasNoLeidas > 0 && (
            <button onClick={() => setSection('alertas')} className="relative text-d-muted">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-bad text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {alertasNoLeidas}
              </span>
            </button>
          )}
        </div>

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">

          {/* ── RESUMEN ── */}
          {section === 'resumen' && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl text-d-primary">
                    Hola, {USUARIO.nombre.split(' ')[0]} 👋
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
                  {CASOS.filter(c => c.estado === 'activo').map(c => <CaseCard key={c.id} caso={c} compact />)}
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
                {CASOS.map(c => <CaseCard key={c.id} caso={c} />)}
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

function CaseCard({ caso, compact = false }) {
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
          <button className="ml-auto flex items-center gap-1 text-xs text-brand hover:text-brand-light transition-colors font-semibold">
            Ver expediente <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

function DocumentCard({ doc }) {
  const tipo = TIPO_LABEL[doc.tipo] || { label: doc.tipo, color: 'text-d-secondary' }

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

      <div className="flex items-center gap-2 pt-1 border-t border-d-line">
        <button className="flex items-center gap-1.5 text-xs text-d-secondary hover:text-d-primary bg-d-elevated hover:bg-d-border px-3 py-1.5 rounded-lg transition-colors font-medium">
          <Eye size={13} /> Ver
        </button>
        <button className="flex items-center gap-1.5 text-xs text-brand hover:text-brand-light bg-brand-dim hover:bg-brand-ring px-3 py-1.5 rounded-lg transition-colors font-semibold">
          <Download size={13} /> Descargar PDF
        </button>
      </div>
    </div>
  )
}
