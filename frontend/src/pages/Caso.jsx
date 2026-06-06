import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ArrowRight, ArrowLeft, CheckCircle2, DollarSign,
  Scale, Lock, CreditCard, Paperclip, FileText, RefreshCw,
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import './Caso.css'

/* ── Primer mensaje del asistente ── */
const FIRST_MESSAGE =
  'Hola, cuéntame tu situación con tus propias palabras. ' +
  'No te preocupes por el orden ni los términos técnicos — ' +
  'yo voy a ayudarte a estructurarlo.'

/* ── Categorías de entrada ── */
const CATEGORIES = [
  { id: 'salud',    label: 'Salud y EPS' },
  { id: 'trabajo',  label: 'Trabajo' },
  { id: 'vivienda', label: 'Vivienda' },
  { id: 'compras',  label: 'Compras' },
  { id: 'familia',  label: 'Familia' },
  { id: 'bancos',   label: 'Bancos y servicios' },
]

const CATEGORY_GREETINGS = {
  salud:    'Cuéntame qué pasó con tu EPS o situación de salud. Estoy aquí para ayudarte.',
  trabajo:  'Cuéntame qué pasó en tu trabajo. Estoy aquí para ayudarte.',
  vivienda: 'Cuéntame qué pasó con tu vivienda o arrendamiento. Estoy aquí para ayudarte.',
  compras:  'Cuéntame qué pasó con tu compra o el producto que recibiste. Estoy aquí para ayudarte.',
  familia:  'Cuéntame qué está pasando en tu situación familiar. Estoy aquí para ayudarte.',
  bancos:   'Cuéntame qué pasó con tu banco o servicio financiero. Estoy aquí para ayudarte.',
}

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

/* ── Lista por defecto de lo que incluye la estrategia paga ── */
const DEFAULT_ESTRATEGIA_INCLUYE = [
  'El documento redactado y listo para radicar',
  'Los artículos y sentencias que blindan tu caso',
  'El paso a paso de dónde y cómo presentarlo',
  'Qué hacer si la contraparte no responde',
]

