import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ArrowRight, ArrowLeft, CheckCircle2, DollarSign,
  Scale, Lock, CreditCard, Paperclip, FileText,
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import './Caso.css'

/* ── Primer mensaje del asistente ── */
const FIRST_MESSAGE =
  'Hola, cuéntame tu situación con tus propias palabras. ' +
  'No te preocupes por el orden ni los términos técnicos — ' +
  'yo voy a ayudarte a estructurarlo.'

/* ── Ejemplos de casos ── */
const CASE_EXAMPLES = [
  'Me despidieron sin justa causa y no me pagaron la liquidación después de 3 años',
  'La EPS me negó una cirugía urgente que el médico ordenó hace 2 meses',
  'Mi ex pareja no me deja ver a mis hijos desde hace 3 meses sin ninguna razón',
  'Mi arrendador me cortó el agua y la luz para que me fuera del apartamento',
  'Me estafaron en una compra por internet, pagué y nunca recibí nada',
  'Mi jefe me acosa laboralmente, me grita y me amenaza delante de todos',
]

const URGENCY_LABELS = {
  critica: { label: '🚨 Urgencia crítica', color: '#F45B5B' },
  alta:    { label: '⚡ Urgencia alta',    color: '#F4A72B' },
  media:   { label: '📋 Urgencia media',   color: '#00B4A0' },
  baja:    { label: '✅ Urgencia baja',    color: '#22D3A0' },
}

const COMPLEXITY_CONFIG = {
  baja:  { label: 'Complejidad baja',  color: '#22D3A0', bgColor: 'rgba(34,211,160,0.08)',  borderColor: 'rgba(34,211,160,0.25)' },
  media: { label: 'Complejidad media', color: '#F4A72B', bgColor: 'rgba(244,167,43,0.08)',  borderColor: 'rgba(244,167,43,0.25)' },
  alta:  { label: 'Complejidad alta',  color: '#00B4A0', bgColor: 'rgba(0,180,160,0.08)',   borderColor: 'rgba(0,180,160,0.3)'   },
}

const inferCategoria = (text) => {
  const s = text.toLowerCase()
  if (['eps', 'cirugía', 'cirugia', 'salud', 'médico', 'medico',
       'hospital', 'clínica', 'clinica', 'medicamento', 'operación', 'operacion',
       'procedimiento', 'cita médica', 'cita medica'].some(p => s.includes(p)))
    return 'tutela_salud'
  if (['arrendador', 'arriendo', 'arrendamiento', 'arrendatario', 'inquilino'].some(p => s.includes(p)))
    return 'arriendo'
  if (['cortó el agua', 'corto el agua', 'cortó la luz', 'corto la luz',
       'sin agua', 'sin luz', 'sin servicios'].some(p => s.includes(p)))
    return 'arriendo'
  if (['custodia', 'hijo', 'hija', 'menor', 'visita', 'régimen de visitas',
       'progenitor', 'pareja no me deja'].some(p => s.includes(p)))
    return 'custodia'
  if (['acoso', 'hostigamiento', 'maltrato', 'grita', 'humilla',
       'discrimina', 'amenaza delante'].some(p => s.includes(p)))
    return 'acoso_laboral'
  if (['despido', 'despedido', 'liquidación', 'liquidacion', 'salario',
       'empleador', 'empresa', 'trabajo', 'contrato', 'prestaciones',
       'jefe', 'patrón', 'patron', 'empleado', 'contrato indefinido'].some(p => s.includes(p)))
    return 'laboral'
  if (['estafa', 'fraude', 'garantía', 'garantia', 'compra', 'producto',
       'devolución', 'devolucion', 'entrega', 'pagué', 'pague',
       'nunca recibí', 'nunca recibi', 'internet'].some(p => s.includes(p)))
    return 'consumidor'
  return 'generico'
}

