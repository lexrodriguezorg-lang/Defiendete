import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Scale, Bell, Briefcase, ChevronDown,
  ChevronRight, CheckCircle2, AlertCircle, Clock, FileText,
  TrendingUp, Users, ArrowRight, LogOut, Menu, X,
  Target, Calendar, DollarSign, Shield,
} from 'lucide-react'
import Logo from '../components/ui/Logo'

/* ── Semáforo dinámico ── */
const HOY = new Date('2026-05-24')

const diasHasta = (fechaStr) => {
  const d = Math.ceil((new Date(fechaStr) - HOY) / (1000 * 60 * 60 * 24))
  return Math.max(0, d)
}

const semaforo = (dias) => {
  if (dias <= 3)  return { color: '#F45B5B', bg: 'rgba(244,91,91,0.10)',  ring: 'rgba(244,91,91,0.25)',  label: 'Urgente',       cls: 'text-bad  bg-bad-bg  border-bad-ring' }
  if (dias <= 14) return { color: '#F4A72B', bg: 'rgba(244,167,43,0.10)', ring: 'rgba(244,167,43,0.25)', label: 'Pronto',        cls: 'text-warn bg-warn-bg border-warn-ring' }
  return             { color: '#22D3A0', bg: 'rgba(34,211,160,0.10)',  ring: 'rgba(34,211,160,0.25)', label: 'Sin urgencia',  cls: 'text-ok   bg-ok-bg   border-ok-ring' }
}

/* ── Mock data ── */
const ABOGADO = {
  nombre: 'Dr. Andrés Morales',
  tarjeta: 'TP-48291',
  especialidad: 'Constitucional · Laboral',
  ciudad: 'Bogotá',
  initials: 'AM',
  plan: 'Socio activo',
  leads_mes: 8,
  ingresos_mes: '$1.840.000',
  casos_activos: 4,
}

const LEADS = [
  {
    id: 'lead-001',
    rama: 'constitucional',
    tipo: 'Acción de Tutela',
    titulo: 'Tutela por negación de tratamiento oncológico',
    complejidad: 'alta',
    urgencia: 'critica',
    precio_ciudadano: 120000,
    fecha_ingreso: '2026-05-23',
    vence: '2026-05-25',
    docs: 3,
    estado: 'disponible',
    resumen_ia:
      'Paciente con diagnóstico de cáncer de mama en etapa II. La EPS niega la quimioterapia ordenada por oncólogo tratante del Instituto Nacional de Cancerología. La paciente tiene historia clínica completa, concepto médico especializado y comunicaciones formales con la EPS donde consta la negativa. Alta probabilidad de éxito (>95%) según jurisprudencia de la Corte Constitucional en casos de negación de tratamientos oncológicos.',
    derechos: ['Art. 49 Const. — Derecho a la salud', 'Art. 11 Const. — Derecho a la vida', 'Sentencia T-760/2008 — Marco general salud'],
  },
  {
    id: 'lead-002',
    rama: 'laboral',
    tipo: 'Demanda laboral',
    titulo: 'Despido masivo sin justa causa — constructora',
    complejidad: 'media',
    urgencia: 'alta',
    precio_ciudadano: 65000,
    fecha_ingreso: '2026-05-22',
    vence: '2026-06-05',
    docs: 5,
    estado: 'disponible',
    resumen_ia:
      'Grupo de 4 trabajadores despedidos simultáneamente de empresa constructora. Antigüedad promedio de 2.5 años, contratos indefinidos. Liquidaciones no pagadas totalizan aproximadamente $8.2M COP. Las 4 demandas podrían acumularse ante el mismo juzgado. Documentos de contrato, nóminas y carta de despido disponibles. Acción recomendada: demanda verbal sumaria + queja ante Ministerio de Trabajo.',
    derechos: ['Art. 25 Const. — Derecho al trabajo', 'Art. 249-252 CST — Prestaciones sociales', 'Código Sustantivo del Trabajo Art. 64'],
  },
  {
    id: 'lead-003',
    rama: 'familia',
    tipo: 'Custodia',
    titulo: 'Custodia compartida — menor de 4 años',
    complejidad: 'alta',
    urgencia: 'media',
    precio_ciudadano: 120000,
    fecha_ingreso: '2026-05-21',
    vence: '2026-06-20',
    docs: 2,
    estado: 'disponible',
    resumen_ia:
      'Padres en proceso de separación. Menor de 4 años sin historial de violencia familiar. Ambos padres tienen domicilio en Bogotá y capacidad económica comparable. La madre solicita custodia exclusiva argumentando mayor tiempo de cuidado. El padre solicita custodia compartida. El caso requiere evaluación psicológica del menor y posiblemente mediación familiar ante el ICBF antes del proceso judicial.',
    derechos: ['Ley 1098/2006 Art. 22 — Interés superior del menor', 'Art. 44 Const. — Derechos de los niños', 'Código Civil Art. 253 — Patria potestad'],
  },
  {
    id: 'lead-004',
    rama: 'penal',
    tipo: 'Querella penal',
    titulo: 'Estafa electrónica — comercio en línea',
    complejidad: 'media',
    urgencia: 'media',
    precio_ciudadano: 65000,
    fecha_ingreso: '2026-05-20',
    vence: '2026-06-15',
    docs: 4,
    estado: 'aceptado',
    resumen_ia:
      'Víctima pagó $3.2M COP por electrodomésticos en tienda virtual que resultó fraudulenta. Tiene capturas completas de conversaciones por WhatsApp, comprobante de transferencia bancaria y reporte de denuncia ante la Dijín. El investigado operaba desde cuenta bancaria rastreable. Caso bien documentado para querella por estafa ante Fiscalía Seccional Bogotá.',
    derechos: ['Código Penal Art. 246 — Estafa', 'Ley 1273/2009 — Delitos informáticos', 'Art. 229 CPC — Protección al consumidor digital'],
  },
]