const MOCK_BY_CATEGORIA = {
  tutela_salud: {
    complejidad: 'alta', precio_label: '$120.000 COP', precio_note: 'pago único',
    rama: 'Constitucional', urgencia: 'alta',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho Constitucional', sub_categoria: 'Acción de Tutela — vulneración del derecho a la salud' },
      derechos_vulnerados: [
        { derecho: 'Derecho fundamental a la salud y a la vida digna', norma: 'Constitución Política de Colombia', explicacion: 'La negación injustificada de un procedimiento médico ordenado por un profesional vulnera directamente el derecho fundamental a la salud.' },
        { derecho: 'Derecho de petición y respuesta oportuna', norma: 'Legislación colombiana de salud y peticiones', explicacion: 'Las entidades de salud tienen la obligación de responder solicitudes médicas dentro de los plazos legales establecidos.' },
      ],
      estrategia_incluye: [
        'La tutela redactada y lista para presentar ante el juez',
        'Los artículos constitucionales y sentencias de la Corte que blindan tu caso',
        'El paso a paso de dónde y cómo presentarla correctamente',
        'Qué hacer si la EPS no cumple el fallo',
      ],
      diagnostico: {
        resumen: 'Tu caso tiene fundamento sólido. Cuando una EPS niega un procedimiento médico ordenado por un médico, vulnera el derecho fundamental a la salud protegido por la Constitución Política colombiana.\n\nLa Acción de Tutela es el mecanismo más efectivo para este tipo de situaciones. La jurisprudencia de la Corte Constitucional ha protegido consistentemente a ciudadanos en circunstancias similares a la tuya.',
        probabilidad_exito_label: 'Alta',
        probabilidad_exito_razon: 'Casos como el tuyo tienen amplio respaldo en la jurisprudencia constitucional colombiana.',
        urgencia_descripcion: 'La tutela tiene plazos importantes y debe presentarse mientras la necesidad médica sea actual. Actuar pronto es determinante para su efectividad.',
        tipo_accion_principal: 'Acción de Tutela',
        opciones: [
          { accion: 'Acción de Tutela', descripcion: 'Mecanismo constitucional para proteger derechos fundamentales como la salud. El juez tiene un plazo para fallar y puede ordenar a la EPS actuar de inmediato.', probabilidad: 'alta' },
          { accion: 'Queja ante Superintendencia Nacional de Salud', descripcion: 'Proceso paralelo que genera presión institucional sobre la EPS y puede complementar la tutela.', probabilidad: 'media' },
        ],
        cierre_paywall: 'Tu caso es sólido y tienes con qué defenderte. Para que tu tutela prospere, debe estar redactada con los fundamentos constitucionales exactos, citar las sentencias de la Corte que aplican a tu situación específica y presentarse correctamente ante el juzgado adecuado. Una tutela mal redactada puede ser denegada por forma, no por fondo — y eso te costaría semanas críticas.',
      },
    },
  },

  arriendo: {
    complejidad: 'media', precio_label: '$180.000 COP', precio_note: 'pago único',
    rama: 'Civil / Policivo', urgencia: 'alta',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho Civil / Policivo — Arrendamientos', sub_categoria: 'Perturbación a la tenencia pacífica — vía de hecho del arrendador' },
      derechos_vulnerados: [
        { derecho: 'Derecho a la vivienda digna y tenencia pacífica', norma: 'Constitución Política + legislación de arrendamientos colombiana', explicacion: 'El arrendador no puede interrumpir los servicios del inmueble arrendado bajo ninguna circunstancia. Hacerlo constituye una vía de hecho sancionable.' },
        { derecho: 'Protección contra perturbación a la posesión', norma: 'Código Civil y legislación policiva colombiana', explicacion: 'El arrendatario tiene derecho a la tenencia pacífica del inmueble. Cualquier perturbación da lugar a acción inmediata.' },
      ],
      estrategia_incluye: [
        'La querella policiva o escrito de restitución redactados y listos',
        'Los artículos de la ley de arrendamientos que protegen tu caso',
        'El paso a paso de dónde y cómo presentarlos',
        'Qué hacer si el arrendador no cumple la orden',
      ],
      diagnostico: {
        resumen: 'Tu caso tiene fundamento claro. Cortar los servicios públicos de un inmueble arrendado está expresamente prohibido por la legislación colombiana de arrendamientos. Esta conducta constituye una vía de hecho que puede acarrear sanciones policivas y civiles para el arrendador.\n\nTienes derecho a exigir el restablecimiento inmediato de los servicios y a reclamar los perjuicios causados durante el período de privación.',
        probabilidad_exito_label: 'Alta',
        probabilidad_exito_razon: 'La legislación colombiana es clara en prohibir esta conducta y hay mecanismos rápidos para remediarla.',
        urgencia_descripcion: 'La privación de servicios es una situación que afecta tu bienestar diario. Entre más pronto actúes, más rápido se restablecen y más fácil es documentar el daño.',
        tipo_accion_principal: 'Querella policiva por perturbación a la posesión',
        opciones: [
          { accion: 'Querella policiva', descripcion: 'Proceso rápido ante la Inspección de Policía que ordena al arrendador restablecer los servicios bajo apercibimiento de multa.', probabilidad: 'alta' },
          { accion: 'Acción civil por perjuicios', descripcion: 'Proceso judicial para reclamar los daños y perjuicios ocasionados por la perturbación.', probabilidad: 'media' },
        ],
        cierre_paywall: 'Tienes razón y la ley te respalda. Para que tu querella sea efectiva, debe estar fundamentada en los artículos precisos, presentada ante la entidad correcta y con la documentación adecuada. Un escrito incompleto puede demorar semanas adicionales de privación.',
      },
    },
  },

  laboral: {
    complejidad: 'media', precio_label: '$65.000 COP', precio_note: 'pago único',
    rama: 'Laboral', urgencia: 'alta',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho Laboral', sub_categoria: 'Despido sin justa causa — liquidación y prestaciones pendientes' },
      derechos_vulnerados: [
        { derecho: 'Derecho al trabajo y estabilidad laboral', norma: 'Constitución Política de Colombia', explicacion: 'El despido sin justa causa sin pago oportuno de la liquidación vulnera el derecho fundamental al trabajo.' },
        { derecho: 'Prestaciones sociales y liquidación oportuna', norma: 'Código Sustantivo del Trabajo colombiano', explicacion: 'Cesantías, intereses sobre cesantías, prima de servicios y vacaciones deben pagarse al terminar el contrato.' },
      ],
      estrategia_incluye: [
        'La carta de cobro o demanda redactada y lista para radicar',
        'Los artículos del CST y jurisprudencia laboral que blindan tu caso',
        'El paso a paso de dónde y cómo reclamar tu liquidación',
        'Qué hacer si el empleador no responde o se niega a pagar',
      ],
      diagnostico: {
        resumen: 'Tu caso tiene fundamento sólido en el derecho laboral colombiano. Un empleador que no paga la liquidación en el plazo legal está incumpliendo una obligación legal que genera consecuencias económicas adicionales a su cargo.\n\nLa legislación laboral colombiana protege a los trabajadores despedidos y establece mecanismos claros para reclamar lo que te corresponde, incluyendo intereses de mora.',
        probabilidad_exito_label: 'Alta',
        probabilidad_exito_razon: 'El Código Sustantivo del Trabajo y la jurisprudencia laboral colombiana son claros en proteger este tipo de reclamos.',
        urgencia_descripcion: 'Los plazos de prescripción en materia laboral son importantes. Actuar dentro del tiempo adecuado protege tu derecho a reclamar el total de lo que te deben.',
        tipo_accion_principal: 'Reclamación laboral ante el Ministerio de Trabajo o demanda laboral',
        opciones: [
          { accion: 'Carta de cobro y queja ante Ministerio de Trabajo', descripcion: 'Primer paso formal que genera presión institucional y deja evidencia de la reclamación.', probabilidad: 'alta' },
          { accion: 'Demanda laboral', descripcion: 'Proceso judicial para obtener el pago completo de lo adeudado más los intereses de mora correspondientes.', probabilidad: 'alta' },
        ],
        cierre_paywall: 'Tienes derecho a reclamar y la ley laboral te respalda. Para que tu reclamación sea efectiva y cubra todo lo que te corresponde — liquidación, intereses de mora, posible indemnización — debe estar fundamentada con precisión. Un error en los cálculos o en el procedimiento puede costarte parte de lo que es tuyo.',
      },
    },
  },

  custodia: {
    complejidad: 'alta', precio_label: '$120.000 COP', precio_note: 'pago único',
    rama: 'Familia', urgencia: 'critica',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho de Familia', sub_categoria: 'Regulación de visitas y custodia — protección del interés superior del menor' },
      derechos_vulnerados: [
        { derecho: 'Derecho del menor a mantener relaciones con ambos progenitores', norma: 'Constitución Política + Código de la Infancia y Adolescencia colombiano', explicacion: 'Los menores tienen el derecho fundamental a mantener contacto con ambos padres, salvo decisión judicial en contrario.' },
        { derecho: 'Derecho de visitas del progenitor no custodio', norma: 'Legislación de familia colombiana', explicacion: 'El progenitor sin custodia tiene derecho legal a un régimen de visitas. Su incumplimiento genera consecuencias legales.' },
      ],
      estrategia_incluye: [
        'La demanda o tutela de visitas redactada y lista para presentar',
        'Los artículos del Código de Infancia y jurisprudencia familiar que aplican',
        'El paso a paso de cómo iniciar el proceso ante el Juez de Familia',
        'Qué hacer si el otro progenitor sigue incumpliendo tras la orden judicial',
      ],
      diagnostico: {
        resumen: 'Tu caso es urgente y tiene respaldo legal claro. La negativa injustificada a permitir el contacto entre el menor y su progenitor puede configurar una vulneración de los derechos fundamentales del niño, según la legislación colombiana de infancia y familia.\n\nExisten mecanismos legales diseñados específicamente para estas situaciones, con plazos de respuesta más cortos que los procesos ordinarios.',
        probabilidad_exito_label: 'Alta',
        probabilidad_exito_razon: 'La jurisprudencia colombiana de familia protege consistentemente el derecho del menor a mantener relación con ambos progenitores.',
        urgencia_descripcion: 'Esta situación afecta directamente los derechos de un menor. Entre más tiempo pase sin regularizar el contacto, más difícil es revertir el daño. La urgencia es real.',
        tipo_accion_principal: 'Demanda de regulación de visitas o Acción de Tutela',
        opciones: [
          { accion: 'Demanda de regulación de visitas', descripcion: 'Proceso ante el Juez de Familia que establece un régimen oficial de visitas con fechas y condiciones vinculantes.', probabilidad: 'alta' },
          { accion: 'Acción de Tutela por derechos del menor', descripcion: 'Cuando la negativa es urgente y reiterada, el juez puede ordenar medidas inmediatas para proteger al niño.', probabilidad: 'alta' },
        ],
        cierre_paywall: 'Tu caso es urgente y tienes fundamento para actuar. Un proceso de familia mal presentado puede demorar meses adicionales — tiempo que el menor no puede recuperar. La demanda debe estar redactada con los fundamentos correctos y presentada ante el juez competente desde el primer intento.',
      },
    },
  },

  acoso_laboral: {
    complejidad: 'media', precio_label: '$65.000 COP', precio_note: 'pago único',
    rama: 'Laboral', urgencia: 'alta',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho Laboral — Acoso Laboral', sub_categoria: 'Conductas constitutivas de acoso laboral' },
      derechos_vulnerados: [
        { derecho: 'Protección contra el acoso laboral', norma: 'Legislación colombiana de acoso laboral', explicacion: 'La ley colombiana define y sanciona el acoso laboral en todas sus formas, incluyendo el maltrato verbal, la persecución y la discriminación.' },
        { derecho: 'Derecho a condiciones dignas de trabajo', norma: 'Constitución Política + Código Sustantivo del Trabajo', explicacion: 'El empleador tiene la obligación legal de garantizar un ambiente de trabajo digno y respetuoso.' },
      ],
      estrategia_incluye: [
        'La queja formal ante el Comité de Convivencia redactada y lista',
        'Los artículos de la ley de acoso laboral y CST que protegen tu caso',
        'El paso a paso del proceso desde la queja interna hasta el Ministerio',
        'Qué hacer si el empleador toma represalias después de la denuncia',
      ],
      diagnostico: {
        resumen: 'Las conductas que describes tienen características de acoso laboral según la legislación colombiana. Esta ley protege a todos los trabajadores contra conductas que atentan contra su dignidad en el entorno laboral.\n\nExiste un procedimiento específico que debes seguir en orden para que tu caso tenga validez legal. Saltarse pasos puede afectar el éxito de la reclamación.',
        probabilidad_exito_label: 'Media',
        probabilidad_exito_razon: 'La efectividad depende de documentar bien las conductas y seguir el procedimiento correcto desde el inicio.',
        urgencia_descripcion: 'Mientras más tiempo pasa sin actuar, más difícil es documentar las conductas. El registro oportuno de hechos es fundamental para el caso.',
        tipo_accion_principal: 'Queja ante Comité de Convivencia Laboral + denuncia ante Ministerio de Trabajo',
        opciones: [
          { accion: 'Queja ante el Comité de Convivencia Laboral', descripcion: 'Primer paso obligatorio. Queda constancia formal del acoso denunciado y activa el procedimiento interno de la empresa.', probabilidad: 'alta' },
          { accion: 'Denuncia ante el Ministerio de Trabajo', descripcion: 'Si la empresa no actúa, el Inspector puede imponer sanciones económicas y ordenar medidas correctivas.', probabilidad: 'media' },
        ],
        cierre_paywall: 'Tienes fundamento para actuar y la ley te protege. Pero el proceso de acoso laboral tiene pasos obligatorios que deben seguirse en el orden correcto, con la redacción adecuada. Un escrito mal presentado o que omita elementos clave puede invalidar la queja o exponer a represalias sin protección legal.',
      },
    },
  },

  consumidor: {
    complejidad: 'baja', precio_label: '$30.000 COP', precio_note: 'pago único',
    rama: 'Consumidor / Administrativo', urgencia: 'media',
    triage_result: {
      clasificacion: { rama_derecho: 'Derecho del Consumidor', sub_categoria: 'Incumplimiento de contrato — protección al consumidor' },
      derechos_vulnerados: [
        { derecho: 'Protección al consumidor — garantía de entrega', norma: 'Estatuto del Consumidor colombiano', explicacion: 'El vendedor está obligado a entregar el producto en las condiciones y plazos pactados. El incumplimiento genera responsabilidad directa.' },
        { derecho: 'Derecho a reclamar ante el vendedor y las autoridades', norma: 'Legislación colombiana de protección al consumidor', explicacion: 'Puedes exigir formalmente una respuesta al vendedor y escalar a la autoridad competente si no responde.' },
      ],
      estrategia_incluye: [
        'El derecho de petición o queja redactados y listos para enviar',
        'Los artículos del Estatuto del Consumidor que respaldan tu reclamo',
        'El paso a paso de cómo presentar la queja ante la SIC si el vendedor no responde',
        'Qué hacer si el vendedor devuelve o sigue sin cumplir',
      ],
      diagnostico: {
        resumen: 'Tu caso tiene fundamento claro en la legislación colombiana de protección al consumidor. El vendedor tiene obligaciones legales respecto a la entrega y las garantías que no puede ignorar.\n\nExisten mecanismos efectivos y accesibles para reclamar, tanto directamente al vendedor como ante la autoridad que supervisa el comercio en Colombia.',
        probabilidad_exito_label: 'Alta',
        probabilidad_exito_razon: 'El Estatuto del Consumidor colombiano protege claramente este tipo de incumplimientos y la Superintendencia tiene facultades para obligar al vendedor a cumplir.',
        urgencia_descripcion: null,
        tipo_accion_principal: 'Derecho de petición formal al vendedor',
        opciones: [
          { accion: 'Derecho de petición formal al vendedor', descripcion: 'Documento legal que obliga al vendedor a responder. Es el primer paso antes de acudir a cualquier entidad.', probabilidad: 'alta' },
          { accion: 'Queja ante Superintendencia de Industria y Comercio', descripcion: 'La SIC puede imponer sanciones y ordenar la devolución del dinero o entrega del producto.', probabilidad: 'alta' },
        ],
        cierre_paywall: 'Tienes razón y la ley del consumidor te respalda. Para que tu reclamo sea tomado en serio — por el vendedor o por la Superintendencia — el derecho de petición debe estar bien redactado, con los fundamentos legales correctos y en el formato adecuado. Un reclamo informal es fácil de ignorar; uno legal no.',
      },
    },
  },

  generico: {
    complejidad: 'baja', precio_label: '$30.000 COP', precio_note: 'pago único',
    rama: 'General', urgencia: 'media',
    triage_result: {
      clasificacion: { rama_derecho: 'Asesoría Legal Preliminar', sub_categoria: 'Evaluación inicial — caso requiere análisis detallado' },
      derechos_vulnerados: [
        { derecho: 'Derecho de petición', norma: 'Constitución Política de Colombia', explicacion: 'Toda persona tiene derecho a elevar peticiones respetuosas a las autoridades y particulares, y a recibir respuesta oportuna.' },
        { derecho: 'Acceso a la administración de justicia', norma: 'Constitución Política de Colombia', explicacion: 'Toda persona tiene derecho a acceder a los mecanismos judiciales para la protección de sus derechos.' },
      ],
      estrategia_incluye: DEFAULT_ESTRATEGIA_INCLUYE,
      diagnostico: {
        resumen: 'Con base en lo que describes, tu situación tiene fundamentos para una reclamación legal. Existen mecanismos legales disponibles en Colombia para proteger tus derechos en este tipo de casos.\n\nEl análisis detallado determinará exactamente qué rama del derecho aplica y cuál es el mecanismo más efectivo para tu situación específica.',
        probabilidad_exito_label: 'Media',
        probabilidad_exito_razon: 'Con el análisis completo y la documentación adecuada, la mayoría de casos similares encuentran una vía legal efectiva.',
        urgencia_descripcion: null,
        tipo_accion_principal: 'Por determinar según análisis del caso',
        opciones: [
          { accion: 'Derecho de petición preliminar', descripcion: 'En muchos casos, el primer paso efectivo es formalizar tu reclamación mediante un documento legal ante la entidad o persona involucrada.', probabilidad: 'media' },
        ],
        cierre_paywall: 'Tu caso tiene mecanismos legales disponibles. Para activarlos correctamente — con el documento adecuado, los fundamentos precisos y ante la entidad correcta — se necesita el análisis completo de tu situación. Sin eso, es fácil perder tiempo en el camino equivocado.',
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
      // estrategia_incluye: viene en data.estrategia_incluye (nivel raíz de la respuesta)
      // o dentro de triage_result.estrategia_incluye
      estrategia_incluye:
        data.estrategia_incluye ||
        data.triage_result?.estrategia_incluye ||
        DEFAULT_ESTRATEGIA_INCLUYE,
    }
  }
  return { success: true, categoria, ...mockBase }
}

