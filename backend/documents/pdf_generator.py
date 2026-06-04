"""Generador de PDF para documentos legales - Defiéndete.

Convierte el output del WriterAgent en un PDF formal
con formato jurídico colombiano usando fpdf2 2.8+.

NOTA: fpdf2 2.8+ NO restablece x al margen izquierdo por defecto tras
multi_cell(). Siempre pasamos new_x=XPos.LMARGIN, new_y=YPos.NEXT
para comportamiento predecible.
"""

from datetime import datetime
from fpdf import FPDF, XPos, YPos
import structlog

logger = structlog.get_logger()

# ──────────────────────────────────────────────
# Constantes de estilo
# ──────────────────────────────────────────────
BLUE   = (20,  80, 160)
GREEN  = (20, 120,  20)
ORANGE = (160, 60,   0)
RED    = (160,   0,   0)
GRAY   = (130, 130, 130)
DARK   = ( 30,  30,  30)
MID    = ( 60,  60,  60)


# ──────────────────────────────────────────────
# Helpers de texto
# ──────────────────────────────────────────────

def _s(text) -> str:
    """Codifica a Latin-1; reemplaza caracteres fuera de rango con '?'."""
    if text is None:
        return ""
    return str(text).encode("latin-1", "replace").decode("latin-1")


def _list_items(value) -> list[str]:
    """
    Normaliza listas de items de distintos formatos:
    - list[str]
    - list[{"numero": n, "texto": "..."}]      (hechos / pretensiones)
    - list[{"norma": "...", "texto": "..."}]    (fundamentos)
    - list[{"orden": n, "accion": "..."}]       (pasos estrategia)
    - str                                        (campo simple)
    """
    if not value:
        return []
    if isinstance(value, str):
        stripped = value.strip()
        return [stripped] if stripped else []
    if isinstance(value, list):
        result = []
        for item in value:
            if isinstance(item, dict):
                if "texto" in item:
                    result.append(str(item["texto"]))
                elif "norma" in item:
                    norma = item.get("norma", "")
                    texto = item.get("texto", "")
                    ver   = " (verificado)" if item.get("verificado_en_corpus") else ""
                    result.append(f"{norma}{ver}: {texto}" if texto else norma)
                elif "accion" in item:
                    parts = [item.get("accion", "")]
                    if item.get("detalle"):
                        parts.append(item["detalle"])
                    if item.get("ante_quien"):
                        parts.append(f"Ante: {item['ante_quien']}")
                    if item.get("plazo"):
                        parts.append(f"[Plazo: {item['plazo']}]")
                    result.append(" - ".join(parts))
                else:
                    result.append(", ".join(str(v) for v in item.values() if v))
            else:
                s = str(item).strip()
                if s:
                    result.append(s)
        return result
    return [str(value)]


def _firma_str(firma) -> str:
    """Convierte el campo firma (dict o str) a texto legible."""
    if isinstance(firma, dict):
        parts = []
        if firma.get("nombre"):
            parts.append(firma["nombre"])
        if firma.get("cedula"):
            parts.append(f"C.C. {firma['cedula']}")
        if firma.get("telefono"):
            parts.append(f"Tel: {firma['telefono']}")
        if firma.get("correo"):
            parts.append(firma["correo"])
        return "\n".join(parts)
    return str(firma) if firma else ""


# ──────────────────────────────────────────────
# Clase PDF
# ──────────────────────────────────────────────

