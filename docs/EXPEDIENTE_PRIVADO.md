# Expediente privado: alcance del piloto

El panel reemplaza casos ficticios y sesiones simuladas por actuaciones que el ciudadano registra o importa. Cada actuación tiene referencia, calidad procesal, estado de verificación, hechos, fuentes, preguntas pendientes y trámites. El estado «radicado» exige un archivo de constancia y una fecha; no equivale a una verificación automática de la autoridad.

El ciudadano conserva originales, exporta la organización y autoriza o revoca acceso a un abogado. El profesional ve los expedientes asignados y agrega observaciones identificadas. La aceptación del titular queda registrada como decisión; no modifica automáticamente el relato ni entrena modelos.

## Ejecutar el piloto

Frontend: `cd frontend && npm ci && npm run dev`.
Backend: configurar las dependencias de `backend/requirements.txt` y ejecutar `uvicorn main:app --host 127.0.0.1 --port 8000` desde backend. El proxy de desarrollo envía `/api` a ese puerto. El servidor completo conserva las dependencias y configuración de los módulos de IA existentes.

Variables necesarias, fuera del repositorio:

- `SECRET_KEY`: secreto aleatorio de al menos 32 caracteres para las sesiones. Se rechaza el valor de desarrollo.
- `DEF_DATA_KEY`: clave Fernet generada con `Fernet.generate_key()`. Guardarla en un gestor de secretos y respaldarla separadamente: perderla impide leer los datos.
- `DEF_DATA_DIR`: volumen privado persistente. No usar una ruta efímera de una función serverless.
- `DEF_VERIFIED_LAWYERS`: correos separados por coma, incorporados por el operador después de verificar identidad, tarjeta profesional y habilitación. Es un control manual del piloto, no una consulta automática al registro profesional.

Usuarios, documentos y contenido del expediente se cifran en SQLite. Los identificadores de cuenta, concesiones de acceso y algunos metadatos de auditoría permanecen en texto en la base privada. Cada actualización conserva una versión cifrada y exige la revisión vigente para evitar sobrescribir cambios concurrentes. La interfaz aún no permite restaurar versiones históricas. No es cifrado de extremo a extremo: el operador del backend administra las claves.

## Antes de habilitar expedientes reales en producción

1. Conectar frontend y API mediante HTTPS, configurar orígenes CORS y un volumen persistente con copias de seguridad cifradas y prueba de restauración. La reescritura actual de Vercel para la SPA no despliega FastAPI.
2. Aprobar responsable, finalidades, política de tratamiento, aviso y base jurídica por categoría de datos; gestionar autorizaciones y derechos de terceros, en especial menores y víctimas. Definir retención, eliminación, solicitudes de titulares e incidentes.
3. Formalizar encargados, proveedores de IA y transmisiones o transferencias internacionales aplicables. Estos documentos requieren revisión antes de abrir el servicio.
4. Endurecer sesiones (cookies HttpOnly y protección CSRF si se migra a cookies), límites de intentos, recuperación y verificación de correo, MFA, auditoría de accesos, cuotas y análisis de adjuntos. Hoy el token está en sessionStorage y el cierre local no revoca un token ya emitido.
5. Sustituir la lista manual de abogados por verificación administrada y auditable. Añadir permisos por actuación/documento y retención de autorizaciones. En este piloto, un abogado autorizado accede a todo el expediente del titular; no hay segregación por documento.
6. Revisar los endpoints preexistentes de IA, documentos, pagos y chat. Este cambio no certifica su seguridad ni modifica su funcionamiento. No cargar material reservado en esos flujos hasta completar la revisión.

Los datos del caso piloto y sus capturas no pertenecen al repositorio. Se preparan como un paquete privado importable en una cuenta autenticada.

## Evolución del producto

1. Ingreso: relato libre, documentos y objetivo; extraer una propuesta de cronología con una cita precisa a cada fuente. El usuario confirma hechos y corrige interpretaciones.
2. Verificación: distinguir relato del usuario, documento original, afirmación de tercero y respuesta oficial. No inferir culpabilidad ni vinculación por recibir un correo.
3. Tramitación: preparar documentos por autoridad, explicar quién puede presentar, registrar envío autorizado, constancia y términos con fuente normativa y fecha. Ningún envío automático por añadir un archivo.
4. Entrega profesional: verificar abogado y mandato; compartir lo autorizado, registrar observaciones y propuestas de cambio. Conservar versiones y explicación de cada ajuste.
5. Aprendizaje: usar correcciones dentro del expediente; para reglas generales, extraer propuestas sin datos identificables, cotejarlas con fuentes vigentes y someterlas a revisión profesional. No reutilizar expedientes sensibles para entrenamiento o búsqueda entre clientes por defecto.

La plataforma puede ayudar a preparar solicitudes, pruebas, conciliaciones y seguimiento. La representación judicial y los actos que requieren defensa técnica siguen teniendo su vía profesional. Registrar una actuación como preparada nunca debe implicar que fue presentada.

## Verificación realizada

`python -m unittest tests_workspace -v` verifica aislamiento entre usuarios, constancias obligatorias, control de concurrencia, cifrado del contenido, persistencia de cuentas, habilitación profesional y revocación. `npm run build` verifica compilación del frontend. La revisión visual en navegador está pendiente: Chromium no pudo iniciar en el entorno disponible. Las pruebas de API ejercitan los routers de autenticación y expediente; no prueban la aplicación completa con sus proveedores de IA ni servicios externos de justicia.