/* ── Componente principal ── */
const Caso = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  /* Texto inicial enviado desde la Landing */
  const pendingInitialTextRef = useRef(location.state?.initialText || '')

  /* Pasos: chat → loading → result (registro va inline en el chat) */
  const [step, setStep]         = useState('chat')

  /* Chat — si venimos de Landing con texto, siempre empezamos en limpio */
  const [chatMessages, setChatMessages] = useState(() => {
    if (location.state?.initialText) { lsClear(); return [{ role: 'assistant', content: FIRST_MESSAGE }] }
    return lsLoad() || [{ role: 'assistant', content: FIRST_MESSAGE }]
  })
  const [chatInput,   setChatInput]   = useState('')
  const [entryInput,  setEntryInput]  = useState('')
  const [isTyping,    setIsTyping]    = useState(false)
  const [isReadingDoc,setIsReadingDoc]= useState(false)

  /* Resto del flujo */
  const [result,       setResult]       = useState(null)
  const [leadData,     setLeadData]     = useState({ nombre: '', contacto: '' })
  const [loadingMsg,   setLoadingMsg]   = useState(0)
  const [pagoMsg,      setPagoMsg]      = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  /* Registro inline en el chat */
  const [isAwaitingReg, setIsAwaitingReg] = useState(false)
  const [pendingResult, setPendingResult] = useState(null)

  /* Refs */
  const chatEndRef  = useRef(null)
  const fileInputRef= useRef(null)

  const canSubmitLead = isAuthenticated
    ? true
    : leadData.nombre.trim().length >= 2 && leadData.contacto.trim().length >= 5

  /* Cantidad de turnos del usuario (para habilitar carga de documentos) */
  const userTurns = chatMessages.filter(m => m.role === 'user').length

  /* Pantalla de entrada — antes del primer mensaje del usuario */
  const isEntryScreen = step === 'chat' &&
    chatMessages.length === 1 &&
    chatMessages[0]?.content === FIRST_MESSAGE

  /* Auto-scroll al último mensaje */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping, isReadingDoc])

  /* Auto-submit del texto inicial proveniente de la Landing */
  useEffect(() => {
    if (pendingInitialTextRef.current) {
      const text = pendingInitialTextRef.current
      pendingInitialTextRef.current = ''
      handleChatSend(text)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
        }
        setStep('result')
      }, 3800)
    }, 700)
  }

  /* ── Procesar respuesta de /conversar ── */
  const processConversarResponse = (data, msgs, setMessages) => {
    if (data.info_completa) {
      const assistantMsg = data.mensaje_usuario || 'Perfecto. Voy a analizar tu caso ahora mismo.'
      const final = [...msgs, { role: 'assistant', content: assistantMsg }]
      setIsTyping(false)

      if (isAuthenticated) {
        /* Usuario ya registrado → diagnóstico directo */
        setMessages(final)
        lsSave(final)
        setLeadData({ nombre: user?.nombre || '', contacto: user?.email || '' })
        goToResult(buildResult(data, msgs))
      } else {
        /* Pedir nombre y celular de forma natural antes del diagnóstico */
        const regMsg = {
          role: 'assistant',
          content: 'Para preparar tu diagnóstico necesito dos datos rápidos. ¿Cuál es tu nombre y a qué número o correo te puedo enviar el resumen?',
        }
        const withReg = [...final, regMsg]
        setMessages(withReg)
        lsSave(withReg)
        setPendingResult(buildResult(data, msgs))
        setIsAwaitingReg(true)
      }
    } else {
      const q = data.siguiente_pregunta || '¿Puedes contarme un poco más?'
      const updated = [...msgs, { role: 'assistant', content: q }]
      setMessages(updated)
      lsSave(updated)
      setIsTyping(false)
    }
  }

  /* ── Enviar registro inline y disparar diagnóstico ── */
  const handleRegSubmit = async (e) => {
    e?.preventDefault()
    if (!canSubmitLead || !pendingResult) return

    /* Anti-abuso: verificar límite por número/correo en Redis (falla silenciosa) */
    try {
      const res = await fetch('/api/cases/register-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:   leadData.nombre.trim(),
          contacto: leadData.contacto.trim(),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (!data.allowed) {
          /* Mostrar bloqueo como mensaje del asistente y cerrar el form */
          setChatMessages(prev => [
            ...prev,
            { role: 'assistant', content: data.message || 'Ya tienes un diagnóstico activo esta semana.' },
          ])
          setIsAwaitingReg(false)
          return
        }
      }
    } catch {
      /* Redis no disponible → continuar de todos modos */
    }

    setIsAwaitingReg(false)
    goToResult(pendingResult)
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

    /* Validación frontend: tamaño > 5 MB */
    if (file.size > 5 * 1024 * 1024) {
      const msg = 'Este archivo es muy grande. Puedes comprimirlo gratis en ilovepdf.com o smallpdf.com y subirlo de nuevo.'
      const updated = [...chatMessages, { role: 'assistant', content: msg }]
      setChatMessages(updated)
      lsSave(updated)
      return
    }

    /* Validación frontend: PDF con más de 10 páginas (estimación por marcadores internos) */
    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        const pdfText = new TextDecoder('latin1').decode(bytes)
        const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g)
        const estimatedPages = pageMatches ? pageMatches.length : 0
        if (estimatedPages > 10) {
          const msg = `Tu PDF tiene aproximadamente ${estimatedPages} páginas. Solo procesamos las primeras 3 en el diagnóstico gratis — continuaré con esas. Si quieres, también puedes subir un PDF más corto.`
          const updated = [...chatMessages, { role: 'assistant', content: msg }]
          setChatMessages(updated)
          lsSave(updated)
          // informativo — seguimos con la subida igual
        }
      } catch { /* ignorar errores de estimación */ }
    }

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
    setEntryInput('')
    lsSave(fresh)
    setResult(null)
    setLeadData({ nombre: '', contacto: '' })
    setPagoMsg(false)
    setConfirmReset(false)
    setStep('chat')
  }

  /* ── Seleccionar categoría en la pantalla de entrada ── */
  const handleCategoryClick = (catId) => {
    const greeting = CATEGORY_GREETINGS[catId]
    const msgs = [{ role: 'assistant', content: greeting }]
    setChatMessages(msgs)
    lsSave(msgs)
    // isEntryScreen becomes false → chat view appears automatically
  }

  /* ── Enviar desde la pantalla de entrada ── */
  const handleEntrySubmit = () => {
    const text = entryInput.trim()
    if (!text) return
    setEntryInput('')
    handleChatSend(text)
  }

  /* ── Indicador de progreso ── */
  const STEPS_ORDER = ['chat', 'loading', 'result']
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
          </div>
        </div>
      </header>

      <main className="caso-main">

        {/* ── PANTALLA DE ENTRADA ── */}
        {step === 'chat' && isEntryScreen && (
          <div className="caso-entry container-narrow animate-fade-up">

            <div className="entry-header">
              <h1 className="entry-title">Defiéndete está contigo</h1>
              <p className="entry-subtitle">Cuéntame qué necesitas resolver</p>
            </div>

            <div className="entry-textarea-wrap">
              <textarea
                className="entry-textarea"
                placeholder="Describe tu situación con tus propias palabras. No necesitas términos legales — solo cuéntame qué pasó..."
                value={entryInput}
                onChange={e => setEntryInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleEntrySubmit()
                  }
                }}
                rows={8}
                autoFocus
              />
            </div>

            <button
              className={`btn-cta btn-cta--full entry-btn ${!entryInput.trim() ? 'btn-cta--disabled' : ''}`}
              onClick={handleEntrySubmit}
              disabled={!entryInput.trim()}
            >
              Continuar <ArrowRight size={18} />
            </button>

            <p className="entry-tagline">Consulta gratis · Estrategia con respaldo legal</p>

            <div className="entry-separator" />

            <p className="entry-categories-label">O elige una categoría para empezar</p>

            <div className="entry-chips">
              {CATEGORIES.map(cat => (
                <button key={cat.id} className="entry-chip" onClick={() => handleCategoryClick(cat.id)}>
                  {cat.label}
                </button>
              ))}
            </div>

            <p className="caso-disclaimer">
              🔒 Tu información es confidencial — Ley 1581 de 2012. Diagnóstico informativo, no asesoría jurídica.
            </p>
          </div>
        )}

        {/* ── CHAT CONVERSACIONAL ── */}
        {step === 'chat' && !isEntryScreen && (
          <div className="caso-chat container-narrow animate-fade-up">

            <div className="caso-chat__header">
              <div className="chat-header-content">
                <span className="section-tag">Asistente legal</span>
                <h1>Cuéntanos qué pasó</h1>
                <p>El asistente te guiará con preguntas para preparar tu diagnóstico gratuito.</p>
              </div>
              <button
                className="chat-reset-btn"
                onClick={() => setConfirmReset(v => !v)}
                title="Reiniciar conversación"
                type="button"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Confirmación de reset */}
            {confirmReset && (
              <div className="chat-reset-confirm">
                <span>¿Estás seguro? Se borrará todo lo que has escrito hasta ahora.</span>
                <div className="chat-reset-confirm__actions">
                  <button className="chat-reset-confirm__yes" onClick={handleReset}>
                    Sí, borrar
                  </button>
                  <button className="chat-reset-confirm__no" onClick={() => setConfirmReset(false)}>
                    No
                  </button>
                </div>
              </div>
            )}

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

            {/* Input del chat o formulario de registro inline */}
            {isAwaitingReg ? (
              <form className="chat-reg-form" onSubmit={handleRegSubmit}>
                <input
                  className="chat-reg-input"
                  type="text"
                  placeholder="Tu nombre"
                  value={leadData.nombre}
                  onChange={e => setLeadData(d => ({ ...d, nombre: e.target.value }))}
                  autoFocus
                />
                <input
                  className="chat-reg-input"
                  type="text"
                  placeholder="WhatsApp o correo"
                  value={leadData.contacto}
                  onChange={e => setLeadData(d => ({ ...d, contacto: e.target.value }))}
                />
                <button
                  type="submit"
                  className={`btn-cta btn-cta--full ${!canSubmitLead ? 'btn-cta--disabled' : ''}`}
                  disabled={!canSubmitLead}
                >
                  Ver mi diagnóstico <ArrowRight size={16} />
                </button>
                <p className="chat-reg-privacy"><Lock size={11} /> Datos protegidos — Ley 1581 de 2012</p>
              </form>
            ) : (
              <div className="chat-input-wrap">

                {/* Botón de adjuntar — solo escritorio, habilitado tras el primer turno */}
                <button
                  className="chat-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTyping || isReadingDoc || userTurns < 1}
                  title={userTurns < 1
                    ? 'Primero cuéntame tu caso, luego podrás adjuntar documentos'
                    : 'Adjuntar documento (PDF, JPG, PNG — máx 5 MB)'}
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
            )}

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
                  {result.triage_result?.diagnostico?.probabilidad_exito_label && (
                    <div className="result-meta-item">
                      <span className="meta-label">Probabilidad de éxito</span>
                      <span className="meta-value meta-value--prob">
                        {result.triage_result.diagnostico.probabilidad_exito_label}
                      </span>
                    </div>
                  )}
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
                {result.triage_result?.diagnostico?.probabilidad_exito_razon && (
                  <p className="result-prob-razon">
                    {result.triage_result.diagnostico.probabilidad_exito_razon}
                  </p>
                )}
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

                  {/* Cierre paywall — crea urgencia de pagar */}
                  {result.triage_result?.diagnostico?.cierre_paywall && (
                    <p className="result-cta__cierre">
                      {result.triage_result.diagnostico.cierre_paywall}
                    </p>
                  )}

                  {/* Lista de lo que incluye la estrategia paga */}
                  <ul className="estrategia-incluye-list">
                    {(result.estrategia_incluye || DEFAULT_ESTRATEGIA_INCLUYE).map((item, i) => (
                      <li key={i} className="estrategia-incluye-item">
                        <CheckCircle2 size={14} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

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
                      Recibir mi estrategia completa y documentos
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