const MOCK_BY_CATEGORIA = {
  tutela_salud: {
    complejidad: 'alta',  precio_label: '$120.000 COP', precio_note: 'pago único',
    rama: 'Constitucional', urgencia: 'alta',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho Constitucional', sub_categoria: 'Acción de Tutela — vulneración del derecho a la salud' },
      derechos_vulnerados: [
        { derecho: 'Derecho a la salud y la vida digna', norma: 'Art. 49 y 11 — Constitución Política', explicacion: 'La negación injustificada de un procedimiento médico ordenado vulnera directamente el derecho fundamental a la salud.' },
        { derecho: 'Derecho de petición y respuesta oportuna', norma: 'Art. 23 Const. + Ley 1755/2015', explicacion: 'Las entidades de salud tienen la obligación de responder solicitudes médicas dentro de los plazos legales establecidos.' },
      ],
      diagnostico: {
        resumen: 'Tienes un caso sólido para interponer una Acción de Tutela. Cuando una EPS niega un procedimiento médico ordenado por un profesional de la salud, vulnera directamente el derecho fundamental a la salud protegido por la Constitución Política.\n\nLa tutela es el mecanismo constitucional más efectivo para estos casos — el juez tiene un plazo máximo de 10 días hábiles para fallar. En casos de urgencia médica comprobada, la tasa de éxito es superior al 90% según jurisprudencia de la Corte Constitucional.',
        opciones: [
          { accion: 'Acción de Tutela ante juzgado civil', descripcion: 'Mecanismo constitucional para proteger derechos fundamentales como la salud. Respuesta obligatoria en 10 días hábiles. Puedes presentarla sin abogado.' },
          { accion: 'Queja ante Superintendencia Nacional de Salud', descripcion: 'Proceso paralelo que genera presión institucional sobre la EPS y puede lograr la autorización antes del fallo de la tutela.' },
        ],
      },
    },
  },

  arriendo: {
    complejidad: 'media', precio_label: '$180.000 COP', precio_note: 'pago único',
    rama: 'Civil / Policivo', urgencia: 'alta',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho Civil / Policivo — Arrendamientos', sub_categoria: 'Perturbación a la tenencia pacífica — vía de hecho del arrendador' },
      derechos_vulnerados: [
        { derecho: 'Derecho a la vivienda digna y tenencia pacífica', norma: 'Art. 51 Const. + Ley 820/2003 (Ley de Arrendamientos)', explicacion: 'El arrendador no puede interrumpir los servicios públicos del inmueble arrendado bajo ninguna circunstancia. Hacerlo constituye una vía de hecho sancionable.' },
        { derecho: 'Protección contra perturbación a la posesión', norma: 'Art. 988 Código Civil + Ley 57/1887', explicacion: 'El arrendatario tiene derecho a la tenencia pacífica del inmueble. Cualquier acto de perturbación da lugar a querella policiva inmediata.' },
      ],
      diagnostico: {
        resumen: 'Se evidencia una presunta vía de hecho por parte del arrendador al cortar los servicios públicos, lo cual vulnera la tenencia pacífica del inmueble.\n\nEsta conducta está expresamente prohibida por la Ley 820 de 2003. El arrendador incurre en una infracción que puede acarrear sanciones policivas y civiles. Tienes derecho a exigir el restablecimiento inmediato de los servicios y a reclamar los perjuicios causados.',
        opciones: [
          { accion: 'Querella policiva por perturbación a la posesión', descripcion: 'Ante la Inspección de Policía o Alcaldía. Proceso rápido que ordena al arrendador restablecer los servicios de forma inmediata bajo apercibimiento de multa.' },
          { accion: 'Acción de restitución de inmueble arrendado', descripcion: 'Si el conflicto persiste, puedes iniciar proceso ante el juzgado civil municipal. El juez puede ordenar medidas cautelares urgentes y reconocer perjuicios.' },
        ],
      },
    },
  },

  laboral: {
    complejidad: 'media', precio_label: '$65.000 COP', precio_note: 'pago único',
    rama: 'Laboral', urgencia: 'alta',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho Laboral', sub_categoria: 'Despido sin justa causa — liquidación y prestaciones pendientes' },
      derechos_vulnerados: [
        { derecho: 'Derecho al trabajo y estabilidad laboral', norma: 'Art. 25 — Constitución Política', explicacion: 'El despido sin justa causa sin pago oportuno de la liquidación vulnera el derecho fundamental al trabajo.' },
        { derecho: 'Prestaciones sociales obligatorias', norma: 'Art. 249-252 — Código Sustantivo del Trabajo', explicacion: 'Cesantías, intereses sobre cesantías, prima de servicios y vacaciones deben pagarse al terminar el contrato.' },
      ],
      diagnostico: {
        resumen: 'Tienes un caso claro de despido sin justa causa con incumplimiento en el pago de la liquidación. El empleador tiene 15 días hábiles para pagar la liquidación desde la terminación del contrato. Después de ese plazo, corren intereses moratorios a su cargo.\n\nCon 3 o más años de antigüedad, tienes derecho a cesantías, intereses sobre cesantías, prima, vacaciones e indemnización por despido sin justa causa.',
        opciones: [
          { accion: 'Carta de cobro + Queja ante Ministerio de Trabajo', descripcion: 'Carta formal exigiendo el pago en plazo determinado y radicación de queja en MinTrabajo para generar presión institucional.' },
          { accion: 'Demanda verbal sumaria ante juzgado laboral', descripcion: 'Para montos menores a 20 SMLMV puedes demandar directamente sin abogado. El juzgado convoca a audiencia de conciliación.' },
        ],
      },
    },
  },

  custodia: {
    complejidad: 'alta', precio_label: '$120.000 COP', precio_note: 'pago único',
    rama: 'Familia', urgencia: 'critica',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho de Familia', sub_categoria: 'Regulación de visitas y custodia — protección del interés superior del menor' },
      derechos_vulnerados: [
        { derecho: 'Derecho del menor a mantener relaciones con ambos progenitores', norma: 'Art. 44 Const. + Ley 1098/2006 (Código de Infancia)', explicacion: 'Los menores de edad tienen el derecho fundamental a mantener contacto y relación con ambos padres, salvo decisión judicial en contrario.' },
        { derecho: 'Derecho de custodia y visitas del progenitor', norma: 'Art. 253 Código Civil + Ley 1361/2009', explicacion: 'El progenitor sin custodia tiene derecho a un régimen de visitas. Su incumplimiento puede configurar el delito de maltrato por descuido.' },
      ],
      diagnostico: {
        resumen: 'La negativa injustificada a permitir el contacto entre el menor y el otro progenitor puede configurar maltrato infantil por afectación emocional, según el Código de la Infancia y la Adolescencia (Ley 1098/2006).\n\nEl Juez de Familia puede regular el régimen de visitas de forma urgente. En casos de negativa reiterada, también procede la Acción de Tutela para proteger los derechos fundamentales del menor, con fallo en 10 días hábiles.',
        opciones: [
          { accion: 'Demanda de regulación de visitas ante Juez de Familia', descripcion: 'El Juez establece un régimen de visitas con fechas y condiciones precisas. El proceso puede resolverse en 3-6 meses con medidas provisionales inmediatas.' },
          { accion: 'Acción de Tutela por vulneración de derechos del menor', descripcion: 'Cuando la negativa es reiterada y urgente. El juez falla en 10 días hábiles y puede ordenar visitas inmediatas como medida provisional.' },
        ],
      },
    },
  },

  acoso_laboral: {
    complejidad: 'media', precio_label: '$65.000 COP', precio_note: 'pago único',
    rama: 'Laboral', urgencia: 'alta',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho Laboral — Acoso Laboral', sub_categoria: 'Conductas constitutivas de acoso laboral — Ley 1010/2006' },
      derechos_vulnerados: [
        { derecho: 'Protección contra el acoso laboral', norma: 'Ley 1010/2006 — Ley de Acoso Laboral', explicacion: 'La Ley 1010 define y sanciona el acoso laboral en todas sus formas, incluyendo el maltrato verbal, la persecución y la discriminación en el trabajo.' },
        { derecho: 'Derecho a condiciones dignas de trabajo', norma: 'Art. 25 Const. + Art. 57 Código Sustantivo del Trabajo', explicacion: 'El empleador tiene la obligación legal de garantizar un ambiente de trabajo digno y respetuoso. El maltrato o las amenazas constituyen incumplimiento grave.' },
      ],
      diagnostico: {
        resumen: 'Las conductas que describes configuran acoso laboral según la Ley 1010 de 2006. Esta ley protege a todos los trabajadores contra conductas que atentan contra su dignidad, como el maltrato verbal, las amenazas y la humillación pública.\n\nEl primer paso obligatorio es radicar una queja formal ante el Comité de Convivencia Laboral de la empresa. Si la empresa no actúa, procede la denuncia ante el Ministerio de Trabajo.',
        opciones: [
          { accion: 'Queja ante el Comité de Convivencia Laboral', descripcion: 'Obligatorio como primer paso legal. La empresa tiene 5 días hábiles para convocar al comité. Queda constancia formal del acoso denunciado.' },
          { accion: 'Denuncia ante el Ministerio de Trabajo', descripcion: 'Si el empleador no actúa, el Inspector de Trabajo puede imponer multas de 2 a 10 SMLMV y ordenar medidas correctivas inmediatas.' },
        ],
      },
    },
  },

  consumidor: {
    complejidad: 'baja', precio_label: '$30.000 COP', precio_note: 'pago único',
    rama: 'Consumidor / Administrativo', urgencia: 'media',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho del Consumidor', sub_categoria: 'Incumplimiento de contrato de compraventa — protección al consumidor' },
      derechos_vulnerados: [
        { derecho: 'Protección al consumidor — garantía de entrega', norma: 'Ley 1480/2011 — Estatuto del Consumidor, Art. 7', explicacion: 'El vendedor está obligado a entregar el producto en las condiciones y plazos pactados. El incumplimiento genera responsabilidad legal directa.' },
        { derecho: 'Derecho de petición ante el vendedor', norma: 'Art. 23 Const. + Ley 1755/2015', explicacion: 'Puedes exigir formalmente una respuesta al vendedor. Tiene máximo 15 días hábiles para contestar.' },
      ],
      diagnostico: {
        resumen: 'Tienes fundamentos sólidos para exigir la entrega del producto, la devolución del dinero o una compensación equivalente. La Ley 1480 de 2011 (Estatuto del Consumidor) protege a los compradores frente a incumplimientos en entregas y garantías, incluyendo compras por internet.',
        opciones: [
          { accion: 'Derecho de petición formal al vendedor', descripcion: 'Documento legal que obliga al vendedor a responder en 15 días hábiles. Es el primer paso antes de acudir a cualquier entidad.' },
          { accion: 'Queja ante la Superintendencia de Industria y Comercio (SIC)', descripcion: 'La SIC puede imponer sanciones económicas y ordenar la devolución del dinero o la entrega del producto por medida cautelar.' },
        ],
      },
    },
  },

  generico: {
    complejidad: 'baja', precio_label: '$30.000 COP', precio_note: 'pago único',
    rama: 'General', urgencia: 'media',
    triage_result: {
      clasificacion: { rama_derecho: 'Asesoría Legal Preliminar', sub_categoria: 'Evaluación inicial — se requiere análisis más detallado del caso' },
      derechos_vulnerados: [
        { derecho: 'Derecho de petición', norma: 'Art. 23 — Constitución Política + Ley 1755/2015', explicacion: 'Toda persona tiene derecho a elevar peticiones respetuosas a las autoridades y particulares, y a recibir respuesta oportuna.' },
        { derecho: 'Acceso a la administración de justicia', norma: 'Art. 229 — Constitución Política', explicacion: 'Toda persona tiene derecho a acceder a la justicia para la protección de sus derechos e intereses legítimos.' },
      ],
      diagnostico: {
        resumen: 'Con base en la descripción proporcionada, tu caso requiere una evaluación jurídica más detallada para identificar la rama del derecho aplicable y las acciones legales precisas.\n\nLo que podemos confirmar es que existen mecanismos legales disponibles para proteger tus derechos. Prepararemos un análisis personalizado con los pasos concretos a seguir.',
        opciones: [
          { accion: 'Asesoría legal personalizada', descripcion: 'Análisis detallado de tu caso con identificación de mecanismos legales adecuados y plan de acción paso a paso con plazos reales.' },
          { accion: 'Derecho de petición preliminar', descripcion: 'En muchos casos, el primer paso efectivo es formalizar tu reclamación mediante un derecho de petición ante la entidad o persona involucrada.' },
        ],
      },
    },
  },
}

