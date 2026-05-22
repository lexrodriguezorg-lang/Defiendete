/* Logo.jsx — Defiéndete · Servicio Legal Digital
   Replica el logo oficial: tipografía bold grafito + D con checkmark cian
*/

const Logo = ({ size = 40, showText = true, variant = 'full', className = '' }) => {
  // variant: 'full' = nombre completo | 'icon' = solo isotipo D+check | 'horizontal' = icono + nombre

  const scale = size / 40

  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <IsotipoD />
      </svg>
    )
  }

  // Versión horizontal: isotipo pequeño + wordmark
  return (
    <div className={`logo-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.28 + 'px' }}>
      {/* Isotipo: D con checkmark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <IsotipoD />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: size * 0.6 + 'px',
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            whiteSpace: 'nowrap',
          }}>
            Defiéndete
          </span>
          {size >= 32 && (
            <span style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: size * 0.185 + 'px',
              color: '#7A8699',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginTop: '3px',
            }}>
              Servicio Legal Digital
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* El isotipo: la D de Defiéndete con el checkmark cian adentro */
const IsotipoD = () => (
  <>
    {/* Cuerpo de la D — grafito oscuro */}
    <path
      d="M6 6 L6 34 L20 34 C29.941 34 38 26.837 38 20 C38 13.163 29.941 6 20 6 Z"
      fill="#2B2F35"
    />
    {/* Borde exterior sutil */}
    <path
      d="M6 6 L6 34 L20 34 C29.941 34 38 26.837 38 20 C38 13.163 29.941 6 20 6 Z"
      fill="none"
      stroke="rgba(255,255,255,0.08)"
      strokeWidth="0.5"
    />
    {/* Checkmark cian — igual al del logo oficial */}
    <path
      d="M12 20.5 L17 26 L27 13"
      stroke="#00B4A0"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)

export default Logo