const ALERTAS_VENC = [
  {
    id: 'av-001',
    titulo: 'Respuesta a denuncia — Fiscalía Seccional',
    caso: 'Estafa electrónica',
    vence: '2026-05-24',
    desc: 'Plazo para presentar memorial adicional con nuevas evidencias digitales.',
  },
  {
    id: 'av-002',
    titulo: 'Plazo de contestación EPS',
    caso: 'Tutela oncológica',
    vence: '2026-05-25',
    desc: 'Si la EPS no responde hoy, preparar escrito solicitando fallo anticipado por silencio.',
  },
  {
    id: 'av-003',
    titulo: 'Audiencia de conciliación',
    caso: 'Despido masivo constructora',
    vence: '2026-06-03',
    desc: 'Audiencia ante Juzgado 5 Laboral del Circuito. Revisar pretensiones y poder de representación.',
  },
  {
    id: 'av-004',
    titulo: 'Vencimiento traslado de pruebas',
    caso: 'Custodia menor',
    vence: '2026-06-18',
    desc: 'Período de contradicción de pruebas del peritaje psicológico. Sin urgencia por ahora.',
  },
]

const RAMA_CONFIG = {
  constitucional: { label: 'Constitucional', color: 'text-brand' },
  laboral:        { label: 'Laboral',         color: 'text-warn'  },
  familia:        { label: 'Familia',         color: 'text-ok'    },
  penal:          { label: 'Penal',           color: 'text-bad'   },
  civil:          { label: 'Civil',           color: 'text-d-secondary' },
}

const COMPLEJIDAD_STYLE = {
  alta:  'text-brand bg-brand-dim border-brand-ring',
  media: 'text-warn bg-warn-bg border-warn-ring',
  baja:  'text-ok bg-ok-bg border-ok-ring',
}