const LOADER_MSGS = [
  'Analizando marco constitucional colombiano...',
  'Evaluando precedentes judiciales aplicables...',
  'Estructurando fundamentos jurídicos...',
]

/* ── localStorage helpers ── */
const LS_KEY   = 'defiendete_chat'
const lsSave   = (msgs) => { try { localStorage.setItem(LS_KEY, JSON.stringify(msgs)) } catch {} }
const lsClear  = ()     => { try { localStorage.removeItem(LS_KEY) } catch {} }
const lsLoad   = ()     => {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (Array.isArray(p) && p.length > 0) return p
    }
  } catch {}
  return null
}

/* ── Fallback offline por turno ── */
const FALLBACK_REPLIES = [
  '¿En qué ciudad de Colombia ocurrió esto, qué fecha fue aproximadamente, y qué resultado esperas obtener — recuperar dinero, protección legal u otro?',
  '¿Tienes algún documento del caso (contrato, carta, historia clínica, capturas de pantalla)? ¿Y hay un monto económico involucrado?',
  '¿Hay algún plazo legal próximo que debas cumplir o alguna persona o empresa específica involucrada?',
]

/* ── Conversión chatMessages → formato API ──
   Los mensajes tipo "document" se convierten en mensajes de usuario con el texto extraído */