class LegalPDF(FPDF):
    """PDF con encabezado y pie de página institucional."""

    def __init__(self, tipo_doc: str = ""):
        super().__init__(format="A4")
        self.tipo_doc = tipo_doc
        self.set_margins(left=25, top=22, right=20)
        self.set_auto_page_break(auto=True, margin=22)

    # ── Encabezado / pie ──────────────────────

    def header(self):
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*GRAY)
        self.cell(
            0, 6, "Defiendete - Asistencia Legal Colombia",
            align="R",
            new_x=XPos.LMARGIN, new_y=YPos.NEXT,
        )
        y = self.get_y()
        self.set_draw_color(200, 200, 200)
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.ln(5)

    def footer(self):
        self.set_y(-14)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*GRAY)
        fecha = datetime.now().strftime("%d/%m/%Y")
        self.cell(
            0, 8,
            f"Generado por Defiendete | {fecha} | Pagina {self.page_no()}",
            align="C",
            new_x=XPos.LMARGIN, new_y=YPos.NEXT,
        )

    # ── Primitivos de estilo ──────────────────

    def _mc(self, w: float, h: float, txt: str, align: str = "L") -> None:
        """multi_cell con new_x=LMARGIN y new_y=NEXT siempre."""
        self.multi_cell(
            w, h, _s(txt), align=align,
            new_x=XPos.LMARGIN, new_y=YPos.NEXT,
        )

    def h1(self, text: str) -> None:
        """Título principal centrado."""
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(*DARK)
        self._mc(0, 8, text, align="C")
        self.ln(5)

    def section_heading(self, text: str, color: tuple = BLUE) -> None:
        """Encabezado de sección con línea decorativa."""
        self.ln(4)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*color)
        self._mc(0, 6, text.upper())
        y = self.get_y()
        self.set_draw_color(*color)
        self.set_line_width(0.4)
        self.line(self.l_margin, y, self.l_margin + 55, y)
        self.set_line_width(0.2)
        self.set_draw_color(0, 0, 0)
        self.ln(3)

    def body(self, text: str) -> None:
        """Párrafo de cuerpo."""
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*DARK)
        self._mc(0, 5.5, text)

    def numbered_item(self, n: int, text: str) -> None:
        """Ítem numerado con pequeña sangría."""
        self.set_x(self.l_margin + 4)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*DARK)
        # número en columna fija
        self.cell(
            8, 5.5, _s(f"{n}."),
            new_x=XPos.RIGHT, new_y=YPos.LAST,
        )
        self.set_font("Helvetica", "", 10)
        self._mc(0, 5.5, text)

    def bullet_item(self, text: str) -> None:
        """Ítem con viñeta."""
        self.set_x(self.l_margin + 4)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*DARK)
        self.cell(
            5, 5.5, "-",
            new_x=XPos.RIGHT, new_y=YPos.LAST,
        )
        self._mc(0, 5.5, text)

    def kv(self, key: str, value: str) -> None:
        """Par clave : valor en la misma línea."""
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*DARK)
        self.cell(
            35, 6, _s(key + ":"),
            new_x=XPos.RIGHT, new_y=YPos.LAST,
        )
        self.set_font("Helvetica", "", 10)
        self._mc(0, 6, value)


# ──────────────────────────────────────────────
# Función principal
# ──────────────────────────────────────────────