/* ── Componente ── */
export default function DashboardAbogado() {
  const [section, setSection]   = useState('dashboard')
  const [sidebar, setSidebar]   = useState(false)
  const [expanded, setExpanded] = useState(null)

  const leadsDisponibles = LEADS.filter(l => l.estado === 'disponible')
  const alertasUrgentes  = ALERTAS_VENC.filter(a => diasHasta(a.vence) <= 3)

  const nav = [
    { id: 'dashboard', label: 'Panel general',      icon: <LayoutDashboard size={17} /> },
    { id: 'leads',     label: 'Bolsa de leads',     icon: <Target size={17} />, badge: leadsDisponibles.length },
    { id: 'casos',     label: 'Mis casos',          icon: <Scale size={17} />,  badge: ABOGADO.casos_activos },
    { id: 'alertas',   label: 'Vencimientos',       icon: <Bell size={17} />,   badge: alertasUrgentes.length || null },
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

        {/* Badge membresía */}
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-brand-dim border border-brand-ring flex items-center gap-2">
          <Shield size={14} className="text-brand shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand">{ABOGADO.plan}</p>
            <p className="text-[11px] text-d-muted">{ABOGADO.especialidad}</p>
          </div>
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
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                  ${item.id === 'alertas' ? 'bg-bad text-white' : 'bg-brand text-d-base'}
                `}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Stats rápidas */}
        <div className="mx-3 mb-3 p-3 bg-d-elevated border border-d-border rounded-xl">
          <p className="text-[11px] text-d-muted uppercase tracking-wider mb-2 font-bold">Este mes</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Leads atendidos', value: ABOGADO.leads_mes },
              { label: 'Ingresos',        value: ABOGADO.ingresos_mes },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-sm font-bold text-d-primary">{s.value}</p>
                <p className="text-[11px] text-d-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Abogado card */}
        <div className="px-3 pb-4 border-t border-d-border pt-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-brand-dim border border-brand-ring flex items-center justify-center text-sm font-bold text-brand shrink-0">
              {ABOGADO.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-d-primary truncate">{ABOGADO.nombre}</p>
              <p className="text-xs text-d-muted">{ABOGADO.tarjeta}</p>
            </div>
            <button className="text-d-muted hover:text-bad transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebar && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebar(false)} />}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar mobile */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 bg-d-surface border-b border-d-border shrink-0">
          <button className="text-d-muted" onClick={() => setSidebar(true)}><Menu size={20} /></button>
          <Logo size={28} showText={true} />
          {alertasUrgentes.length > 0 && (
            <button onClick={() => setSection('alertas')} className="relative text-d-muted">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-bad text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {alertasUrgentes.length}
              </span>
            </button>
          )}
        </div>

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">

          {/* ── PANEL GENERAL ── */}
          {section === 'dashboard' && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h1 className="font-display text-2xl text-d-primary">
                  Bienvenido, {ABOGADO.nombre.split(' ').slice(-1)[0]} ⚖️
                </h1>
                <p className="text-d-muted text-sm mt-0.5">{ABOGADO.ciudad} · {ABOGADO.especialidad}</p>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { icon: <Target size={18} />,     value: leadsDisponibles.length,  label: 'Leads disponibles', accent: 'text-brand', sub: 'casos premasticados' },
                  { icon: <TrendingUp size={18} />,  value: ABOGADO.ingresos_mes,     label: 'Ingresos del mes',  accent: 'text-ok',    sub: 'COP · estimado' },
                  { icon: <Scale size={18} />,       value: ABOGADO.casos_activos,    label: 'Casos activos',     accent: 'text-warn',  sub: 'en seguimiento' },
                ].map((m, i) => (
                  <div key={i} className="bg-d-card border border-d-border rounded-2xl p-4">
                    <div className={`flex items-center gap-2 mb-3 ${m.accent}`}>
                      {m.icon}
                      <span className="text-xs font-bold uppercase tracking-wider text-d-muted">{m.label}</span>
                    </div>
                    <p className={`text-2xl font-display ${m.accent}`}>{m.value}</p>
                    <p className="text-xs text-d-muted mt-0.5">{m.sub}</p>
                  </div>
                ))}
              </div>

              {/* Semáforo de vencimientos — resumen compacto */}
              <div className="bg-d-card border border-d-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-d-muted" />
                    <h3 className="font-body font-bold text-d-primary text-sm">Semáforo de vencimientos</h3>
                  </div>
                  <button className="text-xs text-brand flex items-center gap-1" onClick={() => setSection('alertas')}>
                    Ver todos <ChevronRight size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: '🔴 Urgente',      count: ALERTAS_VENC.filter(a => diasHasta(a.vence) <= 3).length,              cls: 'border-bad-ring bg-bad-bg text-bad' },
                    { label: '🟡 Pronto',       count: ALERTAS_VENC.filter(a => { const d = diasHasta(a.vence); return d > 3 && d <= 14 }).length, cls: 'border-warn-ring bg-warn-bg text-warn' },
                    { label: '🟢 Sin urgencia', count: ALERTAS_VENC.filter(a => diasHasta(a.vence) > 14).length,              cls: 'border-ok-ring bg-ok-bg text-ok' },
                  ].map((s, i) => (
                    <div key={i} className={`rounded-xl border p-3 text-center ${s.cls}`}>
                      <p className="text-2xl font-display">{s.count}</p>
                      <p className="text-xs font-semibold mt-1 opacity-80">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Alertas urgentes en overview */}
                {alertasUrgentes.map(a => {
                  const s = semaforo(diasHasta(a.vence))
                  return (
                    <div key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border mb-2 last:mb-0 ${s.cls}`}>
                      <AlertCircle size={15} className="mt-0.5 shrink-0" style={{ color: s.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-d-primary truncate">{a.titulo}</p>
                        <p className="text-xs text-d-muted">{a.caso} · vence {a.vence}</p>
                      </div>
                      <span className="text-xs font-bold shrink-0" style={{ color: s.color }}>
                        {diasHasta(a.vence) === 0 ? '¡Hoy!' : `${diasHasta(a.vence)}d`}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Preview de leads */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-body font-bold text-d-primary">Leads disponibles</h3>
                  <button className="text-xs text-brand flex items-center gap-1" onClick={() => setSection('leads')}>
                    Ver todos <ChevronRight size={13} />
                  </button>
                </div>
                <div className="space-y-2">
                  {leadsDisponibles.slice(0, 2).map(l => (
                    <LeadCardCompact key={l.id} lead={l} onVer={() => setSection('leads')} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── BOLSA DE LEADS ── */}
          {section === 'leads' && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <h1 className="font-display text-2xl text-d-primary">Bolsa de leads</h1>
                <p className="text-d-muted text-sm mt-0.5">
                  Casos premasticados por la IA — hechos, estrategia y documentos listos
                </p>
              </div>

              {/* Filtros rápidos */}
              <div className="flex gap-2 flex-wrap">
                {['Todos', 'Urgentes', 'Alta complejidad'].map((f, i) => (
                  <button key={i} className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium
                    ${i === 0
                      ? 'bg-brand text-d-base border-brand'
                      : 'bg-d-elevated text-d-secondary border-d-border hover:border-brand hover:text-brand'
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <span className="ml-auto text-xs text-d-muted self-center">{leadsDisponibles.length} disponibles</span>
              </div>

              <div className="space-y-3">
                {LEADS.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isOpen={expanded === lead.id}
                    onToggle={() => setExpanded(expanded === lead.id ? null : lead.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── MIS CASOS (placeholder) ── */}
          {section === 'casos' && (
            <div className="space-y-4 animate-fade-up">
              <h1 className="font-display text-2xl text-d-primary">Mis casos</h1>
              <div className="bg-d-card border border-d-border rounded-2xl p-8 text-center">
                <Scale size={40} className="text-d-muted mx-auto mb-3" />
                <p className="text-d-secondary text-sm">Aquí aparecerán los casos que aceptes de la bolsa de leads.</p>
                <button
                  onClick={() => setSection('leads')}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-d-base text-sm font-bold hover:bg-brand-light transition-colors"
                >
                  Ver leads disponibles <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── SEMÁFORO DE VENCIMIENTOS ── */}
          {section === 'alertas' && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <h1 className="font-display text-2xl text-d-primary">Semáforo de vencimientos</h1>
                <p className="text-d-muted text-sm mt-0.5">Plazos procesales ordenados por urgencia</p>
              </div>

              {/* Leyenda */}
              <div className="flex gap-3 flex-wrap text-xs text-d-muted">
                {[
                  { dot: 'bg-bad',  label: 'Rojo: vence en ≤ 3 días' },
                  { dot: 'bg-warn', label: 'Amarillo: 4–14 días' },
                  { dot: 'bg-ok',   label: 'Verde: > 14 días' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </div>
                ))}
              </div>

              {/* Alertas agrupadas por semáforo */}
              {[
                { titulo: '🔴 Urgente — requiere acción inmediata',    filtro: (d) => d <= 3 },
                { titulo: '🟡 Próximos — planifica esta semana',        filtro: (d) => d > 3 && d <= 14 },
                { titulo: '🟢 Sin urgencia — en seguimiento',          filtro: (d) => d > 14 },
              ].map((grupo, gi) => {
                const items = ALERTAS_VENC.filter(a => grupo.filtro(diasHasta(a.vence)))
                if (!items.length) return null
                return (
                  <div key={gi}>
                    <h3 className="text-xs font-bold text-d-muted uppercase tracking-wider mb-2">{grupo.titulo}</h3>
                    <div className="space-y-2">
                      {items.map(a => {
                        const dias = diasHasta(a.vence)
                        const s = semaforo(dias)
                        return (
                          <div
                            key={a.id}
                            className={`flex items-start gap-4 p-4 rounded-2xl border ${s.cls}`}
                          >
                            {/* Semáforo dot */}
                            <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-sm font-bold text-d-primary leading-snug">{a.titulo}</p>
                                <span
                                  className="text-xs font-bold shrink-0 px-2 py-0.5 rounded-full border"
                                  style={{ color: s.color, borderColor: s.ring, background: s.bg }}
                                >
                                  {dias === 0 ? '¡Hoy!' : dias === 1 ? 'Mañana' : `${dias} días`}
                                </span>
                              </div>
                              <p className="text-xs text-d-muted mb-1">{a.caso}</p>
                              <p className="text-xs text-d-secondary leading-relaxed">{a.desc}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Calendar size={12} className="text-d-muted" />
                                <span className="text-xs text-d-muted">Vence: {a.vence}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

/* ── Lead card compacta (para el overview) ── */
function LeadCardCompact({ lead, onVer }) {
  const s   = semaforo(diasHasta(lead.vence))
  const rama = RAMA_CONFIG[lead.rama] || { label: lead.rama, color: 'text-d-secondary' }
  return (
    <div className="bg-d-card border border-d-border rounded-xl px-4 py-3 flex items-center gap-3 hover:border-brand-ring transition-colors">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-d-primary truncate">{lead.titulo}</p>
        <p className={`text-xs font-medium ${rama.color}`}>{rama.label} · {lead.tipo}</p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${COMPLEJIDAD_STYLE[lead.complejidad]}`}>
        {lead.complejidad}
      </span>
    </div>
  )
}

/* ── Lead card expandible (bolsa de leads) ── */
function LeadCard({ lead, isOpen, onToggle }) {
  const s    = semaforo(diasHasta(lead.vence))
  const dias = diasHasta(lead.vence)
  const rama = RAMA_CONFIG[lead.rama] || { label: lead.rama, color: 'text-d-secondary' }
  const esAceptado = lead.estado === 'aceptado'

  return (
    <div className={`bg-d-card rounded-2xl border transition-colors ${
      isOpen ? 'border-brand-ring' : 'border-d-border hover:border-d-line'
    }`}>
      {/* Header del lead */}
      <button
        onClick={onToggle}
        className="w-full text-left p-5"
      >
        <div className="flex items-start gap-3">
          {/* Semáforo */}
          <div
            className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
            style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold uppercase tracking-wider ${rama.color}`}>
                  {rama.label}
                </span>
                <span className="text-d-border">·</span>
                <span className="text-xs text-d-muted">{lead.tipo}</span>
                {esAceptado && (
                  <span className="flex items-center gap-1 text-xs font-bold text-ok bg-ok-bg border border-ok-ring px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={11} /> Aceptado
                  </span>
                )}
              </div>
              <ChevronDown
                size={16}
                className={`text-d-muted shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>

            <h3 className="font-body font-bold text-d-primary text-sm leading-snug mb-3">{lead.titulo}</h3>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${COMPLEJIDAD_STYLE[lead.complejidad]}`}>
                Complejidad {lead.complejidad}
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                style={{ color: s.color, borderColor: s.ring, background: s.bg }}
              >
                {dias === 0 ? 'Vence hoy' : `${s.label} — ${dias}d`}
              </span>
              <span className="flex items-center gap-1 text-xs text-d-muted">
                <FileText size={11} /> {lead.docs} docs
              </span>
              <span className="text-xs text-d-muted ml-auto">
                Ingresó {lead.fecha_ingreso}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Detalle expandido */}
      {isOpen && (
        <div className="px-5 pb-5 border-t border-d-line pt-4 space-y-4">

          {/* Resumen IA */}
          <div className="bg-d-elevated rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-brand" />
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Resumen del Agente IA</span>
            </div>
            <p className="text-sm text-d-secondary leading-relaxed">{lead.resumen_ia}</p>
          </div>

          {/* Derechos identificados */}
          <div>
            <p className="text-xs font-bold text-d-muted uppercase tracking-wider mb-2">Derechos identificados</p>
            <div className="space-y-1.5">
              {lead.derechos.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-d-secondary">
                  <CheckCircle2 size={12} className="text-brand shrink-0" />
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Precio y acciones */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-d-line flex-wrap">
            <div>
              <p className="text-xs text-d-muted">Pagado por el ciudadano</p>
              <div className="flex items-baseline gap-1">
                <DollarSign size={14} className="text-brand" />
                <span className="font-display text-xl text-brand">
                  ${lead.precio_ciudadano.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs text-d-secondary hover:text-d-primary bg-d-elevated hover:bg-d-border px-3 py-2 rounded-lg transition-colors font-medium border border-d-border">
                <FileText size={13} /> Ver expediente
              </button>
              {!esAceptado ? (
                <button className="flex items-center gap-1.5 text-sm text-d-base bg-brand hover:bg-brand-light px-4 py-2 rounded-lg transition-colors font-bold shadow-brand-sm">
                  <Users size={14} /> Aceptar lead
                </button>
              ) : (
                <button className="flex items-center gap-1.5 text-sm text-ok bg-ok-bg border border-ok-ring px-4 py-2 rounded-lg font-bold" disabled>
                  <CheckCircle2 size={14} /> En mis casos
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