const toApiMessages = (messages) =>
  messages.map(m =>
    m.role === 'document'
      ? { role: 'user', content: `[Documento adjunto: ${m.filename}]\nContenido extraído:\n${m.summary}` }
      : { role: m.role, content: m.content }
  )

/* ── Construir objeto result desde la respuesta de /conversar ── */
const buildResult = (data, messages) => {
  const userTexts = messages
    .map(m => m.role === 'user' ? m.content : m.role === 'document' ? (m.summary || '') : '')
    .join(' ')
  const categoria = inferCategoria(userTexts)
  const mockBase  = MOCK_BY_CATEGORIA[categoria] || MOCK_BY_CATEGORIA.generico

  if (data.triage_result) {
    const cl = data.triage_result.clasificacion || {}
    return {
      success: true, categoria,
      complejidad:  mockBase.complejidad,
      precio_label: mockBase.precio_label,
      precio_note:  mockBase.precio_note,
      rama:         cl.rama_derecho || mockBase.rama,
      urgencia:     cl.urgencia     || mockBase.urgencia,
      triage_result: data.triage_result,
      payment_required_for: data.payment_required_for || ['estrategia_completa', 'documentos', 'seguimiento'],
    }
  }
  return { success: true, categoria, ...mockBase }
}

/* ── Componente principal ── */
const Caso = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  /* Pasos: chat → loading → capture → result */
  const [step, setStep]         = useState('chat')

  /* Chat */
  const [chatMessages, setChatMessages] = useState(
    () => lsLoad() || [{ role: 'assistant', content: FIRST_MESSAGE }]
  )
  const [chatInput,   setChatInput]   = useState('')
  const [isTyping,    setIsTyping]    = useState(false)
  const [isReadingDoc,setIsReadingDoc]= useState(false)

  /* Resto del flujo */
  const [result,     setResult]    = useState(null)
  const [leadData,   setLeadData]  = useState({ nombre: '', contacto: '' })
  const [loadingMsg, setLoadingMsg]= useState(0)
  const [pagoMsg,    setPagoMsg]   = useState(false)

  /* Refs */
  const chatEndRef  = useRef(null)
  const fileInputRef= useRef(null)

  const canSubmitLead = isAuthenticated
    ? true
    : leadData.nombre.trim().length >= 2 && leadData.contacto.trim().length >= 5

  /* Auto-scroll al último mensaje */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping, isReadingDoc])

  /* Cicla los mensajes del loader */
  useEffect(() => {
    if (step !== 'loading') return
    setLoadingMsg(0)
    let idx = 0
    const iv = setInterval(() => { idx = (idx + 1) % LOADER_MSGS.length; setLoadingMsg(idx) }, 1250)
    return () => clearInterval(iv)
  }, [step])

  /* ── Transición a loading + result ── */
  const goToResult = (apiResult) => {
    setTimeout(() => {
      setResult(apiResult)
      setStep('loading')
      setTimeout(() => {
        if (isAuthenticated) {
          setLeadData({ nombre: user?.nombre || '', contacto: user?.email || '' })
          setStep('result')
        } else {
          setStep('capture')
        }
      }, 3800)
    }, 700)
  }

  /* ── Procesar respuesta de /conversar ── */
  const processConversarResponse = (data, msgs, setMessages) => {
    if (data.info_completa) {
      const assistantMsg = data.mensaje_usuario || 'Perfecto. Voy a analizar tu caso ahora mismo.'
      const final = [...msgs, { role: 'assistant', content: assistantMsg }]
      setMessages(final)
      lsSave(final)
      setIsTyping(false)
      goToResult(buildResult(data, msgs))
    } else {
      const q = data.siguiente_pregunta || '¿Puedes contarme un poco más?'
      const updated = [...msgs, { role: 'assistant', content: q }]
      setMessages(updated)
      lsSave(updated)
      setIsTyping(false)
    }
  }

  /* ── Enviar mensaje al asistente ── */
  const handleChatSend = async (overrideText) => {
    const text = (overrideText !== undefined ? overrideText : chatInput).trim()
    if (!text || isTyping || isReadingDoc) return
    setChatInput('')

    const newMessages = [...chatMessages, { role: 'user', content: text }]
    setChatMessages(newMessages)
    lsSave(newMessages)
    setIsTyping(true)

    const userTurn = newMessages.filter(m => m.role === 'user').length

    try {
      const res = await fetch('/api/cases/conversar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toApiMessages(newMessages) }),
      })

      /* Rate limit */
      if (res.status === 429) {
        const err = await res.json()
        const msg = err.detail || 'Ya iniciaste un diagnóstico hoy. Vuelve mañana.'
        const updated = [...newMessages, { role: 'assistant', content: msg }]
        setChatMessages(updated)
        lsSave(updated)
        setIsTyping(false)
        return
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      processConversarResponse(data, newMessages, setChatMessages)

    } catch {
      setIsTyping(false)
      if (userTurn > 4) {
        /* Demasiados turnos sin backend → usar mock directamente */
        const final = [
          ...newMessages,
          { role: 'assistant', content: 'Con la información que me compartiste voy a preparar tu diagnóstico inicial.' }
        ]
        setChatMessages(final)
        lsSave(final)
        goToResult(buildResult({}, newMessages))
      } else {
        const reply = FALLBACK_REPLIES[Math.min(userTurn - 1, FALLBACK_REPLIES.length - 1)]
        const updated = [...newMessages, { role: 'assistant', content: reply }]
        setChatMessages(updated)
        lsSave(updated)
      }
    }
  }

  /* ── Subir y procesar documento ── */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || isTyping || isReadingDoc) return
    e.target.value = ''  // reset input

    setIsReadingDoc(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const uploadRes = await fetch('/api/cases/upload-document', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()

      if (!uploadData.success) {
        /* Límite de páginas u otro error — mostrarlo como mensaje del asistente */
        const msg = uploadData.message || 'No pude procesar el documento. Continúa describiendo tu caso.'
        const updated = [...chatMessages, { role: 'assistant', content: msg }]
        setChatMessages(updated)
        lsSave(updated)
        setIsReadingDoc(false)
        return
      }

      /* Agregar burbuja de documento al chat */
      const docMsg = {
        role: 'document',
        filename: file.name,
        summary: uploadData.summary,
      }
      const msgsWithDoc = [...chatMessages, docMsg]
      setChatMessages(msgsWithDoc)
      setIsReadingDoc(false)
      setIsTyping(true)

      /* Llamar /conversar con el documento en el contexto */
      const convRes = await fetch('/api/cases/conversar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toApiMessages(msgsWithDoc) }),
      })

      if (convRes.status === 429) {
        const err = await convRes.json()
        const msg = err.detail || 'Ya iniciaste un diagnóstico hoy. Vuelve mañana.'
        const updated = [...msgsWithDoc, { role: 'assistant', content: msg }]
        setChatMessages(updated)
        lsSave(updated)
        setIsTyping(false)
        return
      }

      if (!convRes.ok) throw new Error()
      const convData = await convRes.json()
      processConversarResponse(convData, msgsWithDoc, setChatMessages)

    } catch {
      setIsReadingDoc(false)
      setIsTyping(false)
      const errorMsg = 'No pude leer el documento en este momento. Describe el contenido manualmente y continuamos.'
      const updated = [...chatMessages, { role: 'assistant', content: errorMsg }]
      setChatMessages(updated)
      lsSave(updated)
    }
  }

  const handleExampleClick = (ex) => { if (!isTyping && !isReadingDoc) handleChatSend(ex) }

  const handleLeadSubmit = (e) => {
    e.preventDefault()
    if (!canSubmitLead) return
    setStep('result')
  }

  const handleComprar = () => {
    if (!isAuthenticated) { navigate('/registro'); return }
    setPagoMsg(true)
  }

  const handleReset = () => {
    const fresh = [{ role: 'assistant', content: FIRST_MESSAGE }]
    setChatMessages(fresh)
    setChatInput('')
    lsSave(fresh)
    setResult(null)
    setLeadData({ nombre: '', contacto: '' })
    setPagoMsg(false)
    setStep('chat')
  }

  /* ── Indicador de progreso ── */
  const STEPS_ORDER = ['chat', 'loading', 'capture', 'result']
  const currentIdx  = STEPS_ORDER.indexOf(step)
  const stepDot = (idx) => {
    if (idx < currentIdx)  return 'step-dot--done'
    if (idx === currentIdx) return 'step-dot--active'
    return ''
  }

  return (
    <div className="caso-page">

      {/* Header */}
      <header className="caso-header">
        <div className="container caso-header__inner">
          <Link to="/"><Logo size={32} showText={true} /></Link>
          <div className="caso-steps-indicator">
            <span className={`step-dot ${stepDot(0)}`} />
            <span className="step-line" />
            <span className={`step-dot ${stepDot(1)}`} />
            <span className="step-line" />
            <span className={`step-dot ${stepDot(2)}`} />
            <span className="step-line" />
            <span className={`step-dot ${stepDot(3)}`} />
          </div>
        </div>
      </header>

      <main className="caso-main">

        {/* ── CHAT CONVERSACIONAL ── */}
        {step === 'chat' && (
          <div className="caso-chat container-narrow animate-fade-up">

            <div className="caso-chat__header">
              <span className="section-tag">Asistente legal</span>
              <h1>Cuéntanos qué pasó</h1>
              <p>El asistente te guiará con preguntas para preparar tu diagnóstico gratuito.</p>
            </div>

            {/* Mensajes */}
            <div className="chat-messages">
              {chatMessages.map((msg, i) => {

                /* Burbuja de documento adjunto */
                if (msg.role === 'document') return (
                  <div key={i} className="chat-doc-bubble">
                    <div className="chat-doc-icon"><FileText size={15} /></div>
                    <div className="chat-doc-info">
                      <span className="chat-doc-name">{msg.filename}</span>
                      <span className="chat-doc-status">Documento procesado ✓</span>
                    </div>
                  </div>
                )

                return (
                  <div key={i} className={`chat-bubble chat-bubble--${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <div className="chat-avatar"><Scale size={12} /></div>
                    )}
                    <div className="chat-text">{msg.content}</div>
                  </div>
                )
              })}

              {/* Indicador "escribiendo..." / "Leyendo documento..." */}
              {(isTyping || isReadingDoc) && (
                <div className="chat-bubble chat-bubble--assistant">
                  <div className="chat-avatar"><Scale size={12} /></div>
                  {isReadingDoc
                    ? <div className="chat-text chat-reading">Leyendo documento...</div>
                    : <div className="chat-typing"><span /><span /><span /></div>
                  }
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chips de ejemplo — solo chat vacío */}
            {chatMessages.length === 1 && !isTyping && !isReadingDoc && (
              <div className="chat-examples">
                <span className="examples-label">O elige un caso similar para empezar:</span>
                <div className="examples-list">
                  {CASE_EXAMPLES.map((ex, i) => (
                    <button key={i} className="example-chip" onClick={() => handleExampleClick(ex)}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input del chat */}
            <div className="chat-input-wrap">

              {/* Botón de adjuntar — solo escritorio */}
              <button
                className="chat-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping || isReadingDoc}
                title="Adjuntar documento (PDF, JPG, PNG — máx 5 MB)"
                type="button"
              >
                <Paperclip size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <textarea
                className="chat-input"
                placeholder="Escribe aquí tu situación... (Enter para enviar, Shift+Enter nueva línea)"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleChatSend()
                  }
                }}
                rows={2}
                disabled={isTyping || isReadingDoc}
              />

              <button
                className={`chat-send-btn ${!chatInput.trim() || isTyping || isReadingDoc ? 'chat-send-btn--disabled' : ''}`}
                onClick={() => handleChatSend()}
                disabled={!chatInput.trim() || isTyping || isReadingDoc}
                aria-label="Enviar mensaje"
              >
                <ArrowRight size={16} />
              </button>
            </div>

            <p className="caso-disclaimer">
              🔒 Tu información es confidencial — Ley 1581 de 2012. Diagnóstico informativo, no asesoría jurídica.
            </p>
          </div>
        )}

        {/* ── LOADER ── */}
        {step === 'loading' && (
          <div className="caso-loading container-narrow">
            <div className="loading-card animate-fade-in">
              <div className="loading-icon">
                <Scale size={36} className="loading-scale-spin" />
              </div>
              <h2>Analizando tu caso</h2>
              <p className="loading-subtitle">Consultando el corpus legal colombiano vigente</p>
              <div className="loader-msg-wrap">
                {LOADER_MSGS.map((msg, i) => (
                  <div key={i} className={`loader-msg ${loadingMsg === i ? 'loader-msg--active' : loadingMsg > i ? 'loader-msg--done' : ''}`}>
                    <span className="loader-msg-dot" />
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
              <div className="loader-bar-wrap"><div className="loader-bar" /></div>
            </div>
          </div>
        )}

        {/* ── CAPTURA DE LEAD ── */}
        {step === 'capture' && (
          <div className="caso-capture container-narrow animate-fade-up">
            <div className="capture-card">
              <div className="capture-header">
                <div className="capture-icon">
                  <CheckCircle2 size={28} style={{ color: '#00B4A0' }} />
                </div>
                <h2>Tu diagnóstico está listo</h2>
                <p className="capture-subtitle">
                  Ingresa tus datos para ver tu diagnóstico gratuito y congelar tu tarifa preferencial
                </p>
              </div>

              <form className="capture-form" onSubmit={handleLeadSubmit}>
                <div className="capture-field">
                  <label htmlFor="cap-nombre">Tu nombre</label>
                  <input
                    id="cap-nombre" type="text" placeholder="ej. María Rodríguez"
                    value={leadData.nombre}
                    onChange={e => setLeadData(d => ({ ...d, nombre: e.target.value }))}
                    autoComplete="name" autoFocus
                  />
                </div>
                <div className="capture-field">
                  <label htmlFor="cap-contacto">WhatsApp o correo electrónico</label>
                  <input
                    id="cap-contacto" type="text" placeholder="ej. 3001234567 o tu@correo.com"
                    value={leadData.contacto}
                    onChange={e => setLeadData(d => ({ ...d, contacto: e.target.value }))}
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  className={`btn-cta btn-cta--full ${!canSubmitLead ? 'btn-cta--disabled' : ''}`}
                  disabled={!canSubmitLead}
                >
                  Ver mi diagnóstico gratuito <ArrowRight size={18} />
                </button>
              </form>

              <div className="capture-privacy">
                <Lock size={13} />
                <span>Datos protegidos bajo la Ley 1581 de 2012. No compartimos tu información.</span>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTADO ── */}
        {step === 'result' && result && (() => {
          const compConfig  = COMPLEXITY_CONFIG[result.complejidad] || COMPLEXITY_CONFIG.media
          const urgConfig   = URGENCY_LABELS[result.urgencia]
          const precioLabel = result.precio_label || '—'
          const precioNote  = result.precio_note  || 'pago único'

          return (
            <div className="caso-result container-narrow animate-fade-up">

              <div className="result-header">
                <CheckCircle2 size={32} className="result-check" />
                <div>
                  <h2>Tu diagnóstico está listo</h2>
                  <p>Basado en la legislación colombiana vigente · preparado para {leadData.nombre || 'ti'}</p>
                </div>
              </div>

              <div className="result-cotizacion">
                <div className="cotizacion-top">
                  <span className="cotizacion-complexity-badge"
                    style={{ background: compConfig.bgColor, borderColor: compConfig.borderColor, color: compConfig.color }}>
                    {compConfig.label}
                  </span>
                  <p className="cotizacion-descripcion">
                    {result.triage_result?.clasificacion?.rama_derecho || result.rama}
                  </p>
                </div>
                <div className="cotizacion-price-row">
                  <div className="cotizacion-price-info">
                    <span className="cotizacion-label">Estrategia completa + Documentos</span>
                    <div className="cotizacion-amount-row">
                      <DollarSign size={18} className="cotizacion-dollar" />
                      <span className="cotizacion-amount">{precioLabel}</span>
                      <span className="cotizacion-note">· {precioNote}</span>
                    </div>
                  </div>
                  <div className="cotizacion-tag"><span>Cotización de tu caso</span></div>
                </div>
              </div>

              <div className="result-card">
                <div className="result-meta">
                  <div className="result-meta-item">
                    <span className="meta-label">Rama del derecho</span>
                    <span className="meta-value meta-value--rama">{result.rama}</span>
                  </div>
                  <div className="result-meta-item">
                    <span className="meta-label">Urgencia</span>
                    <span className="meta-value" style={{ color: urgConfig?.color }}>
                      {urgConfig?.label || result.urgencia}
                    </span>
                  </div>
                </div>
              </div>

              {result.triage_result?.derechos_vulnerados?.length > 0 && (
                <div className="result-section">
                  <h3>Derechos que podrían estar vulnerados</h3>
                  <div className="rights-list">
                    {result.triage_result.derechos_vulnerados.map((d, i) => (
                      <div key={i} className="right-item">
                        <span className="right-norm">{d.norma}</span>
                        <span className="right-name">{d.derecho}</span>
                        <span className="right-why">{d.explicacion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="result-section">
                <h3>Tu situación legal</h3>
                <div className="result-text">{result.triage_result?.diagnostico?.resumen}</div>
              </div>

              <div className="result-section result-section--locked">
                <div className="locked-header">
                  <h3>Opciones legales disponibles</h3>
                  <span className="locked-badge">Estrategia completa</span>
                </div>
                <div className="locked-preview">
                  {result.triage_result?.diagnostico?.opciones?.slice(0, 2).map((op, i) => (
                    <div key={i} className="option-preview option-preview--blurred">
                      <strong>{op.accion}</strong>
                      <span>{op.descripcion?.slice(0, 60)}...</span>
                    </div>
                  ))}
                  <div className="locked-overlay"><span>Desbloquea el plan de acción completo</span></div>
                </div>
              </div>

              <div className="result-cta">
                <div className="result-cta__info">
                  <h3>Estrategia completa + Documentos listos para radicar</h3>
                  <p>Plan de acción paso a paso, artículos y sentencias verificadas, plazos exactos y documentos listos para radicar.</p>
                  <div className="result-cta__price">
                    <span className="price-amount">{precioLabel}</span>
                    <span className="price-note">· {precioNote} · sin abogado requerido</span>
                  </div>
                </div>
                <div className="result-cta__actions">
                  {pagoMsg ? (
                    <div className="pago-msg">
                      <CreditCard size={16} />
                      <div>
                        <strong>Pago seguro con Wompi</strong>
                        <span>La integración de pago estará activa en el lanzamiento. Te notificaremos.</span>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-cta" onClick={handleComprar}>
                      {isAuthenticated ? 'Obtener estrategia completa' : 'Crear cuenta y obtener estrategia'}
                      <ArrowRight size={18} />
                    </button>
                  )}
                  <button className="btn-ghost-sm" onClick={handleReset}>
                    <ArrowLeft size={14} /> Volver a editar
                  </button>
                </div>
              </div>

            </div>
          )
        })()}

      </main>
    </div>
  )
}

export default Caso