def generate_pdf(
    document: dict,
    opposing_counsel: dict | None = None,
    triage_result: dict | None = None,
    specialist_analysis: dict | None = None,
) -> bytes:
    """
    Genera un PDF formal a partir del output del WriterAgent.

    Args:
        document:            Output de WriterAgent.generate_document()
        opposing_counsel:    Output de OpposingCounselAgent (opcional)
        triage_result:       Output de TriageAgent (para advertencias)
        specialist_analysis: Output de SpecialistAgent (para plazos)

    Returns:
        bytes del PDF generado
    """
    titulo   = document.get("titulo", "DOCUMENTO LEGAL")
    tipo_doc = document.get("tipo_documento", "")
    cuerpo   = document.get("cuerpo", {})

    pdf = LegalPDF(tipo_doc=tipo_doc)
    pdf.add_page()

    # ── TÍTULO ──────────────────────────────────
    pdf.h1(titulo)

    # ── DESTINATARIO ────────────────────────────
    destinatario = document.get("destinatario", {})
    if isinstance(destinatario, dict):
        cargo    = destinatario.get("cargo", "")
        entidad  = destinatario.get("entidad", "")
        ciudad_d = destinatario.get("ciudad", "")
        if cargo:
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*DARK)
            pdf._mc(0, 6, f"Senor(a) {cargo}")
        if entidad:
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(*DARK)
            pdf._mc(0, 6, entidad)
        if ciudad_d:
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(*DARK)
            pdf._mc(0, 6, ciudad_d)
    elif isinstance(destinatario, str) and destinatario.strip():
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(*DARK)
        pdf._mc(0, 6, destinatario)

    pdf.ln(3)

    # ── REFERENCIA ──────────────────────────────
    referencia = document.get("referencia", "")
    if referencia:
        pdf.kv("REFERENCIA", referencia)
        pdf.ln(3)

    # ── LEGITIMACIÓN ────────────────────────────
    legitimacion = cuerpo.get("legitimacion", "")
    if legitimacion:
        pdf.body(str(legitimacion))
        pdf.ln(3)

    # ── HECHOS ──────────────────────────────────
    hechos = _list_items(cuerpo.get("hechos", []))
    if hechos:
        pdf.section_heading("I. Hechos")
        for i, h in enumerate(hechos, 1):
            pdf.numbered_item(i, h)
            pdf.ln(1)

    # ── PRETENSIONES ────────────────────────────
    pretensiones = _list_items(cuerpo.get("pretensiones", []))
    if pretensiones:
        pdf.section_heading("II. Pretensiones")
        for i, p in enumerate(pretensiones, 1):
            pdf.numbered_item(i, p)
            pdf.ln(1)

    # ── FUNDAMENTOS DE DERECHO ──────────────────
    fundamentos = _list_items(cuerpo.get("fundamentos_derecho", []))
    if fundamentos:
        pdf.section_heading("III. Fundamentos de Derecho")
        for f in fundamentos:
            pdf.bullet_item(f)
            pdf.ln(1)

    # ── PRUEBAS ─────────────────────────────────
    pruebas = _list_items(cuerpo.get("pruebas", []))
    if pruebas:
        pdf.section_heading("IV. Pruebas")
        for i, p in enumerate(pruebas, 1):
            pdf.numbered_item(i, p)
            pdf.ln(0.5)

    # ── JURAMENTO ───────────────────────────────
    juramento = cuerpo.get("juramento", "")
    if juramento:
        pdf.section_heading("V. Juramento")
        pdf.body(str(juramento))

    # ── NOTIFICACIONES ──────────────────────────
    notificaciones = cuerpo.get("notificaciones", "")
    if notificaciones:
        pdf.section_heading("VI. Notificaciones")
        pdf.body(str(notificaciones))

    # ── CIUDAD Y FECHA ──────────────────────────
    ciudad_fecha = document.get("ciudad_fecha", "")
    if ciudad_fecha:
        pdf.ln(6)
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*DARK)
        pdf._mc(0, 6, ciudad_fecha)

    # ── FIRMA ───────────────────────────────────
    firma_texto = _firma_str(document.get("firma", ""))
    if firma_texto:
        pdf.ln(14)
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(*DARK)
        pdf._mc(0, 6, firma_texto)
        pdf.ln(2)
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(*MID)
        pdf._mc(0, 5, "Firma y huella del accionante")

    # ──────────────────────────────────────────────────────────
    # PÁGINA 2 - Notas para el usuario + Plazos críticos
    # ──────────────────────────────────────────────────────────
    notas = _list_items(document.get("notas_para_usuario", []))
    plazos: list[dict] = []
    if specialist_analysis:
        plazos = specialist_analysis.get("plazos_legales", [])
    advertencias = []
    if triage_result:
        advertencias = _list_items(
            triage_result.get("diagnostico", {}).get("advertencias", [])
        )

    if notas or plazos or advertencias:
        pdf.add_page()
        pdf.section_heading("Informacion importante para usted", color=GREEN)

        if notas:
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*DARK)
            pdf.cell(
                0, 6, "Que debe hacer con este documento:",
                new_x=XPos.LMARGIN, new_y=YPos.NEXT,
            )
            pdf.ln(1)
            for nota in notas:
                pdf.bullet_item(nota)
                pdf.ln(1)

        if plazos:
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*ORANGE)
            pdf.cell(
                0, 6, "PLAZOS CRITICOS - no deje vencer:",
                new_x=XPos.LMARGIN, new_y=YPos.NEXT,
            )
            pdf.ln(1)
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*MID)
            for p in plazos:
                if isinstance(p, dict):
                    accion = p.get("accion", "")
                    plazo  = p.get("plazo", "")
                    norma  = p.get("norma", "")
                    desde  = p.get("desde_cuando", "")
                    linea  = f"{accion}: {plazo}"
                    if desde:
                        linea += f" (desde {desde})"
                    if norma:
                        linea += f" [{norma}]"
                    pdf.bullet_item(linea)
                else:
                    pdf.bullet_item(str(p))
                pdf.ln(0.5)

        if advertencias:
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*RED)
            pdf.cell(
                0, 6, "ADVERTENCIAS:",
                new_x=XPos.LMARGIN, new_y=YPos.NEXT,
            )
            pdf.ln(1)
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(80, 20, 20)
            for adv in advertencias:
                pdf.bullet_item(adv)
                pdf.ln(0.5)

    # ──────────────────────────────────────────────────────────
    # PÁGINA 3 - Análisis de riesgo (solo si riesgoso / débil)
    # ──────────────────────────────────────────────────────────
    if opposing_counsel:
        calificacion = opposing_counsel.get("calificacion_caso", "riesgoso")
        if calificacion in ("riesgoso", "debil"):
            pdf.add_page()

            cal_color = ORANGE if calificacion == "riesgoso" else RED
            label = "CASO RIESGOSO" if calificacion == "riesgoso" else "CASO DEBIL"
            pdf.set_font("Helvetica", "B", 12)
            pdf.set_text_color(*cal_color)
            pdf.cell(
                0, 8, f"ANALISIS DE RIESGO - {label}",
                new_x=XPos.LMARGIN, new_y=YPos.NEXT,
            )
            pdf.ln(2)

            resumen = opposing_counsel.get("resumen_evaluacion", "")
            if resumen:
                pdf.set_font("Helvetica", "", 10)
                pdf.set_text_color(*MID)
                pdf._mc(0, 5.5, resumen)
                pdf.ln(3)

            debilidades = opposing_counsel.get("debilidades", [])
            if debilidades:
                pdf.set_font("Helvetica", "B", 10)
                pdf.set_text_color(*DARK)
                pdf.cell(
                    0, 6, "Puntos debiles identificados:",
                    new_x=XPos.LMARGIN, new_y=YPos.NEXT,
                )
                pdf.ln(1)
                for d in debilidades[:6]:
                    gravedad   = d.get("gravedad", "").upper()
                    desc       = d.get("descripcion", "")
                    subsanar   = d.get("como_subsanar", "")
                    subsanable = d.get("subsanable", False)

                    g_color = {
                        "CRITICA": RED,
                        "ALTA":    ORANGE,
                        "MEDIA":   (150, 100, 0),
                        "BAJA":    GREEN,
                    }.get(gravedad, MID)

                    pdf.set_x(pdf.l_margin + 4)
                    pdf.set_text_color(*g_color)
                    pdf.set_font("Helvetica", "B", 9)
                    pdf.cell(
                        28, 5, _s(f"[{gravedad}]"),
                        new_x=XPos.RIGHT, new_y=YPos.LAST,
                    )
                    pdf.set_font("Helvetica", "", 9)
                    pdf.set_text_color(*DARK)
                    pdf._mc(0, 5, desc)

                    if subsanable and subsanar:
                        pdf.set_x(pdf.l_margin + 8)
                        pdf.set_text_color(0, 100, 50)
                        pdf.set_font("Helvetica", "I", 9)
                        pdf._mc(0, 5, f"Como corregirlo: {subsanar}")
                        pdf.set_font("Helvetica", "", 9)
                    pdf.ln(1.5)

            pruebas_falt = opposing_counsel.get("pruebas_faltantes", [])
            if pruebas_falt:
                pdf.ln(3)
                pdf.set_font("Helvetica", "B", 10)
                pdf.set_text_color(*DARK)
                pdf.cell(
                    0, 6, "Pruebas que debe conseguir:",
                    new_x=XPos.LMARGIN, new_y=YPos.NEXT,
                )
                pdf.ln(1)
                pdf.set_font("Helvetica", "", 9)
                pdf.set_text_color(*MID)
                for p in pruebas_falt[:5]:
                    prueba      = p.get("prueba", "")
                    como        = p.get("como_conseguirla", "")
                    importancia = p.get("importancia", "")
                    texto = prueba
                    if importancia:
                        texto += f" - {importancia}"
                    pdf.bullet_item(texto)
                    if como:
                        pdf.set_x(pdf.l_margin + 8)
                        pdf.set_text_color(0, 80, 150)
                        pdf._mc(0, 5, f"Donde conseguirla: {como}")
                        pdf.set_text_color(*MID)
                    pdf.ln(1)

    # ── Generar bytes ────────────────────────────
    pdf_bytes = bytes(pdf.output())
    logger.info(
        "pdf_generated",
        pages=pdf.page,
        tipo_documento=tipo_doc,
        size_kb=len(pdf_bytes) // 1024,
        calificacion_oc=(opposing_counsel or {}).get("calificacion_caso", "n/a"),
    )
    return pdf_bytes
